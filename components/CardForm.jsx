"use client"

import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
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

// One simple example, as you enter your non-ascii handle it could auto-decorate the field with tags i.e. pure single emoji,
// color variation, combined, scam (flashing red etc), cyrilic etc... this could be done in a very intuitive and visually appealing way -
// again this is not the solution, but I believe a solution is possible if we imagine a world that wasn't so hobbled by basic ui design.

function getCodePoints(input) {
  const codePoints = []
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    if (char >= 0xd800 && char <= 0xdbff) {
      const high = char
      const low = input.charCodeAt(++i)
      if (low >= 0xdc00 && low <= 0xdfff) {
        const codePoint = (high - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000
        codePoints.push(codePoint.toString(16)) // Convert to hexadecimal
      }
    } else {
      codePoints.push(char.toString(16)) // Convert to hexadecimal
    }
  }
  return codePoints
}

const inputSchema = z.object({
  searchInput: z.string().max(40),
})

const CardForm = () => {
  const [searchInput, setSearchInput] = useState("")
  const [output, setOutput] = useState("")

  // const handleFormSubmit = () => {
  //   try {
  //     inputSchema.parse({
  //       searchInput,
  //     })
  //     const converted = punycodeConverter(searchInput)
  //     setOutput(converted)
  //   } catch (error) {
  //     if (error.errors) {
  //       toast(JSON.stringify())
  //     }
  //     toast("Invalid punycode/ASCII input.")
  //   }
  // }

  const handleInputChange = (e) => {
    const inputText = e.target.value
    setSearchInput(inputText)
    const hasNonASCII = /[^\x00-\x7F]/.test(inputText)

    if (hasNonASCII) {
      const codePoints = getCodePoints(inputText)
      const converted = punycodeConverter(inputText)
      if (codePoints.length === 1) {
        setOutput(
          <>
            <Badge variant="outline" className="mt-4 mb-2">
              Converted
            </Badge>
            <p className="text-lg font-semibold">{converted}</p>
            <br />
            <Badge variant="outline" className="mb-2">
              {codePoints.length} Code Point{codePoints.length > 1 && "s"}
            </Badge>
            <Badge variant="outline">Pure</Badge>
            <p className="text-lg font-semibold">
              U+{codePoints[0].toUpperCase()}
            </p>
          </>
        )
      } else if (codePoints.length > 1) {
        setOutput(
          <>
            <Badge variant="outline" className="mt-4 mb-2">
              Converted
            </Badge>
            <p className="text-lg font-semibold">{converted}</p>
            <br />
            <Badge variant="outline" className="mb-2">
              {codePoints.length} Code Point{codePoints.length > 1 && "s"}
            </Badge>
            {codePoints.map((codePoint, index) => (
              <p key={index} className="text-lg font-semibold inline">
                {`U+${codePoint.toUpperCase()} `}
              </p>
            ))}
          </>
        )
      }
    }

    if (!hasNonASCII) {
      try {
        const converted = punycodeConverter(inputText)
        const codePoints = getCodePoints(converted)
        if (codePoints.length === 1) {
          setOutput(
            <>
              <Badge variant="outline" className=" mb-2">
                Converted
              </Badge>
              <p className="text-lg font-semibold">{converted}</p>
              <br />
              <Badge variant="outline" className="mb-2">
                {codePoints.length} Code Point{codePoints.length > 1 && "s"}
              </Badge>
              <p className="text-lg font-semibold">
                U+{codePoints[0].toUpperCase()}
              </p>
            </>
          )
        } else if (codePoints.length > 1) {
          setOutput(
            <>
              <Badge variant="outline" className="mt-4 mb-2">
                Converted
              </Badge>
              <p className="text-lg font-semibold">{converted}</p>

              <br />
              <Badge variant="outline" className="mb-2">
                {codePoints.length} Code Point{codePoints.length > 1 && "s"}
              </Badge>

              {codePoints.map((codePoint, index) => (
                <p key={index} className="text-lg font-semibold inline">
                  {`U+${codePoint.toUpperCase()} `}
                </p>
              ))}
            </>
          )
        }
      } catch (error) {
        toast("Invalid punycode/ASCII input.")
      }
    }
  }

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <Card>
          <CardHeader>
            <CardTitle>Punycode Converter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Input
                type="text"
                placeholder="Enter text here..."
                onChange={handleInputChange}
              />
              {/* <Button
                className={buttonVariants({ variant: "outline" })}
                onClick={handleFormSubmit}
              >
                Convert
              </Button> */}
            </div>
          </CardContent>
          <CardFooter>
            <p>
              {output ? <span className="text-green-500">{output}</span> : null}{" "}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default CardForm
