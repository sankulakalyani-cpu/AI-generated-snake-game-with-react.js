import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

type Point = { x: number; y: number };

const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (!snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)) {
      break;
    }
  }
  return newFood;
};

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastMoveTimeRef = useRef<number>(0);

  // React state for UI
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Mutable refs for game loop to avoid dependency issues
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const dirRef = useRef<Point>(INITIAL_DIRECTION);
  const nextDirRef = useRef<Point>(INITIAL_DIRECTION);
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);

  const resetGame = () => {
    snakeRef.current = INITIAL_SNAKE;
    dirRef.current = INITIAL_DIRECTION;
    nextDirRef.current = INITIAL_DIRECTION;
    foodRef.current = generateFood(INITIAL_SNAKE);
    gameOverRef.current = false;
    pausedRef.current = false;
    
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    lastMoveTimeRef.current = performance.now();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameOverRef.current) return;

    const { x, y } = dirRef.current;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        if (y !== 1) nextDirRef.current = { x: 0, y: -1 };
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        if (y !== -1) nextDirRef.current = { x: 0, y: 1 };
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        if (x !== 1) nextDirRef.current = { x: -1, y: 0 };
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        if (x !== -1) nextDirRef.current = { x: 1, y: 0 };
        break;
      case ' ':
        e.preventDefault();
        pausedRef.current = !pausedRef.current;
        setIsPaused(pausedRef.current);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const update = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;

    const currentSnake = [...snakeRef.current];
    const head = { ...currentSnake[0] };
    dirRef.current = nextDirRef.current;

    head.x += dirRef.current.x;
    head.y += dirRef.current.y;

    // Check collision with walls
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      gameOverRef.current = true;
      setGameOver(true);
      return;
    }

    // Check collision with self
    if (currentSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      gameOverRef.current = true;
      setGameOver(true);
      return;
    }

    currentSnake.unshift(head);

    // Check food collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore((s) => {
        const newScore = s + 10;
        setHighScore((h) => Math.max(h, newScore));
        return newScore;
      });
      foodRef.current = generateFood(currentSnake);
    } else {
      currentSnake.pop();
    }

    snakeRef.current = currentSnake;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }

    // Draw food
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#d946ef';
    ctx.fillStyle = '#d946ef';
    ctx.fillRect(foodRef.current.x * CELL_SIZE + 2, foodRef.current.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

    // Draw snake
    snakeRef.current.forEach((segment, index) => {
      const isHead = index === 0;
      ctx.shadowBlur = isHead ? 15 : 5;
      ctx.shadowColor = '#22d3ee';
      ctx.fillStyle = isHead ? '#22d3ee' : 'rgba(8, 145, 178, 0.8)';
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });

    ctx.shadowBlur = 0;
  }, []);

  const gameLoop = useCallback((time: number) => {
    if (!lastMoveTimeRef.current) lastMoveTimeRef.current = time;
    const deltaTime = time - lastMoveTimeRef.current;

    if (deltaTime >= GAME_SPEED) {
      update();
      lastMoveTimeRef.current = time;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  // Initial setup
  useEffect(() => {
    foodRef.current = generateFood(INITIAL_SNAKE);
  }, []);

  return (
    <div id="snake-game-container" className="flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-fuchsia-500/30 shadow-[0_0_30px_rgba(217,70,239,0.15)]">
      <div id="score-board" className="flex justify-between w-full max-w-[400px] mb-4 text-cyan-400 font-mono">
        <div id="current-score-container" className="flex flex-col">
          <span id="score-label" className="text-xs uppercase tracking-widest text-cyan-400/60">Score</span>
          <span id="score-value" className="text-2xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        <div id="high-score-container" className="flex flex-col items-end">
          <span id="high-score-label" className="text-xs uppercase tracking-widest text-fuchsia-400/60">High Score</span>
          <span id="high-score-value" className="text-2xl font-bold text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]">
            {highScore.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      <div
        id="canvas-wrapper"
        className="relative bg-gray-900/80 border-2 border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
      >
        <canvas
          id="snake-canvas"
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
        />

        {gameOver && (
          <div id="game-over-overlay" className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm z-20">
            <h2 id="game-over-title" className="text-4xl font-black text-red-500 mb-2 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              Game Over
            </h2>
            <p id="final-score" className="text-cyan-400 mb-6 font-mono">Final Score: {score}</p>
            <motion.button
              id="play-again-btn"
              onClick={resetGame}
              animate={{
                boxShadow: [
                  "0px 0px 10px rgba(34,211,238,0.4)",
                  "0px 0px 30px rgba(34,211,238,1)",
                  "0px 0px 10px rgba(34,211,238,0.4)"
                ]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(34,211,238,1)", color: "#000" }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-transparent border border-cyan-400 text-cyan-400 font-mono uppercase tracking-widest rounded transition-colors duration-300"
            >
              Play Again
            </motion.button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div id="pause-overlay" className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-20">
            <h2 id="pause-title" className="text-3xl font-bold text-cyan-400 uppercase tracking-widest animate-pulse">
              Paused
            </h2>
          </div>
        )}
      </div>

      <div id="game-controls-info" className="mt-6 text-gray-500 font-mono text-xs text-center">
        <p>Use <span className="text-cyan-500">W A S D</span> or <span className="text-cyan-500">Arrow Keys</span> to move.</p>
        <p>Press <span className="text-fuchsia-500">Space</span> to pause.</p>
      </div>
    </div>
  );
}
