import AsteroidsGame from '@/components/AsteroidsGame'
import Leaderboard from '@/components/Leaderboard'

export default function GamePage() {
  return (
    <div className="container mx-auto flex flex-col items-center gap-8 py-8">
      <h1 className="text-4xl font-bold">Asteroids</h1>
      <AsteroidsGame />
      <Leaderboard />
    </div>
  )
}
