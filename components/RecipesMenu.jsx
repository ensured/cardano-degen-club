// - This is a Recipe Sheet + results

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { useWindowSize } from "@uidotdev/usehooks"
import jsPDF from "jspdf"
import { FileText, Loader2, Trash, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"

import { ConfirmPreviewAlertDialog } from "./ConfirmAlertDialogs"
import DeleteAllAlert from "./DeleteAllAlert"
import FavoritesSheet from "./FavoritesSheet"
import PDFViewer from "./PdfViewer"
import { imgUrlToBase64 } from "./actions"
import { Skeleton } from "./ui/skeleton"
import { imageCache } from "@/utils/indexedDB"

const RecipesMenu = ({
  favorites,
  setFavorites,
  removeFromFavorites,
  loading,
  fetchFavorites,
  userEmail,
  isFavoritesLoading,
  setIsFavoritesLoading,
}) => {
  const [isLoadingPdfPreview, setIsLoadingPdfPreview] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null) // this opens the pdf into view
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmPreviewDialogOpen, setIsConfirmPreviewDialogOpen] =
    useState(false)
  const [progress, setProgress] = useState(0)

  const [hasFetched, setHasFetched] = useState(false) // To avoid duplicate fetching

  const handlePreviewPDF = async () => {
    setProgress(0)
    setIsLoadingPdfPreview(true)
    try {
      const previewUrl = await previewFavoritesPDF(favorites)
      setPdfPreviewUrl(previewUrl) // this opens the pdf into view
      setIsOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingPdfPreview(false)
    }
  }

  const previewFavoritesPDF = async (favorites) => {
    if (!favorites || Object.keys(favorites).length === 0) {
      toast("No favorites found", {
        icon: "",
        style: { background: "#18181b" },
      })
      return
    }

    const doc = new jsPDF({ orientation: "l", unit: "mm", format: "a4" })
    let yOffset = 12
    const pageHeight = doc.internal.pageSize.height
    const pageWidth = doc.internal.pageSize.width
    const imageWidth = 24
    const imageHeight = 24
    const borderPadding = 2
    const borderWidth = 0.5
    const borderRadius = 5
    const contentHeight = 26
    const contentWidth = (pageWidth - 20) / 3 // Divide available width for 3 columns
    let currentPosition = 0
    let xOffset = borderPadding

    try {
      const imageLoadingPromises = Object.entries(favorites).map(
        async ([link, { name, url }]) => {
          // Use IndexedDB cache instead of localStorage
          let imageBase64 = await imageCache.get(url)

          if (!imageBase64) {
            imageBase64 = await imgUrlToBase64(url)
            await imageCache.set(url, imageBase64)
          }

          currentPosition++
          const progress = (currentPosition / Object.keys(favorites).length) * 100
          setProgress(progress)

          // Calculate xOffset based on position (1st, 2nd, or 3rd column)
          switch (currentPosition % 3) {
            case 1: // First column
              xOffset = borderPadding
              break
            case 2: // Second column
              xOffset = contentWidth + 10
              break
            case 0: // Third column
              xOffset = 2 * contentWidth + 15
              break
          }

          // Rest of the drawing code remains the same
          doc.setLineWidth(borderWidth)
          doc.roundedRect(
            xOffset,
            yOffset,
            contentWidth,
            contentHeight,
            borderRadius,
            borderRadius
          )

          if (imageBase64) {
            doc.addImage(
              imageBase64,
              "JPEG",
              xOffset + 4,
              yOffset + borderPadding - 1,
              imageWidth,
              imageHeight
            )
          }

          doc.setTextColor(0, 0, 255)
          doc.setFont("helvetica", "bold")
          doc.setFontSize(16)

          const maxNameLength = 100
          const truncatedName = name.length > maxNameLength
            ? name.substring(0, maxNameLength)
            : name

          const textXOffset = xOffset + imageWidth + borderPadding + 4
          const maxTextWidth = contentWidth - imageWidth - borderPadding - 8

          const textLines = doc.splitTextToSize(truncatedName, maxTextWidth)
          const displayedLines = textLines.slice(0, 3)
          
          if (textLines.length > 3) {
            const lastLine = displayedLines[2]
            displayedLines[2] = lastLine.length > maxTextWidth / doc.getFontSize()
              ? lastLine.substring(0, maxTextWidth / 3 - 4) + "..."
              : lastLine
          }

          let textYOffset = yOffset + borderPadding + contentHeight / 3 - 5

          displayedLines.forEach((line) => {
            doc.textWithLink(line, textXOffset, textYOffset, {
              url: link,
            })
            textYOffset += 6
          })

          // Move to next row after every 3 items
          if (currentPosition % 3 === 0) {
            yOffset += contentHeight + 2 * borderPadding
          }

          // Add new page if needed
          if (yOffset + contentHeight + 2 * borderPadding > pageHeight) {
            doc.addPage()
            yOffset = 12
          }
        }
      )

      await Promise.all(imageLoadingPromises)

      const pdfBlob = doc.output("blob")
      return URL.createObjectURL(pdfBlob)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  const size = useWindowSize()
  if (!size.width || !size.height) return null
  return (
    <div>
      {pdfPreviewUrl && <PDFViewer inputFile={pdfPreviewUrl} />}

      <FavoritesSheet
        setFavorites={setFavorites}
        setOpen={setIsOpen}
        isOpen={isOpen}
        loading={loading}
        favorites={favorites}
        fetchFavorites={fetchFavorites}
        userEmail={userEmail}
        isFavoritesLoading={isFavoritesLoading}
        setIsFavoritesLoading={setIsFavoritesLoading}
        hasFetched={hasFetched}
        setHasFetched={setHasFetched}
      >
        {Object.keys(favorites).length > 0 ? (
          <div className="mb-1.5 grid w-full grid-cols-1 gap-1 sm:grid-cols-2">
            <div className="flex justify-center">
              <ConfirmPreviewAlertDialog
                progress={progress}
                handlePreviewPDF={handlePreviewPDF}
                loading={isLoadingPdfPreview}
                isConfirmPreviewDialogOpen={
                  isLoadingPdfPreview ? true : isConfirmPreviewDialogOpen // Prevent dialog closure if PDF is loading
                }
                setIsConfirmPreviewDialogOpen={setIsConfirmPreviewDialogOpen}
              >
                {isFavoritesLoading ? (
                  <Button
                    variant={"outline"}
                    size="sm"
                    disabled={isFavoritesLoading}
                    className="w-full gap-1.5 shadow-md transition-transform duration-75 hover:scale-105" // Make button take full width
                  >
                    <Loader2 className="left-2 size-5 animate-spin md:size-6" />
                    <div className="md:text-md line-clamp-2 items-center text-sm">
                      Preview PDF
                    </div>
                  </Button>
                ) : (
                  <Button
                    variant={"outline"}
                    size="sm"
                    disabled={isFavoritesLoading}
                    className="w-full gap-1.5 shadow-md transition-transform duration-75 hover:scale-105" // Make button take full width
                  >
                    <FileText className="size-5 md:size-6" />
                    <div className="md:text-md line-clamp-2 items-center text-sm">
                      Preview PDF
                    </div>
                  </Button>
                )}
              </ConfirmPreviewAlertDialog>
            </div>

            <div className="flex justify-center">
              {Object.keys(favorites).length > 0 && (
                <DeleteAllAlert
                  setFavorites={setFavorites}
                  isFavoritesLoading={isFavoritesLoading}
                  setIsFavoritesLoading={setIsFavoritesLoading}
                >
                  <Button
                    size="sm"
                    variant="destructive"
                    className="mx-auto flex w-full items-center gap-1.5 text-sm transition-colors duration-200" // Make button take full width
                  >
                    <Trash2 className="size-5 md:size-6" />
                    <span>Delete All</span>
                  </Button>
                </DeleteAllAlert>
              )}
            </div>
          </div>
        ) : (
          <span className="text-md mt-2 flex flex-col items-center justify-center text-center md:text-lg">
            <span>
              You have <b>{Object.keys(favorites).length}</b> favorite recipes.
              Click the star button on a recipe to favorite it.
            </span>
          </span>
        )}

        <div className={`flex h-full flex-col gap-2`}>
          <div
            className={`animate-fade-in custom-scrollbar max-h-[64%] overflow-auto rounded-md ${
              Object.keys(favorites).length ? "border" : ""
            }`}
          >
            {isFavoritesLoading ? (
              <div className="flex flex-col flex-wrap items-center  justify-center overflow-auto rounded-md border-x">
                <div className="flex w-full flex-col gap-0.5">
                  {Array(Object.keys(favorites).length)
                    .fill(null)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-0.5 rounded-b-md border-b p-2 pr-1"
                      >
                        <Skeleton className="h-[2.22rem] w-full" />
                        <Skeleton className="flex size-7 items-center justify-center rounded-full border" />
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              // Favorites list
              <div className={`flex flex-col flex-wrap rounded-md`}>
                {Object.entries(favorites).map(
                  ([link, { name, url }], index) => (
                    <div key={link} className="overflow-auto">
                      <Link
                        target="_blank"
                        href={link}
                        className="flex items-center gap-2 p-1.5 hover:bg-zinc-300/40 hover:text-zinc-600/70 hover:underline dark:hover:bg-zinc-900/70 dark:hover:text-zinc-100/60"
                        style={{ textDecoration: "none" }}
                      >
                        {url && (
                          <Image
                            src={url}
                            alt={name}
                            width={40} // base width for smallest size
                            height={40} // base height for smallest size
                            className="rounded-full sm:size-[3.05rem]"
                            unoptimized
                            priority
                          />
                        )}
                        <div className="relative flex w-full select-none items-center justify-between gap-2 transition-all duration-150">
                          <div>
                            <span className="line-clamp-2 overflow-auto rounded-md text-sm md:text-[1rem]">
                              {name}
                            </span>
                          </div>
                          <button
                            className="relative right-0 h-6 px-0.5 text-red-600 hover:scale-125 hover:text-red-800 md:h-10"
                            onClick={(e) => {
                              e.preventDefault()
                              removeFromFavorites(link)
                            }}
                          >
                            <Trash className="size-5 md:size-6" />
                          </button>
                        </div>
                      </Link>

                      {index < Object.entries(favorites).length - 1 && (
                        <Separator className="h-[0.0625rem] bg-secondary/75 text-white" />
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </FavoritesSheet>
    </div>
  )
}

export default RecipesMenu
