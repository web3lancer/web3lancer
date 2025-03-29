import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@/contexts/ThemeContext';

interface GeometricShape {
  type: 'circle' | 'triangle' | 'square' | 'hexagon' | 'diamond';
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
}

const generateShapes = (count: number, width: number, height: number): GeometricShape[] => {
  const shapes: GeometricShape[] = [];
  const types: ('circle' | 'triangle' | 'square' | 'hexagon' | 'diamond')[] = [
    'circle', 'triangle', 'square', 'hexagon', 'diamond'
  ];

  for (let i = 0; i < count; i++) {
    shapes.push({
      type: types[Math.floor(Math.random() * types.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      size: 20 + Math.random() * 60,
      rotation: Math.random() * 360,
      opacity: 0.03 + Math.random() * 0.08, // Very subtle opacity
    });
  }

  return shapes;
};

const drawShape = (
  ctx: CanvasRenderingContext2D, 
  shape: GeometricShape, 
  color: string
) => {
  const { x, y, size, rotation, type, opacity } = shape;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;

  switch (type) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      ctx.fill();
      break;
    case 'square':
      ctx.fillRect(-size / 2, -size / 2, size, size);
      break;
    case 'hexagon':
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const pX = (size / 2) * Math.cos(angle);
        const pY = (size / 2) * Math.sin(angle);
        if (i === 0) ctx.moveTo(pX, pY);
        else ctx.lineTo(pX, pY);
      }
      ctx.closePath();
      ctx.fill();
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(0, -size / 2);
      ctx.lineTo(size / 2, 0);
      ctx.lineTo(0, size / 2);
      ctx.lineTo(-size / 2, 0);
      ctx.closePath();
      ctx.fill();
      break;
  }
  ctx.restore();
};

export const GeometricBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const shapesRef = useRef<GeometricShape[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      shapesRef.current = generateShapes(50, canvas.width, canvas.height);
      drawShapes();
    };

    const drawShapes = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get the fill color based on theme
      const fillColor = theme === 'dark' ? '#ffffff' : '#000000';
      
      shapesRef.current.forEach(shape => {
        drawShape(ctx, shape, fillColor);
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block',
          width: '100%', 
          height: '100%',
        }} 
      />
    </Box>
  );
};
