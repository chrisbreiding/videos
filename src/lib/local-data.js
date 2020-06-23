export const getItem = (key) => {
  return localStorage[key] ? JSON.parse(localStorage[key]) : undefined
}

export const setItem = (key, value) => {
  localStorage[key] = JSON.stringify(value)
  return value
}
