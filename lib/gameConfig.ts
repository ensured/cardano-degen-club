export const GAME_CONSTANTS = {
  SHOT_COOLDOWN: 150,
  DIFFICULTY_SCORE_INTERVAL: 2000,
  MAX_ROTATION_SPEED: 0.05,
  ROTATION_ACCELERATION: 0.003,
  ROTATION_FRICTION: 0.93,
  POWER_UP_DURATION: 15000,
  POWER_UP_DROP_CHANCE: 0.05,
  POWER_UP_LIFETIME: 15000,
  POWER_UP_BLINK_START: 3000,
  SHIP_SIZE: 12,
  THRUST_POWER: 0.02,
  FRICTION: 0.988,
  LASER_RANGE: 300,
  LASER_DAMAGE_INTERVAL: 50,
  LASER_DAMAGE_PER_TICK: 0.25,
  ASTEROID_COLLISION_FACTOR: 0.8,
  BULLET_DAMAGE: 1,
  BOSS_SPAWN_INTERVAL: 3,
  MAX_BOSSES: 1,
  MAX_ASTEROIDS: 20,
  BOSS_BULLET_DAMAGE: 1,
  BOSS_BULLET_SPEED: 3,
  BOSS_ATTACK_COOLDOWN: 2000,
  BOSS_HEALTH_MULTIPLIER: 5,
  SHIELD_BASE_HEALTH: 120,
  SHIELD_DAMAGE_NORMAL: 100,
  SHIELD_DAMAGE_BOSS: 250,
  SHIP_COLLISION_RADIUS: 25,
  SHIELD_VULNERABILITY: 0.2,
} as const

export type PowerUpType = 'spreadShot' | 'rapidFire' | 'shield' | 'speedBoost' | 'laser'

export const COLORS = {
  powerUps: {
    spreadShot: '#00ff00',
    rapidFire: '#ff0000',
    shield: '#0000ff',
    speedBoost: '#ffff00',
    laser: '#ff00ff',
  },
  particles: {
    shieldSpark: 'hsl(210, 100%, 50%)',
    laserCore: 'hsla(300, 100%, 70%, 0.9)',
    laserEdge: 'hsla(280, 100%, 50%, 0.5)',
  },
}

export const DIFFICULTY_SCALING = (level: number) => ({
  asteroidSpeed: Math.min(0.3 + level * 0.1, 1.2),
  asteroidSpawnRate: Math.min(0.005 + level * 0.002, 0.02),
  asteroidSizeRange: {
    min: Math.max(10, 20 - level * 2),
    max: Math.max(20, 50 - level * 3),
  },
})
