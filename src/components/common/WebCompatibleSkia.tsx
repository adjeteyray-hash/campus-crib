import React, { useRef, useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleSkiaProps extends ViewProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
}

const WebCompatibleSkia: React.FC<WebCompatibleSkiaProps> = ({ 
  children,
  width = 300,
  height = 200,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle web canvas drawing
  useEffect(() => {
    if (!isWeb || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw a simple placeholder (you can customize this)
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, width - 20, height - 20);
      
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Skia Canvas', width / 2, height / 2);
    }
  }, [width, height]);

  if (!isWeb) {
    return (
      <View 
        style={style} 
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {children}
      </View>
    );
  }

  // For web, render canvas
  const baseStyle = {
    border: '1px solid #ddd',
    borderRadius: 4,
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={baseStyle}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    />
  );
};

export default WebCompatibleSkia;
