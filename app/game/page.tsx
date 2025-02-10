import AsteroidsGame from '@/components/AsteroidsGame'
import { LeaderboardDialog } from '@/components/LeaderboardDialog'
export default function GamePage() {
  return (
    <div className="container mx-auto flex flex-col items-center gap-8 py-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-bold">ADAsteroids</h1>
        <LeaderboardDialog />
      </div>

      <AsteroidsGame />
    </div>
  )
}
