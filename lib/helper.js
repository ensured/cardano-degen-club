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

export async function isS3UrlExpired(url) {
  // Extract the expiration time from the URL
  const match = url.match(
    /X-Amz-Date=(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z.*X-Amz-Expires=(\d+)/
  )
  if (!match || match.length < 8) {
    // If the expiration time is not found in the URL, assume it's expired
    return true
  }

  // Parse year, month, day, hour, minute, second, and expiration seconds
  const year = parseInt(match[1])
  const month = parseInt(match[2]) - 1 // Months are zero-indexed in JavaScript
  const day = parseInt(match[3])
  const hour = parseInt(match[4])
  const minute = parseInt(match[5])
  const second = parseInt(match[6])
  const expirationSeconds = parseInt(match[7])

  // Calculate the expiration time in milliseconds
  const expirationTime =
    new Date(year, month, day, hour, minute, second).getTime() +
    expirationSeconds * 1000

  const expiresInTimeLeft = expirationTime - Date.now()
  console.log(expiresInTimeLeft)
  // Compare the expiration time with the current time
  return expirationTime < Date.now()
}
