"use client";

import { useRef, useState, useCallback } from "react";
import { useGesture } from "@use-gesture/react";

interface SVGTransform {
  x: number;
  y: number;
  scale: number;
}

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

/**
 * Gesture handler for SVG pan/zoom via wheel, drag, and pinch.
 * Attach `bind()` spread to the container element.
 * Pass `transform` as a CSS `transform` string to the inner SVG wrapper.
 */
export function useSVGGestures() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<SVGTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const clampScale = (s: number) =>
    Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

  const bind = useGesture(
    {
      onDrag: ({ delta: [dx, dy], buttons }) => {
        // Left button drag only
        if (buttons !== 1 && buttons !== 0) return;
        setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
      },
      onWheel: ({ delta: [, dy], event }) => {
        event.preventDefault();
        const factor = dy > 0 ? 0.9 : 1 / 0.9;
        setTransform((t) => ({ ...t, scale: clampScale(t.scale * factor) }));
      },
      onPinch: ({ offset: [s], origin: [ox, oy] }) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const cx = ox - rect.left;
        const cy = oy - rect.top;
        setTransform((t) => {
          const newScale = clampScale(s);
          const scaleDelta = newScale / t.scale;
          return {
            scale: newScale,
            x: cx - scaleDelta * (cx - t.x),
            y: cy - scaleDelta * (cy - t.y),
          };
        });
      },
    },
    {
      drag: { filterTaps: true },
      wheel: { eventOptions: { passive: false } },
      pinch: { scaleBounds: { min: MIN_SCALE, max: MAX_SCALE } },
    },
  );

  const reset = useCallback(() => setTransform({ x: 0, y: 0, scale: 1 }), []);
  const zoomIn = useCallback(
    () => setTransform((t) => ({ ...t, scale: clampScale(t.scale * 1.25) })),
    [],
  );
  const zoomOut = useCallback(
    () => setTransform((t) => ({ ...t, scale: clampScale(t.scale / 1.25) })),
    [],
  );

  return { bind, containerRef, transform, reset, zoomIn, zoomOut };
}
