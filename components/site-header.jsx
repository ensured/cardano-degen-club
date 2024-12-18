import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { HeaderNavSheet } from "./HeaderNavSheet"
import UserButton from "./UserButton"
import { HeaderTimeAgo } from "./HeaderTimeAgo"

export async function SiteHeader() {
  const blockfrostApiKey = process.env.BLOCKFROST_API_KEY
  const getEpochData = async () => {
    const url = `https://cardano-mainnet.blockfrost.io/api/v0/epochs/latest`
    const response = await fetch(url, {
      headers: {
        project_id: blockfrostApiKey,
      },
      next: {
        revalidate: 0,
      },
    })
    const data = await response.json()
    return data
  }

  const epochData = await getEpochData()

  return (
    <header className="z-40 w-full overflow-x-auto border-b bg-background">
      <div className="flex w-full items-center gap-3 px-4 pt-4 md:px-3">
        <HeaderNavSheet />
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4 overflow-hidden">
          <nav className="flex items-center gap-1.5 text-xs">
            <UserButton />
            <ThemeToggle />
          </nav>
        </div>
      </div>
      <HeaderTimeAgo epochData={epochData} />
    </header>
  )
}
