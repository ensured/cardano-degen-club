export default function extractNameFromFeedbackString(feedbackString) {
  // Split the string by '/' and get the last part
  const parts = feedbackString.split('/').pop();

  // Extract the name from the last part, removing leading/trailing spaces
  const name = parts.split('-')[0].trim();

  // Check if the name is not empty or just spaces, return it; otherwise, return "anonymous"
  return name !== "" ? name : "Anon";
}
