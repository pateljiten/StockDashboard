/**
 * Format a number as currency (USD)
 */
export const formatCurrency = (value: number, showSign = false): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value))
  
  if (showSign && value !== 0) {
    return value > 0 ? `+${formatted}` : `-${formatted}`
  }
  
  return value < 0 ? `-${formatted}` : formatted
}

/**
 * Format a number as percentage
 */
export const formatPercent = (value: number, showSign = true): string => {
  const formatted = `${Math.abs(value).toFixed(2)}%`
  
  if (showSign && value !== 0) {
    return value > 0 ? `+${formatted}` : `-${formatted}`
  }
  
  return formatted
}

/**
 * Format a large number with abbreviation (K, M, B)
 */
export const formatCompactNumber = (value: number): string => {
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`
  }
  return value.toFixed(2)
}

/**
 * Format a number with commas
 */
export const formatNumber = (value: number, decimals = 2): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Get CSS class for positive/negative values
 */
export const getValueColorClass = (value: number): string => {
  if (value > 0) return 'text-emerald-600'
  if (value < 0) return 'text-red-500'
  return 'text-gray-600'
}

/**
 * Get background color class for positive/negative values
 */
export const getValueBgClass = (value: number): string => {
  if (value > 0) return 'bg-emerald-50 text-emerald-700'
  if (value < 0) return 'bg-red-50 text-red-700'
  return 'bg-gray-50 text-gray-700'
}

