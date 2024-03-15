"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
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

const CardForm = ({ autoFocus }) => {
  const [searchInput, setSearchInput] = useState("")
  const [output, setOutput] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleASCIIInput = useCallback((text) => {
    try {
      const converted = punycodeConverter(text)
      const codePoints = getCodePoints(converted)
      if (codePoints.length === 1) {
        setOutput(
          <div>
            <Badge variant="outline" className=" mb-2">
              Converted
            </Badge>
            <p className="white-space:nowrap flex w-full flex-col flex-wrap">
              {converted}
            </p>

            <Badge variant="outline" className="mb-2">
              {codePoints.length} Code Point{codePoints.length > 1 && "s"}
            </Badge>
            <Badge variant="outline">Pure</Badge>
            <p className="text-lg font-semibold">
              U+{codePoints[0].toUpperCase()}
            </p>
          </div>
        )
      } else if (codePoints.length > 1 && codePoints.length < 40) {
        setOutput(
          <div>
            <Badge variant="outline" className="mb-2 mt-4">
              Converted
            </Badge>
            <p className="white-space:nowrap flex w-full flex-col flex-wrap">
              {converted}
            </p>

            <Badge variant="outline" className="mb-2">
              {codePoints.length} Code Point{codePoints.length > 1 && "s"}
            </Badge>

            {codePoints.map((codePoint, index) => (
              <p key={index} className=" text-lg font-semibold">
                {`U+${codePoint.toUpperCase()} `}
              </p>
            ))}
          </div>
        )
      }
    } catch (error) {
      toast("Invalid unicode/punycode input", { type: "error" })
    }
  }, [])

  const handleNonASCIIInput = useCallback((text) => {
    const codePoints = getCodePoints(text)
    const converted = punycodeConverter(text)

    if (codePoints.length === 1) {
      setOutput(
        <div>
          <Badge variant="outline" className="mb-2 mt-4">
            Converted
          </Badge>
          <p className="flex w-full flex-col flex-wrap white-space:nowrap">
            {converted}
          </p>
          <br />
          <Badge variant="outline" className="mb-2">
            {codePoints.length} Code Point{codePoints.length > 1 && "s"}
          </Badge>
          <Badge variant="outline">Pure</Badge>
          <p className="text-lg font-semibold">
            U+{codePoints[0].toUpperCase()}
          </p>
        </div>
      )
    } else if (codePoints.length > 1) {
      setOutput(
        <div>
          <Badge variant="outline" className="mb-2 mt-4">
            Converted
          </Badge>
          <p className="flex w-full flex-col flex-wrap white-space:nowrap">
            {converted}
          </p>

          <br />
          <Badge variant="outline" className="mb-2">
            {codePoints.length} Code Point{codePoints.length > 1 && "s"}
          </Badge>
          {codePoints.map((codePoint, index) => (
            <p key={index} className="text-lg font-semibold">
              {`U+${codePoint.toUpperCase()} `}
            </p>
          ))}
        </div>
      )
    }
  }, [])

  const handleInputChange = useCallback(
    (e) => {
      const inputText = e.target.value
      router.replace(`?q=${inputText}`, {
        scroll: false,
      })
      setSearchInput(inputText)
      const hasNonASCII = /[^\x00-\x7F]/.test(inputText)

      if (hasNonASCII) {
        handleNonASCIIInput(inputText)
      } else {
        handleASCIIInput(inputText)
      }
    },
    [handleNonASCIIInput, handleASCIIInput, router]
  )

  useEffect(() => {
    const search = searchParams.get("q")
    if (search) {
      setSearchInput(search)
      handleInputChange({ target: { value: search } })
    }
  }, [searchParams, handleInputChange]) // Include handleInputChange in the dependency array

  const emojis = ["😃", "💁", "👌", "🎍", "😍"]
  const handleAddEmojiToInput = (e) => {
    const inputText = searchInput + e.target.innerText
    // router.push(`?q=${inputText}`)
    setSearchInput(inputText)
    const hasNonASCII = /[^\x00-\x7F]/.test(inputText)
    router.replace(`?q=${inputText}`, { scroll: false })
    if (hasNonASCII) {
      handleNonASCIIInput(inputText)
    } else {
      handleASCIIInput(inputText)
    }
  }

  const inputRef = useRef()
  return (
    <div className="container items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle className="rounded-sm text-sky-600 opacity-100 dark:text-sky-500 dark:opacity-50 flex justify-center p-4">
            Punycode Converter
          </CardTitle>
          <CardDescription className="text-md">
            Get started by entering either a emoji, punycode, or unicode.{" "}
            <i>ex</i>:{" "}
            <span
              className="hover:cursor-pointer"
              ref={inputRef}
              onClick={(e) => handleAddEmojiToInput(e)}
            >
              📙
            </span>{" "}
            Here are some emojis. <strong>Click one</strong> to try it out!{" "}
            {emojis.map((emoji, index) => (
              <span
                key={index}
                className="hover:cursor-pointer"
                onClick={(e) => handleAddEmojiToInput(e)}
              >
                {emoji}
              </span>
            ))}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col space-y-4">
            <Input
              autoFocus={autoFocus}
              type="text"
              placeholder="Enter text here..."
              onChange={handleInputChange}
              value={searchInput}
            />
          </div>
        </CardContent>
        <CardFooter>
          <div>
            {output ? (
              <span className="overflow-wrap flex w-full flex-col">
                {output}
              </span>
            ) : null}{" "}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default CardForm
