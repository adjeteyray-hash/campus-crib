import React from 'react';
import { View, ViewProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleVictoryNativeProps extends ViewProps {
  children: React.ReactNode;
  data?: Array<{ x: number | string; y: number }>;
  width?: number;
  height?: number;
  color?: string;
}

const WebCompatibleVictoryNative: React.FC<WebCompatibleVictoryNativeProps> = ({ 
  children,
  data = [],
  width = 300,
  height = 200,
  color = '#007AFF',
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
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

  // For web, render basic HTML/CSS chart
  const renderChart = () => {
    if (data.length === 0) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#666',
          fontSize: 14
        }}>
          No data available
        </div>
      );
    }

    const maxY = Math.max(...data.map(d => d.y));
    const minY = Math.min(...data.map(d => d.y));
    const rangeY = maxY - minY || 1;

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Y-axis */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 30,
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#666'
        }}>
          <span>{maxY}</span>
          <span>{((maxY + minY) / 2).toFixed(1)}</span>
          <span>{minY}</span>
        </div>

        {/* Chart area */}
        <div style={{
          position: 'absolute',
          left: 30,
          top: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2
        }}>
          {data.map((point, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                backgroundColor: color,
                height: `${((point.y - minY) / rangeY) * 100}%`,
                minHeight: '2px',
                borderRadius: '2px 2px 0 0'
              }}
              title={`${point.x}: ${point.y}`}
            />
          ))}
        </div>

        {/* X-axis */}
        <div style={{
          position: 'absolute',
          left: 30,
          right: 0,
          bottom: 0,
          height: 30,
          borderTop: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#666'
        }}>
          {data.map((point, index) => (
            <span key={index} style={{ transform: 'rotate(-45deg)', transformOrigin: 'center' }}>
              {point.x}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const baseStyle = {
    width,
    height,
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: 'white',
  };

  return (
    <div
      style={baseStyle}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      {renderChart()}
    </div>
  );
};

export default WebCompatibleVictoryNative;
