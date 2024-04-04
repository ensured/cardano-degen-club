/**
 * Render a card component displaying comments if available, otherwise display a message indicating no comments.
 *
 * @return {JSX.Element} The CommentsCard component
 */

import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/server"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"

const CommentsCard = ({
  comments,
  convertDateTimeAgo,
  extractNameFromFeedbackString,
}) => {
  return (
    <div className="relative flex h-[86vh] flex-col items-center justify-center p-2">
      <div className="absolute right-0 top-0 w-48 px-4 py-2">
        <LogoutLink className="border-b-pink-900 border-l-pink-900 flex flex-row items-center justify-center rounded-md border-y border-b-4 border-l-2 bg-teal-700 p-3 shadow-card hover:translate-y-px hover:border-b  hover:border-l hover:shadow-none">
          Log out
        </LogoutLink>
      </div>
      <div className="mx-1 flex flex-row flex-wrap items-center justify-center gap-1 font-mono">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.objKey} className="max-w-3xl">
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
                <p className="font-mono text-sm text-gray-900 opacity-60 dark:text-slate-50 dark:opacity-40">
                  Posted by{" "}
                  <strong className="text-md">
                    {extractNameFromFeedbackString(comment.objKey)}
                  </strong>
                </p>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="flex w-full justify-center">
            <p className="font-mono text-sm text-gray-900 opacity-60 dark:text-slate-50 dark:opacity-40">
              No comments yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentsCard
