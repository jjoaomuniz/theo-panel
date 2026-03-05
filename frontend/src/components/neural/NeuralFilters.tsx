import { CATEGORY_COLORS, type NodeCategory } from '@/types/neural';

export default function NeuralFilters() {
  return (
    <defs>
      {/* Base glow filter */}
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Subtle glow for links */}
      <filter id="glow-subtle" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Category-specific glow filters */}
      {(Object.entries(CATEGORY_COLORS) as [NodeCategory, string][]).map(([category, color]) => (
        <filter key={category} id={`glow-${category}`} x="-100%" y="-100%" width="300%" height="300%">
          <feFlood floodColor={color} floodOpacity="0.3" result="flood" />
          <feComposite in="flood" in2="SourceGraphic" operator="in" result="mask" />
          <feGaussianBlur in="mask" stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      ))}

      {/* Radial gradient for background ambience */}
      <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.03" />
        <stop offset="100%" stopColor="#0a0a0f" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}
