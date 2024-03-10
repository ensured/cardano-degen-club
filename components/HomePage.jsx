"use client"

import CardForm from "@/components/CardForm"

import FeedBackDrawer from "./FeedbackClient"

const HomePage = () => {
  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-4">
      <CardForm />
      <FeedBackDrawer />
    </div>
  )
}

export default HomePage
