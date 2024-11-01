/* eslint-disable tailwindcss/no-contradicting-classname */
/* eslint-disable tailwindcss/classnames-order */
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

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
import Link from "next/link"

const LinkTable = ({ links }) => (
  <div className="mt-4 rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Name</TableHead>
          <TableHead className="w-[250px]">URL</TableHead>
          {links.some((link) => link.twitter) && (
            <TableHead className="w-[250px]">Twitter</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{link.name}</TableCell>
            <TableCell>
              <Link 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {link.url}
              </Link>
            </TableCell>
            {link.twitter && (
              <TableCell>
                <Link 
                  href={link.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {link.twitter}
                </Link>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)

const CardanoLinks = () => {
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "wallets"
  )
  const router = useRouter()

  useEffect(() => {
    const category = searchParams.get("category")
    if (category) setActiveCategory(category)
  }, [searchParams])

  const handleChange = (selectedCategory) => {
    setActiveCategory(selectedCategory)
    router.push(`?category=${selectedCategory}`)
  }

  const spacedCategoryNames = Object.keys(allLinks).map((category) =>
    category === "ai"
      ? "AI"
      : category
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/^./, (match) => match.toUpperCase())
  )

  return (
    <div className="flex h-full flex-col">
      <div className="px-8 pt-3">
        <Select value={activeCategory} onValueChange={handleChange}>
          <SelectTrigger className="w-[250px] text-base">
            <SelectValue>
              {spacedCategoryNames.find(
                (_, index) => Object.keys(allLinks)[index] === activeCategory
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.keys(allLinks).map((category, index) => (
                <SelectItem key={index} value={category} className="text-base">
                  {spacedCategoryNames[index]}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="h-full overflow-auto px-8 pb-8 mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-[200px] text-base font-semibold">
                Name
              </TableHead>
              <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-[300px] text-base font-semibold">
                URL
              </TableHead>
              {allLinks[activeCategory].some((link) => link.twitter) && (
                <TableHead className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-[300px] text-base font-semibold">
                  Twitter
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allLinks[activeCategory].map((link, index) => (
              <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium text-base">{link.name}</TableCell>
                <TableCell className="whitespace-nowrap text-base">
                  <Link 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline text-primary dark:text-zinc-50/80 hover:text-primary/80 transition-colors"
                  >
                    {link.url}
                  </Link>
                </TableCell>
                {link.twitter && (
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
      </div>
    </div>
  )
}

export default CardanoLinks
