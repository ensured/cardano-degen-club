// - This is a Recipe Sheet + results

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { useWindowSize } from "@uidotdev/usehooks"
import jsPDF from "jspdf"
import {
  FileText,
  Heart,
  Loader2,
  Shuffle,
  Trash2Icon,
  TrashIcon,
} from "lucide-react"
import cache from "memory-cache"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"

import { ConfirmPreviewAlertDialog } from "./ConfirmAlertDialogs"
import DeleteAllAlert from "./DeleteAllAlert"
import FavoritesSheet from "./FavoritesSheet"
import Notepad from "./Notepad"
import PDFViewer from "./PdfViewer"
import { imgUrlToBase64 } from "./actions"
import { Badge } from "./ui/badge"

const RecipesMenu = ({
  searchResults,
  favorites,
  setFavorites,
  removeFromFavorites,
  loading,
  fetchFavorites,
  userEmail,
}) => {
  const [isLoadingPdfPreview, setIsLoadingPdfPreview] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null) // this opens the pdf into view
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

  const CACHE_DURATION = 120000 // 2 minute cache duration

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
          // Check if image is cached
          let imageBase64 = cache.get(url)

          // If not cached, fetch and cache the image
          if (!imageBase64) {
            imageBase64 = await imgUrlToBase64(url)
            cache.put(url, imageBase64, CACHE_DURATION) // Cache for 1 minute
          }

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
    <>
      {pdfPreviewUrl && <PDFViewer inputFile={pdfPreviewUrl} />}
      {/* {searchResults.count > 0 ? (
        <Badge variant={"outline"}>
          Found {searchResults.count}
          {searchResults.count === 1 ? " recipe" : " recipes"}
        </Badge>
      ) : (
        <Badge variant={"outline"} className="invisible"></Badge>
      )} */}

      <FavoritesSheet
        setFavorites={setFavorites}
        setOpen={setIsOpen}
        isOpen={isOpen}
        loading={loading}
        favorites={favorites}
        fetchFavorites={fetchFavorites}
        userEmail={userEmail}
        className="relative w-full"
      >
        {Object.keys(favorites).length > 0 ? (
          <div className="my-1 flex w-full justify-center ">
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
                className="gap-2"
                disabled={loading ? true : false}
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
            <span>
              You have <b> {Object.keys(favorites).length} </b> recipes
              favorited. Get started by favoriting something!
            </span>
          </div>
        )}

        <div className="animate-fade-in h-[calc(100vh-220px)] overflow-auto rounded-md">
          <div className="  flex flex-col flex-wrap">
            {Object.entries(favorites).map(([link, { name, url }]) => (
              <Link
                target="_blank"
                href={link}
                key={link}
                className=" flex items-center justify-between gap-2 border-t px-1 py-2 hover:bg-zinc-300/40 hover:text-zinc-600/70 hover:underline dark:hover:bg-zinc-900/70 dark:hover:text-zinc-100/60"
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
                  <span className="line-clamp-3 rounded-md text-sm  md:text-base lg:text-lg">
                    {name}
                  </span>
                  <button
                    className="p-2 text-red-600 hover:scale-125 hover:text-red-700"
                    onClick={(e) => {
                      e.preventDefault()
                      removeFromFavorites(link, name)
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
            {Object.keys(favorites).length > 0 && (
              <div className="absolute bottom-0 right-16 py-1.5">
                <DeleteAllAlert setFavorites={setFavorites}>
                  <Button
                    variant={"destructive"}
                    className="flex gap-2 text-sm md:text-lg"
                  >
                    Remove all
                    <TrashIcon size={size.height < 600 ? 16 : 20} />
                  </Button>
                </DeleteAllAlert>
              </div>
            )}
          </div>
        </div>
      </FavoritesSheet>
    </>
  )
}

export default RecipesMenu
