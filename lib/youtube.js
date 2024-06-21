"use server"
const API_KEY = process.env.YOUTUBE_API_KEY
const CHANNEL_IDS = [
  "UCWzBeQ6_gbFc0hQltarMTVw", // PPA channel ID
  "UCSP6HlrMmRqogym2aHBPHpw", // Another example channel ID
  // Add more channel IDs as needed
]

export const fetchYouTubeVideos = async () => {
  try {
    let allVideos = []
    let uniqueVideoIds = new Set() // Set to track unique video IDs

    // Fetch videos until we have 100 unique videos
    while (uniqueVideoIds.size < 20) {
      for (const channelId of CHANNEL_IDS) {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=4&type=video&order=date&key=${API_KEY}`
        )
        if (!response.ok) {
          throw new Error(`Failed to fetch videos for channel ${channelId}`)
        }
        const data = await response.json()

        // Filter out duplicates and add to allVideos and uniqueVideoIds
        data.items.forEach((video) => {
          if (!uniqueVideoIds.has(video.id.videoId)) {
            allVideos.push(video)
            uniqueVideoIds.add(video.id.videoId)
          }
        })

        // Exit loop if we reach 100 unique videos
        if (uniqueVideoIds.size >= 20) {
          break
        }
      }
    }

    // Slice to ensure exactly 100 videos if we have more than needed
    allVideos = allVideos.slice(0, 100)

    // Optionally, sort allVideos by published date (if needed)
    allVideos.sort((a, b) => {
      const dateA = new Date(a.snippet.publishedAt)
      const dateB = new Date(b.snippet.publishedAt)
      return dateB - dateA // Sort in descending order (most recent first)
    })

    return allVideos
  } catch (error) {
    console.error("Error fetching YouTube videos:", error.message)
    return []
  }
}
