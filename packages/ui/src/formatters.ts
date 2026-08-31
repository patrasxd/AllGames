export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function pad3(num: number): string {
  if (num < 0) return '000'
  if (num > 999) return '999'
  return String(num).padStart(3, '0')
}
