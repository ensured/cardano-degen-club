"use client"

import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import punycodeConverter from "./punycodeConverter"

const inputSchema = z.object({
  searchInput: z.string().min(1).max(40),
})

const CardForm = () => {
  const [searchInput, setSearchInput] = useState("")
  const [output, setOutput] = useState("")

  const getIsAvail = () => {
    const data = fetch("https://bff.handle.me/handle/rap")
    console.log(data)
  }

  const handleFormSubmit = () => {
    const isAvail = getIsAvail()
    console.log(isAvail)
    try {
      inputSchema.parse({
        searchInput,
      })
      const converted = punycodeConverter(searchInput)
      setOutput(converted)
    } catch (error) {
      console.log(error.errors[0])
      toast(JSON.stringify(error.errors[0]))
    }
  }

  const handleInputChange = (e) => {
    setSearchInput(e.target.value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Punycode Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <Input
            type="email"
            placeholder="Email"
            onChange={handleInputChange}
          />
          <Button
            className={buttonVariants({ variant: "outline" })}
            onClick={handleFormSubmit}
          >
            Convert
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p>
          {output ? <span className="text-green-500">{output}</span> : null}{" "}
        </p>
      </CardFooter>
    </Card>
  )
}

export default CardForm
