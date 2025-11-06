import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

// ThemeToggle now cycles through 5 soft background palettes.
export function ThemeToggle() {
  const MAX = 5;

  const [index, setIndex] = useState<number>(() => {
    try {
      const raw = localStorage.getItem('bgThemeIndex');
      return raw ? Number(raw) : 0;
    } catch {
      return 0;
    }
  });

  const applyBodyClass = useCallback((i: number) => {
    const root = document.body;
    // remove any existing bg-theme-* classes
    for (let k = 0; k < MAX; k++) {
      root.classList.remove(`bg-theme-${k}`);
    }
    root.classList.add(`bg-theme-${i}`);
  }, []);

  useEffect(() => {
    applyBodyClass(index);
    try {
      localStorage.setItem('bgThemeIndex', String(index));
    } catch {
      // ignore
    }
  }, [index, applyBodyClass]);

  const handleClick = () => {
    setIndex((i) => (i + 1) % MAX);
  };

  const labels = ['Celeste', 'Mint', 'Lavanda', 'Durazno', 'Cielo'];
  const colors = ['#2196F3', '#4CAF50', '#9C27B0', '#FF9800', '#03A9F4'];

  return (
    <Tooltip title={`Fondo: ${labels[index]} (clic para cambiar)`}>
      <IconButton 
        onClick={handleClick} 
        size="large"
        sx={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 1)',
            transform: 'scale(1.05) rotate(90deg)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: 40,
          height: 40,
        }}
      >
        {/* Indicador de color actual */}
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: colors[index],
            border: '1px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        />
        
        <Iconify
          icon="solar:restart-bold"
          width={20}
          height={20}
          sx={{
            color: 'text.primary',
            transition: 'transform 0.3s ease',
          }}
        />
      </IconButton>
    </Tooltip>
  );
}