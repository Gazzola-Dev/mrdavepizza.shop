"use client";
import React, { useEffect, useRef, useState } from "react";

const PacMan = () => {
  const [angle, setAngle] = useState(0);
  const [continuousAngle, setContinuousAngle] = useState(0);
  const previousAngleRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to calculate angle between two points
  const calculateAngle = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
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
  }, [angle]);

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

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
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

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-gray-100 flex items-center justify-center"
      style={{ position: "relative", overflow: "hidden" }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
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
          width="100"
          height="100"
          viewBox="0 0 100 100"
          style={{
            transform: `rotate(${continuousAngle + 3}deg)`,
            transition: "transform 0.05s ease-out",
          }}
        >
          <path
            d="M50 50
             L 90 50
             A 40 40 0 1 1 61.7 10.3
             L 50 50 Z"
            fill="yellow"
            stroke="black"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
};

export default PacMan;
