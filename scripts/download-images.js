import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const imagesConfig = JSON.parse(
  fs.readFileSync(new URL('../public/backgrounds/images.json', import.meta.url))
);

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filename);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filename, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function downloadAllImages() {
  // Download background images
  const times = ['morning', 'afternoon', 'evening'];
  const backgroundsDir = path.join(__dirname, '../public/backgrounds');
  const stationsDir = path.join(__dirname, '../public/radio-stations');

  // Ensure directories exist
  [backgroundsDir, stationsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Download background images
  for (const time of times) {
    const imageConfig = imagesConfig[time];
    if (!imageConfig || !imageConfig.url) continue;

    const filename = path.join(backgroundsDir, `${time}.webp`);
    console.log(`Downloading ${time} background...`);
    
    try {
      await downloadImage(imageConfig.url, filename);
    } catch (error) {
      console.error(`Failed to download ${time} background:`, error);
    }
  }

  // Download station images
  if (imagesConfig.stations) {
    for (const [stationId, imageConfig] of Object.entries(imagesConfig.stations)) {
      if (!imageConfig || !imageConfig.url) continue;

      const filename = path.join(stationsDir, `${stationId}.webp`);
      console.log(`Downloading ${stationId} station image...`);
      
      try {
        await downloadImage(imageConfig.url, filename);
      } catch (error) {
        console.error(`Failed to download ${stationId} station image:`, error);
      }
    }
  }
}

downloadAllImages().catch(console.error); 