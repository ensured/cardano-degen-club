"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Tabz = ({ source, howTo }) => {
  return (
    <div className="flex flex-col justify-center p-1 pr-2">
      <Tabs defaultValue="source">
        <TabsList>
          <TabsTrigger value="source">Source code</TabsTrigger>
          <TabsTrigger value="howTo">How-to</TabsTrigger>
        </TabsList>
        <TabsContent value="source">{source}</TabsContent>
        <TabsContent value="howTo">{howTo}</TabsContent>
      </Tabs>
    </div>
  )
}

export default Tabz
