/* eslint-disable tailwindcss/no-contradicting-classname */
/* eslint-disable tailwindcss/classnames-order */
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Description } from "@radix-ui/react-dialog"

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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import allLinks from "../config/cardanoLinks"

const LinkTable = ({ links }) => {
  const hasTwitter = links.some((link) => link.twitter) // Check if any link has Twitter

  return (
    <Table className="z-10">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
          {hasTwitter && <TableHead>Twitter</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{link.name}</TableCell>
            <TableCell>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.url}
              </a>
            </TableCell>
            {link.twitter && (
              <TableCell>
                <a
                  href={link.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.twitter}
                </a>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const CardanoLinks = () => {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "officialCardano"
  const [activeCategory, setActiveCategory] = useState(category || "wallets")
  const router = useRouter()

  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      setActiveCategory(category)
    }
  }, [searchParams])

  const handleChange = (selectedCategory) => {
    setActiveCategory(selectedCategory)
    router.push(`?category=${selectedCategory}`)
  }

  const getLinkTableByCategory = (category) => {
    const links = allLinks[category] || []
    return <LinkTable links={links} />
  }

  const categoryNames = Object.keys(allLinks)

  function camelCaseToSpaced(str) {
    if (str === "ai") {
      return "AI"
    }
    return str
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (match) => match.toUpperCase())
  }

  const spacedCategoryNames = categoryNames.map((category) =>
    camelCaseToSpaced(category)
  )

  return (
    <div className="px-2 pt-2">
      <div className="border-x-2 border-t-2 border-gray-300 p-2 dark:text-slate-300 rounded-t-md flex w-full justify-center text-center text-xs md:text-sm text-gray-700 dark:text-opacity-50">
        Always do your due diligence and double check any links you click
        online!
      </div>
      <Select value={activeCategory} onValueChange={handleChange}>
        <SelectTrigger className=" border-gray-300 rounded-t-none focus:border-gray-300 border-2">
          <SelectValue>{camelCaseToSpaced(activeCategory)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {categoryNames.map((category, index) => (
              <SelectItem
                key={index}
                value={category}
                className="text-indigo-500"
              >
                {spacedCategoryNames[index]}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
        <div className="mt-4">{getLinkTableByCategory(activeCategory)}</div>
      </Select>
    </div>
  )
}

export default CardanoLinks
