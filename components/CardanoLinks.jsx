"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import allLinks from "../config/cardanoLinks"

// Separate component for the table header
const TableHeaders = ({ activeCategory, hasTwitterLinks }) => (
  <TableHeader>
    <TableRow>
      <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-[200px] text-base font-semibold">
        Name
      </TableHead>
      <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-[300px] text-base font-semibold">
        URL
      </TableHead>
      {hasTwitterLinks && (
        <TableHead className="sticky top-0 w-[300px] bg-background/95 text-base font-semibold backdrop-blur supports-[backdrop-filter]:bg-background/60">
          Twitter
        </TableHead>
      )}
    </TableRow>
  </TableHeader>
)

// Separate component for the link table
const LinkTable = ({ activeCategory }) => {
  const categoryLinks = allLinks[activeCategory] || []
  const hasTwitterLinks = categoryLinks.some((link) => link.twitter && link.url)

  if (!categoryLinks.length) {
    return (
      <Table>
        <TableHeaders activeCategory={activeCategory} hasTwitterLinks={hasTwitterLinks} />
        <TableBody>
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              No links found for this category
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  return (
    <Table>
      <TableHeaders activeCategory={activeCategory} hasTwitterLinks={hasTwitterLinks} />
      <TableBody>
        {categoryLinks.map((link, index) => (
          <TableRow key={index} className="hover:bg-muted/50 transition-colors ">
            <TableCell className="font-medium text-base">{link.name}</TableCell>
            <TableCell className="whitespace-nowrap text-base">
              <Link 
                href={link.url || link.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline text-primary dark:text-zinc-50/80 hover:text-primary/80 transition-colors"
              >
                {link.url || link.twitter}
              </Link>
            </TableCell>
            {link.twitter && link.url && (
              <TableCell className="whitespace-nowrap text-base">
                <Link 
                  href={link.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline text-primary dark:text-zinc-50/80 hover:text-primary/80 transition-colors"
                >
                  {link.twitter}
                </Link>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// Helper function to format category names
const formatCategoryName = (category) => {
  if (category === "ai") return "AI"
  return category
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase())
}

const CardanoLinks = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "wallets"
  )

  useEffect(() => {
    const category = searchParams.get("category")
    if (category) setActiveCategory(category)
  }, [searchParams])

  const handleCategoryChange = (selectedCategory) => {
    setActiveCategory(selectedCategory)
    router.push(`?category=${selectedCategory}`)
  }

  const categories = Object.keys(allLinks)
  const formattedCategories = categories.map(formatCategoryName)

  return (
    <div className="flex h-full flex-col">
        <Select value={activeCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="text-base">
            <SelectValue>
              {formattedCategories[categories.indexOf(activeCategory)]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {categories.map((category, index) => (
                <SelectItem key={category} value={category} className="text-base">
                  {formattedCategories[index]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      
        <LinkTable activeCategory={activeCategory} />
    </div>
  )
}

export default CardanoLinks
