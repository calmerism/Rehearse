'use client';

import React, { useEffect, useState } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  barCount = 18,
}) => {
  const [levels, setLevels] = useState<number[]>(() =>
    Array(barCount).fill(4)
  );

  useEffect(() => {
    if (!isActive) {
      setLevels(Array(barCount).fill(4));
      return;
    }

    const interval = setInterval(() => {
      setLevels(
        Array.from({ length: barCount }, () =>
          Math.floor(Math.random() * 20) + 4
        )
      );
    }, 90);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (
    <div className="flex items-center justify-center gap-[3px] h-8 px-4 py-1">
      {levels.map((height, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full transition-all duration-100 ${
            isActive
              ? 'bg-apple-amber-500'
              : 'bg-neutral-300 dark:bg-neutral-700'
          }`}
          style={{
            height: `${height}px`,
            opacity: isActive ? 0.7 + (height / 24) * 0.3 : 0.3,
          }}
        />
      ))}
    </div>
  );
};
