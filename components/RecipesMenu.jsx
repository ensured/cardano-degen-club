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

function extractRecipeId(url) {
  const startIndex = url.indexOf("recipe/") + "recipe/".length
  const endIndex = url.indexOf("/", startIndex)
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("Invalid URL format")
  }
  return url.substring(startIndex, endIndex)
}

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
      toast.custom((t) => (
        <div
          className={`rounded-full bg-background px-6 py-4 text-primary shadow-md`}
        >
          👋 Preview is ready
        </div>
      ))
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
    let yOffset = 10
    const pageHeight = doc.internal.pageSize.height
    const imageWidth = 22
    const imageHeight = 22
    const borderPadding = 2 // Padding around the content
    const borderWidth = 0.5
    const borderRadius = 5 // Rounded corners radius
    const contentHeight = 24
    const contentWidth = 180 // Width of the item
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
          const maxTextWidth = contentWidth - textXOffset - 2 // Max width for text to avoid overflowing

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
          let textYOffset = yOffset + borderPadding + contentHeight / 2.6 // Centering text

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
            yOffset = 10 // Reset yOffset for new page
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
          <div className="my-2 flex w-full justify-center">
            <ConfirmPreviewAlertDialog
              progress={progress}
              handlePreviewPDF={handlePreviewPDF}
              loading={isLoadingPdfPreview}
              isConfirmPreviewDialogOpen={
                isLoadingPdfPreview ? true : isConfirmPreviewDialogOpen // is user is currently loading a pdf if so prevent it from being closed until the download is done.
              }
              setIsConfirmPreviewDialogOpen={setIsConfirmPreviewDialogOpen}
            >
              <Button
                variant={"outline"}
                className="gap-2 shadow-md transition-transform duration-100 hover:scale-105"
              >
                <FileText className="left-2" />
                <div className="line-clamp-1 items-center text-lg">
                  Preview PDF{" "}
                </div>
              </Button>
            </ConfirmPreviewAlertDialog>
          </div>
        ) : (
          <span className="text-md mt-2 flex flex-col items-center justify-center text-center md:text-lg">
            <span>
              You have <b>{Object.keys(favorites).length}</b> favorite recipes.
              Click the star button on a recipe to favorite it.
            </span>
          </span>
        )}

        <div className="animate-fade-in custom-scrollbar h-[calc(100vh-10.5rem)] overflow-auto ">
          {isFavoritesLoading ? (
            <div className="flex flex-col flex-wrap rounded-md border-t border-l border-r items-center justify-center ">
              <div className="flex flex-col gap-0.5 w-full ">
                {Array(Object.keys(favorites).length)
                  .fill(null)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 gap-0.5 pr-1 border-b rounded-b-md"
                    >
                      <Skeleton className="h-[2.22rem] w-full " />
                      <Skeleton className="h-7 w-7 flex justify-center border items-center rounded-full" />
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div
              className={`flex flex-col flex-wrap rounded-md ${
                Object.entries(favorites).length > 0 && "border"
              }`}
            >
              {Object.entries(favorites).map(([link, { name, url }], index) => (
                <div key={link}>
                  <Link
                    target="_blank"
                    href={link}
                    className="flex items-center justify-between gap-1.5 p-1.5 hover:bg-zinc-300/40 hover:text-zinc-600/70 hover:underline dark:hover:bg-zinc-900/70 dark:hover:text-zinc-100/60"
                    style={{ textDecoration: "none" }}
                  >
                    {url && (
                      <Image
                        src={url}
                        width={42}
                        height={42}
                        alt={name}
                        className="rounded-full"
                        unoptimized
                        priority
                      />
                    )}
                    <div className="flex w-full select-none items-center justify-between gap-2 transition-all duration-150">
                      <span className="line-clamp-2 rounded-md text-sm md:text-base lg:text-lg">
                        {name}
                      </span>
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
                  {/* Render Separator only if not the last item */}
                  {index < Object.entries(favorites).length - 1 && (
                    <Separator className="h-[0.005rem] w-full bg-[#ffffff25]" />
                  )}
                </div>
              ))}

              {Object.keys(favorites).length > 0 && (
                <div className="absolute inset-x-0 bottom-0 flex justify-center py-1.5 rounded-lg shadow-md transition-transform duration-100 transform hover:scale-105">
                  <DeleteAllAlert setFavorites={setFavorites}>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-2 px-4 py-2 text-sm md:text-lg transition-colors duration-200 hover:bg-red-600"
                    >
                      <TrashIcon size={size.height < 600 ? 16 : 20} />
                      <span>Remove all</span>
                    </Button>
                  </DeleteAllAlert>
                </div>
              )}
            </div>
          )}
        </div>
      </FavoritesSheet>
    </div>
  )
}

export default RecipesMenu
