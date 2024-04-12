/* eslint-disable tailwindcss/classnames-order */
"use client"

import React, { useCallback, useEffect, useState } from "react"
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

import { Button } from "./ui/button"

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
    }
  }

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages)
  }

  // Function to handle download using jsPDF
  async function handleDownload() {
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1 // Adjust for zero-based indexing
    const day = new Date().getDate()
    const hour = new Date().getHours().toString().padStart(2, "0")
    const minutes = new Date().getMinutes().toString().padStart(2, "0")
    const seconds = new Date().getSeconds().toString().padStart(2, "0")
    const date = `${year}-${month}-${day}-${hour}-${minutes}-${seconds}`

    if (file && numPages !== undefined) {
      const doc = new jsPDF()
      const batchSize = 5
      const totalBatches = Math.ceil(numPages / batchSize)
      console.log(totalBatches)
      const promises = []
      for (let i = 0; i < totalBatches; i++) {
        promises.push(processBatch(i, batchSize, numPages, doc, totalBatches))
      }

      try {
        await Promise.all(promises)
        doc.save(`Recipes-(Favorites)--[${date}].pdf`)
      } catch (error) {
        console.error("Error processing batches:", error)
      }
    }
  }

  if (!size.width || !size.height) return null

  return (
    <div>
      <label htmlFor="file"></label>{" "}
      <input onChange={onFileChange} type="file" hidden />
      <div
        ref={setContainerRef}
        className={` absolute inset-x-0 top-[6.26rem] z-40 overflow-auto mx-2 shadow-md ${
          file ? "border p-2 rounded-sm bg-background" : ""
        }`}
      >
        {!file ||
          (file !== null && (
            <div className="w-full flex flex-row justify-between items-center flex-wrap mb-2 pb-1">
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
                onClick={() => {
                  if (file) {
                    setFile(null)
                  }
                }}
              >
                <X size={size.width < 520 ? 20 : size.width < 840 ? 28 : 36} />
              </Button>
            </div>
          ))}
        <Document
          file={file}
          noData={""}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
          className={""}
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
