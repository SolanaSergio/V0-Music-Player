/// <reference lib="webworker" />

// Ensure we're in a worker context
const ctx = self as DedicatedWorkerGlobalScope

// Audio processing configuration
const config = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  minDecibels: -90,
  maxDecibels: -10,
  beatDetectionThreshold: 0.15,
  beatDetectionRange: [5, 15]
}

// Audio processing state
let isProcessing = false
let dataArray: Uint8Array
let timeDataArray: Uint8Array
let beatDetectionBuffer: Float32Array
let lastBeatTime = 0

// Initialize arrays
ctx.addEventListener('message', (e: MessageEvent) => {
  const { type, data } = e.data

  switch (type) {
    case 'init':
      // Initialize processing buffers
      dataArray = new Uint8Array(data.fftSize / 2)
      timeDataArray = new Uint8Array(data.fftSize)
      beatDetectionBuffer = new Float32Array(data.fftSize)
      break

    case 'start':
      isProcessing = true
      break

    case 'pause':
      isProcessing = false
      break

    case 'process':
      if (!isProcessing) return

      // Update buffers
      dataArray.set(data.frequencyData)
      timeDataArray.set(data.timeData)
      
      // Process audio data
      const processedData = processAudioData()
      
      // Send processed data back
      ctx.postMessage({
        type: 'processed',
        data: processedData
      })
      break
  }
})

function processAudioData() {
  // Frequency analysis
  const frequencyData = analyzeFrequencies(dataArray)
  
  // Time domain analysis
  const timeData = analyzeTimeDomain(timeDataArray)
  
  // Beat detection
  const beatInfo = detectBeats(timeDataArray)
  
  // Return processed data
  return {
    frequency: frequencyData,
    time: timeData,
    beat: beatInfo
  }
}

function analyzeFrequencies(data: Uint8Array) {
  // Calculate average frequency
  const sum = data.reduce((a, b) => a + b, 0)
  const average = sum / data.length

  // Find frequency peaks
  const peaks = findPeaks(data)

  // Calculate frequency bands
  const bands = {
    bass: averageRange(data, 0, 60),
    midrange: averageRange(data, 60, 250),
    treble: averageRange(data, 250, data.length)
  }

  return {
    average,
    peaks,
    bands
  }
}

function analyzeTimeDomain(data: Uint8Array) {
  // Convert to normalized values (-1 to 1)
  const normalized = new Float32Array(data.length)
  for (let i = 0; i < data.length; i++) {
    normalized[i] = (data[i] - 128) / 128
  }

  // Calculate RMS (volume)
  const rms = Math.sqrt(
    normalized.reduce((acc, val) => acc + val * val, 0) / normalized.length
  )

  // Find zero crossings (frequency estimation)
  let zeroCrossings = 0
  for (let i = 1; i < normalized.length; i++) {
    if (normalized[i] * normalized[i - 1] < 0) {
      zeroCrossings++
    }
  }

  return {
    waveform: normalized,
    volume: rms,
    zeroCrossings
  }
}

function detectBeats(data: Uint8Array) {
  const currentTime = performance.now()
  const timeSinceLastBeat = currentTime - lastBeatTime

  // Copy data to beat detection buffer
  for (let i = 0; i < data.length; i++) {
    beatDetectionBuffer[i] = (data[i] - 128) / 128
  }

  // Detect beat
  let isBeat = false
  try {
    const energy = calculateEnergy(beatDetectionBuffer)
    if (energy > config.beatDetectionThreshold && 
        timeSinceLastBeat > config.beatDetectionRange[0] && 
        timeSinceLastBeat < config.beatDetectionRange[1]) {
      isBeat = true
      lastBeatTime = currentTime
    }
  } catch (error) {
    console.error('Beat detection error:', error)
  }

  return {
    isBeat,
    energy: calculateEnergy(beatDetectionBuffer),
    interval: timeSinceLastBeat
  }
}

// Utility functions
function findPeaks(data: Uint8Array) {
  const peaks: number[] = []
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
      peaks.push(i)
    }
  }
  return peaks
}

function averageRange(data: Uint8Array, start: number, end: number) {
  let sum = 0
  for (let i = start; i < end && i < data.length; i++) {
    sum += data[i]
  }
  return sum / (end - start)
}

function calculateEnergy(buffer: Float32Array) {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i]
  }
  return Math.sqrt(sum / buffer.length)
}


