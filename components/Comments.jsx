import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server"

import extractNameFromFeedbackString, { convertDateTimeAgo } from "@/lib/helper"

import CommentsCard from "./CommentsCard"
import getFeedbackDataByKey from "./getFeedback"
import listFeedbackObjects from "./listFeedbackObjects"

const Comments = async () => {
  const fetchComments = async () => {
    try {
      const { success, feedbackObjects } = await listFeedbackObjects()

      if (success) {
        if (feedbackObjects) {
          const feedbackList = await Promise.all(
            feedbackObjects.map(async (object) => {
              const { success: getSuccess, feedbackData } =
                await getFeedbackDataByKey(object.Key)
              const objKey = object.Key
              return getSuccess ? { feedbackData, objKey } : null
            })
          )
          return feedbackList
        }
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }
  const comments = await fetchComments()
  return (
    <CommentsCard
      comments={comments}
      convertDateTimeAgo={convertDateTimeAgo}
      extractNameFromFeedbackString={extractNameFromFeedbackString}
    />
  )
}

export default Comments
