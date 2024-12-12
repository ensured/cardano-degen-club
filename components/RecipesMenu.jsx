// - This is a Recipe Sheet + results

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { useWindowSize } from "@uidotdev/usehooks"
import jsPDF from "jspdf"
import { DownloadIcon, FileText, Loader2, Trash, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import DeleteAllAlert from "./DeleteAllAlert"
import FavoritesSheet from "./FavoritesSheet"
import PDFViewer from "./PdfViewer"
import { getImagesBase64 } from "./actions"
import { Skeleton } from "./ui/skeleton"
import { imageCache } from "@/utils/indexedDB"
import { Progress } from "./ui/progress"
import FavoritesSkeleton from "./FavoritesSkeleton"

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
  const [isLoadingPdfDownload, setIsLoadingPdfDownload] = useState(false)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [pdfProgress, setPdfProgress] = useState(0)

  const handlePreviewPDF = async () => {
    setPdfProgress(0)
    setIsLoadingPdfPreview(true)
    try {
      const previewUrl = await generatePDF(favorites, false, (progress) => {
        setPdfProgress(progress)
      })
      if (previewUrl) {
        setPdfPreviewUrl(previewUrl)
        setIsOpen(false)
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to generate PDF preview")
    } finally {
      setIsLoadingPdfPreview(false)
      setPdfProgress(0)
    }
  }

  const handleDownloadPDF = async () => {
    setPdfProgress(0)
    setIsLoadingPdfDownload(true)
    try {
      const doc = await generatePDF(favorites, true, setPdfProgress)
      if (doc) {
        doc.save("Recipes-(Favorites).pdf")
      }
    } catch (e) {
      console.error(e)
      toast.error("Failed to download PDF")
    } finally {
      setIsLoadingPdfDownload(false)
      setPdfProgress(0)
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
      >
        {Object.keys(favorites).length > 0 ? (
          <div className="mb-1.5 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {/* Preview PDF Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={isFavoritesLoading || isLoadingPdfPreview || isLoadingPdfDownload}
                className="hover:scale-102 relative w-full gap-2 rounded-lg bg-white/50 shadow-lg transition-all duration-200 hover:bg-white/80 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/80"
                onClick={handlePreviewPDF}
              >
                {isLoadingPdfPreview ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium">{Math.round(pdfProgress)}%</span>
                    </div>
                    <Progress 
                      value={Math.round(pdfProgress)} 
                      className="absolute inset-x-0 bottom-0 h-1 rounded-none rounded-b-lg bg-secondary transition-all duration-300"
                    />
                  </>
                ) : (
                  <>
                    <FileText className="size-5 md:size-6" />
                    <div className="md:text-md line-clamp-2 items-center text-sm">
                      Preview PDF
                    </div>
                  </>
                )}
              </Button>

              {/* Download PDF Button */}
              <Button
                variant="outline"
                size="sm"
                disabled={isFavoritesLoading || isLoadingPdfDownload || isLoadingPdfPreview}
                className="hover:scale-102 relative w-full gap-2 rounded-lg bg-white/50 shadow-lg transition-all duration-200 hover:bg-white/80 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/80"
                onClick={handleDownloadPDF}
              >
                {isLoadingPdfDownload  ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium">{Math.round(pdfProgress)}%</span>
                    </div>
                    <Progress 
                      value={Math.round(pdfProgress)} 
                      className="absolute inset-x-0 bottom-0 h-1 rounded-none rounded-b-lg bg-secondary transition-all duration-300"
                    />
                  </>
                ) : (
                  <>
                    <DownloadIcon className="size-5 md:size-6" />
                    <div className="md:text-md line-clamp-2 items-center text-sm">
                      Download PDF
                    </div>
                  </>
                )}
              </Button>

            <div className="col-span-full">
              <DeleteAllAlert
                setFavorites={setFavorites}
                isFavoritesLoading={isFavoritesLoading}
                setIsFavoritesLoading={setIsFavoritesLoading}
              >
                <Button
                  size="sm"
                  variant="destructive"
                  className="mx-auto flex w-full items-center gap-2 rounded-lg text-sm transition-all duration-200 hover:bg-red-600/90"
                  disabled={isFavoritesLoading}
                >
                  <Trash2 className="size-5 md:size-6" />
                  <span>Delete All</span>
                </Button>
              </DeleteAllAlert>
            </div>
          </div>
        ) : (
          <span className="text-md mt-4 flex flex-col items-center justify-center gap-2 text-center font-medium text-zinc-700 dark:text-zinc-300 md:text-lg">
            <span>
              You have <b>{Object.keys(favorites).length}</b> favorite recipes.
              Click the star button on a recipe to favorite it.
            </span>
          </span>
        )}

        <div className="flex h-full flex-col gap-3">
          <div className={`animate-fade-in custom-scrollbar max-h-[64%] overflow-auto rounded-lg border bg-white/50 shadow-inner dark:bg-zinc-900/50 ${
            Object.keys(favorites).length ? "border-zinc-200 dark:border-zinc-800" : ""
          }`}>
            {isFavoritesLoading ? (
              <FavoritesSkeleton />
            ) : (
              // Favorites list
              <div className="flex flex-col flex-wrap rounded-lg">
                {Object.entries(favorites).map(
                  ([link, { name, url }], index) => (
                    <div key={link} className="overflow-auto">
                      <Link
                        target="_blank"
                        href={link}
                        className="flex items-center gap-3 p-2.5 transition-colors duration-200 hover:bg-zinc-100/70 hover:text-zinc-800 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
                        style={{ textDecoration: "none" }}
                      >
                        {url && (
                          <Image
                            src={url}
                            alt={name}
                            width={42}
                            height={42}
                            className="aspect-square size-[42px] rounded-full object-cover shadow-sm transition-transform duration-200"
                            priority
                          />
                        )}
                        <div className="relative flex w-full select-none items-center justify-between gap-3">
                          <div>
                            <span className="line-clamp-2 overflow-auto rounded-md text-sm md:text-[1rem]">
                              {name}
                            </span>
                          </div>
                          <button
                            className="relative right-0 h-8 px-1 text-red-500 transition-all duration-200 hover:scale-110 hover:text-red-600 md:h-10"
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
                        <Separator className="h-px bg-zinc-200 dark:bg-zinc-800" />
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

// Helper function to generate PDF
const generatePDF = async (favorites, forDownload = false, onProgress) => {
  if (!favorites || Object.keys(favorites).length === 0) {
    toast("No favorites found", {
      icon: "",
      style: { background: "#18181b" },
    })
    return null
  }

  try {
    const doc = new jsPDF({ orientation: "l", unit: "mm", format: "a4" })
    const recipes = Object.entries(favorites)
    
    // First, collect all unique image URLs
    const imageUrls = recipes.map(([_, { url }]) => url)
    
    onProgress?.(5) // Start progress
    
    // Try to get images from cache first (5-30%)
    let processedCacheItems = 0
    const cachedImages = await Promise.all(
      imageUrls.map(async url => {
        const base64 = await imageCache.get(url)
        processedCacheItems++
        const cacheProgress = 5 + Math.round((processedCacheItems / imageUrls.length) * 25)
        onProgress?.(cacheProgress)
        return { url, base64 }
      })
    )

    // Filter out URLs that need fetching
    const urlsToFetch = imageUrls.filter(
      url => !cachedImages.find(img => img.url === url && img.base64)
    )

    // Fetch missing images in a single batch if needed (30-70%)
    let fetchedImages = {}
    if (urlsToFetch.length > 0) {
      onProgress?.(30) // Start fetch phase
      fetchedImages = await getImagesBase64(urlsToFetch)
      onProgress?.(70) // End fetch phase
      
      // Cache the newly fetched images (70-75%)
      let cacheCount = 0
      await Promise.all(
        Object.entries(fetchedImages).map(async ([url, base64]) => {
          await imageCache.set(url, base64)
          cacheCount++
          const cacheProgress = 70 + Math.round((cacheCount / Object.keys(fetchedImages).length) * 5)
          onProgress?.(cacheProgress)
        })
      )
    } else {
      onProgress?.(75) // Skip fetching phase if all images were cached
    }

    // Combine cached and fetched images
    const allImages = cachedImages.reduce((acc, { url, base64 }) => {
      if (base64) acc[url] = base64
      return acc
    }, { ...fetchedImages })

    // PDF Generation setup (75-80%)
    const PAGE = {
      width: doc.internal.pageSize.width,
      height: doc.internal.pageSize.height,
      margin: 12,
      columns: 2
    }

    const CARD = {
      padding: 8,
      imageSize: 30,
      spacing: 6,
      height: 42,
      borderRadius: 4
    }

    const cardWidth = (PAGE.width - (PAGE.margin * 2) - (CARD.spacing * (PAGE.columns - 1))) / PAGE.columns
    let yPos = PAGE.margin
    let currentPosition = 0

    onProgress?.(80)

    // Process recipes and track progress (80-95%)
    const totalSteps = recipes.length
    const progressStep = 15 / totalSteps // Distribute 15% (80-95%) across all recipes
    
    for (const [link, { name, url }] of recipes) {
      const column = currentPosition % PAGE.columns
      const xPos = PAGE.margin + column * (cardWidth + CARD.spacing)

      // Update progress before processing each recipe
      const currentProgress = 80 + (progressStep * currentPosition)
      onProgress?.(Math.round(currentProgress))

      const imageBase64 = allImages[url]
      if (imageBase64) {
        doc.addImage(
          imageBase64,
          "JPEG",
          xPos + CARD.padding,
          yPos + CARD.padding,
          CARD.imageSize,
          CARD.imageSize
        )
      }

      // Add recipe text and link
      const textX = xPos + CARD.padding + CARD.imageSize + CARD.padding
      const textWidth = cardWidth - (CARD.padding * 2) - CARD.imageSize
      const lines = doc.splitTextToSize(name, textWidth)
      const displayLines = lines.slice(0, 3)
      
      if (lines.length > 3) {
        displayLines[2] = displayLines[2].substring(0, displayLines[2].length - 3) + "..."
      }

      displayLines.forEach((line, i) => {
        const textY = yPos + (CARD.padding * 1.6) + (i * 12)
        doc.textWithLink(line, textX, textY, { url: link })
      })

      // Update position and page management
      currentPosition++
      if (column === PAGE.columns - 1) {
        yPos += CARD.height + CARD.spacing
      }

      if (yPos + CARD.height > PAGE.height - PAGE.margin) {
        doc.addPage()
        yPos = PAGE.margin
      }
    }

    // Final steps (95-100%)
    onProgress?.(95)
    const result = forDownload ? doc : URL.createObjectURL(doc.output('blob'))
    
    // Ensure we hit 100% before returning
    onProgress?.(98)
    await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for visual feedback
    onProgress?.(100)
    await new Promise(resolve => setTimeout(resolve, 100)) // Small delay at 100%
    
    return result

  } catch (error) {
    console.error("Error generating PDF:", error)
    toast.error("Failed to generate PDF")
    return null
  }
}

export default RecipesMenu
