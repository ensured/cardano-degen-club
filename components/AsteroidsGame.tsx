'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { eventEmitter } from '@/lib/eventEmitter'
import { submitScore } from '@/app/actions'
import { useWallet } from '@/contexts/WalletContext'
import { LeaderboardDialog } from './LeaderboardDialog'
import { Button } from './ui/button'
import Button3D from './3dButton'
import { Progress } from './ui/progress'

// Constants
const GAME_CONSTANTS = {
  SHOT_COOLDOWN: 150,
  DIFFICULTY_SCORE_INTERVAL: 2000,
  MAX_ROTATION_SPEED: 0.05,
  ROTATION_ACCELERATION: 0.003,
  ROTATION_FRICTION: 0.97,
  POWER_UP_DURATION: 15000,
  POWER_UP_DROP_CHANCE: 0.2,
  POWER_UP_LIFETIME: 15000,
  POWER_UP_BLINK_START: 3000,
  SHIP_SIZE: 20,
  THRUST_POWER: 0.02,
  FRICTION: 0.988,
} as const

// Types and Interfaces
type PowerUpType = 'spreadShot' | 'rapidFire' | 'shield' | 'speedBoost'

interface PowerUp {
  x: number
  y: number
  type: PowerUpType
  createdAt: number
}

interface Asteroid {
  x: number
  y: number
  size: number
  dx: number
  dy: number
  points: Array<{ x: number; y: number }>
  rotation: number
  rotationSpeed: number
}

interface Bullet {
  x: number
  y: number
  dx: number
  dy: number
}

// Helper Functions
const generateAsteroidPoints = (size: number) => {
  const points: Array<{ x: number; y: number }> = []
  const vertices = Math.floor(Math.random() * 4) + 7
  const variance = 0.4

  for (let i = 0; i < vertices; i++) {
    const angle = (i / vertices) * Math.PI * 2
    const radius = size * (1 - variance + Math.random() * variance * 2)
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    })
  }
  return points
}

const getDifficultyValues = (level: number) => {
  return {
    asteroidSpeed: Math.min(0.3 + level * 0.1, 1.2),
    asteroidSpawnRate: Math.min(0.005 + level * 0.002, 0.02),
    asteroidSizeRange: {
      min: Math.max(10, 20 - level * 2),
      max: Math.max(20, 50 - level * 3),
    },
  }
}

const getOrdinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Drawing Functions
const drawShip = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  isThrusting: boolean,
) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  // Draw ship body
  ctx.strokeStyle = 'white'
  ctx.beginPath()
  ctx.moveTo(0, -GAME_CONSTANTS.SHIP_SIZE)
  ctx.lineTo(-10, GAME_CONSTANTS.SHIP_SIZE)
  ctx.lineTo(10, GAME_CONSTANTS.SHIP_SIZE)
  ctx.closePath()
  ctx.stroke()

  // Draw thruster
  if (isThrusting) {
    ctx.beginPath()
    ctx.moveTo(-5, GAME_CONSTANTS.SHIP_SIZE)
    ctx.lineTo(0, GAME_CONSTANTS.SHIP_SIZE + 10)
    ctx.lineTo(5, GAME_CONSTANTS.SHIP_SIZE)
    ctx.strokeStyle = 'orange'
    ctx.stroke()
  }

  ctx.restore()
}

const rotatePoint = (point: { x: number; y: number }, angle: number) => {
  return {
    x: Math.cos(angle) * point.x - Math.sin(angle) * point.y,
    y: Math.sin(angle) * point.x + Math.cos(angle) * point.y,
  }
}

const drawAsteroid = (ctx: CanvasRenderingContext2D, asteroid: Asteroid) => {
  ctx.strokeStyle = 'white'
  ctx.beginPath()

  const startPoint = rotatePoint(asteroid.points[0], asteroid.rotation)
  ctx.moveTo(asteroid.x + startPoint.x, asteroid.y + startPoint.y)

  asteroid.points.forEach((point, i) => {
    const rotated = rotatePoint(point, asteroid.rotation)
    ctx.lineTo(asteroid.x + rotated.x, asteroid.y + rotated.y)
  })

  ctx.closePath()
  ctx.stroke()
}

const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
  const timeLeft = GAME_CONSTANTS.POWER_UP_LIFETIME - (Date.now() - powerUp.createdAt)
  const isBlinking = timeLeft < GAME_CONSTANTS.POWER_UP_BLINK_START

  // Calculate blink rate - gets faster as time runs out
  const shouldShow =
    !isBlinking ||
    Math.floor(Date.now() / (100 + (timeLeft / GAME_CONSTANTS.POWER_UP_BLINK_START) * 400)) % 2 ===
      0

  if (!shouldShow) return

  ctx.save()
  ctx.translate(powerUp.x, powerUp.y)

  // Different colors for different power-up types
  const colors = {
    spreadShot: '#00ff00',
    rapidFire: '#ff0000',
    shield: '#0000ff',
    speedBoost: '#ffff00',
  }

  ctx.strokeStyle = colors[powerUp.type]
  ctx.beginPath()
  ctx.arc(0, 0, 10, 0, Math.PI * 2)
  ctx.stroke()

  // Different symbols for different power-ups
  ctx.strokeStyle = '#ffffff'
  ctx.beginPath()
  switch (powerUp.type) {
    case 'spreadShot':
      // Three lines spreading out
      ctx.moveTo(-5, 5)
      ctx.lineTo(0, -5)
      ctx.lineTo(5, 5)
      break
    case 'rapidFire':
      // Multiple dots
      for (let i = -4; i <= 4; i += 4) {
        ctx.moveTo(i, 0)
        ctx.arc(i, 0, 1, 0, Math.PI * 2)
      }
      break
    case 'shield':
      // Circle
      ctx.arc(0, 0, 5, 0, Math.PI * 2)
      break
    case 'speedBoost':
      // Lightning bolt
      ctx.moveTo(-3, -5)
      ctx.lineTo(3, 0)
      ctx.lineTo(-3, 5)
      break
  }
  ctx.stroke()

  ctx.restore()
}

// Game Logic Functions
const handleCollisions = (
  bullets: Bullet[],
  asteroids: Asteroid[],
  powerUps: PowerUp[],
  shipPosition: { x: number; y: number },
  onAsteroidHit: (x: number, y: number) => void,
  onGameOver: () => void,
) => {
  // Bullet-Asteroid collisions
  bullets.forEach((bullet, bulletIndex) => {
    asteroids.forEach((asteroid, asteroidIndex) => {
      const dx = bullet.x - asteroid.x
      const dy = bullet.y - asteroid.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < asteroid.size) {
        // Handle collision
        onAsteroidHit(asteroid.x, asteroid.y)
        // Remove bullet and asteroid
        bullets.splice(bulletIndex, 1)
        asteroids.splice(asteroidIndex, 1)
      }
    })
  })

  // Ship-Asteroid collisions
  asteroids.forEach((asteroid) => {
    const dx = shipPosition.x - asteroid.x
    const dy = shipPosition.y - asteroid.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < asteroid.size + 10) {
      onGameOver()
    }
  })
}

// Main Component
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
  const asteroids = useRef<Asteroid[]>([])
  const bullets = useRef<Bullet[]>([])
  const keys = useRef<{ [key: string]: boolean }>({})

  // Add a shooting cooldown ref
  const lastShotTime = useRef(0)

  // Add these refs for difficulty scaling
  const difficultyLevel = useRef(1)
  const lastDifficultyIncrease = useRef(0)

  // Add this ref at the top with other refs
  const shootingInterval = useRef<NodeJS.Timeout | null>(null)

  // Add these refs at the top with other refs
  const rotationVelocity = useRef(0)

  // Add these new refs at the top with other refs
  const gamepadIndex = useRef<number | null>(null)

  // Add this ref for quit press timing
  const lastQuitPressTime = useRef<number | null>(null)

  // Add these refs with your other refs
  const powerUps = useRef<PowerUp[]>([])
  const activePowerUps = useRef<{ type: PowerUpType; expiresAt: number }[]>([])

  // Add these new state variables at the top with other states
  const [quitProgress, setQuitProgress] = useState(0)
  const quitStartTime = useRef<number | null>(null)
  const QUIT_HOLD_DURATION = 3000 // 3 seconds in milliseconds

  // Add this ref near the top with other refs
  const lastPauseTime = useRef(0)

  // Add this ref near the top with other refs
  const lastStartButtonState = useRef(false)

  // Add this function near the top with other function definitions
  const shoot = () => {
    if (!isPaused && isPlaying) {
      const hasSpreadShot = activePowerUps.current.some((p) => p.type === 'spreadShot')
      const hasRapidFire = activePowerUps.current.some((p) => p.type === 'rapidFire')

      if (hasSpreadShot) {
        // Create 3 bullets in a spread pattern
        const angles = [-0.2, 0, 0.2]
        angles.forEach((angleOffset) => {
          const angle = shipAngle.current + angleOffset
          bullets.current.push({
            x: shipX.current,
            y: shipY.current,
            dx: Math.cos(angle - Math.PI / 2) * (hasRapidFire ? 10 : 7),
            dy: Math.sin(angle - Math.PI / 2) * (hasRapidFire ? 10 : 7),
          })
        })
      } else {
        // Normal single shot
        bullets.current.push({
          x: shipX.current,
          y: shipY.current,
          dx: Math.cos(shipAngle.current - Math.PI / 2) * (hasRapidFire ? 10 : 7),
          dy: Math.sin(shipAngle.current - Math.PI / 2) * (hasRapidFire ? 10 : 7),
        })
      }
    }
  }

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

  const createAsteroid = () => {
    const { asteroidSpeed, asteroidSizeRange } = getDifficultyValues(difficultyLevel.current)
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
      // Apply speed boost to thrust if active
      const hasSpeedBoost = activePowerUps.current.some((p) => p.type === 'speedBoost')
      const thrustMultiplier = hasSpeedBoost ? 1.5 : 1

      if (keys.current['ArrowUp'] || keys.current['KeyW']) {
        const thrust = GAME_CONSTANTS.THRUST_POWER * thrustMultiplier
        velocity.current.x += Math.cos(shipAngle.current - Math.PI / 2) * thrust
        velocity.current.y += Math.sin(shipAngle.current - Math.PI / 2) * thrust
      }

      // Rotation with momentum
      if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
        rotationVelocity.current -= GAME_CONSTANTS.ROTATION_ACCELERATION
      }
      if (keys.current['ArrowRight'] || keys.current['KeyD']) {
        rotationVelocity.current += GAME_CONSTANTS.ROTATION_ACCELERATION
      }

      // Clamp rotation speed
      rotationVelocity.current = Math.max(
        -GAME_CONSTANTS.MAX_ROTATION_SPEED,
        Math.min(GAME_CONSTANTS.MAX_ROTATION_SPEED, rotationVelocity.current),
      )

      // Apply rotation friction
      rotationVelocity.current *= GAME_CONSTANTS.ROTATION_FRICTION

      // Apply rotation
      shipAngle.current += rotationVelocity.current

      // Apply stronger friction to slow down faster
      velocity.current.x *= GAME_CONSTANTS.FRICTION
      velocity.current.y *= GAME_CONSTANTS.FRICTION

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

      // Check shield collisions if shield is active
      const hasShield = activePowerUps.current.some((p) => p.type === 'shield')
      if (hasShield) {
        const shieldRadius = GAME_CONSTANTS.SHIP_SIZE + 10
        asteroids.current = asteroids.current.filter((asteroid) => {
          const dx = shipX.current - asteroid.x
          const dy = shipY.current - asteroid.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          // If asteroid touches shield, destroy it and add score
          if (distance < shieldRadius + asteroid.size) {
            scoreRef.current += 50 // Half points for shield destruction

            // Chance to drop power-up
            if (Math.random() < GAME_CONSTANTS.POWER_UP_DROP_CHANCE) {
              createPowerUp(asteroid.x, asteroid.y)
            }

            // Add visual feedback for shield hit
            if (canvasRef.current?.getContext('2d')) {
              const ctx = canvasRef.current.getContext('2d')!
              ctx.strokeStyle = '#ffffff'
              ctx.lineWidth = 3
              ctx.beginPath()
              ctx.arc(shipX.current, shipY.current, shieldRadius, 0, Math.PI * 2)
              ctx.stroke()
              ctx.lineWidth = 1
            }

            return false // Remove the asteroid
          }
          return true
        })
      }

      // Update collision detection to not trigger game over if shield is active
      asteroids.current.forEach((asteroid) => {
        const dx = shipX.current - asteroid.x
        const dy = shipY.current - asteroid.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < asteroid.size + 10 && !gameOver) {
          // Only trigger game over if no shield
          if (!hasShield) {
            handleGameOver()
          }
        }
      })
    }

    // Draw everything regardless of pause state
    // Draw ship
    drawShip(
      ctx,
      shipX.current,
      shipY.current,
      shipAngle.current,
      (keys.current['ArrowUp'] || keys.current['KeyW']) && !isPaused,
    )

    // Draw bullets
    bullets.current.forEach((bullet) => {
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw asteroids
    asteroids.current.forEach((asteroid) => {
      drawAsteroid(ctx, asteroid)

      // Only update rotation if game is not paused
      if (!isPaused) {
        asteroid.rotation += asteroid.rotationSpeed
      }
    })

    // Rest of collision detection and game logic only if not paused
    if (!isPaused) {
      // Check if it's time to increase difficulty
      if (
        scoreRef.current - lastDifficultyIncrease.current >=
        GAME_CONSTANTS.DIFFICULTY_SCORE_INTERVAL
      ) {
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

            // Chance to drop power-up
            if (Math.random() < GAME_CONSTANTS.POWER_UP_DROP_CHANCE) {
              createPowerUp(asteroid.x, asteroid.y)
            }

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
      const { asteroidSpawnRate } = getDifficultyValues(difficultyLevel.current)
      if (Math.random() < asteroidSpawnRate) {
        createAsteroid()
      }
    }

    // Update active power-ups
    activePowerUps.current = activePowerUps.current.filter(
      (powerUp) => Date.now() < powerUp.expiresAt,
    )

    // Update power-up collection logic
    powerUps.current = powerUps.current.filter((powerUp) => {
      const dx = shipX.current - powerUp.x
      const dy = shipY.current - powerUp.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const powerUpAge = Date.now() - powerUp.createdAt

      // Remove if collected or older than lifetime
      if (distance < 20 || powerUpAge > GAME_CONSTANTS.POWER_UP_LIFETIME) {
        if (distance < 20) {
          // Find existing power-up of same type
          const existingPowerUpIndex = activePowerUps.current.findIndex(
            (p) => p.type === powerUp.type,
          )

          if (existingPowerUpIndex !== -1) {
            // Update existing power-up expiration time
            activePowerUps.current[existingPowerUpIndex].expiresAt =
              Date.now() + GAME_CONSTANTS.POWER_UP_DURATION
          } else {
            // Add new power-up
            activePowerUps.current.push({
              type: powerUp.type,
              expiresAt: Date.now() + GAME_CONSTANTS.POWER_UP_DURATION,
            })
          }

          // Show toast notification for power-up collection
          toast.success(`${powerUp.type} power-up collected!`, {
            duration: 2000,
          })
        }
        return false // Remove power-up
      }
      return true
    })

    // Draw power-ups
    powerUps.current.forEach((powerUp) => {
      drawPowerUp(ctx, powerUp)
    })

    // Draw shield if active
    const hasShield = activePowerUps.current.some((p) => p.type === 'shield')
    if (hasShield) {
      const shieldRadius = GAME_CONSTANTS.SHIP_SIZE + 10
      const pulseAmount = Math.sin(Date.now() / 200) * 2 // Pulsing effect

      ctx.strokeStyle = '#0000ff'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(shipX.current, shipY.current, shieldRadius + pulseAmount, 0, Math.PI * 2)
      ctx.stroke()
      ctx.lineWidth = 1

      // Add inner shield ring
      ctx.strokeStyle = '#4444ff'
      ctx.beginPath()
      ctx.arc(shipX.current, shipY.current, shieldRadius - 2 - pulseAmount, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw UI
    ctx.fillStyle = 'white'
    ctx.font = '20px Arial'
    ctx.fillText(`Score: ${scoreRef.current}`, 10, 30)
    ctx.fillText(`Level: ${difficultyLevel.current}`, 10, 60)

    // Update the UI to show all active power-ups
    if (activePowerUps.current.length > 0) {
      ctx.fillStyle = '#00ff00'
      activePowerUps.current.forEach((powerUp, index) => {
        const timeLeft = Math.ceil((powerUp.expiresAt - Date.now()) / 1000)
        ctx.fillText(`${powerUp.type}: ${timeLeft}s`, 10, 90 + index * 25)
      })
    }
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

  // Add this function to create power-ups
  const createPowerUp = (x: number, y: number) => {
    const types: PowerUpType[] = ['spreadShot', 'rapidFire', 'shield', 'speedBoost']
    const randomType = types[Math.floor(Math.random() * types.length)]

    powerUps.current.push({
      x,
      y,
      type: randomType,
      createdAt: Date.now(),
    })
  }

  // Update the updateGamepadState function
  const updateGamepadState = () => {
    if (!isPlaying) return

    const gamepads = navigator.getGamepads()
    const gamepad = gamepadIndex.current !== null ? gamepads[gamepadIndex.current] : null

    if (gamepad) {
      // Only process non-pause inputs if game is not paused
      if (!isPaused) {
        // Movement Controls
        const stickThreshold = 0.3
        const leftStickX = gamepad.axes[0]
        const rightStickX = gamepad.axes[2] // Added right stick support

        // Allow both sticks or d-pad for rotation
        if (
          leftStickX < -stickThreshold ||
          rightStickX < -stickThreshold ||
          gamepad.buttons[14].pressed
        ) {
          keys.current['ArrowLeft'] = true
          keys.current['ArrowRight'] = false
        } else if (
          leftStickX > stickThreshold ||
          rightStickX > stickThreshold ||
          gamepad.buttons[15].pressed
        ) {
          keys.current['ArrowRight'] = true
          keys.current['ArrowLeft'] = false
        } else {
          keys.current['ArrowLeft'] = false
          keys.current['ArrowRight'] = false
        }

        // Thrust - RT (button 7) or A button (button 0) or LT (button 6)
        keys.current['ArrowUp'] =
          gamepad.buttons[7].pressed || gamepad.buttons[0].pressed || gamepad.buttons[6].pressed

        // Shooting - X button (button 2) or RB (button 5)
        if (
          (gamepad.buttons[2].pressed || gamepad.buttons[5].pressed) &&
          Date.now() - lastShotTime.current > GAME_CONSTANTS.SHOT_COOLDOWN
        ) {
          shoot()
          lastShotTime.current = Date.now()

          if (gamepad.vibrationActuator) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
              startDelay: 0,
              duration: 100,
              weakMagnitude: 0.8,
              strongMagnitude: 0.4,
            })
          }
        }
      }

      // Pause toggle - Start button (9) or Select/Back (8)
      const startButtonPressed = gamepad.buttons[9].pressed || gamepad.buttons[8].pressed

      // Only trigger pause on button press (not hold)
      if (startButtonPressed && !lastStartButtonState.current) {
        handlePause()

        // Add haptic feedback for pause
        if (gamepad.vibrationActuator) {
          gamepad.vibrationActuator.playEffect('dual-rumble', {
            startDelay: 0,
            duration: 200,
            weakMagnitude: 0.3,
            strongMagnitude: 0.3,
          })
        }
      }

      // Update the last button state
      lastStartButtonState.current = startButtonPressed

      // Quit game - Hold B button (1) for 1 second
      if (gamepad.buttons[1].pressed) {
        if (!lastQuitPressTime.current) {
          lastQuitPressTime.current = Date.now()
        } else if (Date.now() - lastQuitPressTime.current > 1000) {
          setIsPaused(false)
          setIsPlaying(false)
          setGameOver(false)
          lastQuitPressTime.current = null
        }
      } else {
        lastQuitPressTime.current = null
      }

      // Update quit progress when holding start button
      if (gamepad.buttons[9].pressed) {
        // Start button
        if (!quitStartTime.current) {
          quitStartTime.current = Date.now()
        }
        const holdDuration = Date.now() - quitStartTime.current
        const progress = Math.min(holdDuration / QUIT_HOLD_DURATION, 1)
        setQuitProgress(progress)

        if (progress >= 1) {
          setIsPaused(false)
          setIsPlaying(false)
          setGameOver(false)
          setQuitProgress(0)
          quitStartTime.current = null
        }
      } else {
        quitStartTime.current = null
        setQuitProgress(0)
      }
    }
  }

  // Add this useEffect for gamepad connection handling
  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      if (!gamepadIndex.current) {
        gamepadIndex.current = e.gamepad.index
        toast.success(`Gamepad ${e.gamepad.id} connected!`)
      }
    }

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      if (gamepadIndex.current === e.gamepad.index) {
        gamepadIndex.current = null
        toast.error('Gamepad disconnected')
      }
    }

    window.addEventListener('gamepadconnected', handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected)
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected)
    }
  }, [])

  // Modify the gameLoop function to include gamepad update
  const gameLoop = () => {
    updateGame()
    requestAnimationFrame(gameLoop)
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

      // Handle Escape key with debounce
      if (e.code === 'Escape' && isPlaying) {
        const now = Date.now()
        if (now - lastPauseTime.current > 250) {
          // 250ms debounce
          handlePause()
          lastPauseTime.current = now
        }
        return
      }

      // Only process other keys if game is not paused
      if (!isPaused) {
        keys.current[e.code] = true

        // Handle shooting with rapid fire power-up
        if (e.code === 'Space' && !shootingInterval.current) {
          const hasRapidFire = activePowerUps.current.some((p) => p.type === 'rapidFire')
          const shootCooldown = hasRapidFire
            ? GAME_CONSTANTS.SHOT_COOLDOWN / 2
            : GAME_CONSTANTS.SHOT_COOLDOWN

          // Shoot immediately
          shoot()

          // Set up interval for continuous shooting
          shootingInterval.current = setInterval(shoot, shootCooldown)
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
      updateGamepadState()
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

      {/* Improved quit indicator - centered with better styling */}
      {quitProgress > 0 && isPlaying && (
        <div className="absolute left-1/2 top-8 flex min-w-[200px] -translate-x-1/2 flex-col items-center gap-2 rounded-lg bg-background/20 p-4 backdrop-blur-sm">
          <span className="text-sm font-medium text-white">Hold Start to Quit</span>
          <Progress value={quitProgress * 100} className="h-3 w-44" />
        </div>
      )}
    </div>
  )
}

export default AsteroidsGame
