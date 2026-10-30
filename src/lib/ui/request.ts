export async function mutateJson(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) {
  const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error ?? 'Could not save changes. Try again.')
  return data
}
