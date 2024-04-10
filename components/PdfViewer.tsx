"use client"

import { useCallback, useEffect, useState } from "react"
import { useResizeObserver } from "@wojtekmaj/react-hooks"
import { Document, Page, pdfjs } from "react-pdf"

import "./PdfViewer.css"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
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

export default function PDFViewer({ inputFile }: { inputFile: File | null }) {
  const [file, setFile] = useState<PDFFile>(inputFile)
  const [numPages, setNumPages] = useState<number>()
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>()

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

  return (
    <div>
      <label htmlFor="file"></label>{" "}
      <input onChange={onFileChange} type="file" hidden />
      <div
        ref={setContainerRef}
        className={`absolute inset-x-0 top-[6.2rem] z-40 mx-auto overflow-auto rounded-md shadow-md ${
          file ? "border-2 border-indigo-400/50 shadow-indigo-700" : ""
        }`}
      >
        {!file ||
          (file !== null && (
            <Button
              variant={"moon"}
              className="absolute right-0 z-50 h-8 w-8 rounded-md p-1 text-sm" // Adjust padding and font size here
              onClick={() => {
                if (file) {
                  setFile(null)
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-x"
              >
                <line x1="6" y1="6" x2="18" y2="18"></line>
                <line x1="6" y1="18" x2="18" y2="6"></line>
              </svg>
            </Button>
          ))}
        <Document
          file={file}
          noData={""}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
          className={"rounded-md"}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={containerWidth}
            />
          ))}
        </Document>
      </div>
    </div>
  )
}
