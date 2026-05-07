// Absolute base URL — works in local, Vercel preview and production
export function siteUrl(): string {
  // Set explicitly (e.g. custom domain in production)
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL

  // Vercel injects this automatically on every deployment
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  return 'http://localhost:3001'
}
