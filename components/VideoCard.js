import { convertDateTimeAgo } from "@/lib/helper"

const VideoCard = ({ video }) => {
  console.log(video.snippet)
  const { title, thumbnails, publishedAt } = video.snippet
  const videoId = video.id.videoId

  return (
    <div className="overflow-hidden rounded-lg border shadow-md">
      <iframe
        width="100%"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        className="border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
      <div className="relative flex h-36 flex-col items-center p-4">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-center">
            <h1 className="line-clamp-3 text-xl font-bold">{title}</h1>
          </div>
        </div>
        <p className="absolute bottom-3.5 left-4 text-sm text-gray-500 md:text-base">
          {convertDateTimeAgo(publishedAt).replace("~", "")}
        </p>
      </div>
    </div>
  )
}

export default VideoCard
