"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import VideoCard from "@/components/VideoCard"
import { scrapePickleballVideos } from "@/components/actions"

const Page = () => {
  // const [pickleballVideos, setPickleballVideos] = useState([])
  // const [visibleVideos, setVisibleVideos] = useState([])
  // const [loading, setLoading] = useState(false)
  // const observer = useRef()

  // const loadMoreVideos = useCallback(() => {
  //   const newVisibleVideos = pickleballVideos.slice(
  //     visibleVideos.length,
  //     visibleVideos.length + 10
  //   )
  //   setVisibleVideos((prev) => [...prev, ...newVisibleVideos])
  // }, [pickleballVideos, visibleVideos.length])

  // useEffect(() => {
  //   const handleObserver = (entries) => {
  //     const target = entries[0]
  //     if (target.isIntersecting) {
  //       loadMoreVideos()
  //     }
  //   }

  //   observer.current = new IntersectionObserver(handleObserver, {
  //     root: null,
  //     rootMargin: "20px",
  //     threshold: 0.1,
  //   })

  //   const target = document.querySelector("#loadMoreTrigger")
  //   if (target) {
  //     observer.current.observe(target)
  //   }

  //   return () => {
  //     if (observer.current && target) {
  //       observer.current.unobserve(target)
  //     }
  //   }
  // }, [loadMoreVideos])

  // useEffect(() => {
  //   async function fetchData() {
  //     setLoading(true)
  //     const videoIds = await scrapePickleballVideos()
  //     setPickleballVideos(videoIds)
  //     setVisibleVideos(videoIds.slice(0, 10))
  //     setLoading(false)
  //   }
  //   fetchData()
  // }, [])

  return (
    <div>
      <div className="flex flex-col items-center justify-center pt-2">
        Pickleball
      </div>

      {/* {visibleVideos.length > 0 ? (
        <div className="m-6 grid grid-cols-1 gap-6  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleVideos.map((videoId) => (
            <iframe
              key={videoId}
              src={`https://www.youtube.com/embed/${videoId}`}
              title={videoId}
              className="rounded-lg border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ))}
          <div id="loadMoreTrigger" className="h-1"></div>
        </div>
      ) : (
        loading && (
          <div className="relative flex h-[86vh] flex-row items-center justify-center gap-2 ">
            <Loader2 className="size-10 animate-spin" />
          </div>
        )
      )} */}
    </div>
  )
}

export default Page
