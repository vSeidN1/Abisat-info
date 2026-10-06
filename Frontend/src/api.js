function authHeaders() {
  const credentials = sessionStorage.getItem('adminCredentials')
  return credentials ? { Authorization: `Basic ${credentials}` } : {}
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {})
  for (const [key, value] of Object.entries(authHeaders())) headers.set(key, value)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')

  const response = await fetch(path, { ...options, headers })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${response.status})`)
  }
  return response.status === 204 ? null : response.json()
}

export function toFormData(values, fileFields = []) {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) {
    if (fileFields.includes(key)) {
      if (value) data.append(key, value)
    } else {
      data.append(key, value ?? '')
    }
  }
  return data
}
