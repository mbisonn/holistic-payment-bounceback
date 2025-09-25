export async function sendWhatsAppMessage(to: string, content: string, name?: string) {
  const endpoint = `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || '/'}send-whatsapp`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, content, name })
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to send WhatsApp message')
  }
  return res.json()
}



