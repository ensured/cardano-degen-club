"use client"

import { useState } from "react"

const FeedbackListClient = ({ feedbackList, sortFeedbackList }) => {
  return (
    <div className="flex flex-col items-center justify-center pt-40">
      <button onClick={sortFeedbackList}>Sort by Date</button>
      {feedbackList.length > 0 &&
        feedbackList.map((feedback, index) => (
          <div key={index} style={commentStyle}>
            <p>
              <strong>Date:</strong> {feedback.date}
            </p>
            <p>
              <strong>Title: </strong> {extractTitle(feedback.Key)}
            </p>
            <p>
              <strong>Feedback: </strong> {feedback.feedback}
            </p>
          </div>
        ))}
    </div>
  )
}

export default FeedbackListClient
