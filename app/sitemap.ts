import { MetadataRoute } from "next"

// Define an interface for the expected data structure
interface RouteItem {
  slug: string // Assuming each item has a slug property
  updatedAt: string // Assuming each item has an updatedAt property
  isHomePage?: boolean // Optional property to determine if it's the homepage
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.cardanodegen.shop" // Replace with your actual domain

  // Fetch dynamic routes from an API or database
  const response = await fetch("https://api.example.com/routes") // Replace with your API endpoint
  const data: RouteItem[] = await response.json() // Specify the type of data

  const routes = data.map((item: RouteItem) => ({
    // Use the defined interface
    url: `${baseUrl}/${item.slug}`,
    lastModified: new Date(item.updatedAt),
    changeFrequency: "weekly" as const,
    priority: item.isHomePage ? 1 : 0.8,
  }))

  return routes
}
