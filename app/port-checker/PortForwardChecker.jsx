"use client"

import { useState } from "react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

function PortForwardChecker({ usersIp }) {
  const [ip, setIp] = useState("")
  const [port, setPort] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setResult(null)
    setError(null)
    setLoading(true) // Set loading to true when submitting form

    try {
      const response = await axios.get("/api/ping", {
        params: { ip, port },
      })
      setResult(response.data.message)
    } catch (err) {
      setError(err.response?.data?.message || "Error checking port")
    }

    setLoading(false) // Set loading to false after response received
  }

  return (
    <div className="mt-2 flex md:flex-row flex-col items-center justify-center rounded-md p-6 md:gap-10 lg:gap-20 gap-4">
      <h1 className="text-center max-w-[269px] md:max-w-[500px] md:text-4xl text-2xl">
        Check open/closed ports for any ip address
      </h1>
      <Form>
        <form onSubmit={handleSubmit}>
          <label htmlFor="ip">IP Address:</label>

          <Input
            type="text"
            id="ip"
            placeholder="69.69.69.69"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
          <br />
          <label htmlFor="port">Port Number:</label>
          <Input
            type="number"
            id="port"
            placeholder={"1024"}
            value={port}
            onChange={(e) => setPort(e.target.value)}
            min={0}
            max={65535}
          />
          <div className="h-6">
            {result && (
              <p>
                {result.includes("Port is open") && (
                  <>
                    Port is <b className="text-green">open</b>
                  </>
                )}
                {result.includes("Port is closed") && (
                  <>
                    Port is <b className="text-red-600 opacity-90">closed</b>
                  </>
                )}
                {result.includes("Error checking port") && (
                  <>
                    <b className="text-red-600 opacity-90">
                      Error checking port
                    </b>
                  </>
                )}
                {result.includes("Connection timed out") && (
                  <>
                    <b className="text-red-600 opacity-90">
                      Connection timed out
                    </b>
                  </>
                )}
              </p>
            )}
            {error && <p className="text-red-600">{error}</p>}
          </div>

          <Button
            className="relative w-full flex items-center justify-center" // Add flexbox styles
            variant={"moon"}
            type="submit"
            disabled={loading}
          >
            {!loading && "Check Port"}
            {loading && (
              <>
                <span>Loading...</span>
                <svg
                  className="absolute h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.373A8 8 0 0012 20v4c-4.418 0-8-3.582-8-8h4zM20 12c0-4.418-3.582-8-8-8v4c3.137 0 5.373 1.164 7.373 3.164l-1.732 1.732C17.373 13.622 16 12.373 16 12h4z"
                  ></path>
                </svg>
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default PortForwardChecker
