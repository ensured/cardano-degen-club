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
      setActiveTab(category.toString())
    }
  }, [searchParams])

  const renderLinkContent = (category) => {
    const links = allLinks[category + "Links"] || []
    return <LinkTable links={links} />
  }

  const handleOnChange = () => {
    router.push(`/cardano-links?category=${activeTab}`)
    setActiveTab(activeTab)
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
      {renderLinkContent(trigger)}
    </TabsContent>
  ))

  return (
    <div className="container mx-auto px-2 py-4 break-all">
      <Tabs defaultValue={activeTab} onChange={handleOnChange}>
        <TabsList>
          {tabTriggers.map((trigger, index) => (
            <TabsTrigger key={index} value={String(index + 1)}>
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
