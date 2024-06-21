"use server"
const API_KEY = process.env.YOUTUBE_API_KEY
const CHANNEL_ID = "UCSP6HlrMmRqogym2aHBPHpw" // Replace with the PPA's YouTube channel ID

export const fetchYouTubeVideos = async () => {
  try {
    // Fetch the most recent 20 videos from the PPA channel
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=20&type=video&order=date&key=${API_KEY}`
    )
    if (!response.ok) {
      throw new Error("Failed to fetch videos")
    }
    const data = await response.json()
    return data.items
  } catch (error) {
    console.error("Error fetching YouTube videos:", error.message)
    return []
  }
}
