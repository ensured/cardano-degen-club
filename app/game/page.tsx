import AsteroidsGame from '@/components/AsteroidsGame'
import { LeaderboardDialog } from '@/components/LeaderboardDialog'
export default function GamePage() {
  return (
    <div className="container mx-auto flex flex-col items-center h-screen py-8">
      <div className="fixed inset-0 w-full h-full">
        <AsteroidsGame />
      </div>
    </div>
  )
}
