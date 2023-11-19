"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

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

  const [activeTab, setActiveTab] = useState(category || "1")
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
    <TabsContent key={index} value={String(index + 1)}>
      {getLinkTableByCategory(trigger)}
    </TabsContent>
  ))

  const handleClick = (e) => {
    const index = tabTriggers.findIndex(
      (trigger) => trigger === e.target.textContent
    )
    setActiveTab(String(index + 1))
    router.push(`?category=${index + 1}`)
  }

  return (
    <div className="container mx-auto px-2 py-4 break-all">
      <Tabs value={activeTab}>
        <TabsList>
          {tabTriggers.map((trigger, index) => (
            <TabsTrigger
              key={index}
              value={String(index + 1)}
              onClick={handleClick}
              className="text-sm font-semibold"
            >
              {trigger}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabContents}
      </Tabs>
    </div>
  )
}

export default CardanoLinks
