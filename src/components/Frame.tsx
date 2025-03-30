"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useFrameSDK } from "~/hooks/useFrameSDK";

// Game constants
const GRID_SIZE = 15;
const CELL_SIZE = 18;
const GAME_SPEED = 150;
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

function SnakeGame() {
  const [snake, setSnake] = useState([{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }]);
  const [food, setFood] = useState({ x: 10, y: 7 });
  const [direction, setDirection] = useState(DIRECTIONS.RIGHT);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Generate random food position
  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    return newFood;
  };

  // Move the snake one step
  const moveSnake = () => {
    if (gameOver || isPaused) return;
    
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    
    // Move head in current direction
    head.x += direction.x;
    head.y += direction.y;
    
    // Check for wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      setGameOver(true);
      return;
    }
    
    // Check for self collision
    for (let i = 0; i < newSnake.length; i++) {
      if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
        setGameOver(true);
        return;
      }
    }
    
    // Add new head
    newSnake.unshift(head);
    
    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
      setScore(score + 10);
      setFood(generateFood());
    } else {
      // Remove tail if no food eaten
      newSnake.pop();
    }
    
    setSnake(newSnake);
  };

  // Handle direction button clicks
  const handleDirectionClick = (newDirection: typeof direction) => {
    // Prevent 180-degree turns
    if (
      (direction === DIRECTIONS.UP && newDirection === DIRECTIONS.DOWN) ||
      (direction === DIRECTIONS.DOWN && newDirection === DIRECTIONS.UP) ||
      (direction === DIRECTIONS.LEFT && newDirection === DIRECTIONS.RIGHT) ||
      (direction === DIRECTIONS.RIGHT && newDirection === DIRECTIONS.LEFT)
    ) {
      return;
    }
    
    setDirection(newDirection);
  };

  // Reset game
  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }]);
    setDirection(DIRECTIONS.RIGHT);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Move snake on button click
  const handleMove = () => {
    moveSnake();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-center">
        <p className="font-semibold">Score: {score}</p>
        {(gameOver || isPaused) && (
          <p className="text-sm font-medium text-red-500">
            {gameOver ? "Game Over!" : "Paused"}
          </p>
        )}
      </div>
      
      <div 
        className="border-2 border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 relative"
        style={{ 
          width: GRID_SIZE * CELL_SIZE, 
          height: GRID_SIZE * CELL_SIZE 
        }}
      >
        {/* Render food */}
        <div 
          className="absolute bg-red-500 rounded-full"
          style={{
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            left: food.x * CELL_SIZE + 1,
            top: food.y * CELL_SIZE + 1,
          }}
        />
        
        {/* Render snake */}
        {snake.map((segment, index) => (
          <div 
            key={index}
            className={`absolute ${index === 0 ? 'bg-green-700' : 'bg-green-500'} rounded-sm`}
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE + 1,
              top: segment.y * CELL_SIZE + 1,
            }}
          />
        ))}
      </div>
      
      {/* Game controls */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-[200px]">
        <div></div>
        <Button 
          size="sm"
          onClick={() => handleDirectionClick(DIRECTIONS.UP)}
          disabled={gameOver}
        >
          ↑
        </Button>
        <div></div>
        
        <Button 
          size="sm"
          onClick={() => handleDirectionClick(DIRECTIONS.LEFT)}
          disabled={gameOver}
        >
          ←
        </Button>
        
        <Button 
          size="sm"
          onClick={gameOver ? resetGame : togglePause}
        >
          {gameOver ? "Reset" : (isPaused ? "Play" : "Pause")}
        </Button>
        
        <Button 
          size="sm"
          onClick={() => handleDirectionClick(DIRECTIONS.RIGHT)}
          disabled={gameOver}
        >
          →
        </Button>
        
        <div></div>
        <Button 
          size="sm"
          onClick={() => handleDirectionClick(DIRECTIONS.DOWN)}
          disabled={gameOver}
        >
          ↓
        </Button>
        <div></div>
      </div>
      
      <Button 
        className="mt-2"
        onClick={handleMove}
        disabled={gameOver || isPaused}
      >
        Move
      </Button>
      
      <div className="mt-2 text-xs text-center text-gray-500">
        <p>Use buttons to control direction</p>
        <p>Press "Move" to advance the snake</p>
      </div>
    </div>
  );
}

export default function Frame() {
  const { isSDKLoaded } = useFrameSDK();

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-2 px-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-center">Snake Game</CardTitle>
          <CardDescription className="text-center">
            Play the classic snake game!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SnakeGame />
        </CardContent>
      </Card>
    </div>
  );
}
