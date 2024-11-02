/* eslint-disable tailwindcss/classnames-order */
import Animation from "@/components/Animation"
import CardanoLinks from "@/components/CardanoLinks"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Shield } from "lucide-react"

export const metadata = {
  title: "Cardano Links | Comprehensive Resource Directory",
  description: "A curated collection of essential Cardano ecosystem resources, tools, and platforms.",
}

const CardanoLinksPage = () => {
  return (
    <Animation>
      <div className="mx-auto h-full max-w-7xl px-1 py-4 sm:px-10 ">
        <div className="mb-6 space-y-2 text-center p-4">
          <h1 className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-5xl animate-gradient-x dark:from-blue-300 dark:via-purple-300 dark:to-pink-300">
            Cardano Resources Directory
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg ">
            Explore essential tools and platforms in the Cardano ecosystem
          </p>
        </div>
        
        <Card className="h-[calc(100%-6rem)] shadow-lg">
          <CardHeader className="border-muted text-muted-foreground">
            <Alert variant="warning" className="flex items-center border-muted bg-muted/10 p-4 rounded-md text-muted-foreground shadow-lg bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:via-gray-900 dark:to-black">
              <div className="flex items-center justify-center mr-3 ">
                <Shield className="size-6 text-muted-foreground" />
              </div>
              <AlertDescription className="text-sm font-medium sm:text-base">
                Always verify links and do your due diligence before connecting your wallet or sharing sensitive information
              </AlertDescription>
            </Alert>
          </CardHeader>
          
          <CardanoLinks />
        </Card>
      </div>
    </Animation>
  )
}

export default CardanoLinksPage
