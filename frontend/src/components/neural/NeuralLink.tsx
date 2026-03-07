import { useRef, useEffect } from 'react';
import type { NeuralNode, NeuralLink as NeuralLinkType } from '@/types/neural';

interface Props {
  link: NeuralLinkType;
  highlighted: boolean;
}

export default function NeuralLinkLine({ link, highlighted }: Props) {
  const lineRef = useRef<SVGLineElement>(null);
  const animatedRef = useRef(false);

  const source = link.source as NeuralNode;
  const target = link.target as NeuralNode;

  if (!source.x || !source.y || !target.x || !target.y) return null;

  useEffect(() => {
    if (animatedRef.current || !lineRef.current) return;
    const line = lineRef.current;
    const length = Math.sqrt(
      Math.pow((source.x ?? 0) - (target.x ?? 0), 2) +
      Math.pow((source.y ?? 0) - (target.y ?? 0), 2)
    );
    line.style.setProperty('--link-length', String(length));
    line.style.strokeDasharray = String(length);
    line.style.strokeDashoffset = String(length);
    line.style.animation = 'link-draw 1s ease-out forwards';
    animatedRef.current = true;
  }, [source.x, source.y, target.x, target.y]);

  return (
    <>
      {/* Glow underline for highlighted links */}
      {highlighted && (
        <line
          x1={source.x} y1={source.y}
          x2={target.x} y2={target.y}
          stroke="url(#link-gradient-purple)"
          strokeWidth={4}
          opacity={0.15}
          filter="url(#glow-subtle)"
        />
      )}

      {/* Main link line */}
      <line
        ref={lineRef}
        x1={source.x} y1={source.y}
        x2={target.x} y2={target.y}
        stroke={highlighted ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.04)'}
        strokeWidth={highlighted ? 1.5 : 0.6}
        style={{ transition: 'stroke 0.4s, stroke-width 0.4s' }}
      />
    </>
  );
}
