"use client"

import { useState } from "react"

import CardForm from "@/components/CardForm"

import punycodeConverter from "./punycodeConverter"

export default function Search() {
  const [searchInput, setSearchInput] = useState("")
  const [output, setOutput] = useState("")

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const text = formData.get("search")
    const converted = punycodeConverter(text)
    setOutput(converted)
  }

  const handleInputChange = (e) => {
    setSearchInput(e.target.value)
  }

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg">
        {/* form */}
        {/* <form className="flex" onSubmit={handleFormSubmit}>
          <input
            type="text"
            name="search"
            className="rounded-l py-2 px-4 outline-none focus:shadow-outline rounded-md"
            placeholder="Enter text here..."
            onChange={handleInputChange}
            value={searchInput}
          />
          <button type="submit" className={buttonVariants()}>
            Convert
          </button>
        </form> */}
        <CardForm />
      </div>
    </div>
  )
}
