'use client';

import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import { useMemo, useEffect } from 'react';

interface RiveOrbProps {
  size?: number;
  colorMode?: number;
  isActive?: boolean;
  className?: string;
}

/**
 * RiveOrb Component
 * Renders an animated orb using Rive Canvas
 *
 * @param size - Size of the orb in pixels (default: 48)
 * @param colorMode - Color mode (0-9, default: 9)
 * @param isActive - Whether the orb should animate actively (e.g., during speech)
 * @param className - Additional CSS classes
 */
export function RiveOrb({
  size = 48,
  colorMode = 9,
  isActive = false,
  className = ''
}: RiveOrbProps) {
  const { rive, RiveComponent } = useRive({
    src: '/Assets/orb-1.2.riv',
    stateMachines: 'default',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    onLoadError: (err) => {
      console.debug('Rive load error:', err);
    },
  });

  // Get the color input from the state machine
  const colorInput = useStateMachineInput(rive, 'default', 'color');

  // Set color mode when input is available or colorMode changes
  useEffect(() => {
    if (colorInput) {
      colorInput.value = colorMode;
    }
  }, [colorInput, colorMode]);

  // Memoize styles to prevent unnecessary re-renders
  const containerStyle = useMemo(() => ({
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }), [size]);

  return (
    <div className={`rive-orb ${className}`} style={containerStyle}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

/**
 * RiveOrbMini - Smaller version for sidebar/compact UI
 */
export function RiveOrbMini({
  colorMode = 9,
  isActive = false,
  className = ''
}: Omit<RiveOrbProps, 'size'>) {
  return (
    <RiveOrb
      size={24}
      colorMode={colorMode}
      isActive={isActive}
      className={className}
    />
  );
}

/**
 * RiveOrbLarge - Larger version for main displays
 */
export function RiveOrbLarge({
  colorMode = 9,
  isActive = false,
  className = ''
}: Omit<RiveOrbProps, 'size'>) {
  return (
    <RiveOrb
      size={120}
      colorMode={colorMode}
      isActive={isActive}
      className={className}
    />
  );
}

export default RiveOrb;
