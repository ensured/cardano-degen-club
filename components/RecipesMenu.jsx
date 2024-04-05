import Link from "next/link"
import { Separator } from "@radix-ui/react-dropdown-menu"
import jsPDF from "jspdf"
import { Download, FileText, Trash2Icon } from "lucide-react"
import toast from "react-hot-toast"

import FavoritesSheet from "./FavoritesSheet"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

const generateFavoritesPDF = (favorites) => {
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
  const lineHeight = 3 // Adjust line height as needed for compactness
  const pageHeight = doc.internal.pageSize.height

  Object.entries(favorites).forEach(([recipeName, link]) => {
    // Style for recipe name
    doc.setTextColor(0, 0, 0) // Black color for recipe name
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    const truncatedName = recipeName.substring(0, 40)
    const textLines = doc.splitTextToSize(truncatedName, 100)
    doc.text(textLines, 10, yOffset)

    // Calculate number of lines for link
    const linkLines = doc.splitTextToSize(link, 160) // Adjust width as needed

    // Style for link
    doc.setTextColor(0, 0, 255) // Blue color for links
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const linkYOffset = yOffset + textLines.length * lineHeight // Calculate yOffset for link

    // Truncate link if it exceeds certain length
    const maxLinkLength = 60 // Adjust as needed
    const truncatedLink =
      link.length > maxLinkLength
        ? link.substring(0, maxLinkLength) + "..."
        : link
    doc.textWithLink(truncatedLink, 10, linkYOffset + lineHeight, { url: link })

    yOffset += (textLines.length + linkLines.length + 1) * lineHeight // Reduce spacing

    // Check if yOffset exceeds page height, add new page if needed
    if (yOffset > pageHeight - 20) {
      doc.addPage()
      yOffset = 10
    }
  })

  doc.save("Recipe-Favorites.pdf")
}

const RecipesMenu = ({ searchResults, favorites, removeFromFavorites }) => {
  const handleDownloadPDF = () => {
    generateFavoritesPDF(favorites) // Call the PDF generation function
  }
  return (
    <div
      className={`mx-14  flex h-14 items-center justify-between text-sm opacity-100 transition-opacity duration-100 md:mx-20 `}
    >
      <>
        {searchResults.count > 0 && (
          <Badge variant={"outline"} className="p-2">
            <b>{searchResults.count}</b> results
          </Badge>
        )}
        <div className="grow"></div>
        <FavoritesSheet>
          {" "}
          {Object.keys(favorites).length > 0 && (
            <div className="flex justify-center">
              <Button
                variant={"moon"}
                onClick={handleDownloadPDF}
                className="md:text-md gap-1 p-2 text-sm lg:text-lg"
              >
                {" "}
                <Download />
                <div className="line-clamp-1">Download Favorites (PDF)</div>
              </Button>
            </div>
          )}
          <div className="flex h-[94%] flex-col overflow-auto rounded-md">
            <div className="my-2">
              {Object.entries(favorites).map(([recipeName, link]) => (
                <Link
                  target="_blank"
                  href={link}
                  key={recipeName}
                  className="flex items-center justify-between gap-2 border-t px-1 py-0.5 transition duration-300 ease-in-out hover:underline"
                  style={{ textDecoration: "none" }} // Ensure default Link underline is removed
                >
                  <div className="flex w-full select-none items-center justify-between gap-2 transition-all duration-150 hover:text-moon">
                    <span className="rounded-md p-2 decoration-moon  hover:shadow-inner ">
                      {recipeName}
                    </span>

                    <button
                      className="p-2 text-red-600 hover:scale-125 hover:text-red-700"
                      onClick={(e) => {
                        e.preventDefault() // prevent default Link click which otherwise would happen
                        removeFromFavorites(recipeName)
                      }}
                    >
                      <Trash2Icon size={18} />
                      <Separator className="bg-red-900 text-red-500" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FavoritesSheet>
      </>
    </div>
  )
}

export default RecipesMenu
