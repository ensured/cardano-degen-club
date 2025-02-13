import { GAME_CONSTANTS } from './game-config'
import type { Asteroid, PowerUp, PowerUpType } from './types'

export const drawShip = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  isThrusting: boolean,
) => {
  ctx.save()
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
  ctx.lineTo(-wingSpan, shipSize * 0.8) // Left wing tip
  ctx.lineTo(-shipSize * 0.4, shipSize * 0.6) // Left inner wing
  ctx.lineTo(0, shipSize * 0.4) // Rear center
  ctx.lineTo(shipSize * 0.4, shipSize * 0.6) // Right inner wing
  ctx.lineTo(wingSpan, shipSize * 0.8) // Right wing tip
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
    const thrustLength = shipSize * 2.5
    const thrustWidth = shipSize * 1.2

    // Main thrust gradient
    const thrustGradient = ctx.createLinearGradient(0, 0, 0, thrustLength)
    thrustGradient.addColorStop(0, 'rgba(255, 100, 0, 0.9)') // Core color
    thrustGradient.addColorStop(0.3, 'rgba(255, 200, 0, 0.5)') // Middle glow
    thrustGradient.addColorStop(1, 'rgba(255, 80, 0, 0)') // Fade out

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

  // Add hitbox visualization
  ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(0, 0, 10, 0, Math.PI * 2) // Visualize collision radius
  ctx.stroke()

  // Add pulsating core for better orientation
  const pulse = Math.sin(Date.now() / 100) * 0.5 + 1.5
  ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
  ctx.beginPath()
  ctx.arc(0, 0, 3 * pulse, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

const rotatePoint = (point: { x: number; y: number }, angle: number) => {
  return {
    x: Math.cos(angle) * point.x - Math.sin(angle) * point.y,
    y: Math.sin(angle) * point.x + Math.cos(angle) * point.y,
  }
}

export const drawAsteroid = (ctx: CanvasRenderingContext2D, asteroid: Asteroid) => {
  // Health-based color
  const healthColor = `hsl(${30 * (asteroid.health / asteroid.initialHealth)}, 100%, 70%)`
  ctx.strokeStyle = healthColor

  // Draw asteroid shape
  ctx.beginPath()
  const startPoint = rotatePoint(asteroid.points[0], asteroid.rotation)
  ctx.moveTo(asteroid.x + startPoint.x, asteroid.y + startPoint.y)
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
    // ctx.fillStyle = 'white'
    // ctx.font = '12px Arial'
    // ctx.textAlign = 'center'
    // ctx.fillText(
    //   `${Math.ceil(asteroid.health)}/${asteroid.initialHealth}`,
    //   asteroid.x,
    //   asteroid.y + yOffset + barHeight + 14,
    // )
  }

  if (asteroid.isBoss) {
    // Pulsing core glow
    const pulse = Math.sin(Date.now() / 200) * 0.5 + 0.5
    const coreGradient = ctx.createRadialGradient(
      asteroid.x,
      asteroid.y,
      0,
      asteroid.x,
      asteroid.y,
      asteroid.size,
    )
    coreGradient.addColorStop(0, `rgba(255, 0, 0, ${0.4 + pulse * 0.3})`)
    coreGradient.addColorStop(1, 'rgba(255, 0, 0, 0)')

    ctx.fillStyle = coreGradient
    ctx.beginPath()
    ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2)
    ctx.fill()

    // Energy particles
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = asteroid.size * (0.8 + Math.random() * 0.2)
      ctx.fillStyle = `rgba(255, ${Math.random() * 100}, 0, ${0.5})`
      ctx.beginPath()
      ctx.arc(
        asteroid.x + Math.cos(angle) * radius,
        asteroid.y + Math.sin(angle) * radius,
        2 + Math.random() * 3,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
  }
}

export const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUp) => {
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
