'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { eventEmitter } from '@/lib/eventEmitter'
import { submitScore } from '@/app/actions'
import { useWallet } from '@/contexts/WalletContext'
import { LeaderboardDialog } from './LeaderboardDialog'
import { Button } from './ui/button'
import Button3D from './3dButton'
const AsteroidsGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scoreRef = useRef(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { walletState, loading, network } = useWallet()
  const username = walletState?.adaHandle?.handle
    ? '$' + walletState?.adaHandle?.handle
    : walletState?.walletAddress

  // Game state refs
  const shipX = useRef(400)
  const shipY = useRef(300)
  const shipAngle = useRef(0)
  const velocity = useRef({ x: 0, y: 0 })
  const asteroids = useRef<
    Array<{
      x: number
      y: number
      size: number
      dx: number
      dy: number
      points: Array<{ x: number; y: number }>
      rotation: number
      rotationSpeed: number
    }>
  >([])
  const bullets = useRef<Array<{ x: number; y: number; dx: number; dy: number }>>([])
  const keys = useRef<{ [key: string]: boolean }>({})

  // Add a shooting cooldown ref
  const lastShotTime = useRef(0)
  const SHOT_COOLDOWN = 150 // milliseconds between shots

  // Add these refs for difficulty scaling
  const difficultyLevel = useRef(1)
  const lastDifficultyIncrease = useRef(0)
  const DIFFICULTY_SCORE_INTERVAL = 2000 // Increase difficulty every 1000 points

  // Add this ref at the top with other refs
  const shootingInterval = useRef<NodeJS.Timeout | null>(null)

  // Add these refs at the top with other refs
  const rotationVelocity = useRef(0)
  const MAX_ROTATION_SPEED = 0.05
  const ROTATION_ACCELERATION = 0.003
  const ROTATION_FRICTION = 0.97

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
    setGameOver(false)

    // Reset all key states
    keys.current = {}

    // Reset shooting cooldown
    lastShotTime.current = 0

    // Reset difficulty
    difficultyLevel.current = 1
    lastDifficultyIncrease.current = 0

    // Reset pause state if it was paused
    setIsPaused(false)

    // Clear any existing shooting interval
    if (shootingInterval.current) {
      clearInterval(shootingInterval.current)
      shootingInterval.current = null
    }

    // Reset rotation velocity
    rotationVelocity.current = 0

    // Create initial asteroids
    for (let i = 0; i < 5; i++) {
      createAsteroid()
    }
  }

  // Add this new function to generate random polygon points
  const generateAsteroidPoints = (size: number) => {
    const points: Array<{ x: number; y: number }> = []
    const vertices = Math.floor(Math.random() * 4) + 7 // 7-10 vertices
    for (let i = 0; i < vertices; i++) {
      const angle = (i / vertices) * Math.PI * 2
      const variance = 0.4 // How much the radius can vary
      const radius = size * (1 - variance + Math.random() * variance * 2)
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      })
    }
    return points
  }

  // Modify getDifficultyValues to reduce speed scaling
  const getDifficultyValues = () => {
    const level = difficultyLevel.current
    return {
      asteroidSpeed: Math.min(0.3 + level * 0.1, 1.2), // Significantly reduced speed and max speed
      asteroidSpawnRate: Math.min(0.005 + level * 0.002, 0.02),
      asteroidSizeRange: {
        min: Math.max(10, 20 - level * 2),
        max: Math.max(20, 50 - level * 3),
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

    // Ensure asteroids spawn outside the center area and away from the ship
    const safeDistance = 150 // Minimum safe distance from ship
    let distanceFromShip = 0
    do {
      // Randomly choose to spawn on horizontal or vertical edges
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? -size : canvas.width + size
        y = Math.random() * canvas.height
      } else {
        x = Math.random() * canvas.width
        y = Math.random() < 0.5 ? -size : canvas.height + size
      }

      // Calculate distance from ship
      const dx = x - shipX.current
      const dy = y - shipY.current
      distanceFromShip = Math.sqrt(dx * dx + dy * dy)
    } while (distanceFromShip < safeDistance)

    asteroids.current.push({
      x,
      y,
      size,
      dx: (Math.random() - 0.5) * asteroidSpeed * 2,
      dy: (Math.random() - 0.5) * asteroidSpeed * 2,
      points: generateAsteroidPoints(size),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02, // Random rotation speed
    })
  }

  const updateGame = () => {
    if (!canvasRef.current || gameOver) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Only update positions if game is not paused
    if (!isPaused) {
      // Thrust
      if (keys.current['ArrowUp'] || keys.current['KeyW']) {
        const thrust = 0.02
        velocity.current.x += Math.cos(shipAngle.current - Math.PI / 2) * thrust
        velocity.current.y += Math.sin(shipAngle.current - Math.PI / 2) * thrust
      }

      // Rotation with momentum
      if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
        rotationVelocity.current -= ROTATION_ACCELERATION
      }
      if (keys.current['ArrowRight'] || keys.current['KeyD']) {
        rotationVelocity.current += ROTATION_ACCELERATION
      }

      // Clamp rotation speed
      rotationVelocity.current = Math.max(
        -MAX_ROTATION_SPEED,
        Math.min(MAX_ROTATION_SPEED, rotationVelocity.current),
      )

      // Apply rotation friction
      rotationVelocity.current *= ROTATION_FRICTION

      // Apply rotation
      shipAngle.current += rotationVelocity.current

      // Apply stronger friction to slow down faster
      velocity.current.x *= 0.988
      velocity.current.y *= 0.988

      // Update ship position
      shipX.current += velocity.current.x
      shipY.current += velocity.current.y

      // Update wrap around
      shipX.current = (shipX.current + canvas.width) % canvas.width
      shipY.current = (shipY.current + canvas.height) % canvas.height

      // Update bullet positions
      bullets.current.forEach((bullet) => {
        bullet.x += bullet.dx
        bullet.y += bullet.dy
      })

      // Update asteroid positions
      asteroids.current.forEach((asteroid) => {
        asteroid.x += asteroid.dx
        asteroid.y += asteroid.dy
        asteroid.x = (asteroid.x + canvas.width) % canvas.width
        asteroid.y = (asteroid.y + canvas.height) % canvas.height
      })
    }

    // Draw everything regardless of pause state
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

    // Add thruster flame when moving forward
    if ((keys.current['ArrowUp'] || keys.current['KeyW']) && !isPaused) {
      ctx.beginPath()
      ctx.moveTo(-5, 20)
      ctx.lineTo(0, 30)
      ctx.lineTo(5, 20)
      ctx.strokeStyle = 'orange'
      ctx.stroke()
    }
    ctx.restore()

    // Draw bullets
    bullets.current.forEach((bullet) => {
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw asteroids
    asteroids.current.forEach((asteroid) => {
      ctx.strokeStyle = 'white'
      ctx.beginPath()

      // Move to the first point
      const startX =
        asteroid.x +
        asteroid.points[0].x * Math.cos(asteroid.rotation) -
        asteroid.points[0].y * Math.sin(asteroid.rotation)
      const startY =
        asteroid.y +
        asteroid.points[0].x * Math.sin(asteroid.rotation) +
        asteroid.points[0].y * Math.cos(asteroid.rotation)
      ctx.moveTo(startX, startY)

      // Draw lines to each point
      for (let i = 1; i <= asteroid.points.length; i++) {
        const point = asteroid.points[i % asteroid.points.length]
        const rotatedX =
          asteroid.x + point.x * Math.cos(asteroid.rotation) - point.y * Math.sin(asteroid.rotation)
        const rotatedY =
          asteroid.y + point.x * Math.sin(asteroid.rotation) + point.y * Math.cos(asteroid.rotation)
        ctx.lineTo(rotatedX, rotatedY)
      }

      ctx.stroke()

      // Only update rotation if game is not paused
      if (!isPaused) {
        asteroid.rotation += asteroid.rotationSpeed
      }
    })

    // Rest of collision detection and game logic only if not paused
    if (!isPaused) {
      // Check if it's time to increase difficulty
      if (scoreRef.current - lastDifficultyIncrease.current >= DIFFICULTY_SCORE_INTERVAL) {
        difficultyLevel.current++
        lastDifficultyIncrease.current = scoreRef.current
        // Visual feedback for difficulty increase
        toast.info(`Difficulty increased to level ${difficultyLevel.current}!`, {
          duration: 2000,
        })
      }

      // Update and draw bullets
      bullets.current = bullets.current.filter((bullet) => {
        // Remove bullets that go off screen
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
          return false
        }

        // Check collision with asteroids
        let hitAsteroid = false
        asteroids.current = asteroids.current.filter((asteroid) => {
          const dx = bullet.x - asteroid.x
          const dy = bullet.y - asteroid.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < asteroid.size) {
            hitAsteroid = true
            scoreRef.current += 100
            if (asteroid.size > 20) {
              // Split asteroid
              for (let i = 0; i < 2; i++) {
                asteroids.current.push({
                  x: asteroid.x,
                  y: asteroid.y,
                  size: asteroid.size / 2,
                  dx: (Math.random() - 0.5) * 4,
                  dy: (Math.random() - 0.5) * 4,
                  points: generateAsteroidPoints(asteroid.size / 2),
                  rotation: Math.random() * Math.PI * 2,
                  rotationSpeed: (Math.random() - 0.5) * 0.02,
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
    }

    // Draw UI
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
        console.log(result)

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

        // Emit event to update leaderboard
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
    if (!walletState?.walletAddress) {
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
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
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
        keys.current[e.code] = true

        // Handle shooting separately from movement
        if (e.code === 'Space' && !shootingInterval.current) {
          // Create a shoot function
          const shoot = () => {
            if (!isPaused) {
              bullets.current.push({
                x: shipX.current,
                y: shipY.current,
                dx: Math.cos(shipAngle.current - Math.PI / 2) * 7,
                dy: Math.sin(shipAngle.current - Math.PI / 2) * 7,
              })
            }
          }

          // Shoot immediately
          shoot()

          // Set up interval for continuous shooting
          shootingInterval.current = setInterval(shoot, SHOT_COOLDOWN)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      // Always process key up events to prevent stuck keys
      keys.current[e.code] = false

      // Clear shooting interval when space is released
      if (e.code === 'Space' && shootingInterval.current) {
        clearInterval(shootingInterval.current)
        shootingInterval.current = null
      }
    }

    const gameLoop = () => {
      updateGame()
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
      // Clear shooting interval on cleanup
      if (shootingInterval.current) {
        clearInterval(shootingInterval.current)
        shootingInterval.current = null
      }
    }
  }, [isPlaying, isPaused]) // Add isPaused to dependencies

  const formatAddress = (address: string) => {
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
      <div className="flex gap-2">
        {!isPlaying && !gameOver ? (
          <div className="flex flex-col items-center gap-4">
            {/* if mainnet and wallet connected show button */}
            {(walletState?.adaHandle?.handle || walletState?.walletAddress) && network === 1 ? (
              <Button3D variant={'outline'} onClick={startGame}>
                Start Game
              </Button3D>
            ) : (
              <div className="text-lg font-bold">please connect to mainnet to play</div>
            )}
          </div>
        ) : (
          <canvas ref={canvasRef} className="h-full w-full" />
        )}
      </div>

      {isPaused && isPlaying && !gameOver && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Game Paused</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsPaused(false)}
              className="w-full rounded border border-border/50 bg-blue/30 px-4 py-2 hover:bg-blue/25"
            >
              Resume
            </button>
            <button
              onClick={() => {
                setIsPaused(false)
                setIsPlaying(false)
                setGameOver(false)
              }}
              className="w-full rounded bg-red-600/30 px-4 py-2 hover:bg-red-700/30"
            >
              Quit Game
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-400">Press ESC to resume</p>
        </div>
      )}

      {gameOver && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background/80 p-8 text-center backdrop-blur-sm">
          <h2 className="text-2xl font-bold">Game Over!</h2>

          <p className="mb-2 text-sm">{username ?? ''}</p>
          <p className="mb-4 text-xl">Final Score: {scoreRef.current}</p>
          <Button variant={'outline'} onClick={startGame}>
            Play Again
          </Button>
        </div>
      )}
    </div>
  )
}

export default AsteroidsGame
