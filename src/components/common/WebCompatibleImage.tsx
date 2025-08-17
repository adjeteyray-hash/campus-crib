import React from 'react';
import { Image, ImageProps, Platform } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleImageProps extends Omit<ImageProps, 'source'> {
  source: any;
  alt?: string;
}

const WebCompatibleImage: React.FC<WebCompatibleImageProps> = ({ 
  source, 
  alt, 
  style, 
  ...props 
}) => {
  if (!isWeb) {
    return <Image source={source} style={style} {...props} />;
  }

  // For web, render img tag
  const imageSource = typeof source === 'object' && source.uri ? source.uri : source;
  
  return (
    <img
      src={imageSource}
      alt={alt || 'Image'}
      style={{
        width: '100%',
        height: 'auto',
        ...style,
      }}
      {...props}
    />
  );
};

export default WebCompatibleImage;
