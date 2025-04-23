"use client";
import RedirectDialog from "@/components/RedirectDialog";
import React, { useCallback, useEffect, useRef, useState } from "react";

// Wedge props interface
interface WedgeProps {
  angle: number;
  containerWidth: number;
  containerHeight: number;
  pacmanAngle: number;
  onReachedTarget: (success: boolean) => void;
}

// Wedge component that fits into Pac-Man's mouth
const Wedge: React.FC<WedgeProps> = ({
  angle,
  containerHeight,
  pacmanAngle,
  onReachedTarget,
}) => {
  const [position, setPosition] = useState(0);
  const animationRef = useRef<number | null>(null);
  const hasReachedTarget = useRef(false);

  useEffect(() => {
    const moveTowardsTarget = () => {
      if (hasReachedTarget.current) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }

      // Move towards target at a speed of 2 pixels per frame
      const speed = 2;
      setPosition((prev) => {
        const newPosition = prev + speed;

        // Check if we've reached the target (bottom of container)
        if (newPosition >= containerHeight) {
          hasReachedTarget.current = true;

          // Check if the wedge angle is aligned with pacman's mouth
          // Calculate the difference between angles, accounting for 360-degree wrapping
          const angleOffset = 50; // Adjust this value as needed
          let angleDiff = Math.abs(angle - angleOffset - pacmanAngle) % 360;
          if (angleDiff > 180) angleDiff = 360 - angleDiff;

          // If the difference is within 22.5 degrees, it's aligned
          const isAligned = angleDiff <= 22.5;

          onReachedTarget(isAligned);
          return containerHeight;
        }

        return newPosition;
      });

      animationRef.current = requestAnimationFrame(moveTowardsTarget);
    };

    animationRef.current = requestAnimationFrame(moveTowardsTarget);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [containerHeight, onReachedTarget, angle, pacmanAngle]);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: `${position}px`,
        transform: "translateX(-50%) rotate(-50deg)",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100"
        height="100"
        viewBox="0 0 100 100"
      >
        <path
          d="M50 50 L 90 50 A 40 40 0 0 0 61.7 10.3 L 50 50 Z"
          fill="#EDCA98"
          stroke="#863A18"
          strokeWidth="2"
        />
        <path
          d="M50 50 L 90 50 A 40 40 0 0 0 61.7 10.3 L 50 50 Z"
          fill="none"
          stroke="#C88A3B"
          strokeWidth="5"
          strokeDasharray="5,3"
          strokeDashoffset="10"
        />
        <ellipse
          cx="65"
          cy="30"
          rx="4"
          ry="3"
          fill="#B8A99D"
        />
        <ellipse
          cx="75"
          cy="40"
          rx="3.5"
          ry="2.5"
          fill="#B8A99D"
        />
        <ellipse
          cx="80"
          cy="25"
          rx="4"
          ry="3"
          fill="#B8A99D"
        />
        <path
          d="M65 30 Q 68 28, 70 25"
          stroke="#5F8D4E"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M75 40 Q 78 38, 80 35"
          stroke="#5F8D4E"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M65 20 Q 68 18, 70 15"
          stroke="#F8E8B0"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M80 30 Q 83 28, 85 25"
          stroke="#F8E8B0"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="70"
          cy="36"
          r="1"
          fill="#F5D76E"
          opacity="0.7"
        />
        <circle
          cx="78"
          cy="30"
          r="0.8"
          fill="#F5D76E"
          opacity="0.7"
        />
        <circle
          cx="65"
          cy="22"
          r="0.9"
          fill="#F5D76E"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};

// Custom hook to spawn wedges
const useWedges = (
  pacmanPosition: { x: number; y: number },
  pacmanSize: number,
  containerTopDistance: number,
  pacmanAngle: number,
  onScoreUpdate: (success: boolean, wedgeId: number) => void
) => {
  const [wedges, setWedges] = useState<
    Array<{
      id: number;
      angle: number;
    }>
  >([]);
  const nextWedgeId = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [spawnInterval, setSpawnInterval] = useState(2000); // Start with 2 seconds between spawns
  const lastSpawnTimeRef = useRef(0);

  // Function to generate a random angle
  const generateRandomAngle = () => {
    return Math.random() * 360;
  };

  // Spawn a new wedge
  const spawnWedge = useCallback((now: number) => {
    if (!containerRef.current) return;

    lastSpawnTimeRef.current = now;

    const newWedge = {
      id: nextWedgeId.current++,
      angle: generateRandomAngle(),
    };

    setWedges((prev) => [...prev, newWedge]);

    // Gradually decrease the spawn interval, but not below 200ms
    setSpawnInterval((prev) => Math.max(200, prev * 0.98));
  }, []);

  // Reset the game
  const resetGame = () => {
    setSpawnInterval(2000); // Reset spawn interval to initial value
    setWedges([]); // Clear all wedges
  };

  // Remove a wedge by ID and update score
  const handleWedgeReachedTarget = (id: number, success: boolean) => {
    setWedges((prev) => prev.filter((wedge) => wedge.id !== id));
    onScoreUpdate(success, id);

    // If not successful, reset the game
    if (!success) {
      resetGame();
    }
  };

  // Animation loop for spawning wedges at dynamic intervals
  useEffect(() => {
    let animationId: number;

    const animate = (timestamp: number) => {
      if (timestamp - lastSpawnTimeRef.current >= spawnInterval) {
        spawnWedge(timestamp);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [spawnInterval, lastSpawnTimeRef, spawnWedge]);

  // Calculate container dimensions
  const containerWidth = pacmanSize;
  const containerHeight = containerTopDistance + 100; // Distance to top + 100px

  return {
    wedges,
    handleWedgeReachedTarget,
    containerRef,
    containerWidth,
    containerHeight,
    resetGame,
  };
};

const PacMan = () => {
  const [angle, setAngle] = useState(0);
  const [continuousAngle, setContinuousAngle] = useState(0);
  const previousAngleRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pacmanPositionRef = useRef({ x: 0, y: 0 });
  const [pacmanSize] = useState(100);
  const [containerTopDistance, setContainerTopDistance] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  // Set to track wedges that have already been scored
  const processedWedgesRef = useRef<Set<number>>(new Set());

  // Function to calculate angle between two points
  const calculateAngle = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  };

  // Handle score updates with wedge ID tracking
  const handleScoreUpdate = (success: boolean, wedgeId: number) => {
    // Check if this wedge has already been processed
    if (processedWedgesRef.current.has(wedgeId)) {
      return; // Skip if already processed
    }

    // Mark this wedge as processed
    processedWedgesRef.current.add(wedgeId);

    if (success) {
      setScore((prev) => {
        const newScore = prev + 1;
        // Update high score if current score is higher
        if (newScore > highScore) {
          setHighScore(newScore);
        }
        return newScore;
      });
    } else {
      setScore(0); // Reset score on failure
      // Clear the processed wedges set on failure
      processedWedgesRef.current.clear();
    }
  };

  // Track angle changes and maintain continuity
  useEffect(() => {
    // Reset angle if it gets too large to prevent overflow
    if (Math.abs(continuousAngle) > 3600) {
      setContinuousAngle(angle);
      previousAngleRef.current = angle;
      return;
    }

    // Calculate the shortest path for rotation
    const angleDiff = angle - previousAngleRef.current;

    // Handle the case where angle jumps between 0 and 360
    if (Math.abs(angleDiff) > 180) {
      // If we're crossing the 0/360 boundary
      if (previousAngleRef.current > angle) {
        // Going from high to low (e.g., 359 to 1)
        setContinuousAngle(continuousAngle + (angleDiff + 360));
      } else {
        // Going from low to high (e.g., 1 to 359)
        setContinuousAngle(continuousAngle + (angleDiff - 360));
      }
    } else {
      // Normal case - just add the difference
      setContinuousAngle(continuousAngle + angleDiff);
    }

    // Update the reference for the next calculation
    previousAngleRef.current = angle;
  }, [angle, continuousAngle]);

  // Update Pac-Man position reference whenever the container size changes
  useEffect(() => {
    const updatePacmanPosition = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const pacmanY = (rect.height * 2) / 3;

      pacmanPositionRef.current = {
        x: rect.width / 2,
        y: pacmanY,
      };

      // Calculate distance from pacman to top of screen
      setContainerTopDistance(pacmanY);
    };

    updatePacmanPosition();

    window.addEventListener("resize", updatePacmanPosition);
    return () => window.removeEventListener("resize", updatePacmanPosition);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Get container dimensions and position
    const rect = containerRef.current.getBoundingClientRect();

    // Get pacman center coordinates (positioned at 1/3 up from bottom)
    const pacmanX = rect.width / 2;
    const pacmanY = (rect.height * 2) / 3;

    // Calculate angle from pacman to mouse
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate angle and add offset
    const newAngle =
      (calculateAngle(pacmanX, pacmanY, mouseX, mouseY) - 145) % 360;
    setAngle(newAngle < 0 ? newAngle + 360 : newAngle); // Normalize to 0-359
  };

  // Add this in the PacMan component, near your other useCallback hooks
  const preventDefaultTouchBehavior = useCallback((e: TouchEvent) => {
    e.preventDefault();
  }, []);

  // Add this handler
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // Add this line
    if (!containerRef.current) return;

    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();

      const pacmanX = rect.width / 2;
      const pacmanY = (rect.height * 2) / 3;

      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;

      const newAngle =
        (calculateAngle(pacmanX, pacmanY, touchX, touchY) + 180) % 360;
      setAngle(newAngle < 0 ? newAngle + 360 : newAngle); // Normalize to 0-359
    }
  };

  // Get the actual angle for pacman (normalized to 0-359)
  const normalizedPacmanAngle = (((continuousAngle + 3) % 360) + 360) % 360;

  // Use our custom wedges hook
  const {
    wedges,
    handleWedgeReachedTarget,
    containerRef: wedgesContainerRef,
    containerWidth,
    containerHeight,
  } = useWedges(
    pacmanPositionRef.current,
    pacmanSize,
    containerTopDistance,
    normalizedPacmanAngle,
    handleScoreUpdate
  );

  // Connect the wedges container ref to our main container ref
  useEffect(() => {
    if (containerRef.current) {
      wedgesContainerRef.current = containerRef.current;
    }
  }, [wedgesContainerRef]);

  useEffect(() => {
    // Disable touchmove on the document to prevent scrolling
    document.addEventListener("touchmove", preventDefaultTouchBehavior, {
      passive: false,
    });

    // Prevent pull-to-refresh on mobile browsers
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";

    return () => {
      // Clean up event listeners
      document.removeEventListener("touchmove", preventDefaultTouchBehavior);

      // Reset body styles
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [preventDefaultTouchBehavior]);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-gray-100 flex items-center justify-center"
      style={{ position: "relative", overflow: "hidden" }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
    >
      <RedirectDialog />
      {/* Score UI */}
      <div className="absolute top-4 left-0 right-0 flex justify-center items-center gap-8">
        <div className="bg-yellow-400 rounded-lg p-4 shadow-lg">
          <div className="text-center font-bold text-2xl">Score: {score}</div>
        </div>
        <div className="bg-blue-500 text-white rounded-lg p-4 shadow-lg">
          <div className="text-center font-bold text-2xl">
            High Score: {highScore}
          </div>
        </div>
      </div>

      {/* Render wedges with their containers */}
      {wedges.map((wedge) => (
        <div
          key={wedge.id}
          className=""
          style={{
            position: "absolute",
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
            left: "50%",
            top: "-13%", // Same position as pacman
            transformOrigin: "bottom center",
            transform: `translateX(-50%) rotate(${wedge.angle}deg)`,
            overflow: "visible",
          }}
        >
          <Wedge
            angle={wedge.angle}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
            pacmanAngle={normalizedPacmanAngle}
            onReachedTarget={(success) =>
              handleWedgeReachedTarget(wedge.id, success)
            }
          />
        </div>
      ))}

      {/* Render Pac-Man */}
      <div
        className="relative"
        style={{
          position: "absolute",
          left: "50%",
          top: "66.67%", // Positioned at 2/3 from the top (1/3 up from bottom)
          transform: "translate(-50%, -50%)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          viewBox="0 0 100 100"
          style={{
            transform: `rotate(${continuousAngle}deg)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <path
            d="M50 50 L 90 50 A 40 40 0 1 1 61.7 10.3 L 50 50 Z"
            fill="#EDCA98"
            stroke="#863A18"
            strokeWidth="2"
          />
          <path
            d="M50 50 L 90 50 A 40 40 0 1 1 61.7 10.3 L 50 50 Z"
            fill="none"
            stroke="#C88A3B"
            strokeWidth="5"
            strokeDasharray="5,3"
            strokeDashoffset="10"
          />
          <ellipse
            cx="30"
            cy="30"
            rx="4"
            ry="3"
            fill="#B8A99D"
          />
          <ellipse
            cx="25"
            cy="45"
            rx="3.5"
            ry="2.5"
            fill="#B8A99D"
          />
          <ellipse
            cx="15"
            cy="65"
            rx="4"
            ry="3"
            fill="#B8A99D"
          />
          <ellipse
            cx="82"
            cy="65"
            rx="3.5"
            ry="2.5"
            fill="#B8A99D"
          />
          <ellipse
            cx="75"
            cy="75"
            rx="4"
            ry="3"
            fill="#B8A99D"
          />
          <path
            d="M35 45 Q 38 42, 40 40"
            stroke="#5F8D4E"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M20 30 Q 23 28, 25 25"
            stroke="#5F8D4E"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M85 55 Q 88 52, 90 50"
            stroke="#5F8D4E"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M35 80 Q 38 78, 40 75"
            stroke="#5F8D4E"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M65 80 Q 68 78, 70 75"
            stroke="#5F8D4E"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M15 40 Q 20 35, 25 30"
            stroke="#F8E8B0"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M30 45 Q 35 40, 40 35"
            stroke="#F8E8B0"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M75 60 Q 80 65, 85 68"
            stroke="#F8E8B0"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M20 70 Q 25 75, 30 80"
            stroke="#F8E8B0"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M60 65 Q 65 70, 70 75"
            stroke="#F8E8B0"
            strokeWidth="1.5"
            fill="none"
          />
          <circle
            cx="32"
            cy="36"
            r="1"
            fill="#F5D76E"
            opacity="0.7"
          />
          <circle
            cx="23"
            cy="40"
            r="0.8"
            fill="#F5D76E"
            opacity="0.7"
          />
          <circle
            cx="37"
            cy="25"
            r="0.9"
            fill="#F5D76E"
            opacity="0.7"
          />
          <circle
            cx="80"
            cy="60"
            r="1"
            fill="#F5D76E"
            opacity="0.7"
          />
          <circle
            cx="65"
            cy="75"
            r="0.8"
            fill="#F5D76E"
            opacity="0.7"
          />
          <circle
            cx="18"
            cy="60"
            r="1"
            fill="#F5D76E"
            opacity="0.7"
          />
          <circle
            cx="45"
            cy="78"
            r="0.9"
            fill="#F5D76E"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
};

export default PacMan;
