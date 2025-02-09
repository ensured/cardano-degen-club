'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { eventEmitter } from '@/lib/eventEmitter'
import { submitScore } from '@/app/actions'
import { useWallet } from '@/contexts/WalletContext'

const AsteroidsGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scoreRef = useRef(0)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { walletState, loading } = useWallet()
  const username = '$' + walletState?.adaHandle.handle || walletState?.stakeAddress || ''

  // Game state refs
  const shipX = useRef(400)
  const shipY = useRef(300)
  const shipAngle = useRef(0)
  const velocity = useRef({ x: 0, y: 0 })
  const asteroids = useRef<Array<{ x: number; y: number; size: number; dx: number; dy: number }>>(
    [],
  )
  const bullets = useRef<Array<{ x: number; y: number; dx: number; dy: number }>>([])
  const keys = useRef<{ [key: string]: boolean }>({})

  // Add a shooting cooldown ref
  const lastShotTime = useRef(0)
  const SHOT_COOLDOWN = 100 // milliseconds between shots

  // Add these refs for difficulty scaling
  const difficultyLevel = useRef(1)
  const lastDifficultyIncrease = useRef(0)
  const DIFFICULTY_SCORE_INTERVAL = 1000 // Increase difficulty every 1000 points

  const initGame = () => {
    if (!canvasRef.current) return

    // Adjust canvas size to window size
    const canvas = canvasRef.current
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Reset game state with new center position
    shipX.current = window.innerWidth / 2
    shipY.current = window.innerHeight / 2
    shipAngle.current = 0
    velocity.current = { x: 0, y: 0 }
    asteroids.current = []
    bullets.current = []
    scoreRef.current = 0
    setScore(0)
    setGameOver(false)

    // Reset difficulty
    difficultyLevel.current = 1
    lastDifficultyIncrease.current = 0

    // Create initial asteroids
    for (let i = 0; i < 5; i++) {
      createAsteroid()
    }
  }

  // Add this function to calculate difficulty-adjusted values
  const getDifficultyValues = () => {
    const level = difficultyLevel.current
    return {
      asteroidSpeed: Math.min(2 + level * 0.5, 6), // Speed increases with level, caps at 6
      asteroidSpawnRate: Math.min(0.005 + level * 0.002, 0.02), // Spawn rate increases, caps at 0.02
      asteroidSizeRange: {
        min: Math.max(10, 20 - level * 2), // Minimum size decreases with level, minimum 10
        max: Math.max(20, 50 - level * 3), // Maximum size decreases with level, minimum 20
      },
    }
  }

  const createAsteroid = () => {
    const { asteroidSpeed, asteroidSizeRange } = getDifficultyValues()
    const size =
      Math.random() * (asteroidSizeRange.max - asteroidSizeRange.min) + asteroidSizeRange.min
    let x, y
    const canvas = canvasRef.current
    if (!canvas) return

    // Ensure asteroids spawn outside the center area
    do {
      x = Math.random() * canvas.width
      y = Math.random() * canvas.height
    } while (Math.abs(x - shipX.current) < 100 && Math.abs(y - shipY.current) < 100)

    asteroids.current.push({
      x,
      y,
      size,
      dx: (Math.random() - 0.5) * asteroidSpeed * 2,
      dy: (Math.random() - 0.5) * asteroidSpeed * 2,
    })
  }

  const updateGame = () => {
    if (!canvasRef.current || gameOver || isPaused) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Check if it's time to increase difficulty
    if (scoreRef.current - lastDifficultyIncrease.current >= DIFFICULTY_SCORE_INTERVAL) {
      difficultyLevel.current++
      lastDifficultyIncrease.current = scoreRef.current
      // Visual feedback for difficulty increase
      toast.info(`Difficulty increased to level ${difficultyLevel.current}!`, {
        duration: 2000,
      })
    }

    // Clear canvas
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update ship position based on keys
    if (keys.current['ArrowUp'] || keys.current['w']) {
      const thrust = 0.3 // Reduced thrust for better control
      velocity.current.x += Math.cos(shipAngle.current - Math.PI / 2) * thrust
      velocity.current.y += Math.sin(shipAngle.current - Math.PI / 2) * thrust
    }
    if (keys.current['ArrowLeft'] || keys.current['a']) shipAngle.current -= 0.1
    if (keys.current['ArrowRight'] || keys.current['d']) shipAngle.current += 0.1

    // Apply stronger friction
    velocity.current.x *= 0.98 // Increased friction
    velocity.current.y *= 0.98 // Increased friction

    // Add maximum velocity limit
    const maxSpeed = 10
    const currentSpeed = Math.sqrt(
      velocity.current.x * velocity.current.x + velocity.current.y * velocity.current.y,
    )

    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed
      velocity.current.x *= scale
      velocity.current.y *= scale
    }

    // Update ship position
    shipX.current += velocity.current.x
    shipY.current += velocity.current.y

    // Update wrap around with canvas dimensions
    shipX.current = (shipX.current + canvas.width) % canvas.width
    shipY.current = (shipY.current + canvas.height) % canvas.height

    // Draw ship
    ctx.save()
    ctx.translate(shipX.current, shipY.current)
    ctx.rotate(shipAngle.current)
    ctx.strokeStyle = 'white'
    ctx.beginPath()
    ctx.moveTo(0, -20)
    ctx.lineTo(-10, 20)
    ctx.lineTo(10, 20)
    ctx.closePath()
    ctx.stroke()
    ctx.restore()

    // Add shooting logic to updateGame
    const now = Date.now()
    if (keys.current[' '] && now - lastShotTime.current > SHOT_COOLDOWN) {
      bullets.current.push({
        x: shipX.current,
        y: shipY.current,
        dx: Math.cos(shipAngle.current - Math.PI / 2) * 7,
        dy: Math.sin(shipAngle.current - Math.PI / 2) * 7,
      })
      lastShotTime.current = now
    }

    // Update and draw bullets
    bullets.current = bullets.current.filter((bullet) => {
      bullet.x += bullet.dx
      bullet.y += bullet.dy

      // Remove bullets that go off screen
      if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
        return false
      }

      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2)
      ctx.fill()

      // Check collision with asteroids
      let hitAsteroid = false
      asteroids.current = asteroids.current.filter((asteroid) => {
        const dx = bullet.x - asteroid.x
        const dy = bullet.y - asteroid.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < asteroid.size) {
          hitAsteroid = true
          scoreRef.current += 100
          setScore((prev) => {
            const newScore = prev + 100
            return newScore
          })
          if (asteroid.size > 20) {
            // Split asteroid
            for (let i = 0; i < 2; i++) {
              asteroids.current.push({
                x: asteroid.x,
                y: asteroid.y,
                size: asteroid.size / 2,
                dx: (Math.random() - 0.5) * 4,
                dy: (Math.random() - 0.5) * 4,
              })
            }
          }
          return false
        }
        return true
      })

      // Remove bullet if it hit an asteroid
      return !hitAsteroid
    })

    // Update and draw asteroids
    asteroids.current.forEach((asteroid) => {
      asteroid.x += asteroid.dx
      asteroid.y += asteroid.dy
      asteroid.x = (asteroid.x + canvas.width) % canvas.width
      asteroid.y = (asteroid.y + canvas.height) % canvas.height

      ctx.strokeStyle = 'white'
      ctx.beginPath()
      ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2)
      ctx.stroke()

      // Check collision with ship
      const dx = shipX.current - asteroid.x
      const dy = shipY.current - asteroid.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < asteroid.size + 10 && !gameOver) {
        console.log('Collision detected:', {
          shipPos: { x: shipX.current, y: shipY.current },
          asteroidPos: { x: asteroid.x, y: asteroid.y },
          distance,
          threshold: asteroid.size + 10,
          currentScore: scoreRef.current,
        })
        handleGameOver()
      }
    })

    // Update asteroid spawn logic with dynamic rate
    const { asteroidSpawnRate } = getDifficultyValues()
    if (Math.random() < asteroidSpawnRate) {
      createAsteroid()
    }

    // Add difficulty level display
    ctx.fillStyle = 'white'
    ctx.font = '20px Arial'
    ctx.fillText(`Score: ${scoreRef.current}`, 10, 30)
    ctx.fillText(`Level: ${difficultyLevel.current}`, 10, 60)
  }

  const handleGameOver = async () => {
    if (gameOver) {
      console.log('Game already over, preventing duplicate call')
      return
    }

    // Use scoreRef instead of score state
    const finalScore = scoreRef.current
    console.log('Game Over triggered:', {
      username,
      finalScore,
      currentScore: scoreRef.current,
      gameOverState: gameOver,
      isPlayingState: isPlaying,
    })

    setGameOver(true)
    setIsPlaying(false)

    if (username && finalScore > 0) {
      try {
        console.log('Attempting to submit score:', { username, finalScore })

        const result = await submitScore(username, finalScore)

        if (!result.success) {
          throw new Error(result.error || 'Failed to save score')
        }

        console.log('Score submitted successfully:', result.data)

        // Get the ordinal suffix for the rank
        const getOrdinal = (n: number) => {
          const s = ['th', 'st', 'nd', 'rd']
          const v = n % 100
          return n + (s[(v - 20) % 10] || s[v] || s[0])
        }

        toast.success(`Score saved to leaderboard! You are in ${getOrdinal(result.rank)} place!`, {
          duration: 5000,
        })

        eventEmitter.emit('SCORE_UPDATED')
      } catch (error) {
        console.error('Error saving score:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to save score')
      }
    } else {
      console.log('Score validation failed:', {
        hasUsername: !!username,
        username,
        finalScore,
        isScorePositive: finalScore > 0,
      })
      if (!username) {
        toast.error('No username provided')
      } else if (finalScore <= 0) {
        return
      }
    }
  }

  const startGame = () => {
    if (!walletState?.stakeAddress) {
      toast.error('Please connect your wallet to play')
      return
    }
    setIsPlaying(true)
    initGame()
  }

  const handlePause = () => {
    setIsPaused((prev) => !prev)
  }

  useEffect(() => {
    if (!isPlaying) return

    let animationId: number

    const handleResize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default actions for game controls
      if (
        [
          'Space',
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'w',
          'a',
          's',
          'd',
          'Escape',
        ].includes(e.code)
      ) {
        e.preventDefault()
      }

      // Handle Escape key
      if (e.code === 'Escape' && isPlaying) {
        handlePause()
        return
      }

      // Only process other keys if game is not paused
      if (!isPaused) {
        if (e.code === 'Space') {
          keys.current[' '] = true
        } else {
          keys.current[e.key] = true
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isPaused) {
        if (e.code === 'Space') {
          keys.current[' '] = false
        } else {
          keys.current[e.key] = false
        }
      }
    }

    const gameLoop = () => {
      if (!isPaused) {
        updateGame()
      } else {
        // Draw paused state
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx) {
          // Keep drawing the current game state while paused
          ctx.fillStyle = 'white'
          ctx.font = '20px Arial'
          ctx.fillText(`Score: ${scoreRef.current}`, 10, 30)
          ctx.fillText(`Level: ${difficultyLevel.current}`, 10, 60)
        }
      }
      animationId = requestAnimationFrame(gameLoop)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    handleResize()

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPlaying, isPaused]) // Add isPaused to dependencies

  const formatStakeAddress = (address: string) => {
    if (!address) return ''
    if (address.length <= 16) return address
    return `${address.slice(0, 10)}...${address.slice(-8)}`
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-4"
      style={{
        position: isPlaying ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: isPlaying ? 'black' : 'transparent',
      }}
    >
      {!isPlaying && !gameOver ? (
        <div className="flex flex-col items-center gap-4">
          {walletState?.stakeAddress && (
            <button
              onClick={startGame}
              className="bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 text-white"
            >
              Start Game
            </button>
          )}
        </div>
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" />
      )}

      {isPaused && isPlaying && !gameOver && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/80 p-6 text-center backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-white">Game Paused</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsPaused(false)}
              className="bg-blue-500 hover:bg-blue-600 w-full rounded px-4 py-2 text-white"
            >
              Resume
            </button>
            <button
              onClick={() => {
                setIsPaused(false)
                setIsPlaying(false)
                setGameOver(false)
              }}
              className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Quit Game
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-400">Press ESC to resume</p>
        </div>
      )}

      {gameOver && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/80 p-6 text-center backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white">Game Over!</h2>
          <p className="mb-2 text-sm text-gray-400">{formatStakeAddress(username)}</p>
          <p className="mb-4 text-xl text-white">Final Score: {scoreRef.current}</p>
          <button
            onClick={startGame}
            className="bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 text-white"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}

export default AsteroidsGame
