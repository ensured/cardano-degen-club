/* eslint-disable tailwindcss/classnames-order */
"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useResizeObserver } from "@wojtekmaj/react-hooks"
import { jsPDF } from "jspdf"
import { Document, Page, pdfjs } from "react-pdf"

import "./PdfViewer.css"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import { useWindowSize } from "@uidotdev/usehooks"
import { DownloadIcon, X } from "lucide-react"
import type { PDFDocumentProxy } from "pdfjs-dist"
import { File } from "react-pdf/dist/cjs/shared/types"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { Button } from "./ui/button"
import { Input } from "./ui/input"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString()

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
}

const resizeObserverOptions = {}

type PDFFile = string | File | null

async function processBatch(
  batchIndex: number,
  batchSize: number,
  numPages: number | undefined,
  doc: jsPDF,
  totalBatches: number
) {
  const startPage = batchIndex * batchSize + 1
  const endPage = Math.min((batchIndex + 1) * batchSize, numPages ?? 0)

  for (let i = startPage; i <= endPage; i++) {
    const canvas = document.getElementById(`page_canvas_${i}`)
    if (canvas instanceof HTMLCanvasElement) {
      doc.addImage(
        canvas,
        "canvas",
        0,
        0,
        doc.internal.pageSize.getWidth(),
        doc.internal.pageSize.getHeight()
      )
    } else {
      console.error(`Canvas not found for page ${i}`)
    }

    if (i !== endPage) {
      doc.addPage()
    }
  }

  // Add a new page if it's not the last batch
  if (batchIndex < totalBatches - 1) {
    doc.addPage()
  }
}

export default function PDFViewer({ inputFile }: { inputFile: File | null }) {
  const [file, setFile] = useState<PDFFile>(inputFile)
  const [numPages, setNumPages] = useState<number>()
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>()
  const [filename, setFilename] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [isSwitchChecked, setIsSwitchChecked] = useState(false)

  const moveCursor = useCallback(async () => {
    if (inputRef.current) {
      const inputLength = filename.length
      const pdfIndex = filename.lastIndexOf(".pdf")

      if (pdfIndex !== -1) {
        const cursorPosition = Math.min(
          inputRef.current.selectionStart ?? inputLength,
          pdfIndex
        )
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
      }
    }
  }, [filename])

  useEffect(() => {
    moveCursor()
  }, [filename, moveCursor])

  const size = useWindowSize()

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries

    if (entry) {
      setContainerWidth(entry.contentRect.width)
    }
  }, [])

  useEffect(() => {
    setFile(inputFile)
  }, [inputFile])

  useResizeObserver(containerRef, resizeObserverOptions, onResize)

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
    try {
      const { files } = event.target

      if (files && files[0]) {
        setFile(files[0] || null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      inputRef.current?.focus()
    }
  }

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages)
    setTimeout(() => {
      inputRef.current?.focus()
      moveCursor()
    }, 200)
  }

  // Function to handle download using jsPDF
  async function handleDownload() {
    if (file && numPages !== undefined) {
      const doc = new jsPDF()
      const batchSize = 10
      const totalBatches = Math.ceil(numPages / batchSize)

      const promises = []
      for (let i = 0; i < totalBatches; i++) {
        promises.push(processBatch(i, batchSize, numPages, doc, totalBatches))
      }

      try {
        await Promise.all(promises)
        let finalFilename = "Recipes-(Favorites)"
        if (filename && filename.endsWith(".pdf")) {
          finalFilename = filename.slice(0, -4) // Remove ".pdf" extension
        }

        if (isSwitchChecked) {
          const date = new Date().toISOString().replace(/:/g, "-").slice(0, -5) // Format date
          finalFilename += `--[${date}]`
        }

        finalFilename += ".pdf"

        doc.save(finalFilename)
      } catch (error) {
        console.error("Error processing batches:", error)
      }
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target
    const newValue = value.replace(/\.pdf$/, "") + ".pdf"

    // Calculate the cursor position to be before the ".pdf" extension
    const cursorPosition = newValue.lastIndexOf(".pdf")

    setFilename(newValue)

    // Set the cursor position
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition)
    }
  }

  const handleSwitch = () => {
    setIsSwitchChecked(!isSwitchChecked)
  }

  if (!size.width || !size.height) return null

  return (
    <div>
      <label htmlFor="file"></label>{" "}
      <input onChange={onFileChange} type="file" hidden />
      <div
        ref={setContainerRef}
        className={`absolute inset-x-0 top-0 z-40 shadow-md ${
          file ? "border py-2 rounded-sm bg-background" : ""
        }`}
      >
        {!file ||
          (file !== null && (
            <div className="flex flex-row justify-between items-center flex-wrap mb-2 pb-1">
              <div className="flex gap-2 flex-wrap w-full">
                <div className="w-full flex justify-center gap-2">
                  <Label htmlFor="append-datetime-switch">
                    <div className="flex flex-col w-full items-center space-x-2">
                      <Switch
                        checked={isSwitchChecked}
                        onCheckedChange={handleSwitch}
                        id="append-datetime-switch"
                      />
                      <span className="text-center ">Append datetime?</span>
                    </div>
                  </Label>
                  <Input
                    type="text"
                    placeholder="filename"
                    value={filename}
                    onChange={handleInputChange}
                    ref={inputRef}
                    className="w-40 mr-14 "
                  />
                </div>

                <div className="flex w-full justify-center items-center">
                  <Button variant={"moon"} onClick={handleDownload}>
                    <DownloadIcon
                      size={size.width < 520 ? 20 : size.width < 840 ? 28 : 36}
                    />
                    <span className="ml-2 text-md md:text-3xl xl:md:text-3xl font-serif font-semibold">
                      Download
                    </span>
                  </Button>
                  <Button
                    variant={"destructive"}
                    className="absolute top-2 right-2"
                    onClick={() => {
                      if (file) {
                        setFile(null)
                      }
                    }}
                  >
                    <X
                      size={size.width < 520 ? 20 : size.width < 840 ? 28 : 36}
                    />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        <Document
          file={file}
          noData={""}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
        >
          {numPages !== undefined &&
            Array.from(new Array(numPages), (el, index) => (
              <Page
                className={"rounded-sm"}
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={containerWidth}
                canvasRef={(el) => {
                  if (el) {
                    el.id = `page_canvas_${index + 1}`
                  }
                }}
              />
            ))}
        </Document>
      </div>
    </div>
  )
}
