export const getItem = <T>(key: string): T | undefined => {
  return localStorage[key] ? JSON.parse(localStorage[key]) : undefined
}

export const setItem = <T>(key: string, value: T): T => {
  localStorage[key] = JSON.stringify(value)
  return value
}
