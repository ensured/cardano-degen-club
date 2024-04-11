// - This is a Recipe Sheet + results

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { useWindowSize } from "@uidotdev/usehooks"
import jsPDF from "jspdf"
import { File, Trash2Icon } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"

import { ConfirmPreviewAlertDialog } from "./ConfirmAlertDialogs"
import FavoritesSheet from "./FavoritesSheet"
import PDFViewer from "./PdfViewer"
import { downloadAndEmbedImage } from "./actions"
import { Badge } from "./ui/badge"

const RecipesMenu = ({
  searchResults,
  favorites,
  removeFromFavorites,
  loading,
}) => {
  const [isLoadingPdfPreview, setIsLoadingPdfPreview] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmPreviewDialogOpen, setIsConfirmPreviewDialogOpen] =
    useState(false)
  const [progress, setProgress] = useState(0)

  const handlePreviewPDF = async () => {
    setProgress(0)
    setIsLoadingPdfPreview(true)
    try {
      const previewUrl = await previewFavoritesPDF(favorites)
      setPdfPreviewUrl(previewUrl) // this opens the pdf into view
      setIsOpen(false)
      toast("Your preview is ready!", {
        icon: "🎉",
        position: "bottom-center",
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingPdfPreview(false)
    }
  }

  const previewFavoritesPDF = async (favorites) => {
    if (!favorites || Object.keys(favorites).length === 0) {
      toast("No favorites found", {
        icon: "🙈",
        style: {
          background: "#18181b",
        },
      })
      return
    }
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
    let yOffset = 10
    const lineHeight = 10 // Adjust line height as needed
    const pageHeight = doc.internal.pageSize.height
    const imageWidth = 32 // Adjust width of the image
    const imageHeight = 32 // Adjust height of the image
    const borderPadding = 2 // Adjust padding for the border
    const borderWidth = 0.5 // Adjust width of the border
    let currentPosition = 0
    for (const [recipeName, { link, image }] of Object.entries(favorites)) {
      // Draw border
      doc.setLineWidth(borderWidth)
      doc.roundedRect(
        borderPadding, // x-coordinate of the top-left corner
        yOffset, // y-coordinate of the top-left corner
        doc.internal.pageSize.width - 2 * borderPadding, // width of the rectangle
        imageHeight + 2 * borderPadding, // height of the rectangle
        3, // radius of the rounded corners (adjust as needed)
        3, // radius of the rounded corners (adjust as needed)
        "S" // draw "stroke" (border)
      )

      // Embed image if available
      if (image) {
        currentPosition++
        try {
          const imgData = await downloadAndEmbedImage(image)
          if (imgData) {
            setProgress((currentPosition / Object.keys(favorites).length) * 100)

            // Add image at current yOffset
            doc.addImage(
              imgData,
              "JPEG",
              borderPadding + borderWidth + 2,
              yOffset + borderPadding,
              imageWidth,
              imageHeight
            ) // Adjust width and height as needed, considering the border
          } else {
            console.error(`Failed to embed image for ${recipeName}`)
          }
        } catch (error) {
          console.error(`Error embedding image for ${recipeName}:`, error)
        }
      }

      // Style for recipe name
      doc.setTextColor(0, 0, 0)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)

      const maxNameLength = 100 // Maximum characters for recipe name
      const truncatedName =
        recipeName.length > maxNameLength
          ? recipeName.substring(0, maxNameLength) + "..."
          : recipeName
      const textLines = doc.splitTextToSize(truncatedName, 100)
      const truncatedTextLines = textLines.slice(0, 2) // Take only the first two lines

      doc.text(
        truncatedTextLines,
        borderPadding + imageWidth + 6,
        yOffset + lineHeight
      )

      // Style for link
      doc.setTextColor(0, 0, 255)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)

      const maxLinkLength = 60 // Maximum characters for link
      const truncatedLink =
        link.length > maxLinkLength
          ? link.substring(0, maxLinkLength) + "..."
          : link

      const linkTextWidth =
        (doc.getStringUnitWidth(truncatedLink) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor // Calculate width of link text
      const linkXOffset = 40 // Center the link horizontally within the border
      doc.textWithLink(truncatedLink, linkXOffset, yOffset + 28, {
        url: link,
      })

      yOffset += imageHeight + 2 * borderPadding + lineHeight + borderPadding // Adjust yOffset to move to the next content with border and padding

      if (yOffset > pageHeight - 20) {
        doc.addPage()
        yOffset = 10
      }
    }
    const pdfBlob = doc.output("blob")
    return URL.createObjectURL(pdfBlob)
  }

  const handleClosePreview = () => {
    setPdfPreviewUrl(null)
  }

  const size = useWindowSize()
  if (!size.width || !size.height) return null

  return (
    <div className="flex h-12 w-full items-center px-4 text-sm opacity-100 transition-opacity duration-100">
      <div className="flex w-full justify-center gap-4">
        <div className="w-[320px]">
          {searchResults.count > 0 ? (
            <Badge variant={"outline"} className="select-none p-2">
              Found <b>{searchResults.count}</b> results
            </Badge>
          ) : (
            <Badge variant={"outline"} className="invisible"></Badge>
          )}
        </div>
        {pdfPreviewUrl && (
          <PDFViewer inputFile={pdfPreviewUrl} onClose={handleClosePreview} />
        )}
        <FavoritesSheet setOpen={setIsOpen} isOpen={isOpen} loading={loading}>
          {Object.keys(favorites).length > 0 ? (
            <div className="mb-3 mt-4 flex justify-center gap-1">
              <ConfirmPreviewAlertDialog
                progress={progress}
                handlePreviewPDF={handlePreviewPDF}
                loading={isLoadingPdfPreview}
                isConfirmPreviewDialogOpen={
                  isLoadingPdfPreview ? true : isConfirmPreviewDialogOpen // is user is currently loading a pdf if so prevent it from being closed until the download is done.
                }
                setIsConfirmPreviewDialogOpen={setIsConfirmPreviewDialogOpen}
              >
                <Button variant={"outline"} className="gap-2">
                  <File className="left-2" />
                  <div className="line-clamp-1 items-center text-lg">
                    Preview PDF{" "}
                  </div>
                </Button>
              </ConfirmPreviewAlertDialog>
            </div>
          ) : (
            <div className="flex justify-center ">
              Get started by favoriting something!
            </div>
          )}
          <div className="flex max-h-[85%] flex-col overflow-auto rounded-md">
            {Object.entries(favorites).map(([recipeName, { link, image }]) => (
              <Link
                target="_blank"
                href={link}
                key={recipeName}
                className="flex items-center justify-between gap-2 border-t px-1 py-2 transition duration-150 ease-in-out hover:bg-zinc-300/40 hover:underline dark:hover:bg-zinc-900/70"
                style={{ textDecoration: "none" }}
              >
                {image && (
                  <Image
                    src={image}
                    width={42}
                    height={42}
                    alt={recipeName}
                    className="rounded-full"
                    unoptimized
                    priority
                  />
                )}
                <div className="flex w-full select-none items-center justify-between gap-2 transition-all duration-150 hover:text-moon">
                  <span className="line-clamp-3 rounded-md text-sm decoration-moon md:text-base lg:text-lg">
                    {recipeName}
                  </span>
                  <button
                    className="p-2 text-red-600 hover:scale-125 hover:text-red-700"
                    onClick={(e) => {
                      e.preventDefault()
                      removeFromFavorites(recipeName)
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
                    <Separator className="bg-red-900 text-red-500" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </FavoritesSheet>
      </div>
    </div>
  )
}

export default RecipesMenu
