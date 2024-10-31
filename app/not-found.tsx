import Link from 'next/link'
import { Inter } from "next/font/google"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"

const inter = Inter({ 
  subsets: ["latin"],
  // Optional: you can add variable font settings
  variable: "--font-inter",
})

export default function NotFound() {
  return (
    <main className={`flex min-h-[calc(100vh-20rem)] items-center justify-center p-10 ${inter.className}`}>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <h1 className="text-4xl font-bold">404</h1>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link 
            href="/" 
            className="rounded-md bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return Home
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
