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

const LinkTable = ({ links }) => (
  <Table className="z-10">
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>URL</TableHead>
        {links.some((link) => link.twitter) && <TableHead>Twitter</TableHead>}
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
              <a href={link.twitter} target="_blank" rel="noopener noreferrer">
                {link.twitter}
              </a>
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>
  </Table>
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
    <Select value={activeCategory} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue>
          {spacedCategoryNames.find(
            (_, index) => Object.keys(allLinks)[index] === activeCategory
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.keys(allLinks).map((category, index) => (
            <SelectItem key={index} value={category}>
              {spacedCategoryNames[index]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
      <LinkTable links={allLinks[activeCategory] || []} />
    </Select>
  )
}

export default CardanoLinks
