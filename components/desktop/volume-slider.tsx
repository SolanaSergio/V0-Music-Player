'use client';

import { Volume2, VolumeX } from "lucide-react";
import * as RadixSlider from "@radix-ui/react-slider";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ElementRef, useEffect, useRef, useState } from "react";

interface VolumeSliderProps {
  value: number;      // Value between 0-100
  onChange: (value: number) => void;
}

export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const scale = useMotionValue(1);
  const ref = useRef<ElementRef<typeof RadixSlider.Root>>(null);

  // Handle hover animations
  useEffect(() => {
    if (isHovered || isDragging) {
      animate(scale, 1.1);
    } else {
      animate(scale, 1);
    }
  }, [isHovered, isDragging, scale]);

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        scale,
        opacity: useTransform(scale, [1, 1.1], [0.7, 1]),
      }}
      className="flex w-[140px] touch-none select-none items-center justify-center gap-2"
    >
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(value === 0 ? 50 : 0)}
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent/50"
      >
        {value === 0 ? (
          <VolumeX className="h-4 w-4 text-foreground" />
        ) : (
          <Volume2 className="h-4 w-4 text-foreground" />
        )}
      </motion.button>

      <RadixSlider.Root
        ref={ref}
        defaultValue={[value]}
        value={[value]}
        max={100}
        step={1}
        onValueChange={([newValue]) => onChange(newValue)}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        className="relative flex h-8 w-full items-center"
      >
        <RadixSlider.Track className="relative h-1 w-full grow rounded-full bg-transparent">
          <RadixSlider.Range className="absolute h-full rounded-full bg-foreground/80" />
        </RadixSlider.Track>
        <RadixSlider.Thumb
          className="block h-3 w-3 rounded-full bg-foreground shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        />
      </RadixSlider.Root>
    </motion.div>
  );
}

export default VolumeSlider; 