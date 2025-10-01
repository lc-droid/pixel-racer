import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Player, GameObject, KeysPressed, Particle } from '../types';
import { GameObjectType } from '../types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  LANE_COUNT,
  LANE_HEIGHT,
  ROAD_Y_OFFSET,
  GAME_SPEED_START,
  GAME_SPEED_INCREMENT,
  SPAWN_INTERVAL,
  COIN_SIZE,
  OBSTACLE_WIDTH,
  OBSTACLE_HEIGHT,
  RAMP_WIDTH,
  RAMP_HEIGHT,
  JUMP_DURATION,
  JUMP_HEIGHT,
  BOOST_DURATION,
  BOOST_SPEED_MULTIPLIER,
  BOOST_SIZE,
  EXPLOSION_DURATION,
} from '../constants';

interface GameProps {
  onGameOver: (scores: { player1: number; player2: number }) => void;
}

const Game: React.FC<GameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameFrameRef = useRef<number>(0);
  const gameSpeedRef = useRef<number>(GAME_SPEED_START);
  const spawnTimerRef = useRef<number>(0);

  const keysPressedRef = useRef<KeysPressed>({});
  const playersRef = useRef<Player[]>([]);
  const gameObjectsRef = useRef<GameObject[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const getLaneCenterY = (lane: number) => {
    return ROAD_Y_OFFSET + lane * LANE_HEIGHT + LANE_HEIGHT / 2;
  };

  const initGame = useCallback(() => {
    gameFrameRef.current = 0;
    gameSpeedRef.current = GAME_SPEED_START;
    spawnTimerRef.current = 0;
    gameObjectsRef.current = [];
    particlesRef.current = [];

    playersRef.current = [
      {
        id: 1,
        position: { x: 100, y: getLaneCenterY(0) - PLAYER_HEIGHT / 2 },
        size: { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
        speed: PLAYER_SPEED,
        score: 0,
        isAlive: true,
        isJumping: false,
        jumpTime: 0,
        lane: 0,
        isBoosting: false,
        boostTimer: 0,
        isExploding: false,
        explosionFrame: 0,
        explosionTimer: 0,
      },
      {
        id: 2,
        position: { x: 100, y: getLaneCenterY(2) - PLAYER_HEIGHT / 2 },
        size: { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
        speed: PLAYER_SPEED,
        score: 0,
        isAlive: true,
        isJumping: false,
        jumpTime: 0,
        lane: 2,
        isBoosting: false,
        boostTimer: 0,
        isExploding: false,
        explosionFrame: 0,
        explosionTimer: 0,
      },
    ];
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleKeyDown = (e: KeyboardEvent) => {
    keysPressedRef.current[e.key.toLowerCase()] = true;
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    keysPressedRef.current[e.key.toLowerCase()] = false;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const updatePlayers = () => {
    playersRef.current.forEach(player => {
      if (!player.isAlive) {
        if (player.isExploding) {
          player.explosionTimer++;
          if (player.explosionTimer >= EXPLOSION_DURATION) {
              player.isExploding = false;
          }
        }
        return;
      }

      const keys = keysPressedRef.current;
      const targetY = getLaneCenterY(player.lane) - player.size.height / 2;
      const currentSpeed = player.isBoosting ? player.speed * BOOST_SPEED_MULTIPLIER : player.speed;
      
      if (player.id === 1) { 
        if (keys['a']) player.position.x -= currentSpeed;
        if (keys['d']) player.position.x += currentSpeed;
      } else {
        if (keys['arrowleft']) player.position.x -= currentSpeed;
        if (keys['arrowright']) player.position.x += currentSpeed;
      }

      const changeLaneUp = (player.id === 1 && keys['w']) || (player.id === 2 && keys['arrowup']);
      const changeLaneDown = (player.id === 1 && keys['s']) || (player.id === 2 && keys['arrowdown']);

      if (changeLaneUp && player.lane > 0) {
        player.lane--;
        if (player.id === 1) keys['w'] = false; else keys['arrowup'] = false;
      }
      if (changeLaneDown && player.lane < LANE_COUNT - 1) {
        player.lane++;
        if (player.id === 1) keys['s'] = false; else keys['arrowdown'] = false;
      }
      
      if (Math.abs(player.position.y - targetY) > currentSpeed) {
        player.position.y += Math.sign(targetY - player.position.y) * currentSpeed;
      } else {
        player.position.y = targetY;
      }

      player.position.x = Math.max(0, Math.min(GAME_WIDTH - player.size.width, player.position.x));

      if (player.isJumping) {
        player.jumpTime++;
        if (player.jumpTime > JUMP_DURATION) {
          player.isJumping = false;
          player.jumpTime = 0;
        }
      }

      if (player.isBoosting) {
        player.boostTimer++;
        if (player.boostTimer > BOOST_DURATION) {
            player.isBoosting = false;
            player.boostTimer = 0;
        }
        if (gameFrameRef.current % 2 === 0) {
            particlesRef.current.push({
                x: player.position.x,
                y: player.position.y + player.size.height / 2 + (Math.random() - 0.5) * 10,
                size: Math.random() * 5 + 2,
                lifetime: 30,
                color: ['#FFFF00', '#FFD700', '#FFA500'][Math.floor(Math.random() * 3)],
                vx: -gameSpeedRef.current,
                vy: (Math.random() - 0.5) * 2,
            });
        }
      }
    });
  };
  
  const spawnGameObjects = () => {
    spawnTimerRef.current++;
    if (spawnTimerRef.current < SPAWN_INTERVAL) return;

    spawnTimerRef.current = 0;
    const rowLayout: (GameObjectType | null)[] = Array(LANE_COUNT).fill(null);

    if (Math.random() < 0.2) {
        for (let i = 0; i < LANE_COUNT; i++) rowLayout[i] = GameObjectType.OBSTACLE;
        const rampIndex = Math.floor(Math.random() * LANE_COUNT);
        rowLayout[rampIndex] = GameObjectType.RAMP;
    } else {
        for (let i = 0; i < LANE_COUNT; i++) {
            const rand = Math.random();
            if (rand < 0.25) {
                rowLayout[i] = GameObjectType.OBSTACLE;
            } else if (rand < 0.45) {
                rowLayout[i] = GameObjectType.COIN;
            } else if (rand < 0.50) {
                rowLayout[i] = GameObjectType.SPEED_BOOST;
            }
        }
    }

    rowLayout.forEach((type, lane) => {
        if (!type) return;

        let newObject: GameObject | null = null;
        const yPos = getLaneCenterY(lane);

        if (type === GameObjectType.OBSTACLE) {
            newObject = { id: Date.now() + lane, type, position: { x: GAME_WIDTH + 100, y: yPos - OBSTACLE_HEIGHT / 2 }, size: { width: OBSTACLE_WIDTH, height: OBSTACLE_HEIGHT } };
        } else if (type === GameObjectType.RAMP) {
            newObject = { id: Date.now() + lane, type, position: { x: GAME_WIDTH + 100, y: yPos - RAMP_HEIGHT / 2 }, size: { width: RAMP_WIDTH, height: RAMP_HEIGHT } };
        } else if (type === GameObjectType.COIN) {
            newObject = { id: Date.now() + lane, type, position: { x: GAME_WIDTH + 100, y: yPos - COIN_SIZE / 2 }, size: { width: COIN_SIZE, height: COIN_SIZE } };
        } else if (type === GameObjectType.SPEED_BOOST) {
            newObject = { id: Date.now() + lane, type, position: { x: GAME_WIDTH + 100, y: yPos - BOOST_SIZE / 2 }, size: { width: BOOST_SIZE, height: BOOST_SIZE } };
        }
        
        if (newObject) gameObjectsRef.current.push(newObject);
    });
  };

  const updateGameObjects = () => {
    gameObjectsRef.current.forEach(obj => {
      obj.position.x -= gameSpeedRef.current;
    });
    gameObjectsRef.current = gameObjectsRef.current.filter(obj => obj.position.x > -obj.size.width);
  };
  
  const checkCollisions = () => {
    playersRef.current.forEach(player => {
        if (!player.isAlive) return;

        const playerBox = { x: player.position.x, y: player.position.y, width: player.size.width, height: player.size.height };

        gameObjectsRef.current = gameObjectsRef.current.filter(obj => {
            const objBox = { x: obj.position.x, y: obj.position.y, width: obj.size.width, height: obj.size.height };
            if (
                playerBox.x < objBox.x + objBox.width &&
                playerBox.x + playerBox.width > objBox.x &&
                playerBox.y < objBox.y + objBox.height &&
                playerBox.y + playerBox.height > objBox.y
            ) {
                if (obj.type === GameObjectType.COIN) {
                    player.score += 10;
                    return false; 
                } else if (obj.type === GameObjectType.OBSTACLE && !player.isJumping) {
                    player.isAlive = false;
                    player.isExploding = true;
                    player.explosionTimer = 0;
                } else if (obj.type === GameObjectType.RAMP && !player.isJumping) {
                    player.isJumping = true;
                    player.jumpTime = 0;
                } else if (obj.type === GameObjectType.SPEED_BOOST) {
                    player.isBoosting = true;
                    player.boostTimer = 0;
                    return false;
                }
            }
            return true;
        });
    });
  };

  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.lifetime--;
        p.size *= 0.98;
        if (p.lifetime <= 0 || p.size < 1) {
            particlesRef.current.splice(index, 1);
        } else {
            ctx.globalAlpha = p.lifetime / 30;
            ctx.fillStyle = p.color;
            ctx.font = `${Math.floor(p.size)}px 'Press Start 2P'`;
            ctx.fillText('.', p.x, p.y);
        }
    });
    ctx.globalAlpha = 1.0;
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    ctx.fillStyle = '#444';
    ctx.fillRect(0, ROAD_Y_OFFSET, GAME_WIDTH, LANE_COUNT * LANE_HEIGHT);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 5;
    ctx.setLineDash([40, 30]);
    for (let i = 1; i < LANE_COUNT; i++) {
        const lineY = ROAD_Y_OFFSET + i * LANE_HEIGHT;
        const lineOffset = -(gameFrameRef.current * gameSpeedRef.current) % 70;
        ctx.lineDashOffset = lineOffset;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(GAME_WIDTH, lineY);
        ctx.stroke();
    }
    ctx.setLineDash([]);

    updateAndDrawParticles(ctx);

    const baseFontSize = 40;
    ctx.font = `${baseFontSize}px 'Press Start 2P'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    gameObjectsRef.current.forEach(obj => {
        const drawX = obj.position.x + obj.size.width / 2;
        const drawY = obj.position.y + obj.size.height / 2;
        switch(obj.type) {
            case GameObjectType.OBSTACLE:
                ctx.fillStyle = '#EF4444'; // red-500
                ctx.fillText('O', drawX, drawY);
                break;
            case GameObjectType.RAMP:
                ctx.fillStyle = '#F59E0B'; // amber-500
                ctx.fillText('R', drawX, drawY);
                break;
            case GameObjectType.COIN:
                ctx.fillStyle = '#FBBF24'; // amber-400
                ctx.fillText('$', drawX, drawY);
                break;
            case GameObjectType.SPEED_BOOST:
                ctx.fillStyle = '#8B5CF6'; // violet-500
                ctx.fillText('>', drawX, drawY);
                break;
        }
    });
    
    playersRef.current.forEach(player => {
        if (player.isExploding) {
            const progress = player.explosionTimer / EXPLOSION_DURATION;
            const size = 20 + progress * 80;
            ctx.globalAlpha = 1 - progress;
            ctx.fillStyle = 'white';
            ctx.font = `${size}px 'Press Start 2P'`;
            ctx.fillText('*', player.position.x + player.size.width/2, player.position.y + player.size.height/2);
            ctx.globalAlpha = 1;

        } else if (player.isAlive) {
            let yPos = player.position.y;
            if (player.isJumping) {
                const jumpProgress = player.jumpTime / JUMP_DURATION;
                const jumpArc = Math.sin(jumpProgress * Math.PI);
                yPos -= jumpArc * JUMP_HEIGHT;
            }
            
            ctx.font = `${baseFontSize}px 'Press Start 2P'`;
            ctx.fillStyle = player.id === 1 ? '#34D399' : '#60A5FA'; // green-400, blue-400
            ctx.fillText(
              player.id === 1 ? 'P1' : 'P2',
              player.position.x + player.size.width / 2,
              yPos + player.size.height / 2
            );
        }
    });

    ctx.fillStyle = 'white';
    ctx.font = "30px 'Press Start 2P'";
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 7;
    ctx.fillText(`P1: ${playersRef.current[0]?.score || 0}`, 20, 40);
    ctx.textAlign = 'right';
    ctx.fillText(`P2: ${playersRef.current[1]?.score || 0}`, GAME_WIDTH - 20, 40);
    ctx.shadowBlur = 0;
  };
  
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    gameFrameRef.current++;
    gameSpeedRef.current += GAME_SPEED_INCREMENT;

    updatePlayers();
    spawnGameObjects();
    updateGameObjects();
    checkCollisions();

    draw(ctx);
    
    const allDead = playersRef.current.every(p => !p.isAlive);
    if (allDead && playersRef.current.length > 0) {
        const explosionsDone = playersRef.current.every(p => !p.isExploding);
        if (explosionsDone) {
            onGameOver({ player1: playersRef.current[0].score, player2: playersRef.current[1].score });
            return;
        }
    }
    requestAnimationFrame(gameLoop);
  }, [onGameOver]);

  useEffect(() => {
    requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  return (
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="bg-gray-800 w-full h-full" />
  );
};

export default Game;