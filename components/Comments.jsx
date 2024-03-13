import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server"

import extractNameFromFeedbackString, { convertDateTimeAgo } from "@/lib/helper"

import getFeedbackDataByKey from "./getFeedback"
import listFeedbackObjects from "./listFeedbackObjects"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"

const Comments = async () => {
  const fetchComments = async () => {
    try {
      const { success, feedbackObjects } = await listFeedbackObjects()
      console.log(feedbackObjects)
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
    <div className="flex flex-col items-center justify-center  ">
      <div className="h-16 w-48 px-4 py-2">
        <LogoutLink className="flex flex-row items-center justify-center rounded-md  border-y border-b-4 border-l-2 border-b-pink-900 border-l-pink-900 bg-teal-700 p-3 shadow-card hover:translate-y-px hover:border-b  hover:border-l hover:shadow-none">
          Log out
        </LogoutLink>
      </div>
      {comments && comments.length > 0 && (
        <div className="mx-1 flex flex-row flex-wrap items-center justify-center gap-1 font-mono">
          {comments.map((comment) => (
            <Card key={comment.objKey} className="max-w-3xl  ">
              <CardHeader>
                <CardTitle>
                  <div className="break-all">
                    {comment.feedbackData.feedback}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{convertDateTimeAgo(comment.feedbackData.date)}</p>
              </CardContent>
              <CardFooter>
                <p className="font-mono text-sm text-gray-900 opacity-60 dark:opacity-40 dark:text-slate-50">
                  Posted by{" "}
                  <strong className="text-md ">
                    {extractNameFromFeedbackString(comment.objKey)}
                  </strong>
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default Comments
