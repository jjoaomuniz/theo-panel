import { CATEGORY_COLORS, type NodeCategory } from '@/types/neural';

export default function NeuralFilters() {
  return (
    <defs>
      {/* Base glow filter */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Soft link glow */}
      <filter id="glow-subtle" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Intense hover glow */}
      <filter id="glow-intense" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="10" result="blur1" />
        <feGaussianBlur stdDeviation="20" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Category-specific glow filters — double-layered for richer bloom */}
      {(Object.entries(CATEGORY_COLORS) as [NodeCategory, string][]).map(([category, color]) => (
        <filter key={category} id={`glow-${category}`} x="-150%" y="-150%" width="400%" height="400%">
          <feFlood floodColor={color} floodOpacity="0.4" result="flood" />
          <feComposite in="flood" in2="SourceGraphic" operator="in" result="mask" />
          <feGaussianBlur in="mask" stdDeviation="8" result="softBlur" />
          <feGaussianBlur in="mask" stdDeviation="20" result="wideBlur" />
          <feMerge>
            <feMergeNode in="wideBlur" />
            <feMergeNode in="softBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      ))}

      {/* Background ambient gradients */}
      <radialGradient id="bg-gradient" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.035" />
        <stop offset="40%" stopColor="#22d3ee" stopOpacity="0.015" />
        <stop offset="100%" stopColor="#06060b" stopOpacity="0" />
      </radialGradient>

      {/* Grid pattern */}
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(139,92,246,0.03)" strokeWidth="0.5" />
      </pattern>

      {/* Vignette for depth */}
      <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#06060b" stopOpacity="0" />
        <stop offset="70%" stopColor="#06060b" stopOpacity="0" />
        <stop offset="100%" stopColor="#06060b" stopOpacity="0.7" />
      </radialGradient>

      {/* Link gradient for highlighted connections */}
      <linearGradient id="link-gradient-purple" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
        <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
      </linearGradient>
    </defs>
  );
}
