"use client"

import { useCallback, useEffect, useState } from "react"
import { useResizeObserver } from "@wojtekmaj/react-hooks"
import { Document, Page, pdfjs } from "react-pdf"

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

const maxWidth = 800

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
      {!file ||
        (file !== null && (
          <Button
            className="fixed right-10 top-1/2 z-50 border border-slate-600 bg-slate-600/50"
            onClick={() => {
              if (file) {
                setFile(null)
              }
            }}
          >
            Close PDF
          </Button>
        ))}
      <div
        ref={setContainerRef}
        className="absolute inset-x-0 z-40 mx-auto w-[92vw] overflow-auto rounded-md"
      >
        <Document
          file={file}
          noData={""}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
          ))}
        </Document>
      </div>
    </div>
  )
}
