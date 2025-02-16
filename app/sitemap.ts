import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.cardanotools.xyz' // Replace with your actual domain

  // Add all your public routes here
  const routes = [
    '',
    '/cardano-links',
    '/crypto-tracker',
    '/punycode',
    '/recipe-fren',
    '/tradingview-script',
    '/port-checker',
    '/tradingview-script',
    '/generateSeed',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
