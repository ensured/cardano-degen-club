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
      <Tabs value={activeTab} onChange={handleTabChange}>
        {/* Tab triggers */}
        {/* ... */}

        {/* Tab content */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((index) => (
          <TabsContent key={index} value={index.toString()}>
            {renderLinkContent(index.toString())}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export default CardanoLinks
