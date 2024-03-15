"use client"

import { useEffect, useState } from "react"

import CardForm from "@/components/CardForm"

const HomePage = () => {
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Trigger slide-in and fade-in effect after component mounts
    setShowForm(true)
  }, [])

  return (
    <div className="mb-20 mt-24">
      <div
        className={`transition-all duration-1000 ${
          showForm ? "translate-x-0 opacity-100" : "translate-x-32 opacity-0"
        }`}
      >
        <CardForm autoFocus={false} />
      </div>
    </div>
  )
}

export default HomePage
