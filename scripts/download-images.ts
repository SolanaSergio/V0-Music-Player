import type { IncomingMessage } from 'http'
import type { WriteStream } from 'fs'
const fs = require('fs')
const path = require('path')
const https = require('https')
const sharp = require('sharp')
const { STATION_IMAGES, GENRE_IMAGES, IMAGE_SIZES } = require('../config/images')

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const TEMP_DIR = path.join(process.cwd(), 'temp')
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Music-related image IDs from Unsplash
const IMAGE_IDS = [
  'pZRRkP8qP4M', // Concert
  'JAHdPHMoaEA', // Guitar
  'D4LDw5eXhgg', // Piano
  'YFmvjO3TP_g', // Vinyl
  'YrtFlrLo2DQ', // Studio
  'FH7w3BqYMfQ', // Concert
  'oZuBNC-6E2s', // Guitar
  'YrtFlrLo2DQ', // Studio
  'YuGgZ6btrlY', // Piano
  'MEL-jJnm7RQ', // Concert
  'YrtFlrLo2DQ', // Studio
  'JAHdPHMoaEA', // Guitar
]

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

const cleanupFile = (filepath: string) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }
  } catch (error) {
    console.error(`Failed to clean up file ${filepath}:`, error)
  }
}

const handleFileStream = (fileStream: WriteStream, filepath: string, resolve: () => void, reject: (error: Error) => void) => {
  fileStream.on('finish', () => {
    fileStream.close()
    resolve()
  })
  fileStream.on('error', (error: Error) => {
    fileStream.close()
    cleanupFile(filepath)
    reject(error)
  })
}

const downloadImage = async (url: string, filepath: string, retryCount = 0): Promise<void> => {
  try {
    return await new Promise((resolve, reject) => {
      const request = https.get(url, (response: IncomingMessage) => {
        if (response.statusCode === 302 && response.headers.location) {
          // Handle redirect
          https.get(response.headers.location, (redirectResponse: IncomingMessage) => {
            if (redirectResponse.statusCode === 200) {
              const fileStream = fs.createWriteStream(filepath)
              redirectResponse.pipe(fileStream)
              handleFileStream(fileStream, filepath, resolve, reject)
            } else {
              reject(new Error(`Failed to download image after redirect: ${redirectResponse.statusCode}`))
            }
          }).on('error', reject)
        } else if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(filepath)
          response.pipe(fileStream)
          handleFileStream(fileStream, filepath, resolve, reject)
        } else {
          reject(new Error(`Failed to download image: ${response.statusCode}`))
        }
      }).on('error', reject)

      request.end()
    })
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      await delay(RETRY_DELAY)
      return downloadImage(url, filepath, retryCount + 1)
    }
    throw error
  }
}

const processImage = async (inputPath: string, outputPath: string, size: keyof typeof IMAGE_SIZES): Promise<void> => {
  const { width, height, quality } = IMAGE_SIZES[size]
  await sharp(inputPath)
    .resize(width, height, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality })
    .toFile(outputPath)
}

const getRandomImageId = () => {
  const index = Math.floor(Math.random() * IMAGE_IDS.length)
  return IMAGE_IDS[index]
}

const cleanupTempFiles = () => {
  try {
    const files = fs.readdirSync(TEMP_DIR)
    for (const file of files) {
      cleanupFile(path.join(TEMP_DIR, file))
    }
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmdirSync(TEMP_DIR)
    }
  } catch (error) {
    console.error('Failed to clean up temp directory:', error)
  }
}

const processImageSet = async (
  images: Record<string, string>,
  type: 'station' | 'genre'
) => {
  for (const [name, imagePath] of Object.entries(images)) {
    const tempPath = path.join(TEMP_DIR, `${name}.jpg`)
    const publicPath = path.join(PUBLIC_DIR, imagePath)
    const publicDir = path.dirname(publicPath)

    try {
      ensureDirectoryExists(publicDir)
      const imageId = getRandomImageId()
      const imageUrl = `https://images.unsplash.com/photo-${imageId}?w=1280&h=720&fit=crop`
      await downloadImage(imageUrl, tempPath)
      await processImage(tempPath, publicPath, 'lg')
      console.log(`✓ Downloaded and processed image for ${type}: ${name}`)
    } catch (error) {
      console.error(`✗ Failed to process image for ${type} ${name}:`, error)
    } finally {
      cleanupFile(tempPath)
    }
  }
}

const downloadAndProcessImages = async () => {
  // Ensure temp directory exists
  ensureDirectoryExists(TEMP_DIR)

  try {
    await processImageSet(STATION_IMAGES, 'station')
    await processImageSet(GENRE_IMAGES, 'genre')
  } finally {
    cleanupTempFiles()
  }
}

downloadAndProcessImages().catch(console.error) 