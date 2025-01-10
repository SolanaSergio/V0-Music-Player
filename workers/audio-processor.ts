const ctx: Worker = self as any

let dataArray: Uint8Array
let timeDataArray: Uint8Array
let bufferLength: number

ctx.addEventListener('message', (e: MessageEvent) => {
  const { type, data } = e.data

  switch (type) {
    case 'init':
      bufferLength = data.bufferLength
      dataArray = new Uint8Array(bufferLength)
      timeDataArray = new Uint8Array(bufferLength)
      break

    case 'process':
      dataArray.set(data.frequencyData)
      timeDataArray.set(data.timeData)
      
      // Process audio data
      const processedData = {
        frequency: processFrequencyData(dataArray),
        time: processTimeData(timeDataArray)
      }

      ctx.postMessage({ type: 'processed', data: processedData })
      break
  }
})

function processFrequencyData(data: Uint8Array) {
  const sum = data.reduce((a, b) => a + b, 0)
  const avg = sum / data.length
  const peaks = findPeaks(data)
  return { avg, peaks }
}

function processTimeData(data: Uint8Array) {
  const normalized = new Float32Array(data.length)
  for (let i = 0; i < data.length; i++) {
    normalized[i] = (data[i] - 128) / 128
  }
  return normalized
}

function findPeaks(data: Uint8Array) {
  const peaks: number[] = []
  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
      peaks.push(i)
    }
  }
  return peaks
}

