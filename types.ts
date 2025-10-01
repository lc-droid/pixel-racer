
export interface Vector2D {
  x: number;
  y: number;
}

export interface Player {
  id: number;
  position: Vector2D;
  size: { width: number; height: number };
  speed: number;
  score: number;
  isAlive: boolean;
  isJumping: boolean;
  jumpTime: number;
  lane: number;
  // New properties for boost and explosion
  isBoosting: boolean;
  boostTimer: number;
  isExploding: boolean;
  explosionFrame: number;
  explosionTimer: number;
}

export enum GameObjectType {
  COIN = 'COIN',
  OBSTACLE = 'OBSTACLE',
  RAMP = 'RAMP',
  SPEED_BOOST = 'SPEED_BOOST',
}

export interface GameObject {
  id: number;
  type: GameObjectType;
  position: Vector2D;
  size: { width: number; height: number };
}

export interface KeysPressed {
  [key: string]: boolean;
}

export type GameStatus = 'menu' | 'playing' | 'gameOver';

export interface Particle {
    x: number;
    y: number;
    size: number;
    lifetime: number;
    color: string;
    vx: number;
    vy: number;
}