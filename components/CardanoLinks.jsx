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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>URL</TableHead>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

const CardanoLinks = () => {
  const searchParams = useSearchParams()
  const category = searchParams.get("category")

  const [activeTab, setActiveTab] = useState(category || "wallets")
  const router = useRouter()

  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      setActiveTab(category)
    }
  }, [searchParams])

  const getLinkTableByCategory = (category) => {
    const links = allLinks[category + "Links"] || []
    return <LinkTable links={links} />
  }

  const tabTriggers = [
    "officialCardano",
    "wallets",
    "dexs",
    "marketplaces",
    "metaverse",
    "chartsAnalytics",
    "lendingBorrowing",
    "yieldAggregators",
    "stablecoins",
    "privacy",
    "syntheticProtocols",
    "oracles",
    "memecoins",
    "other",
  ]

  const tabContents = tabTriggers.map((trigger, index) => (
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
    // const index = tabTriggers.findIndex((trigger) => trigger === text)
    setActiveTab(text)
    router.push(`?category=${text}`)
  }

  return (
    <div className="container py-4 ">
      <Tabs value={activeTab}>
        <TabsList>
          {tabTriggers.map((trigger, index) => (
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
