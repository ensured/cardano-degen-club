// - This is a Recipe Sheet + results

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { useWindowSize } from "@uidotdev/usehooks"
import jsPDF from "jspdf"
import { FileText, Loader2, Trash, Trash2Icon, TrashIcon } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"

import { ConfirmPreviewAlertDialog } from "./ConfirmAlertDialogs"
import DeleteAllAlert from "./DeleteAllAlert"
import FavoritesSheet from "./FavoritesSheet"
import PDFViewer from "./PdfViewer"
import { imgUrlToBase64 } from "./actions"
import { Skeleton } from "./ui/skeleton"

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

  const setLocalStorageWithoutExpiry = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  // Helper function to get item from localStorage without expiry
  const getLocalStorageWithoutExpiry = (key) => {
    const itemStr = localStorage.getItem(key)
    if (!itemStr) return null
    return JSON.parse(itemStr)
  }

  const previewFavoritesPDF = async (favorites) => {
    if (!favorites || Object.keys(favorites).length === 0) {
      toast("No favorites found", {
        icon: "",
        style: { background: "#18181b" },
      })
      return
    }

    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
    let yOffset = 12
    const pageHeight = doc.internal.pageSize.height
    const imageWidth = 24
    const imageHeight = 24
    const borderPadding = 2 // Padding around the content
    const borderWidth = 0.5
    const borderRadius = 5 // Rounded corners radius
    const contentHeight = 26
    const contentWidth = 206 // Width of the item
    let currentPosition = 0

    try {
      const imageLoadingPromises = Object.entries(favorites).map(
        async ([link, { name, url }]) => {
          // Check if image is cached in localStorage without expiry
          let imageBase64 = getLocalStorageWithoutExpiry(url)

          // If not cached, fetch and cache the image
          if (!imageBase64) {
            imageBase64 = await imgUrlToBase64(url)
            setLocalStorageWithoutExpiry(url, imageBase64)
          }

          currentPosition++
          const progress =
            (currentPosition / Object.keys(favorites).length) * 100
          setProgress(progress)

          // Draw rounded border around the entire item (image + text)
          doc.setLineWidth(borderWidth)
          doc.roundedRect(
            borderPadding,
            yOffset,
            contentWidth,
            contentHeight,
            borderRadius,
            borderRadius
          ) // x, y, width, height, radius for rounded corners

          // Embed image if available
          if (imageBase64) {
            doc.addImage(
              imageBase64,
              "JPEG",
              borderPadding + 4, // Adjust the position inside the rounded rectangle
              yOffset + borderPadding - 1,
              imageWidth,
              imageHeight
            )
          } else {
            console.error(`Failed to embed image`)
          }

          // Style for recipe name with link
          doc.setTextColor(0, 0, 255) // Blue for clickable link
          doc.setFont("helvetica", "bold")
          doc.setFontSize(16) // Title size

          const maxNameLength = 100 // Limit title length
          const truncatedName =
            name.length > maxNameLength
              ? name.substring(0, maxNameLength)
              : name

          // Calculate available width for text, excluding padding and image
          const textXOffset = imageWidth + borderPadding + 4 // Position text right of the image
          const maxTextWidth = contentWidth - textXOffset - 3 // Max width for text to avoid overflowing

          // Split text to ensure it doesn't overflow
          const textLines = doc.splitTextToSize(truncatedName, maxTextWidth)

          // Ensure only two lines are displayed and handle truncation for the second line
          const displayedLines = textLines.slice(0, 2) // Only take up to 2 lines
          if (textLines.length > 2) {
            const secondLine = displayedLines[1]
            // Truncate the second line and add ellipsis if it exceeds the max width
            displayedLines[1] =
              secondLine.length > maxTextWidth / doc.getFontSize()
                ? secondLine.substring(0, maxTextWidth / 3 - 4) + "..."
                : secondLine
          }

          // Calculate starting y position for the text to center it vertically
          let textYOffset = yOffset + borderPadding + contentHeight / 2.6 - 5 // Centering text

          // Draw the text with link for each line
          displayedLines.forEach((line) => {
            doc.textWithLink(line, borderPadding + textXOffset, textYOffset, {
              url: link, // Link embedded in the title
            })
            textYOffset += 6 // Move down for the next line
          })

          // Move yOffset down to draw the next item, ensuring there's space for the bottom border
          yOffset += contentHeight + 2 * borderPadding // Ensure the bottom border is included

          // Add new page if needed
          if (yOffset + contentHeight + 2 * borderPadding > pageHeight) {
            doc.addPage()
            yOffset = 12 // Reset yOffset for new page
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
                    <Loader2 className="left-2 size-5 animate-spin md:size-6 lg:size-7" />
                    <div className="md:text-md line-clamp-2 items-center text-sm lg:text-lg">
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
                    <FileText className="size-5 md:size-6 lg:size-7" />
                    <div className="md:text-md line-clamp-2 items-center text-sm lg:text-lg">
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
                    className="mx-auto flex items-center gap-1.5 text-sm transition-colors duration-200 w-full" // Make button take full width
                  >
                    <TrashIcon size={18 + Math.floor(size.height / 115)} />
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
            className={`animate-fade-in custom-scrollbar max-h-[85.75%] overflow-auto rounded-md ${
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
                            className="rounded-full sm:size-[3.5rem] md:size-[3.7rem] lg:size-[3.9rem]"
                            unoptimized
                            priority
                          />
                        )}
                        <div className="flex w-full select-none items-center justify-between gap-2 transition-all duration-150">
                          <div>
                            <span className="line-clamp-2 rounded-md text-[0.85rem] sm:text-[.95rem] md:text-[1.05rem] lg:text-xl">
                              {name}
                            </span>
                          </div>
                          <button
                            className="text-red-600 hover:scale-125 hover:text-red-800"
                            onClick={(e) => {
                              e.preventDefault()
                              removeFromFavorites(link)
                            }}
                          >
                            <Trash2Icon
                              size={
                                size?.width < 480
                                  ? 20
                                  : size?.width < 640
                                  ? 22
                                  : size?.width < 900
                                  ? 23
                                  : 24
                              }
                            />
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
