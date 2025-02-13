'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { eventEmitter } from '@/lib/eventEmitter'
import { submitScore } from '@/app/actions'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from './ui/button'
import Button3D from './3dButton'
import { Progress } from './ui/progress'
import { BrowserView, MobileView } from 'react-device-detect'

// Constants
const GAME_CONSTANTS = {
  SHOT_COOLDOWN: 120,
  RAPID_FIRE_MULTIPLIER: 3, // 3x faster when active
  DIFFICULTY_SCORE_INTERVAL: 100,
  MAX_ROTATION_SPEED: 0.05,
  ROTATION_ACCELERATION: 0.003,
  ROTATION_FRICTION: 0.93,
  POWER_UP_DURATION: 20000,
  POWER_UP_DROP_CHANCE: 0.2,
  POWER_UP_LIFETIME: 20000,
  POWER_UP_BLINK_START: 3000,
  SHIP_SIZE: 12,
  THRUST_POWER: 0.0223,
  FRICTION: 0.988,
  LASER_RANGE: 300,
  LASER_DAMAGE_INTERVAL: 50,
  LASER_DAMAGE_PER_TICK: 0.25,
  ASTEROID_COLLISION_FACTOR: 0.8, // Increased from 0.6 for better coverage
  BULLET_DAMAGE: 1,
  BULLET_SPEED: 10,
  BOSS_SPAWN_INTERVAL: 1, // Every level
  MAX_BOSSES: 1,
  MAX_ASTEROIDS: 10,
  MAX_BULLETS: 50,
  BOSS_BULLET_DAMAGE: 1,
  BOSS_BULLET_SPEED: 1.69, // Slightly slower bullets
  BOSS_ATTACK_COOLDOWN: 10000,
  BOSS_HEALTH_MULTIPLIER: 1.1,
  SHIELD_BASE_HEALTH: 120, // Increased from 200
  SHIELD_DAMAGE_NORMAL: 100, // Fixed value per asteroid hit
  SHIELD_DAMAGE_BOSS: 250, // Fixed value per boss hit
  BOSS_ATTACK_WARNING_DURATION: 5000, // 2 second warning
  BOSS_CHARGE_UP_DURATION: 3000, // 1 second charge-up
  SHIP_COLLISION_RADIUS: 6, // Added this constant
  LASER_RANGE_SQ: 300 * 300, // Pre-square the constant
  MAX_BULLETS_PER_BOSS: 20, // Add at top with constants
  MAX_PARTICLES: 300,
  ASTEROID_BASE_SPEED: 0.8, // Was likely 1.2
  ASTEROID_SPEED_INCREMENT: 0.05, // Was likely 0.1
} as const

const particlePool: DisintegrationParticle[] = []

// Add this helper function in the Constants section
const getBulletProperties = (hasRapidFire: boolean) => ({
  bulletSpeed: hasRapidFire ? 7 : 4, // Increased normal speed from 2 to 4
  cooldown: hasRapidFire
    ? GAME_CONSTANTS.SHOT_COOLDOWN / GAME_CONSTANTS.RAPID_FIRE_MULTIPLIER
    : GAME_CONSTANTS.SHOT_COOLDOWN,
})

// Types and Interfaces
type PowerUpType = 'spreadShot' | 'rapidFire' | 'speedBoost' | 'laser'

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
  collisionRadius: number
  health: number
  initialHealth: number
  isBoss: boolean
  attackCooldown: number
  bullets: BossBullet[]
  bounds: {
    minX: number
    maxX: number
    minY: number
    maxY: number
  }
  isCharging: boolean
  lastAttackTime: number
}

interface Bullet {
  x: number
  y: number
  dx: number
  dy: number
  damage: number
}

interface ExplosionParticle {
  x: number
  y: number
  dx: number
  dy: number
  size: number
  createdAt: number
  color?: string
}

// Add new particle type
interface DisintegrationParticle {
  x: number
  y: number
  dx: number
  dy: number
  size: number
  rotation: number
  rotationSpeed: number
  createdAt: number
  color?: string
  startX: number
  control1X: number
  control2X: number
  endX: number
}

type BossBullet = {
  x: number
  y: number
  dx: number
  dy: number
  createdAt: number
}
// helper function to check if the ship is colliding with the asteroid
const closestPointOnSegment = (
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number },
) => {
  const ab = { x: b.x - a.x, y: b.y - a.y }
  const t = ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / (ab.x * ab.x + ab.y * ab.y)
  return t < 0 ? a : t > 1 ? b : { x: a.x + ab.x * t, y: a.y + ab.y * t }
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
  // Add initial cooldown period
  const baseSpawnRate = level > 5 ? 0.015 : 0.005 + level * 0.002

  return {
    asteroidSpeed: {
      min: 0.1, // Reduced from 0.2
      max: 0.12 + level * 0.025, // Reduced from 0.15 + level * 0.03
    },
    asteroidSizeRange: { min: 30, max: 60 + level * 2 },
    asteroidSpawnRate: baseSpawnRate,
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
  currentShieldHealth: number,
  activePowerUps: { type: PowerUpType; expiresAt: number }[],
) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  // Corrected wing tip Y coordinates (was 9.6, now 2.4)
  ctx.strokeStyle = '#00ff00'
  ctx.beginPath()
  ctx.moveTo(0, -18) // Nose
  ctx.lineTo(-7.2, -2.4) // Left shoulder
  ctx.lineTo(-14.4, 2.4) // Left wing tip (Y corrected from 9.6 to 2.4)
  ctx.lineTo(-4.8, 7.2) // Left inner wing
  ctx.lineTo(0, 4.8) // Rear center
  ctx.lineTo(4.8, 7.2) // Right inner wing
  ctx.lineTo(14.4, 2.4) // Right wing tip (Y corrected from 9.6 to 2.4)
  ctx.lineTo(7.2, -2.4) // Right shoulder
  ctx.closePath()
  ctx.stroke()

  ctx.restore()

  // Add rapid fire visual effect
  const hasRapidFire = activePowerUps.some((p) => p.type === 'rapidFire')

  ctx.save()
  if (hasRapidFire) {
    // Add red glow effect
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 50)
    glow.addColorStop(0, 'rgba(255, 50, 50, 0.4)')
    glow.addColorStop(1, 'rgba(255, 0, 0, 0)')
    ctx.fillStyle = glow
    ctx.fillRect(x - 50, y - 50, 100, 100)
  }
  ctx.translate(x, y)
  ctx.rotate(angle)

  const shipSize = GAME_CONSTANTS.SHIP_SIZE
  const wingSpan = shipSize * 1.2 // Increased wing span
  const bodyLength = shipSize * 1.5 // Longer body

  // Main hull gradient
  const hullGradient = ctx.createLinearGradient(-shipSize, 0, shipSize, 0)
  hullGradient.addColorStop(0, '#2d3748')
  hullGradient.addColorStop(0.5, '#4a5568')
  hullGradient.addColorStop(1, '#2d3748')

  // Glow effect
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, shipSize * 2)
  glow.addColorStop(0, 'rgba(59, 130, 246, 0.4)')
  glow.addColorStop(1, 'rgba(59, 130, 246, 0)')

  // Ship glow
  ctx.save()
  ctx.beginPath()
  ctx.arc(0, 0, shipSize * 1.5, 0, Math.PI * 2)
  ctx.fillStyle = glow
  ctx.globalCompositeOperation = 'lighter'
  ctx.fill()
  ctx.restore()

  // Main hull
  ctx.fillStyle = hullGradient
  ctx.strokeStyle = '#cbd5e0'
  ctx.lineWidth = 2

  // Angular hull design
  ctx.beginPath()
  ctx.moveTo(0, -bodyLength) // Top point
  ctx.lineTo(-shipSize * 0.6, -shipSize * 0.2) // Left shoulder
  ctx.lineTo(-wingSpan, shipSize * 0.2) // Left wing tip
  ctx.lineTo(-shipSize * 0.4, shipSize * 0.6) // Left inner wing
  ctx.lineTo(0, shipSize * 0.4) // Rear center
  ctx.lineTo(shipSize * 0.4, shipSize * 0.6) // Right inner wing
  ctx.lineTo(wingSpan, shipSize * 0.2) // Right wing tip
  ctx.lineTo(shipSize * 0.6, -shipSize * 0.2) // Right shoulder
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Central spine
  ctx.strokeStyle = '#93c5fd'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, -bodyLength)
  ctx.lineTo(0, shipSize * 0.4)
  ctx.stroke()

  // Wing details
  ctx.strokeStyle = '#93c5fd'
  ctx.lineWidth = 1
  // Left wing details
  ctx.beginPath()
  ctx.moveTo(-shipSize * 0.5, -shipSize * 0.1)
  ctx.lineTo(-wingSpan * 0.8, shipSize * 0.7)
  ctx.stroke()
  // Right wing details
  ctx.beginPath()
  ctx.moveTo(shipSize * 0.5, -shipSize * 0.1)
  ctx.lineTo(wingSpan * 0.8, shipSize * 0.7)
  ctx.stroke()

  // Engine glow
  if (isThrusting) {
    ctx.save()

    // Add speed boost effect
    const hasSpeedBoost = activePowerUps.some((p) => p.type === 'speedBoost')
    const boostIntensity = hasSpeedBoost ? 1.5 : 1

    const thrustLength = shipSize * (hasSpeedBoost ? 3.5 : 2.5)
    const thrustWidth = shipSize * (hasSpeedBoost ? 1.5 : 1.2)

    // Main thrust gradient
    const thrustGradient = ctx.createLinearGradient(0, 0, 0, thrustLength)
    thrustGradient.addColorStop(0, `rgba(255, ${hasSpeedBoost ? '200' : '100'}, 0, 0.9)`)
    thrustGradient.addColorStop(0.3, `rgba(255, ${hasSpeedBoost ? '255' : '200'}, 0, 0.5)`)
    thrustGradient.addColorStop(1, 'rgba(255, 80, 0, 0)')

    // Add boost particles
    if (hasSpeedBoost) {
      for (let i = 0; i < 10; i++) {
        const angle = ((Math.random() - 0.5) * Math.PI) / 3 // Narrower cone
        const speed = Math.random() * 4 + 3 * boostIntensity
        const size = Math.random() * 2 + 1

        ctx.fillStyle = `rgba(255, ${150 + Math.random() * 105}, 0, ${0.7})`
        ctx.beginPath()
        ctx.arc(
          Math.sin(angle) * speed * 2,
          shipSize * 0.4 + Math.cos(angle) * speed * 5,
          size,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }
    }

    // Thrust shape (flame-like)
    ctx.beginPath()
    ctx.moveTo(-thrustWidth / 2, shipSize * 0.4)
    ctx.quadraticCurveTo(0, shipSize * 0.4 + thrustLength * 0.7, thrustWidth / 2, shipSize * 0.4)
    ctx.lineTo(0, shipSize * 0.4 + thrustLength)
    ctx.closePath()
    ctx.fillStyle = thrustGradient
    ctx.globalCompositeOperation = 'lighter'
    ctx.fill()

    // Core glow
    const coreGradient = ctx.createRadialGradient(0, shipSize * 0.4, 0, 0, shipSize * 0.4, shipSize)
    coreGradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)')
    coreGradient.addColorStop(1, 'rgba(255, 100, 0, 0)')

    ctx.beginPath()
    ctx.arc(0, shipSize * 0.4, shipSize * 0.8, 0, Math.PI * 2)
    ctx.fillStyle = coreGradient
    ctx.fill()

    // Particle effect
    for (let i = 0; i < 15; i++) {
      const angle = ((Math.random() - 0.5) * Math.PI) / 2 // Wider angle spread
      const speed = Math.random() * 3 + 2
      const size = Math.random() * 2 + 1
      const alpha = Math.random() * 0.5 + 0.3

      // Calculate direction based on angle relative to ship
      const dirX = Math.sin(angle) * speed * 2
      const dirY = Math.cos(angle) * speed * 5

      ctx.fillStyle = `rgba(255, ${200 + Math.random() * 55}, 0, ${alpha})`
      ctx.beginPath()
      ctx.arc(
        dirX, // X position based on angle
        shipSize * 0.4 + dirY, // Y position
        size,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }

    ctx.restore()
  }

  // Add pulsating core for better orientation
  const pulse = Math.sin(Date.now() / 100) * 0.5 + 1.5
  ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
  ctx.beginPath()
  ctx.arc(0, 0, 3 * pulse, 0, Math.PI * 2)
  ctx.fill()

  // Draw shield health bar below the ship
  if (currentShieldHealth > 0) {
    const shieldBarWidth = GAME_CONSTANTS.SHIP_SIZE * 1.5 // 18px
    const shieldBarHeight = 3
    const shieldBarY = GAME_CONSTANTS.SHIP_SIZE

    // Background
    ctx.fillStyle = 'rgba(0, 0, 50, 0.5)'
    ctx.fillRect(-shieldBarWidth / 2, shieldBarY, shieldBarWidth, shieldBarHeight)

    // Current health (percentage of base health)
    ctx.fillStyle = 'rgba(0, 150, 255, 0.8)'
    ctx.fillRect(
      -shieldBarWidth / 2,
      shieldBarY,
      shieldBarWidth * (currentShieldHealth / GAME_CONSTANTS.SHIELD_BASE_HEALTH),
      shieldBarHeight,
    )
  }

  ctx.restore()

  // Power-up timer display
  const powerUpDisplayStartX = window.innerWidth - 160
  const powerUpDisplayStartY = 20
  let timerYOffset = 0

  activePowerUps.forEach((powerUp) => {
    const timeLeft = powerUp.expiresAt - Date.now()
    if (timeLeft > 0) {
      const progress = timeLeft / GAME_CONSTANTS.POWER_UP_DURATION

      // Timer bar
      ctx.fillStyle = '#333'
      ctx.fillRect(powerUpDisplayStartX, powerUpDisplayStartY + timerYOffset, 150, 14)

      // Progress bar
      ctx.fillStyle = {
        rapidFire: '#ff4444',
        spreadShot: '#44ff44',
        speedBoost: '#ffff44',
        laser: '#ff44ff',
        shield: '#4444ff',
      }[powerUp.type]
      ctx.fillRect(powerUpDisplayStartX, powerUpDisplayStartY + timerYOffset, 150 * progress, 14)

      // Timer text
      ctx.fillStyle = 'black'
      ctx.font = 'bold 12px Arial'
      ctx.fillText(
        `${powerUp.type}: ${(timeLeft / 1000).toFixed(1)}s`,
        powerUpDisplayStartX + 5,
        powerUpDisplayStartY + timerYOffset + 11,
      )

      timerYOffset += 15
    }
  })

  // MOVE HITBOX DRAWING TO THE END OF THE FUNCTION
  // Draw hitbox ON TOP of everything else
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  // Enhanced hitbox visualization
  ctx.strokeStyle = '#ffffff10'
  ctx.fillStyle = 'rgba(0, 255, 0, 0.1)' // Add subtle fill
  ctx.lineWidth = 2
  ctx.shadowColor = '#00ff00'
  ctx.shadowBlur = 15
  ctx.beginPath()
  ctx.moveTo(0, -18)
  ctx.lineTo(-7.2, -2.4)
  ctx.lineTo(-14.4, 2.4)
  ctx.lineTo(-4.8, 7.2)
  ctx.lineTo(0, 4.8)
  ctx.lineTo(4.8, 7.2)
  ctx.lineTo(14.4, 2.4)
  ctx.lineTo(7.2, -2.4)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.restore()

  const shipPoints = [
    { x: 0, y: -18 },
    { x: -7.2, y: -2.4 },
    { x: -14.4, y: 2.4 },
    { x: -4.8, y: 7.2 },
    { x: 0, y: 4.8 },
    { x: 4.8, y: 7.2 },
    { x: 14.4, y: 2.4 },
    { x: 7.2, y: -2.4 },
  ].map((p) => rotatePoint(p, angle))
  // Add this at the top of drawShip function
  ctx.strokeStyle = 'rgba(255,0,0,0.5)'
  ctx.beginPath()
  shipPoints.forEach((p) => ctx.lineTo(p.x, p.y))
  ctx.closePath()
  ctx.stroke()
}

const rotatePoint = (point: { x: number; y: number }, angle: number) => {
  return {
    x: Math.cos(angle) * point.x - Math.sin(angle) * point.y,
    y: Math.sin(angle) * point.x + Math.cos(angle) * point.y,
  }
}

const drawAsteroid = (ctx: CanvasRenderingContext2D, asteroid: Asteroid) => {
  // Collision debug outline
  ctx.save()
  ctx.strokeStyle = '#00ff0080' // Green with 50% opacity
  ctx.lineWidth = 1
  ctx.beginPath()
  let startPoint = rotatePoint(asteroid.points[0], asteroid.rotation) // Use let instead of const
  ctx.moveTo(asteroid.x + startPoint.x, asteroid.y + startPoint.y)
  asteroid.points.forEach((point, i) => {
    const rotated = rotatePoint(point, asteroid.rotation)
    ctx.lineTo(asteroid.x + rotated.x, asteroid.y + rotated.y)
  })
  ctx.closePath()
  ctx.stroke()
  ctx.restore()

  // In original drawing code, change from:
  // const startPoint = rotatePoint(...)
  // to:
  startPoint = rotatePoint(asteroid.points[0], asteroid.rotation) // <-- Remove 'const' here
  ctx.moveTo(asteroid.x + startPoint.x, asteroid.y + startPoint.y)

  // Health-based color
  const healthColor = `hsl(${30 * (asteroid.health / asteroid.initialHealth)}, 100%, 70%)`
  ctx.strokeStyle = healthColor

  // Draw asteroid shape
  ctx.beginPath()
  asteroid.points.forEach((point, i) => {
    const rotated = rotatePoint(point, asteroid.rotation)
    ctx.lineTo(asteroid.x + rotated.x, asteroid.y + rotated.y)
  })
  ctx.closePath()
  ctx.stroke()

  // Draw health bar when damaged
  if (asteroid.health < asteroid.initialHealth) {
    const healthPercentage = asteroid.health / asteroid.initialHealth
    const barWidth = 40
    const barHeight = 4
    const yOffset = asteroid.size + 12

    // Health bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(asteroid.x - barWidth / 2, asteroid.y + yOffset, barWidth, barHeight)

    // Health bar fill
    ctx.fillStyle = `hsl(${120 * healthPercentage}, 100%, 50%)`
    ctx.fillRect(
      asteroid.x - barWidth / 2,
      asteroid.y + yOffset,
      barWidth * healthPercentage,
      barHeight,
    )

    // Health text
    ctx.fillStyle = 'white'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(
      `${Math.ceil(asteroid.health)}/${asteroid.initialHealth}`,
      asteroid.x,
      asteroid.y + yOffset + barHeight + 14,
    )
  }

  if (asteroid.isBoss) {
    // Add charge progress calculation
    const chargeProgress = Math.min(
      1,
      (Date.now() - asteroid.lastAttackTime) / GAME_CONSTANTS.BOSS_CHARGE_UP_DURATION,
    )

    // Pulsing core glow
    const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5
    const coreGradientBoss = ctx.createRadialGradient(
      asteroid.x,
      asteroid.y,
      0,
      asteroid.x,
      asteroid.y,
      asteroid.size,
    )
    coreGradientBoss.addColorStop(0, `rgba(255, 0, 0, ${0.4 + pulse * 0.3})`)
    coreGradientBoss.addColorStop(1, 'rgba(255, 0, 0, 0)')

    ctx.fillStyle = coreGradientBoss
    ctx.beginPath()
    ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2)
    ctx.fill()

    // Energy particles
    ctx.save()
    for (let i = 0; i < 20; i++) {
      // Increased particle count
      const lifeProgress = (Date.now() % 2000) / 2000 // 2 second cycle
      const angle = Math.random() * Math.PI * 2
      const radius = asteroid.size * (0.7 + Math.sin(Date.now() / 100 + i * 0.3) * 0.3)
      const particleSize = 3 + Math.sin(Date.now() / 50 + i) * 2
      const hue = 30 + Math.sin(Date.now() / 200 + i) * 20

      // Create gradient for particle
      const gradient = ctx.createRadialGradient(
        asteroid.x + Math.cos(angle) * radius,
        asteroid.y + Math.sin(angle) * radius,
        0,
        asteroid.x + Math.cos(angle) * radius,
        asteroid.y + Math.sin(angle) * radius,
        particleSize * 2,
      )
      gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, ${0.8 - lifeProgress * 0.5})`)
      gradient.addColorStop(1, `hsla(${hue}, 100%, 30%, 0)`)

      ctx.fillStyle = gradient

      // Add rotation and different shapes
      ctx.save()
      ctx.translate(asteroid.x + Math.cos(angle) * radius, asteroid.y + Math.sin(angle) * radius)
      ctx.rotate(Date.now() / 500 + i)

      // Random shape (circle or triangle)
      if (Math.random() > 0.5) {
        ctx.beginPath()
        ctx.arc(0, 0, particleSize, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.moveTo(0, -particleSize)
        ctx.lineTo(particleSize, particleSize)
        ctx.lineTo(-particleSize, particleSize)
        ctx.closePath()
        ctx.fill()
      }

      // Add trailing particles
      if (Math.random() > 0.7) {
        ctx.beginPath()
        ctx.arc(
          (Math.random() - 0.5) * particleSize * 2,
          (Math.random() - 0.5) * particleSize * 2,
          particleSize * 0.5,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }

      ctx.restore()
    }
    ctx.restore()

    // Add core pulse effect
    const corePulse = Math.sin(Date.now() / 150) * 0.5 + 0.5
    const coreGradient = ctx.createRadialGradient(
      asteroid.x,
      asteroid.y,
      0,
      asteroid.x,
      asteroid.y,
      asteroid.size * 1.5,
    )
    coreGradient.addColorStop(0, `hsla(30, 100%, 70%, ${0.3 + corePulse * 0.2})`)
    coreGradient.addColorStop(1, 'hsla(30, 100%, 50%, 0)')

    ctx.fillStyle = coreGradient
    ctx.beginPath()
    ctx.arc(asteroid.x, asteroid.y, asteroid.size * 1.2, 0, Math.PI * 2)
    ctx.fill()

    // Accurate target lines matching bullet spread
    if (asteroid.isCharging) {
      ctx.save()
      // Add conditional check
      const bulletCount = 8
      const bulletSpread = Math.PI * 2
      const startRadius = asteroid.size + 10

      ctx.strokeStyle = `hsla(${30 * (1 - chargeProgress)}, 100%, 50%, ${0.5 + chargeProgress * 0.3})`
      ctx.lineWidth = 1 + chargeProgress * 2

      for (let i = 0; i < bulletCount; i++) {
        const angle = (i * bulletSpread) / bulletCount
        const startX = asteroid.x + Math.cos(angle) * startRadius
        const startY = asteroid.y + Math.sin(angle) * startRadius
        const endX = startX + Math.cos(angle) * 150 * pulse
        const endY = startY + Math.sin(angle) * 150 * pulse

        // Draw tapered line
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)

        // Create gradient for line
        const lineGradient = ctx.createLinearGradient(startX, startY, endX, endY)
        lineGradient.addColorStop(0, `hsla(30, 100%, 70%, ${0.8 + chargeProgress * 0.2})`)
        lineGradient.addColorStop(1, `hsla(30, 100%, 50%, 0)`)
        ctx.strokeStyle = lineGradient

        ctx.stroke()
      }
    }
    ctx.restore() // End isolation
  }
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
    laser: '#ff00ff',
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
    // case 'shield':
    //   // Circle
    //   ctx.arc(0, 0, 5, 0, Math.PI * 2)
    //   break
    case 'speedBoost':
      // Lightning bolt
      ctx.moveTo(-3, -5)
      ctx.lineTo(3, 0)
      ctx.lineTo(-3, 5)
      break
    case 'laser':
      // Lightning-like zigzag
      ctx.moveTo(-5, -5)
      ctx.lineTo(0, 0)
      ctx.lineTo(5, -5)
      ctx.lineTo(0, 5)
      break
  }
  ctx.stroke()

  ctx.restore()
}

// Add these helper functions
const preciseCollisionCheck = (
  asteroid: Asteroid,
  shipX: number,
  shipY: number,
  shipAngle: number,
): boolean => {
  // Get ship points in world space
  const shipPoints = [
    { x: 0, y: -18 }, // Nose
    { x: -7.2, y: -2.4 }, // Left shoulder
    { x: -14.4, y: 2.4 }, // Left wing tip (UPDATED from 9.6 to 2.4)
    { x: -4.8, y: 7.2 }, // Left inner wing
    { x: 0, y: 4.8 }, // Rear center
    { x: 4.8, y: 7.2 }, // Right inner wing
    { x: 14.4, y: 2.4 }, // Right wing tip (UPDATED from 9.6 to 2.4)
    { x: 7.2, y: -2.4 }, // Right shoulder
  ].map((p) => {
    // Rotate and translate ship points
    const rotated = rotatePoint(p, shipAngle)
    return {
      x: shipX + rotated.x,
      y: shipY + rotated.y,
    }
  })

  // Check each ship point against asteroid polygon
  const worldPoints = asteroid.points.map((p) => {
    const rotated = rotatePoint(p, asteroid.rotation)
    return { x: asteroid.x + rotated.x, y: asteroid.y + rotated.y }
  })

  return shipPoints.some(
    (shipPoint) =>
      isPointInPolygon(shipPoint, worldPoints) ||
      worldPoints.some((a, i) => {
        const b = worldPoints[(i + 1) % worldPoints.length]
        const closest = closestPointOnSegment(shipPoint, a, b)
        const dx = closest.x - shipPoint.x
        const dy = closest.y - shipPoint.y
        return dx * dx + dy * dy < 25 // 5px threshold
      }),
  )
}

const isPointInPolygon = (
  point: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>,
): boolean => {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
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

  // Add this ref at the top with other refs
  const lastLaserDamageTime = useRef(0)

  // Add these refs at the top with other refs
  const explosions = useRef<ExplosionParticle[]>([])

  // Add to component refs
  const disintegrationParticles = useRef<DisintegrationParticle[]>([])

  // Add near other state declarations
  const [currentShieldHealth, setCurrentShieldHealth] = useState<number>(0)

  // Add this ref at the top of the component with other refs
  const lastUpdateTime = useRef(Date.now())

  // Add near top with other refs:
  const currentShieldHealthRef = useRef(currentShieldHealth)

  // Update whenever shield health changes:
  useEffect(() => {
    currentShieldHealthRef.current = currentShieldHealth
  }, [currentShieldHealth])

  // Add this new state at the top of the component
  const [controlMode, _setControlMode] = useState<'keyboard' | 'controller'>('keyboard')

  // Add this ref near other refs
  const controlModeRef = useRef(controlMode)

  // Add this ref near other refs
  const lastControlChangeTime = useRef(0)

  // Update the state setter to track changes
  const setControlMode = (mode: 'keyboard' | 'controller') => {
    if (controlModeRef.current !== mode) {
      lastControlChangeTime.current = Date.now()
      controlModeRef.current = mode
      _setControlMode(mode)
    }
  }

  // Update the shoot function
  const shoot = () => {
    const now = Date.now()
    const hasRapidFire = activePowerUps.current.some((p) => p.type === 'rapidFire')
    const { cooldown } = getBulletProperties(hasRapidFire)

    if (!isPaused && isPlaying && now - lastShotTime.current > cooldown) {
      lastShotTime.current = now
      const { bulletSpeed } = getBulletProperties(hasRapidFire)
      const hasSpreadShot = activePowerUps.current.some((p) => p.type === 'spreadShot')

      // Calculate bullet spawn position at ship's nose
      const bodyLength = GAME_CONSTANTS.SHIP_SIZE * 1.5
      const baseShoot = (angle: number) => {
        const offsetX = Math.cos(angle - Math.PI / 2) * bodyLength
        const offsetY = Math.sin(angle - Math.PI / 2) * bodyLength

        bullets.current.push({
          x: shipX.current + offsetX,
          y: shipY.current + offsetY,
          dx: Math.cos(angle - Math.PI / 2) * bulletSpeed,
          dy: Math.sin(angle - Math.PI / 2) * bulletSpeed,
          damage: GAME_CONSTANTS.BULLET_DAMAGE,
        })
      }

      if (hasSpreadShot) {
        ;[-0.2, 0, 0.2].forEach((offset) => baseShoot(shipAngle.current + offset))
      } else {
        baseShoot(shipAngle.current)
      }
    }
  }

  const updateLaser = (ctx: CanvasRenderingContext2D, shipX: number, shipY: number) => {
    const hasLaser = activePowerUps.current.some((p) => p.type === 'laser')
    if (!hasLaser) return

    const now = Date.now()
    const timeSinceLastDamage = now - lastLaserDamageTime.current

    // Declare variable in outer scope
    let nearbyAsteroids: Asteroid[] = []

    if (timeSinceLastDamage > GAME_CONSTANTS.LASER_DAMAGE_INTERVAL) {
      nearbyAsteroids = asteroids.current.filter((asteroid) => {
        const dx = asteroid.x - shipX
        const dy = asteroid.y - shipY
        return dx * dx + dy * dy <= GAME_CONSTANTS.LASER_RANGE_SQ // Pre-square the constant
      })

      nearbyAsteroids.forEach((asteroid) => {
        // Apply damage
        asteroid.health = Math.max(0, asteroid.health - GAME_CONSTANTS.LASER_DAMAGE_PER_TICK)

        // Create particles
        const particleCount = Math.ceil(8 * GAME_CONSTANTS.LASER_DAMAGE_PER_TICK)
        for (let i = 0; i < particleCount; i++) {
          disintegrationParticles.current.push({
            x: asteroid.x + (Math.random() - 0.5) * asteroid.size,
            y: asteroid.y + (Math.random() - 0.5) * asteroid.size,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            size: Math.random() * 4 + 2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.15,
            createdAt: now,
            color: `hsl(210, 100%, ${50 + Math.random() * 30}%)`, // Blueish particles
            startX: asteroid.x + (Math.random() - 0.5) * asteroid.size,
            control1X: asteroid.x + (Math.random() - 0.5) * asteroid.size,
            control2X: asteroid.x + (Math.random() - 0.5) * asteroid.size,
            endX: asteroid.x + (Math.random() - 0.5) * asteroid.size,
          })
        }

        // Remove if health depleted
        if (asteroid.health <= 0) {
          const index = asteroids.current.indexOf(asteroid)
          if (index !== -1) {
            asteroids.current.splice(index, 1)
            scoreRef.current += 100 * (asteroid.isBoss ? 3 : 1)
          }

          // Drop power-ups
          if (asteroid.isBoss) {
            // Bosses always drop two power-ups slightly offset
            createPowerUp(asteroid.x + 15, asteroid.y - 15)
            createPowerUp(asteroid.x - 15, asteroid.y + 15)
          } else if (Math.random() < GAME_CONSTANTS.POWER_UP_DROP_CHANCE) {
            createPowerUp(asteroid.x, asteroid.y)
          }

          // Split only if not boss and size > 40
          if (!asteroid.isBoss && asteroid.size > 40) {
            for (let i = 0; i < 2; i++) {
              // Calculate angle away from ship
              const angleToShip = Math.atan2(shipY - asteroid.y, shipX - asteroid.x)
              // Add 90-270 degrees variance to ensure away direction
              const angle = angleToShip + Math.PI + (Math.random() * Math.PI - Math.PI / 2)
              const speed = Math.random() * 0.8 + 0.4 // Reduced max speed from 1.2 to 0.8

              asteroids.current.push({
                x: asteroid.x,
                y: asteroid.y,
                size: asteroid.size / 2,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                points: generateAsteroidPoints(asteroid.size / 2),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02, // Random rotation speed
                collisionRadius: (asteroid.size / 2) * GAME_CONSTANTS.ASTEROID_COLLISION_FACTOR,
                health: Math.ceil(asteroid.size / 10),
                initialHealth: Math.ceil(asteroid.size / 10),
                isBoss: false,
                attackCooldown: 0,
                bullets: [],
                bounds: {
                  // Add actual bounding box
                  minX:
                    Math.min(...generateAsteroidPoints(asteroid.size / 2).map((p) => p.x)) +
                    asteroid.x,
                  maxX:
                    Math.max(...generateAsteroidPoints(asteroid.size / 2).map((p) => p.x)) +
                    asteroid.x,
                  minY:
                    Math.min(...generateAsteroidPoints(asteroid.size / 2).map((p) => p.y)) +
                    asteroid.y,
                  maxY:
                    Math.max(...generateAsteroidPoints(asteroid.size / 2).map((p) => p.y)) +
                    asteroid.y,
                },
                isCharging: false,
                lastAttackTime: 0,
              })
            }
          }
        }
      })

      lastLaserDamageTime.current = now
    }

    // Visual effects using the same nearbyAsteroids
    if (nearbyAsteroids.length > 0) {
      // Draw laser effect
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      nearbyAsteroids.forEach((asteroid) => {
        // Lightning-style beam
        const segments = 20
        const baseAngle = Math.atan2(asteroid.y - shipY, asteroid.x - shipX)
        const maxOffset = 15 // Maximum lightning jitter

        ctx.strokeStyle = 'rgba(150, 50, 255, 0.9)'
        ctx.lineWidth = 2 + Math.sin(Date.now() / 80) * 1.5
        ctx.beginPath()
        ctx.moveTo(shipX, shipY)

        // Create jagged lightning path
        for (let i = 1; i <= segments; i++) {
          const progress = i / segments
          const offsetX = (Math.random() - 0.5) * maxOffset * (1 - progress)
          const offsetY = (Math.random() - 0.5) * maxOffset * (1 - progress)

          ctx.lineTo(
            shipX + (asteroid.x - shipX) * progress + offsetX,
            shipY + (asteroid.y - shipY) * progress + offsetY,
          )
        }
        ctx.stroke()

        // Add core line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(shipX, shipY)
        ctx.lineTo(asteroid.x, asteroid.y)
        ctx.stroke()

        if (Math.random() < 0.1) {
          const angle = Math.atan2(asteroid.y - shipY, asteroid.x - shipX)
          disintegrationParticles.current.push({
            x: asteroid.x + (Math.random() - 0.5) * 10,
            y: asteroid.y + (Math.random() - 0.5) * 10,
            dx: Math.cos(angle) * 6,
            dy: Math.sin(angle) * 6,
            size: Math.random() * 2 + 0.2,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            createdAt: Date.now(),
            color: `hsl(${280 + Math.random() * 10}, 100%, 70%)`,
            startX: asteroid.x + (Math.random() - 0.5) * 10,
            control1X: asteroid.x + (Math.random() - 0.5) * 10,
            control2X: asteroid.x + (Math.random() - 0.5) * 10,
            endX: asteroid.x + (Math.random() - 0.5) * 10,
          })
        }
      })

      ctx.restore()
    }
  }

  const quitGame = () => {
    setIsPaused(false)
    setIsPlaying(false)
    setGameOver(false)
    scoreRef.current = 0
    setCurrentShieldHealth(0)
    difficultyLevel.current = 1
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
  }

  const initGame = () => {
    if (!canvasRef.current) return

    const currentTime = Date.now()
    const deltaTime = currentTime - lastUpdateTime.current // Calculate deltaTime
    lastUpdateTime.current = currentTime // Update for next frame

    // Reset shield health on new game
    setCurrentShieldHealth(0)

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

    // Create initial asteroids - reduced from 5 to 3
    for (let i = 0; i < 3; i++) {
      createAsteroid(false)
    }
  }

  const createAsteroid = (isBoss = false) => {
    const { asteroidSizeRange } = getDifficultyValues(difficultyLevel.current)
    // Fixed base size for bosses
    const baseSize = isBoss
      ? 50 // Fixed base size for all bosses
      : Math.random() * (asteroidSizeRange.max - asteroidSizeRange.min) + asteroidSizeRange.min

    const size = baseSize // Remove previous 1.2 multiplier for bosses
    const initialHealth = isBoss ? Math.ceil(size * 0.25) : Math.ceil(size * 0.1)

    // Initialize with safe defaults
    let x: number = 0
    let y: number = 0

    // Then assign in switch statement
    const side = Math.floor(Math.random() * 4) // 0-3 for each screen edge
    const buffer = size * 3 // Spawn outside visible area
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    switch (side) {
      case 0: // Top
        x = Math.random() * canvas.width
        y = -buffer
        break
      case 1: // Right
        x = canvas.width + buffer
        y = Math.random() * canvas.height
        break
      case 2: // Bottom
        x = Math.random() * canvas.width
        y = canvas.height + buffer
        break
      case 3: // Left
        x = -buffer
        y = Math.random() * canvas.height
        break
      default: // Fallback
        x = canvas.width + buffer
        y = canvas.height + buffer
    }

    // Modify safe distance calculation to be more strict
    const safeDistance = isBoss
      ? Math.min(window.innerWidth, window.innerHeight) * 0.5 // Increased from 0.4 to 0.5
      : Math.max(
          size * 6, // Increased minimum safe distance from 4x to 6x size
          Math.min(window.innerWidth, window.innerHeight) * 0.4, // 40% of screen size
        )

    let attempts = 0
    let validPosition = false

    while (!validPosition && attempts < 1000) {
      // Increased max attempts from 500 to 1000
      attempts++

      // Calculate actual distance using squared values for performance
      const dx = x - shipX.current
      const dy = y - shipY.current
      const distanceSq = dx * dx + dy * dy
      const minDistance = safeDistance + size + GAME_CONSTANTS.SHIP_COLLISION_RADIUS
      const minDistanceSq = minDistance * minDistance

      validPosition = distanceSq > minDistanceSq

      // Stricter offscreen check with larger buffer
      const buffer = size * 5 // Increased from 3x to 5x
      const isOffscreen =
        x < -buffer || x > canvas.width + buffer || y < -buffer || y > canvas.height + buffer

      validPosition = validPosition && isOffscreen
    }

    // Ensure boss movement
    const { asteroidSpeed } = getDifficultyValues(difficultyLevel.current)
    const speedMultiplier = isBoss ? 0.8 : 1.0 // Reduced from 1.2

    // Calculate direction to player without random variation for bosses
    const angle: number = Math.atan2(shipY.current - y, shipX.current - x)
    const baseSpeed: number = asteroidSpeed.max * speedMultiplier * 0.6 // Reduced from 0.7
    const dx: number = Math.cos(angle) * baseSpeed + (Math.random() - 0.5) * 0.3 // Reduced variation
    const dy: number = Math.sin(angle) * baseSpeed + (Math.random() - 0.5) * 0.3 // Reduced variation

    const points = generateAsteroidPoints(size)
    const xValues = points.map((p) => p.x)
    const yValues = points.map((p) => p.y)

    const asteroid: Asteroid = {
      x,
      y,
      size,
      dx: isBoss ? dx : dx + (Math.random() - 0.5), // Bosses move directly at player
      dy: isBoss ? dy : dy + (Math.random() - 0.5), // Regular asteroids get random variation
      points,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02, // Random rotation speed
      collisionRadius: size * GAME_CONSTANTS.ASTEROID_COLLISION_FACTOR,
      health: initialHealth,
      initialHealth,
      isBoss,
      attackCooldown: 0,
      bullets: [],
      bounds: {
        minX: Math.min(...xValues) + x,
        maxX: Math.max(...xValues) + x,
        minY: Math.min(...yValues) + y,
        maxY: Math.max(...yValues) + y,
      },
      isCharging: false,
      lastAttackTime: 0,
    }

    if (isBoss) {
      // Remove size scaling
      // Add health bonus based on number of boss spawns
      const bossLevel = Math.floor(difficultyLevel.current / GAME_CONSTANTS.BOSS_SPAWN_INTERVAL)
      asteroid.health = initialHealth + 5 * bossLevel
      asteroid.initialHealth = asteroid.health
      asteroid.rotationSpeed *= 2
      asteroid.dx *= 0.8
      asteroid.dy *= 0.8
    }

    // Add velocity direction check for regular asteroids
    if (!isBoss) {
      // Ensure asteroids are moving away from edges
      const edgeBuffer = 100
      if (x < edgeBuffer) asteroid.dx += Math.abs(asteroid.dx) * 0.5
      if (x > canvas.width - edgeBuffer) asteroid.dx -= Math.abs(asteroid.dx) * 0.5
      if (y < edgeBuffer) asteroid.dy += Math.abs(asteroid.dy) * 0.5
      if (y > canvas.height - edgeBuffer) asteroid.dy -= Math.abs(asteroid.dy) * 0.5
    }

    asteroids.current.push(asteroid)
  }

  const updateBossBehavior = (asteroid: Asteroid) => {
    if (!asteroid.isBoss) return

    const now = Date.now()
    const timeSinceLastAttack = now - asteroid.lastAttackTime

    if (
      timeSinceLastAttack >
      GAME_CONSTANTS.BOSS_ATTACK_COOLDOWN - GAME_CONSTANTS.BOSS_CHARGE_UP_DURATION
    ) {
      asteroid.isCharging =
        timeSinceLastAttack >
        GAME_CONSTANTS.BOSS_ATTACK_COOLDOWN - GAME_CONSTANTS.BOSS_CHARGE_UP_DURATION

      if (timeSinceLastAttack >= GAME_CONSTANTS.BOSS_ATTACK_COOLDOWN) {
        const bulletCount = 8 // Match target line count
        const bulletSpread = Math.PI * 2
        const startRadius = asteroid.size + 10

        for (let i = 0; i < bulletCount; i++) {
          const angle = (i * bulletSpread) / bulletCount
          const startX = asteroid.x + Math.cos(angle) * startRadius
          const startY = asteroid.y + Math.sin(angle) * startRadius

          asteroid.bullets.push({
            x: startX,
            y: startY,
            dx: Math.cos(angle) * GAME_CONSTANTS.BOSS_BULLET_SPEED,
            dy: Math.sin(angle) * GAME_CONSTANTS.BOSS_BULLET_SPEED,
            createdAt: Date.now(),
          })
        }
        asteroid.lastAttackTime = now
        asteroid.isCharging = false
      }
    }
  }

  const updateGame = () => {
    if (!canvasRef.current) return

    // Add this bullet cleanup code in the bullet update section
    bullets.current = bullets.current.filter((bullet) => {
      // Keep bullets that are within screen bounds + 100px buffer
      return (
        bullet.x > -100 &&
        bullet.x < canvasRef.current!.width + 100 &&
        bullet.y > -100 &&
        bullet.y < canvasRef.current!.height + 100
      )
    })

    const now = Date.now()
    const deltaTime = now - lastFrameTime.current
    lastFrameTime.current = now

    // Add this cleanup at the start of updateGame
    asteroids.current.forEach((asteroid) => {
      if (asteroid.isBoss) {
        // Clean up off-screen bullets
        asteroid.bullets = asteroid.bullets.filter(
          (b) =>
            b.x > -100 &&
            b.x < canvasRef.current!.width + 100 &&
            b.y > -100 &&
            b.y < canvasRef.current!.height + 100,
        )
      }
    })

    lastUpdateTime.current = now
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Only update game state if not game over and not paused
    if (!gameOver && !isPaused) {
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
        // Remove the else clause to update boss positions too
        asteroid.x += asteroid.dx
        asteroid.y += asteroid.dy
        asteroid.x = (asteroid.x + canvas.width) % canvas.width
        asteroid.y = (asteroid.y + canvas.height) % canvas.height

        if (asteroid.isBoss) {
          updateBossBehavior(asteroid)
        }
      })

      // Improved collision detection function
      const checkCollision = (
        asteroid: Asteroid,
        shipX: number,
        shipY: number,
        shipAngle: number,
      ) => {
        // Get transformed asteroid points
        const worldPoints = asteroid.points.map((p) => {
          const rotated = rotatePoint(p, asteroid.rotation)
          return { x: asteroid.x + rotated.x, y: asteroid.y + rotated.y }
        })

        // Get transformed ship points - UPDATE THESE VALUES TO MATCH VISUAL
        const shipPoints = [
          { x: 0, y: -18 }, // Nose
          { x: -7.2, y: -2.4 }, // Left shoulder
          { x: -14.4, y: 2.4 }, // Left wing tip (UPDATED from 9.6 to 2.4)
          { x: -4.8, y: 7.2 }, // Left inner wing
          { x: 0, y: 4.8 }, // Rear center
          { x: 4.8, y: 7.2 }, // Right inner wing
          { x: 14.4, y: 2.4 }, // Right wing tip (UPDATED from 9.6 to 2.4)
          { x: 7.2, y: -2.4 }, // Right shoulder
        ].map((p) => {
          const rotated = rotatePoint(p, shipAngle)
          return { x: shipX + rotated.x, y: shipY + rotated.y }
        })

        // Check for any intersection between ship and asteroid polygons
        return shipPoints.some(
          (shipPoint) =>
            isPointInPolygon(shipPoint, worldPoints) ||
            worldPoints.some((a, i) => {
              const b = worldPoints[(i + 1) % worldPoints.length]
              const closest = closestPointOnSegment(shipPoint, a, b)
              const dx = closest.x - shipPoint.x
              const dy = closest.y - shipPoint.y
              return dx * dx + dy * dy < 25 // 5px threshold
            }),
        )
      }

      asteroids.current.forEach((asteroid, asteroidIndex) => {
        if (checkCollision(asteroid, shipX.current, shipY.current, shipAngle.current)) {
          if (currentShieldHealthRef.current > 0) {
            handleShieldCollision(asteroid)
          } else {
            handleGameOver()
          }
        }
      })
    }

    // Always draw everything regardless of game state
    drawShip(
      ctx,
      shipX.current,
      shipY.current,
      shipAngle.current,
      (keys.current['ArrowUp'] || keys.current['KeyW']) && !isPaused && !gameOver,
      currentShieldHealthRef.current,
      activePowerUps.current,
    )

    // Draw player bullets
    ctx.beginPath()
    bullets.current.forEach((bullet) => {
      ctx.moveTo(bullet.x + 2, bullet.y)
      ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2)
    })
    ctx.fillStyle = 'white'
    ctx.fill()

    // Add boss bullets drawing
    ctx.beginPath()
    asteroids.current.forEach((asteroid) => {
      if (asteroid.isBoss) {
        asteroid.bullets.forEach((bullet) => {
          ctx.moveTo(bullet.x + 3, bullet.y)
          ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2)
        })
      }
    })
    ctx.fillStyle = 'red'
    ctx.fill()

    // Draw asteroids
    asteroids.current.forEach((asteroid) => {
      drawAsteroid(ctx, asteroid)
      // Only update rotation if game is not paused and not game over
      if (!isPaused && !gameOver) {
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

        // Spawn boss every 3 levels

        if (difficultyLevel.current % GAME_CONSTANTS.BOSS_SPAWN_INTERVAL === 0) {
          if (asteroids.current.filter((a) => a.isBoss).length < GAME_CONSTANTS.MAX_BOSSES) {
            createAsteroid(true)
            toast.info(`BOSS INCOMING!`, { duration: 2000 })
          }
        } else {
          toast.info(`Difficulty increased to level ${difficultyLevel.current}!`, {
            duration: 2000,
          })
        }
      }

      // Update and draw bullets
      bullets.current = bullets.current.filter((bullet) => {
        let hitAsteroid = false
        asteroids.current = asteroids.current.filter((asteroid) => {
          // Transform asteroid points with current rotation
          const worldPoints = asteroid.points.map((p) => {
            const rotated = rotatePoint(p, asteroid.rotation)
            return {
              x: rotated.x + asteroid.x,
              y: rotated.y + asteroid.y,
            }
          })

          // Check bullet collision using polygon check
          const isInside = isPointInPolygon({ x: bullet.x, y: bullet.y }, worldPoints)

          // Additional edge check for near misses
          let edgeCollision = false
          for (let i = 0; i < worldPoints.length; i++) {
            const a = worldPoints[i]
            const b = worldPoints[(i + 1) % worldPoints.length]
            const closest = closestPointOnSegment({ x: bullet.x, y: bullet.y }, a, b)
            const dx = closest.x - bullet.x
            const dy = closest.y - bullet.y
            const distanceSq = dx * dx + dy * dy

            if (distanceSq < 25) {
              // 5px threshold
              edgeCollision = true
              break
            }
          }

          if (isInside || edgeCollision) {
            hitAsteroid = true
            asteroid.health -= bullet.damage

            // Create impact particles
            for (let i = 0; i < 5; i++) {
              disintegrationParticles.current.push({
                x: bullet.x + (Math.random() - 0.5) * 10,
                y: bullet.y + (Math.random() - 0.5) * 10,
                dx: (Math.random() - 0.5) * 3,
                dy: (Math.random() - 0.5) * 3,
                size: Math.random() * 3 + 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                createdAt: Date.now(),
                color: '#ffffff',
                startX: bullet.x + (Math.random() - 0.5) * 10,
                control1X: bullet.x + (Math.random() - 0.5) * 10,
                control2X: bullet.x + (Math.random() - 0.5) * 10,
                endX: bullet.x + (Math.random() - 0.5) * 10,
              })
            }

            if (asteroid.health <= 0) {
              // Always add score
              scoreRef.current += 100 * (asteroid.isBoss ? 5 : 1)

              // Drop power-up for destroyed asteroids
              if (Math.random() < GAME_CONSTANTS.POWER_UP_DROP_CHANCE || asteroid.isBoss) {
                createPowerUp(asteroid.x, asteroid.y)
              }

              // Split only if not boss and size > 40
              if (!asteroid.isBoss && asteroid.size > 40) {
                // Split asteroid
                for (let i = 0; i < 2; i++) {
                  const parentSpeedMultiplier = Math.min(1, asteroid.size / 40) // Scale speed by original size
                  asteroids.current.push({
                    // Add .current to access the array
                    x: asteroid.x,
                    y: asteroid.y,
                    size: asteroid.size / 2,
                    dx: (Math.random() - 0.5) * 2 * parentSpeedMultiplier, // Reduced from 4 to 2
                    dy: (Math.random() - 0.5) * 2 * parentSpeedMultiplier, // Reduced from 4 to 2
                    points: generateAsteroidPoints(asteroid.size / 2),
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.02, // Random rotation speed
                    collisionRadius: (asteroid.size / 2) * GAME_CONSTANTS.ASTEROID_COLLISION_FACTOR,
                    health: Math.ceil(asteroid.size / 10),
                    initialHealth: Math.ceil(asteroid.size / 10),
                    isBoss: false,
                    attackCooldown: 0,
                    bullets: [],
                    bounds: {
                      // Add actual bounding box
                      minX:
                        Math.min(...generateAsteroidPoints(asteroid.size / 2).map((p) => p.x)) +
                        asteroid.x,
                      maxX:
                        Math.max(...generateAsteroidPoints(asteroid.size / 2).map((p) => p.x)) +
                        asteroid.x,
                      minY:
                        Math.min(...generateAsteroidPoints(asteroid.size / 2).map((p) => p.y)) +
                        asteroid.y,
                      maxY:
                        Math.max(...generateAsteroidPoints(asteroid.size / 2).map((p) => p.y)) +
                        asteroid.y,
                    },
                    isCharging: false,
                    lastAttackTime: 0,
                  })
                }
              }
              return false
            }
            return true // Keep asteroid if still alive
          }
          return true
        })
        return !hitAsteroid
      })

      // Update and draw asteroids
      asteroids.current.forEach((asteroid) => {
        // Check collision with ship
        const dx = shipX.current - asteroid.x
        const dy = shipY.current - asteroid.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < asteroid.size + 10 && !gameOver) {
          handleGameOver()
        }
      })

      // Update asteroid spawn logic with dynamic rate
      const { asteroidSpawnRate } = getDifficultyValues(difficultyLevel.current)
      if (
        Math.random() < asteroidSpawnRate &&
        asteroids.current.length < GAME_CONSTANTS.MAX_ASTEROIDS
      ) {
        createAsteroid()
      }
    }

    // Only update these if not paused
    if (!isPaused) {
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

        if (distance < 20 || powerUpAge > GAME_CONSTANTS.POWER_UP_LIFETIME) {
          if (distance < 20) {
            const existingPowerUpIndex = activePowerUps.current.findIndex(
              (p) => p.type === powerUp.type,
            )

            if (existingPowerUpIndex !== -1) {
              activePowerUps.current[existingPowerUpIndex].expiresAt =
                Date.now() + GAME_CONSTANTS.POWER_UP_DURATION
            } else {
              activePowerUps.current.push({
                type: powerUp.type,
                expiresAt: Date.now() + GAME_CONSTANTS.POWER_UP_DURATION,
              })

              // Immediate effect for rapid fire
              if (powerUp.type === 'rapidFire' && shootingInterval.current) {
                clearInterval(shootingInterval.current)
                shootingInterval.current = null
                if (keys.current['Space'] || keys.current['KeyM']) {
                  shootHandler() // Restart shooting with new rate
                }
              }
            }

            toast.success(`${powerUp.type} power-up collected!`, {
              duration: 2000,
            })
          }
          return false
        }
        return true
      })

      // Draw power-ups
      powerUps.current.forEach((powerUp) => {
        drawPowerUp(ctx, powerUp)
      })

      // Update boss behavior
      asteroids.current.forEach((asteroid) => {
        if (asteroid.isBoss) {
          updateBossBehavior(asteroid)
        }
      })

      // Update boss bullet positions
      asteroids.current.forEach((asteroid) => {
        if (asteroid.isBoss) {
          asteroid.bullets.forEach((b) => {
            b.x += b.dx
            b.y += b.dy
          })

          asteroid.bullets = asteroid.bullets.filter(
            (b) => b.x > -50 && b.x < canvas.width + 50 && b.y > -50 && b.y < canvas.height + 50,
          )
        }
      })
    }

    // Draw UI
    ctx.save()

    // Text styling
    ctx.fillStyle = '#ababab'
    ctx.font = 'bold 14px Arial, sans-serif'
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'

    // Score and level text
    ctx.fillText(`LEVEL ${difficultyLevel.current}`, 0, 2)
    ctx.fillText(`SCORE: ${scoreRef.current}`, 0, 24)

    // Control mode icon (only show for 2 seconds after change)
    const timeSinceControlChange = Date.now() - lastControlChangeTime.current
    if (timeSinceControlChange < 2000) {
      if (controlModeRef.current === 'keyboard') {
        drawKeyboardIcon(ctx, window.innerWidth - 42, 2)
      } else {
        drawGamepadIcon(ctx, window.innerWidth - 42, 2)
      }
    }

    ctx.restore()

    // Add this near where you draw other effects
    if (!isPaused) {
      updateLaser(ctx, shipX.current, shipY.current)
    }

    // Update and draw explosions
    explosions.current = explosions.current.filter((particle) => {
      const age = Date.now() - particle.createdAt
      return age < 1000 // Keep particles for 1 second
    })

    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    explosions.current.forEach((particle) => {
      const age = Date.now() - particle.createdAt
      const progress = age / 1000
      const alpha = 1 - progress

      ctx.fillStyle = `rgba(0, 100, 255, ${alpha})`
      ctx.beginPath()
      ctx.arc(
        particle.x + particle.dx * progress * 50,
        particle.y + particle.dy * progress * 50,
        particle.size * (1 - progress),
        0,
        Math.PI * 2,
      )
      ctx.fill()
    })
    ctx.restore()

    // Add this new function to draw disintegration particles
    drawDisintegration(ctx)

    // Add this right after the existing asteroid collision checks
    // But before the boss behavior updates
    asteroids.current.forEach((asteroid) => {
      asteroid.bullets.forEach((bullet, bulletIndex) => {
        const dx = shipX.current - bullet.x
        const dy = shipY.current - bullet.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 20) {
          // 10 (ship) + 10 (bullet)
          if (currentShieldHealthRef.current > 0) {
            const shieldDamage = asteroid.isBoss
              ? GAME_CONSTANTS.SHIELD_DAMAGE_BOSS * 100
              : GAME_CONSTANTS.SHIELD_DAMAGE_NORMAL * 100
            setCurrentShieldHealth((prev) => Math.max(0, prev - shieldDamage))
          } else {
            handleGameOver()
          }
          asteroid.bullets.splice(bulletIndex, 1)
        }
      })
    })

    // Check for expired rapid fire and reset shooting
    const rapidFireActive = activePowerUps.current.some((p) => p.type === 'rapidFire')
    if (!rapidFireActive && shootingInterval.current) {
      clearInterval(shootingInterval.current)
      shootingInterval.current = null

      // If still holding fire button, restart with normal rate
      if (keys.current['Space'] || keys.current['KeyM']) {
        shootHandler()
      }
    }

    // Add to top of file
    const GRID_SIZE = 300
    const spatialGrid = new Map<string, Set<Asteroid | Bullet>>()

    // In updateGame(), before collision checks:
    spatialGrid.clear()

    // Add asteroids to grid
    asteroids.current.forEach((obj) => {
      const gridX = Math.floor(obj.x / GRID_SIZE)
      const gridY = Math.floor(obj.y / GRID_SIZE)
      const key = `${gridX},${gridY}`
      if (!spatialGrid.has(key)) spatialGrid.set(key, new Set())
      spatialGrid.get(key)!.add(obj)
    })

    // Only check collisions within same grid cell
    asteroids.current.forEach((asteroid) => {
      const gridX = Math.floor(asteroid.x / GRID_SIZE)
      const gridY = Math.floor(asteroid.y / GRID_SIZE)

      // Check current cell and adjacent cells
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          const key = `${gridX + x},${gridY + y}`
          const cellObjects = spatialGrid.get(key) || []
          cellObjects.forEach((obj) => {
            if (obj !== asteroid) {
              // Your existing collision check here
            }
          })
        }
      }
    })

    // In updateGame():
    asteroids.current = asteroids.current.slice(0, GAME_CONSTANTS.MAX_ASTEROIDS)
    bullets.current = bullets.current.slice(0, GAME_CONSTANTS.MAX_BULLETS)
    disintegrationParticles.current = disintegrationParticles.current.slice(
      0,
      GAME_CONSTANTS.MAX_PARTICLES,
    )
  }

  const handleGameOver = async () => {
    if (gameOver) {
      return
    }

    const finalScore = scoreRef.current

    setGameOver(true)
    setIsPaused(true)

    if (username && finalScore > 0) {
      try {
        const result = await submitScore(username, finalScore)

        if (!result.success) {
          throw new Error(result.error || 'Failed to save score')
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
    const types: PowerUpType[] = ['spreadShot', 'rapidFire', 'speedBoost', 'laser']

    // Get current active power-up types
    const activeTypes = activePowerUps.current.map((p) => p.type)

    // Filter out currently active power-ups but ensure at least one type remains
    let availableTypes = types.filter((type) => !activeTypes.includes(type) || Math.random() > 0.5)

    // Fallback to all types if filtered list is empty
    if (availableTypes.length === 0) {
      availableTypes = types
    }

    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)]

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
      // Detect ANY gamepad input
      const hasInput =
        gamepad.buttons.some((b) => b.pressed) || gamepad.axes.some((a) => Math.abs(a) > 0.1)

      if (hasInput) {
        setControlMode('controller')
        // Clear keyboard inputs when switching modes
        keys.current = {}
      }

      // Only process inputs if in controller mode
      if (controlModeRef.current === 'controller' && !isPaused) {
        const deadZone = 0.1
        const leftStickY = gamepad.axes[1] // Left stick vertical
        const rightStickX = gamepad.axes[2] // Right stick horizontal

        // Forward thrust only with left stick (push forward)
        if (leftStickY < -deadZone) {
          const thrustInput = -leftStickY // Invert and normalize (0-1)
          const thrustPower = GAME_CONSTANTS.THRUST_POWER * Math.min(thrustInput, 1)
          velocity.current.x += Math.cos(shipAngle.current - Math.PI / 2) * thrustPower
          velocity.current.y += Math.sin(shipAngle.current - Math.PI / 2) * thrustPower
        }

        // Rotation only with right stick
        if (Math.abs(rightStickX) > deadZone) {
          const stickPosition = Math.abs(rightStickX) - deadZone
          const direction = rightStickX > 0 ? 1 : -1
          const normalizedPosition = stickPosition / (1 - deadZone)
          const speedScale = Math.pow(normalizedPosition, 3) // Cubic sensitivity curve
          rotationVelocity.current = direction * speedScale * GAME_CONSTANTS.MAX_ROTATION_SPEED
        } else {
          rotationVelocity.current *= GAME_CONSTANTS.ROTATION_FRICTION
        }

        // Clamp rotation speed
        rotationVelocity.current = Math.max(
          -GAME_CONSTANTS.MAX_ROTATION_SPEED,
          Math.min(GAME_CONSTANTS.MAX_ROTATION_SPEED, rotationVelocity.current),
        )

        // Shooting control
        const shootButton = gamepad.buttons[7].pressed || gamepad.buttons[2].pressed
        if (shootButton && !shootingInterval.current) {
          shootHandler()
        }

        // Stop shooting when button released
        if (!shootButton && shootingInterval.current) {
          clearInterval(shootingInterval.current)
          shootingInterval.current = null
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

  useEffect(() => {
    if (!isPlaying) return

    let animationId: number

    const handleResize = () => {
      if (!canvasRef.current) return
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // Left mouse button
        setControlMode('keyboard')
        if (!shootingInterval.current) {
          shootHandler()
        }
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0 && shootingInterval.current) {
        clearInterval(shootingInterval.current)
        shootingInterval.current = null
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Force keyboard mode on any key press
      setControlMode('keyboard')

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

      // Only process keys if in keyboard mode (using ref for real-time check)
      if (controlModeRef.current === 'keyboard' && !isPaused) {
        keys.current[e.code] = true

        // Shooting logic - keep spacebar and add mouse
        if ((e.code === 'Space' || e.code === 'KeyM') && !shootingInterval.current) {
          shootHandler()
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
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    handleResize()

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      // Clear shooting interval on cleanup
      if (shootingInterval.current) {
        clearInterval(shootingInterval.current)
        shootingInterval.current = null
      }
    }
  }, [isPlaying, isPaused]) // Add isPaused to dependencies

  // Add this new function
  const createShieldExplosion = (x: number, y: number) => {
    const particleCount = 20
    for (let i = 0; i < particleCount; i++) {
      explosions.current.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 3,
        dy: (Math.random() - 0.5) * 3,
        size: Math.random() * 3 + 2,
        createdAt: Date.now(),
      })
    }
  }

  // Add this new function to draw disintegration particles
  const drawDisintegration = (ctx: CanvasRenderingContext2D) => {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'

    disintegrationParticles.current.forEach((particle) => {
      const age = Date.now() - particle.createdAt
      const progress = age / 1000
      const alpha = 1 - progress * 2 // Faster fade out

      if (progress > 0.5) return

      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.rotation)

      // Gradient for energy effect
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2)
      gradient.addColorStop(0, `hsla(300, 100%, 70%, ${alpha})`)
      gradient.addColorStop(1, `hsla(280, 100%, 50%, ${alpha * 0.5})`)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, particle.size * (1 - progress), 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      // Update particle physics
      particle.x += particle.dx
      particle.y += particle.dy
      particle.rotation += particle.rotationSpeed
      particle.dx *= 0.95
      particle.dy *= 0.95
    })

    // Remove old particles
    disintegrationParticles.current = disintegrationParticles.current.filter(
      (p) => Date.now() - p.createdAt < 500,
    )

    ctx.restore()
  }

  const createParticles = (
    x: number,
    y: number,
    count: number,
    color: string,
    speedMultiplier: number,
  ) => {
    for (let i = 0; i < count; i++) {
      explosions.current.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 4 * speedMultiplier,
        dy: (Math.random() - 0.5) * 4 * speedMultiplier,
        size: 2 + Math.random() * 3,
        createdAt: Date.now(),
        color,
      })
    }
  }

  // Add with other particle functions
  const createShieldSparkEffect = (x: number, y: number) => {
    for (let i = 0; i < 15; i++) {
      const particle = particlePool.pop() || {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        size: 0,
        rotation: 0,
        rotationSpeed: 0,
        createdAt: 0,
        color: '',
        startX: 0,
        control1X: 0,
        control2X: 0,
        endX: 0,
      } // Reuse particles
      // Reset particle properties
      disintegrationParticles.current.push(particle)
      if (disintegrationParticles.current.length > GAME_CONSTANTS.MAX_PARTICLES) {
        disintegrationParticles.current.shift()
      }
    }
  }

  const handleShieldCollision = (asteroid: Asteroid) => {
    const baseDamage = asteroid.isBoss
      ? GAME_CONSTANTS.SHIELD_DAMAGE_BOSS
      : GAME_CONSTANTS.SHIELD_DAMAGE_NORMAL

    // Calculate damage with smaller random variation
    const damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4))

    setCurrentShieldHealth((prev) => {
      const newHealth = prev - damage

      // Visual feedback for all hits
      createShieldSparkEffect(shipX.current, shipY.current)
      createShieldExplosion(asteroid.x, asteroid.y)

      // Shield break effect
      if (newHealth <= 0 && prev > 0) {
        createShieldExplosion(shipX.current, shipY.current)
        toast.warning('Shield destroyed!')
      }

      return Math.max(0, newHealth)
    })

    // Always apply damage to asteroid (shield reflects damage)
    asteroid.health -= damage * 3 // 3x damage reflection
    if (asteroid.health <= 0) {
      const index = asteroids.current.indexOf(asteroid)
      if (index !== -1) {
        asteroids.current.splice(index, 1)
        scoreRef.current += 200 // Bonus points for shield destruction
      }
    }
  }

  // Add these icon drawing functions
  const drawKeyboardIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!keyboardInputRef.current) return
    ctx.drawImage(keyboardInputRef.current, x, y, 40, 25) // Use keyboardInputRef instead of keyboardImageRef
  }

  // Add this ref near other refs
  const gamepadImageRef = useRef<HTMLImageElement | null>(null)
  const keyboardInputRef = useRef<HTMLImageElement | null>(null)

  // Add this useEffect to load the SVG
  useEffect(() => {
    const svgData = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ededed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="6" x2="10" y1="11" y2="11"/>
      <line x1="8" x2="8" y1="9" y2="13"/>
      <line x1="15" x2="15.01" y1="12" y2="12"/>
      <line x1="18" x2="18.01" y1="10" y2="10"/>
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
    </svg>
    `

    const img = new Image()
    img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svgData)}`
    img.onload = () => {
      gamepadImageRef.current = img
    }
  }, [])

  // Modify the drawGamepadIcon function
  const drawGamepadIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!gamepadImageRef.current) return
    ctx.drawImage(gamepadImageRef.current, x, y, 30, 30) // Adjust size as needed
  }

  // Update shootHandler function
  const shootHandler = () => {
    const hasRapidFire = activePowerUps.current.some((p) => p.type === 'rapidFire')
    const { cooldown } = getBulletProperties(hasRapidFire)

    // Clear any existing interval first!
    if (shootingInterval.current) {
      clearInterval(shootingInterval.current)
    }

    shoot()
    shootingInterval.current = setInterval(shoot, cooldown)
  }

  // Add this ref near other refs

  // Add this useEffect to load the keyboard SVG
  useEffect(() => {
    const keyboardData = `
    <svg fill="#ededed" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 490 490" xml:space="preserve" stroke="#ededed"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M251.2,193.5v-53.7c0-5.8,4.7-10.5,10.5-10.5h119.4c21,0,38.1-17.1,38.1-38.1s-17.1-38.1-38.1-38.1H129.5 c-5.4,0-10.1,4.3-10.1,10.1c0,5.8,4.3,10.1,10.1,10.1h251.6c10.1,0,17.9,8.2,17.9,17.9c0,10.1-8.2,17.9-17.9,17.9H261.7 c-16.7,0-30.3,13.6-30.3,30.3v53.3H0v244.2h490V193.5H251.2z M232.2,221.5h15.6c5.4,0,10.1,4.3,10.1,10.1s-4.3,10.1-10.1,10.1 h-15.6c-5.4,0-10.1-4.3-10.1-10.1C222.1,225.8,226.7,221.5,232.2,221.5z M203.4,325.7h-15.6c-5.4,0-10.1-4.3-10.1-10.1 c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1C213.5,321,208.8,325.7,203.4,325.7z M213.5,352.9 c0,5.4-4.3,10.1-10.1,10.1h-15.6c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6C208.8,342.8,213.5,347.5,213.5,352.9z M203.4,288h-15.6c-5.4,0-10.1-4.3-10.1-10.1c0-5.8,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1 C213.5,283.7,208.8,288,203.4,288z M186.3,221.5h15.6c5.4,0,10.1,4.3,10.1,10.1s-4.3,10.1-10.1,10.1h-15.6 c-5.4,0-10.1-4.3-10.1-10.1S180.8,221.5,186.3,221.5z M140.4,221.5H156c5.4,0,10.1,4.3,10.1,10.1s-4.3,10.1-10.1,10.1h-15.6 c-5.4,0-10.1-4.3-10.1-10.1C130.3,225.8,134.9,221.5,140.4,221.5z M138.8,268.1h15.6c5.4,0,10.1,4.3,10.1,10.1 c0,5.8-4.3,10.1-10.1,10.1h-15.6c-5.4,0-10.1-4.3-10.1-10.1C128.7,272.4,133.4,268.1,138.8,268.1z M138.8,305.5h15.6 c5.4,0,10.1,4.3,10.1,10.1c0,5.4-4.3,10.1-10.1,10.1h-15.6c-5.4,0-10.1-4.3-10.1-10.1C128.7,310.1,133.4,305.5,138.8,305.5z M138.8,342.8h15.6c5.4,0,10.1,4.3,10.1,10.1c0,5.4-4.3,10.1-10.1,10.1h-15.6c-5.4,0-10.1-4.3-10.1-10.1 C128.7,347.5,133.4,342.8,138.8,342.8z M94.5,221.5h15.6c5.4,0,10.1,4.3,10.1,10.1s-4.3,10.1-10.1,10.1H94.5 c-5.4,0-10.1-4.3-10.1-10.1S89.1,221.5,94.5,221.5z M89.4,268.1H105c5.4,0,10.1,4.3,10.1,10.1c0,5.8-4.3,10.1-10.1,10.1H89.4 c-5.4,0-10.1-4.3-10.1-10.1C79.3,272.4,84,268.1,89.4,268.1z M89.4,305.5H105c5.4,0,10.1,4.3,10.1,10.1c0,5.4-4.3,10.1-10.1,10.1 H89.4c-5.4,0-10.1-4.3-10.1-10.1C79.7,310.1,84,305.5,89.4,305.5z M89.4,342.8H105c5.4,0,10.1,4.3,10.1,10.1 c0,5.4-4.3,10.1-10.1,10.1H89.4c-5.4,0-10.1-4.3-10.1-10.1C79.7,347.5,84,342.8,89.4,342.8z M56,400.4H40.4 c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1H56c5.4,0,10.1,4.3,10.1,10.1C65.7,395.7,61.4,400.4,56,400.4z M56,363H40.4 c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1H56c5.4,0,10.1,4.3,10.1,10.1C65.7,358.4,61.4,363,56,363z M56,325.7H40.4 c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1H56c5.4,0,10.1,4.3,10.1,10.1C65.7,321,61.4,325.7,56,325.7z M56,288H40.4 c-5.4,0-10.1-4.3-10.1-10.1c0-5.8,4.3-10.1,10.1-10.1H56c5.4,0,10.1,4.3,10.1,10.1C66.1,283.7,61.4,288,56,288z M56,241.3H40.4 c-5.4,0-10.1-4.3-10.1-10.1s4.3-10.1,10.1-10.1H56c5.4,0,10.1,4.3,10.1,10.1S61.4,241.3,56,241.3z M252.8,400.4H89.4 c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h163.3c5.4,0,10.1,4.3,10.1,10.1C262.9,395.7,258.2,400.4,252.8,400.4z M252.8,363h-15.6c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1 C262.9,358.4,258.2,363,252.8,363z M252.8,325.7h-15.6c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6 c5.4,0,10.1,4.3,10.1,10.1C262.9,321,258.2,325.7,252.8,325.7z M252.8,288h-15.6c-5.4,0-10.1-4.3-10.1-10.1 c0-5.8,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1C262.9,283.7,258.2,288,252.8,288z M302.2,400.4h-15.6 c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1C311.9,395.7,307.6,400.4,302.2,400.4z M302.2,363h-15.6c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1 C311.9,358.4,307.6,363,302.2,363z M302.2,325.7h-15.6c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6 c5.4,0,10.1,4.3,10.1,10.1C311.9,321,307.6,325.7,302.2,325.7z M302.2,288h-15.6c-5.4,0-10.1-4.3-10.1-10.1 c0-5.8,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1C312.3,283.7,307.6,288,302.2,288z M312.3,241.3h-15.6 c-5.4,0-10.1-4.3-10.1-10.1s4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1S317.7,241.3,312.3,241.3z M351.2,400.4h-15.6 c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1C361.3,395.7,356.6,400.4,351.2,400.4z M351.2,363h-15.6c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1 C361.3,358.4,356.6,363,351.2,363z M351.2,325.7h-15.6c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6 c5.4,0,10.1,4.3,10.1,10.1C361.3,321,356.6,325.7,351.2,325.7z M351.2,288h-15.6c-5.4,0-10.1-4.3-10.1-10.1 c0-5.8,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1C361.3,283.7,356.6,288,351.2,288z M357.8,241.3h-15.6 c-5.4,0-10.1-4.3-10.1-10.1s4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1S363.6,241.3,357.8,241.3z M400.6,400.4H385 c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1C410.3,395.7,406,400.4,400.6,400.4z M400.6,363H385c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1 C410.3,358.4,406,363,400.6,363z M400.6,325.7H385c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6 c5.4,0,10.1,4.3,10.1,10.1C410.3,321,406,325.7,400.6,325.7z M400.6,288H385c-5.4,0-10.1-4.3-10.1-10.1c0-5.8,4.3-10.1,10.1-10.1 h15.6c5.4,0,10.1,4.3,10.1,10.1C410.7,283.7,406,288,400.6,288z M403.7,241.3h-15.6c-5.4,0-10.1-4.3-10.1-10.1s4.3-10.1,10.1-10.1 h15.6c5.4,0,10.1,4.3,10.1,10.1C413.8,237,409.5,241.3,403.7,241.3z M449.6,400.4H434c-5.4,0-10.1-4.3-10.1-10.1 c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1C459.7,395.7,455,400.4,449.6,400.4z M449.6,363H434 c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1C459.7,358.4,455,363,449.6,363z M449.6,325.7 H434c-5.4,0-10.1-4.3-10.1-10.1c0-5.4,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1C459.7,321,455,325.7,449.6,325.7z M449.6,288H434c-5.4,0-10.1-4.3-10.1-10.1c0-5.8,4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1 C459.7,283.7,455,288,449.6,288z M449.6,241.3H434c-5.4,0-10.1-4.3-10.1-10.1s4.3-10.1,10.1-10.1h15.6c5.4,0,10.1,4.3,10.1,10.1 S455,241.3,449.6,241.3z"></path> </g> </g> </g></svg>
    `

    const img = new Image()
    img.src = `data:image/svg+xml;utf8,${encodeURIComponent(keyboardData)}`
    img.onload = () => {
      keyboardInputRef.current = img
    }
  }, [])

  // Add this ref near other refs
  const isPlayingRef = useRef(isPlaying)

  // Update ref when isPlaying changes
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  // Add this useEffect for right-click prevention
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (isPlayingRef.current) {
        e.preventDefault()
      }
    }

    window.addEventListener('contextmenu', handleContextMenu)
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  // Add this at the top of the component with other refs
  const lastFrameTime = useRef(Date.now())

  // Instead of checking every asteroid against every bullet/ship:
  const GRID_SIZE = 300 // Match typical asteroid size
  const grid = new Map<string, Asteroid[]>()

  asteroids.current.forEach((asteroid) => {
    const gridX = Math.floor(asteroid.x / GRID_SIZE)
    const gridY = Math.floor(asteroid.y / GRID_SIZE)
    const key = `${gridX},${gridY}`
    grid.set(key, [...(grid.get(key) || []), asteroid])
  })

  // Then only check collisions within same grid cell

  return (
    <div className="flex flex-col items-center gap-4">
      <MobileView>
        <h1>Please play on desktop, mobile is not supported yet</h1>
      </MobileView>
      <BrowserView>
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
            cursor: isPlaying && !isPaused ? 'none' : 'auto',
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
              <canvas
                ref={canvasRef}
                className="absolute left-0 top-0 h-full w-full"
                style={{
                  pointerEvents: isPlaying && !isPaused ? 'none' : 'auto',
                  padding: '20px',
                }}
              />
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
                  onClick={quitGame}
                  className="w-full rounded bg-red-600/30 px-4 py-2 hover:bg-red-700/30"
                >
                  Quit Game
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-400">Press ESC to resume</p>
            </div>
          )}

          {gameOver && (
            <div className="absolute left-1/2 top-1/2 flex w-[500px] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 break-all rounded-2xl border border-border bg-background/60 p-8 text-center backdrop-blur-sm">
              <h2 className="text-2xl font-bold">
                {username && username.length < 22 ? 'Game Over ' + username + '!' : 'Game Over!'}
              </h2>
              {username && username.length > 32 && (
                <p className="text-xl">
                  {username.slice(0, 10) + '...' + username.slice(username.length - 10)}
                </p>
              )}
              <p className="text-xl">Score: {scoreRef.current}</p>
              <Button variant={'outline'} onClick={startGame}>
                Play Again
              </Button>
              <Button variant={'outline'} onClick={quitGame}>
                Quit Game
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
      </BrowserView>
    </div>
  )
}

export default AsteroidsGame
