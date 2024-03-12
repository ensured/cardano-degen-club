import {
  LoginLink,
  LogoutLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server"

import extractNameFromFeedbackString from "@/lib/helper"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import getFeedbackDataByKey from "@/components/getFeedback"
import listFeedbackObjects from "@/components/listFeedbackObjects"

const page = async () => {
  const { getUser, isAuthenticated } = getKindeServerSession()
  const user = getUser()
  if (isAuthenticated) {
    if (user?.email === "finalemail417@gmail.com") {
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
      console.log()

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
                    <p>{comment.feedbackData.date}</p>
                  </CardContent>
                  <CardFooter>
                    <p className="font-mono text-sm text-gray-200 opacity-60">
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
    } else {
      if (user) {
        return (
          <div className="flex flex-col items-center justify-center">
            <CardTitle>Hello {user.email}</CardTitle>
            <LogoutLink className="rounded-md bg-teal-600 p-2 px-5">
              <div className="rounded-md bg-teal-600 p-1 px-4">Log out</div>
            </LogoutLink>
          </div>
        )
      } else {
        return (
          <div className="flex flex-col items-center justify-center">
            <CardTitle>Not authenticated and not authorized.</CardTitle>
            <LoginLink className="rounded-md bg-teal-900 p-2 px-5">
              Log in
            </LoginLink>
          </div>
        )
      }
    }
  }
}

export default page
