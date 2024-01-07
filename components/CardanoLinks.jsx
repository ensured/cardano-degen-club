"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
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
  const ref = useRef(null)
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
    return str
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (match) => match.toUpperCase())
  }

  const spacedCategoryNames = categoryNames.map((category) =>
    camelCaseToSpaced(category)
  )

  return (
    <div className="px-2">
      <Select
        value={activeCategory}
        onValueChange={handleChange}
        className="z-50 w-[180px]"
      >
        <SelectTrigger>
          <SelectValue>{camelCaseToSpaced(activeCategory)}</SelectValue>
        </SelectTrigger>
        <SelectContent
        // ref={(ref) => {
        //   if (!ref) return
        //   ref.ontouchstart = (e) => {
        //     e.preventDefault()
        //   }
        // }}
        >
          <SelectGroup className="max-h-[10rem] overflow-y-auto ">
            {categoryNames.map((category, index) => (
              <SelectItem key={index} value={category}>
                {spacedCategoryNames[index]}
              </SelectItem>
            ))}
            <SelectItem key={"t1"} value={"t1"}>
              t1
            </SelectItem>
            <SelectItem key={"t2"} value={"t2"}>
              t2
            </SelectItem>
            <SelectItem key={"t3"} value={"t3"}>
              t3
            </SelectItem>
            <SelectItem key={"t4"} value={"t4"}>
              t4
            </SelectItem>
            <SelectItem key={"t5"} value={"t5"}>
              t5
            </SelectItem>
            <SelectItem key={"t6"} value={"t6"}>
              t6
            </SelectItem>
            <SelectItem key={"t7"} value={"t7"}>
              t7
            </SelectItem>
          </SelectGroup>
        </SelectContent>
        <div className="mt-4">{getLinkTableByCategory(activeCategory)}</div>
      </Select>
    </div>
  )
}

export default CardanoLinks
