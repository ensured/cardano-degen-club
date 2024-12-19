export default function extractNameFromFeedbackString(feedbackString) {
  // Split the string by '/' and get the last part
  const parts = feedbackString.split("/").pop()

  // Extract the name from the last part, removing leading/trailing spaces
  const name = parts.split("-")[0].trim()

  // Check if the name is not empty or just spaces, return it; otherwise, return "anonymous"
  return name !== "" ? name : "Anon"
}

export function convertDateTimeAgo(formattedDateString) {
  const date = new Date(formattedDateString)
  const now = new Date()
  const diff = Math.abs(now.getTime() - date.getTime())
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  const centuries = Math.floor(years / 100)

  if (centuries > 0) {
    return `~${centuries} century${centuries > 1 ? "s" : ""} ago`
  } else if (years > 0) {
    return `~${years} year${years > 1 ? "s" : ""} ago`
  } else if (months > 0) {
    return `~${months} month${months > 1 ? "s" : ""} ago`
  } else if (days > 0) {
    return `~${days} day${days > 1 ? "s" : ""} ago`
  } else if (hours > 0) {
    return `~${hours} hour${hours > 1 ? "s" : ""} ago`
  } else if (minutes > 0) {
    return `~${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else {
    return "Just now"
  }
}

export const timeAgoCompact = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.abs(now.getTime() - date.getTime())
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  const centuries = Math.floor(years / 100)

  if (centuries > 0) {
    return `${centuries} centur${centuries > 1 ? "ies" : "y"} ago`
  } else if (years > 0) {
    return `${years}y`
  } else if (months > 0) {
    return `${months}M`
  } else if (days > 0) {
    return `${days}d`
  } else if (hours > 0) {
    return `${hours}h`
  } else if (minutes > 0) {
    return `${minutes}m`
  } else {
    return "Just now"
  }
}
