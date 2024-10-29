"use client"

import React, { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"

import { Button } from "./ui/button"
import { Form } from "./ui/form"
import { Input } from "./ui/input"

function getCurrentTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, "0") // Ensure two digits
  const minutes = String(now.getMinutes()).padStart(2, "0") // Ensure two digits
  return `${hours}:${minutes}`
}

function getCurrentDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0") // Month is zero-based
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const Notify = () => {
  const [message, setMessage] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  const messageRef = useRef()

  useEffect(() => {
    const currentTime = getCurrentTime()
    const currentDate = getCurrentDate()
    setTime(currentTime)
    setDate(currentDate)
    messageRef.current.focus()
  }, [])

  useEffect(() => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification")
    } else {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const handleNotification = () => {
      if (Notification.permission === "granted") {
        new Notification(`Message: ${message}`, {
          body: `Date: ${date}, Time: ${time}`,
        })
      }
    }

    const storedDateTime = new Date(`${date}T${time}`)
    const currentDateTime = new Date()

    const timeDifference = storedDateTime.getTime() - currentDateTime.getTime()

    if (timeDifference > 0) {
      const timeoutId = setTimeout(() => {
        handleNotification()
      }, timeDifference)

      return () => clearTimeout(timeoutId)
    }
  }, [date, time, message])

  const handleInputChange = (e) => {
    setMessage(e.target.value)
  }

  const handleDateChange = (e) => {
    setDate(e.target.value)
  }

  const handleTimeChange = (e) => {
    setTime(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!message) {
      toast.error("Please enter a message", {
        duration: 2000,
      })
      return
    }

    const selectedDateTime = new Date(`${date}T${time}`)
    const currentDateTime = new Date()

    if (selectedDateTime < currentDateTime) {
      toast.error("Selected date and time cannot be in the past", {
        duration: 2500,
      })
      return
    }

    // Store message, date, and time in localStorage
    localStorage.setItem("message", message)
    localStorage.setItem("date", date)
    localStorage.setItem("time", time)
    toast.success("Notification has been set!", {
      duration: 2250,
    })
  }

  return (
    <div className="container flex w-full flex-col gap-6 p-8">
      <h1 className="p-4 text-center font-serif text-3xl">Notification App</h1>
      <Form>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center gap-1">
            <Input
              className="w-[300px] font-mono"
              type="text"
              placeholder="Enter reminder message"
              value={message}
              ref={messageRef}
              onChange={handleInputChange}
            />
            <div className="flex flex-row gap-1">
              <Input
                type="date"
                className="w-[140px] font-mono"
                value={date}
                onChange={handleDateChange}
              />
              <Input
                type="time"
                className="w-[120px] font-mono"
                value={time}
                onChange={handleTimeChange}
              />
            </div>
            <div className="flex flex-row">
              <Button
                type="submit"
                className="w-[150px] font-serif"
                variant={"outline"}
              >
                Notify
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default Notify
