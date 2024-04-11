/* eslint-disable tailwindcss/classnames-order */
"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useResizeObserver } from "@wojtekmaj/react-hooks"
import { jsPDF } from "jspdf"
import { Document, Page, pdfjs } from "react-pdf"

import "./PdfViewer.css"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import { ExitIcon } from "@radix-ui/react-icons"
import { useWindowSize } from "@uidotdev/usehooks"
import { Download, DownloadIcon, SidebarClose } from "lucide-react"
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
      // Check if canvas is not null
      // doc.addImage(
      //   canvas,
      //   "canvas",
      //   0,
      //   0,
      //   doc.internal.pageSize.getWidth(),
      //   doc.internal.pageSize.getHeight()
      // )
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
  function handleDownload() {
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
      const promises = []
      for (let i = 0; i < totalBatches; i++) {
        promises.push(processBatch(i, batchSize, numPages, doc, totalBatches))
      }

      Promise.all(promises).then(() => {
        doc.save(`Recipes-(Favorites)--[${date}].pdf`)
      })
    }
  }
  if (!size.width || !size.height) return null
  return (
    <div>
      <label htmlFor="file"></label>{" "}
      <input onChange={onFileChange} type="file" hidden />
      <div
        ref={setContainerRef}
        className={` absolute inset-x-0 top-[6.2rem] z-40 mx-auto overflow-auto rounded-md shadow-md ${
          file
            ? "border border-indigo-400/50 shadow-indigo-700 dark:bg-zinc-100"
            : ""
        }`}
      >
        {!file ||
          (file !== null && (
            <>
              <Button
                variant={"default"}
                className=" absolute sm:top-1 top-0 md:top-2 left-4 z-50 h-[1.6rem] w-auto rounded-md border dark:hover:bg-zinc-200  hover:border-slate-500 lg:h-14"
                onClick={handleDownload} // Call the handleDownload function
              >
                <DownloadIcon size={size.width < 520 ? 18 : 24} />
                <span className=" ml-2 p-4 text-sm md:text-xl">Download</span>
              </Button>
              <Button
                variant={"default"}
                className="absolute dark:hover:bg-zinc-200  hover:border-slate-500  right-0 top-0 md:top-2 p-1 z-50 h-[2.8rem] w-[3rem] rounded-md border lg:h-[3.2rem] lg:lg:w-[3.2rem]"
                onClick={() => {
                  if (file) {
                    setFile(null)
                  }
                }}
              >
                <ExitIcon className="w-6 h-6" />
              </Button>
            </>
          ))}
        <Document
          file={file}
          noData={""}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
          className={"rounded-md"}
        >
          {numPages !== undefined &&
            Array.from(new Array(numPages), (el, index) => (
              <Page
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
