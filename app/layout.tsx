import "@/styles/globals.css"
import { Metadata } from "next"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import Footer from "@/components/Footer"
import ScrollToTopButton from "@/components/ScrollToTopButton"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"

export const metadata: Metadata = {
  title: "Home",
  description: siteConfig.description,
  icons: {
    icon: "/favicon.svg",
  },
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable,
        inter.className
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster
            richColors={true}
            toastOptions={{
              style: { minWidth: "20rem", maxWidth: "40rem" },
              className: "break-all",
            }}
          />
          <div className="flex min-h-screen flex-col">
            <div className="relative">
              <SiteHeader />
            </div>
            <main className="grow">{children}</main>
            <Footer />
          </div>
          <TailwindIndicator />
        </ThemeProvider>
        <ScrollToTopButton />
      </body>
    </html>
  )
}
