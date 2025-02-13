export type PowerUpType = 'spreadShot' | 'rapidFire' | 'shield' | 'speedBoost' | 'laser'

export interface PowerUp {
  x: number
  y: number
  type: PowerUpType
  createdAt: number
}

export interface Asteroid {
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
}

export interface Bullet {
  x: number
  y: number
  dx: number
  dy: number
  damage: number
}

export interface ExplosionParticle {
  x: number
  y: number
  dx: number
  dy: number
  size: number
  createdAt: number
  color?: string
}

export interface DisintegrationParticle {
  x: number
  y: number
  dx: number
  dy: number
  size: number
  rotation: number
  rotationSpeed: number
  createdAt: number
}

export interface BossBullet {
  x: number
  y: number
  dx: number
  dy: number
  createdAt: number
}
