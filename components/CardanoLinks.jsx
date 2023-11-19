"use client"

import { useState } from "react"

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
  const [activeTab, setActiveTab] = useState("1")

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  const renderLinkContent = (category) => {
    const links = allLinks[category + "Links"] || []
    return <LinkTable links={links} />
  }

  return (
    <div className="container mx-auto px-2 py-4 break-all">
      <Tabs onChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="1">official cardano links</TabsTrigger>
          <TabsTrigger value="2">wallets</TabsTrigger>
          <TabsTrigger value="3">dexs</TabsTrigger>
          <TabsTrigger value="4">marketplaces</TabsTrigger>
          <TabsTrigger value="6">charts/analytics</TabsTrigger>
          <TabsTrigger value="5">metaverse</TabsTrigger>
          <TabsTrigger value="7">lending/borrowing</TabsTrigger>
          <TabsTrigger value="8">yield aggregators</TabsTrigger>
          <TabsTrigger value="9">stable coins</TabsTrigger>
          <TabsTrigger value="10">privacy</TabsTrigger>
          <TabsTrigger value="11">synthetic protocols</TabsTrigger>

          <TabsTrigger value="12">oracles</TabsTrigger>
          <TabsTrigger value="13">meme coins</TabsTrigger>
          <TabsTrigger value="14">other</TabsTrigger>
        </TabsList>

        {/* Tab content */}
        <TabsContent value="1">
          {renderLinkContent("officialCardano")}
        </TabsContent>
        <TabsContent value="2">{renderLinkContent("wallets")}</TabsContent>
        <TabsContent value="3">{renderLinkContent("dexs")}</TabsContent>
        <TabsContent value="4">{renderLinkContent("marketplaces")}</TabsContent>
        <TabsContent value="6">
          {renderLinkContent("chartsAnalytics")}
        </TabsContent>
        <TabsContent value="5">{renderLinkContent("metaverse")}</TabsContent>
        <TabsContent value="7">
          {renderLinkContent("lendingBorrowing")}
        </TabsContent>
        <TabsContent value="14">{renderLinkContent("other")}</TabsContent>
        <TabsContent value="8">
          {renderLinkContent("yieldAggregators")}
        </TabsContent>

        <TabsContent value="9">{renderLinkContent("stablecoins")}</TabsContent>

        <TabsContent value="10">{renderLinkContent("privacy")}</TabsContent>

        <TabsContent value="11">
          {renderLinkContent("syntheticProtocols")}
        </TabsContent>

        <TabsContent value="12">{renderLinkContent("oracles")}</TabsContent>

        <TabsContent value="13">{renderLinkContent("memecoins")}</TabsContent>

        <TabsContent value="14">{renderLinkContent("other")}</TabsContent>
      </Tabs>
    </div>
  )
}

export default CardanoLinks
