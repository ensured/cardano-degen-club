import React from "react"

const VideoCard = ({ videoId }) => {
  return (
    <div className="font-semibold text-gray-700">
      <iframe
        key={videoId}
        src={`https://www.youtube.com/embed/${videoId}`}
        title={videoId}
        className="border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
}

export default VideoCard
