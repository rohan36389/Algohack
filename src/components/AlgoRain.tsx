import { useMemo } from 'react';

export const AlgoRain = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => {
      const layer = i < 8 ? 'far' : i < 17 ? 'mid' : 'near';
      const sizeRange = layer === 'far' ? [12, 18] : layer === 'mid' ? [20, 32] : [34, 48];
      const opacityRange = layer === 'far' ? [0.03, 0.05] : layer === 'mid' ? [0.05, 0.07] : [0.07, 0.09];
      const durationRange = layer === 'far' ? [14, 18] : layer === 'mid' ? [10, 14] : [8, 11];
      const blurAmount = layer === 'far' ? '1px' : layer === 'mid' ? '0.4px' : '0px';

      const rand = (min: number, max: number) => Math.random() * (max - min) + min;

      return {
        id: i,
        x: rand(0, 96),
        size: rand(sizeRange[0], sizeRange[1]),
        duration: rand(durationRange[0], durationRange[1]),
        delay: rand(0, 16),
        rotStart: rand(-60, 60),
        rotDelta: rand(-120, 120),
        opacity: rand(opacityRange[0], opacityRange[1]),
        blur: blurAmount,
      };
    });
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      zIndex: 0, pointerEvents: 'none', overflow: 'hidden'
    }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}vw`,
            top: '-60px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            filter: `blur(${p.blur})`,
            animation: `algoRainFall ${p.duration}s ${p.delay}s linear infinite`,
            transform: `rotate(${p.rotStart}deg)`,
            willChange: 'transform',
            ['--rot-start' as any]: `${p.rotStart}deg`,
            ['--rot-delta' as any]: `${p.rotDelta}deg`,
            ['--opacity' as any]: p.opacity,
          }}
        >
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
               style={{ width: '100%', height: '100%' }}>
            <path d="M50 5 L80 90 H65 L50 45 L35 90 H20 Z M35 65 H65 L57 45 H43 Z"
                  fill="currentColor"/>
          </svg>
        </div>
      ))}
    </div>
  );
};
