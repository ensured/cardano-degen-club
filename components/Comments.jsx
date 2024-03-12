"use client"

import { useEffect, useState } from "react"

import { getFeedbackDataByKey, listFeedbackObjects } from "@/app/protected/page"

import extractNameFromFeedbackString from "../lib/helper"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"

const Comments = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchComments = async () => {
      try {
        const { success, feedbackObjects } = await listFeedbackObjects()
        if (success && isMounted) {
          if (feedbackObjects) {
            const feedbackList = await Promise.all(
              feedbackObjects.map(async (object) => {
                const { success: getSuccess, feedbackData } =
                  await getFeedbackDataByKey(object.Key)
                const objKey = object.Key
                return getSuccess ? { feedbackData, objKey } : null
              })
            )
            isMounted && setComments(feedbackList)
            isMounted && setLoading(false)
          }
        }
      } catch (error) {
        console.error("Error fetching comments:", error)
      }
    }

    fetchComments()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center pt-16">
      {loading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-t-4 border-dotted border-slate-50"></div>
      ) : comments.length > 0 ? (
        <Card className="">
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {comments.map((feedback, index) => (
              <Card
                key={index}
                className="flex flex-col items-center flex-wrap"
              >
                <CardContent>
                  <div className="mt-4 rounded-lg bg-slate-700 px-4 py-2 text-center text-lg font-bold opacity-50">
                    {extractNameFromFeedbackString(feedback.objKey)}
                  </div>
                  <div className="text-lg font-bold  px-4 pt-4 rounded-lg">
                    Date: {feedback.feedbackData.date}
                  </div>
                  <div className="text-lg font-bold  px-4 rounded-lg">
                    Comment: {feedback.feedbackData.feedback}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Card>
            <CardTitle>No Comments</CardTitle>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Comments
