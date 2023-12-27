"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import allLinks from "../config/cardanoLinks"

const LinkTable = ({ links }) => {
  const hasTwitter = links.some((link) => link.twitter) // Check if any link has Twitter

  return (
    <Table>
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

  const [activeTab, setActiveTab] = useState(category || "wallets")
  const router = useRouter()

  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      setActiveTab(category)
    }
  }, [searchParams])

  const getLinkTableByCategory = (category) => {
    const links = allLinks[category] || []
    return <LinkTable links={links} />
  }

  const categoryNames = Object.keys(allLinks)

  const tabContents = categoryNames.map((trigger, index) => (
    <TabsContent key={index} value={trigger}>
      {getLinkTableByCategory(trigger)}
    </TabsContent>
  ))

  function spacedToCamelCase(text) {
    return text
      .replace(/\s+/g, "")
      .replace(/([^A-Z])([A-Z])/g, "$1 $2")
      .replace(/^./, (match) => match.toLowerCase())
      .replace(/\s/g, "")
  }

  function camelCaseToSpaced(str) {
    return str
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (match) => match.toUpperCase())
  }

  const handleClick = (e) => {
    const text = spacedToCamelCase(e.target.textContent)
    setActiveTab(text)
    router.push(`?category=${text}`)
  }

  return (
    <div className="container py-4 ">
      <Tabs value={activeTab}>
        <TabsList>
          {categoryNames.map((trigger, index) => (
            <TabsTrigger
              key={index}
              value={trigger}
              onClick={handleClick}
              className="text-sm font-semibold"
            >
              {camelCaseToSpaced(trigger)}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabContents}
      </Tabs>
    </div>
  )
}

export default CardanoLinks
