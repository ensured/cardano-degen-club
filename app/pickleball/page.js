"use client"

import { useEffect, useState } from "react"

import { fetchYouTubeVideos } from "@/lib/youtube"
import VideoCard from "@/components/VideoCard"

export default function Home() {
  const [videos, setVideos] = useState([])

  useEffect(() => {
    const getVideos = async () => {
      const videoData = await fetchYouTubeVideos()
      setVideos(videoData)
    }

    getVideos()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Pickleball Pro Doubles Matches
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id.videoId} video={video} />
        ))}
      </div>
    </div>
  )
}
