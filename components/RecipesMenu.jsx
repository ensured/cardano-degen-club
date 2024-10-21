// - This is a Recipe Sheet + results

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { useWindowSize } from "@uidotdev/usehooks"
import jsPDF from "jspdf"
import { FileText, Loader2, Trash2Icon, TrashIcon } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"

import { ConfirmPreviewAlertDialog } from "./ConfirmAlertDialogs"
import DeleteAllAlert from "./DeleteAllAlert"
import FavoritesSheet from "./FavoritesSheet"
import PDFViewer from "./PdfViewer"

const urlToBase64 = async (url) => {
  const response = await fetch(url, {
    cache: "force-cache",
    headers: {
      "Access-Control-Allow-Origin": "https://www.cardanodegen.shop/",
    },
  })

  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
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
    const lineHeight = 10
    const pageHeight = doc.internal.pageSize.height
    const imageWidth = 32
    const imageHeight = 32
    const borderPadding = 2
    const borderWidth = 0.5
    let currentPosition = 0

    try {
      const imageLoadingPromises = Object.entries(favorites).map(
        async ([link, { name, url }]) => {
          currentPosition++
          const progress =
            (currentPosition / Object.keys(favorites).length) * 100
          setProgress(progress)

          // Draw border
          doc.setLineWidth(borderWidth)
          doc.roundedRect(
            borderPadding,
            yOffset,
            doc.internal.pageSize.width - 2 * borderPadding,
            imageHeight + 2 * borderPadding,
            3,
            3,
            "S"
          )

          // Convert image URL to Base64
          const imageBase64 = await urlToBase64(url)

          // Embed image if available
          if (imageBase64) {
            doc.addImage(
              imageBase64,
              "JPEG",
              borderPadding + borderWidth + 2,
              yOffset + borderPadding,
              imageWidth,
              imageHeight
            )
          } else {
            console.error(`Failed to embed image`)
          }

          // Style for recipe name
          doc.setTextColor(0, 0, 0)
          doc.setFont("helvetica", "bold")
          doc.setFontSize(16)

          const maxNameLength = 100
          const truncatedName =
            name.length > maxNameLength
              ? name.substring(0, maxNameLength) + "..."
              : name
          const textLines = doc.splitTextToSize(truncatedName, 100)
          const truncatedTextLines = textLines.slice(0, 2)

          doc.text(
            truncatedTextLines,
            borderPadding + imageWidth + 6,
            yOffset + lineHeight
          )

          // Style for link
          doc.setTextColor(0, 0, 255)
          doc.setFont("helvetica", "normal")
          doc.setFontSize(12)

          const maxLinkLength = 60
          const truncatedLink =
            link.length > maxLinkLength
              ? link.substring(0, maxLinkLength) + "..."
              : link

          const linkXOffset = 40
          doc.textWithLink(truncatedLink, linkXOffset, yOffset + 28, {
            url: link,
          })

          yOffset +=
            imageHeight + 2 * borderPadding + lineHeight + borderPadding

          if (yOffset > pageHeight - 20) {
            doc.addPage()
            yOffset = 10
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
          <div className="animate-fade-in flex justify-center p-0.5">
            {isFavoritesLoading ? (
              <div className="mt-12 flex size-full items-center justify-center rounded-md bg-background p-2 text-primary shadow-md">
                <Loader2 className="size-12 animate-spin" />
              </div>
            ) : (
              <span className="text-md mt-2 flex flex-col items-center justify-center text-center md:text-lg">
                <span>
                  You have <b>{Object.keys(favorites).length}</b> favorite
                  recipes. Click the star button on a recipe to favorite it.
                </span>
              </span>
            )}
          </div>
        )}

        <div className="animate-fade-in custom-scrollbar h-[calc(100vh-10.5rem)] overflow-auto ">
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
                  className="flex items-center justify-between gap-1.5 p-1.5  hover:bg-zinc-300/40 hover:text-zinc-600/70 hover:underline dark:hover:bg-zinc-900/70 dark:hover:text-zinc-100/60"
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
                  <div className="flex w-full select-none items-center justify-between gap-2 transition-all duration-150 ">
                    <span className="line-clamp-3 rounded-md text-sm md:text-base lg:text-lg">
                      {name}
                    </span>
                    <button
                      className="p-2 text-red-600 hover:scale-125 hover:text-red-700"
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
        </div>
      </FavoritesSheet>
    </div>
  )
}

export default RecipesMenu
