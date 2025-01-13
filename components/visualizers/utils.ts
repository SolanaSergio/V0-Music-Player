/**
 * Utility functions for visualizers
 */

/**
 * Applies sensitivity to a frequency value consistently across visualizers
 */
export const applySensitivity = (value: number, sensitivity: number, maxValue = 255): number => {
  const normalizedValue = value / maxValue
  return normalizedValue * sensitivity
}

/**
 * Applies sensitivity to an array of frequency data
 */
export const applySensitivityToData = (data: Uint8Array, sensitivity: number): number[] => {
  return Array.from(data).map(value => applySensitivity(value, sensitivity) * 255)
}

/**
 * Gets the average frequency with sensitivity applied
 */
export const getAverageFrequency = (data: Uint8Array, sensitivity: number): number => {
  const sum = Array.from(data).reduce((acc, val) => acc + val, 0)
  const avg = sum / data.length
  return applySensitivity(avg, sensitivity)
}

/**
 * Gets normalized frequency value (0-1) with sensitivity applied
 */
export const getNormalizedFrequency = (value: number, sensitivity: number): number => {
  return applySensitivity(value, sensitivity)
} 