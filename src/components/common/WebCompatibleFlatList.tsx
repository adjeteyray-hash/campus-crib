import React from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
}

const WebCompatibleFlatList = <T extends any>({ 
  data,
  renderItem,
  keyExtractor,
  style,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}: WebCompatibleFlatListProps<T>) => {
  if (!isWeb) {
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
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
    flexDirection: 'column',
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

export default WebCompatibleFlatList;
