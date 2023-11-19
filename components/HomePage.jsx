"use client"

import { useRouter } from "next/navigation"

import CardForm from "@/components/CardForm"

const HomePage = () => {
  const router = useRouter()
  return (
    <div className="mt-8">
      <CardForm />
    </div>
  )
}

export default HomePage
