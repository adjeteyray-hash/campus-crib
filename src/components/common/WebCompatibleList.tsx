import React from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  horizontal?: boolean;
}

const WebCompatibleList = <T extends any>({ 
  data,
  renderItem,
  keyExtractor,
  horizontal = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}: WebCompatibleListProps<T>) => {
  if (!isWeb) {
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal={horizontal}
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      />
    );
  }

  // For web, render div structure
  const baseStyle = {
    display: 'flex',
    flexDirection: horizontal ? 'row' : 'column',
    width: '100%',
  };

  return (
    <div
      style={baseStyle}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      {data.map((item, index) => (
        <div key={keyExtractor ? keyExtractor(item, index) : index}>
          {renderItem({ item, index })}
        </div>
      ))}
    </div>
  );
};

export default WebCompatibleList;
