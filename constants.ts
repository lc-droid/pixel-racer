
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Player constants
export const PLAYER_WIDTH = 60;
export const PLAYER_HEIGHT = 40;
export const PLAYER_SPEED = 7;
export const JUMP_DURATION = 30; // in frames
export const JUMP_HEIGHT = 50;
export const BOOST_DURATION = 180; // in frames (3 seconds)
export const BOOST_SPEED_MULTIPLIER = 1.8;
export const EXPLOSION_DURATION = 40; // in frames

// Game constants
export const GAME_SPEED_START = 6;
export const GAME_SPEED_INCREMENT = 0.001;
export const LANE_COUNT = 3;
export const LANE_HEIGHT = 120;
export const ROAD_Y_OFFSET = GAME_HEIGHT / 2 - (LANE_COUNT * LANE_HEIGHT) / 2 + 50;


// Object constants
export const COIN_SIZE = 40;
export const OBSTACLE_WIDTH = 40;
export const OBSTACLE_HEIGHT = 40;
export const RAMP_WIDTH = 40;
export const RAMP_HEIGHT = 40;
export const BOOST_SIZE = 40;
export const SPAWN_INTERVAL = 80; // in frames
