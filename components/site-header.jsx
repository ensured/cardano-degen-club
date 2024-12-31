import { MainNav } from '@/components/main-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { HeaderNavSheet } from './HeaderNavSheet'
import UserButton from './UserButton'
import { EpochTime } from './EpochTime'
import { getEpochData } from '../app/actions'

export async function SiteHeader() {
  const epochData = await getEpochData()

  return (
    <header className="z-40 w-full overflow-x-auto border-b bg-background">
      <div className="flex w-full items-center gap-1 px-2 pt-2 md:px-2">
        <MainNav HeaderNavSheet={<HeaderNavSheet />} />

        <div className="flex flex-1 items-center justify-end space-x-4 overflow-hidden">
          <nav className="flex items-center gap-2 text-xs">
            <UserButton />
            <ThemeToggle />
          </nav>
        </div>
      </div>
      <EpochTime epochData={epochData} />
    </header>
  )
}
