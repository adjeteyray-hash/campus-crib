import React, { useEffect } from 'react';
import { Modal, ModalProps } from 'react-native';
import { isWeb } from '../../utils/platform';

interface WebCompatibleModalProps extends ModalProps {
  children: React.ReactNode;
}

const WebCompatibleModal: React.FC<WebCompatibleModalProps> = ({ 
  visible,
  children,
  onRequestClose,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  ...props 
}) => {
  // Handle escape key for web
  useEffect(() => {
    if (!isWeb || !visible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onRequestClose) {
        onRequestClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [visible, onRequestClose]);

  if (!isWeb) {
    return (
      <Modal
        visible={visible}
        onRequestClose={onRequestClose}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        {...props}
      >
        {children}
      </Modal>
    );
  }

  // For web, render custom modal
  if (!visible) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onRequestClose) {
      onRequestClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={handleOverlayClick}
      data-testid={testID}
      role={accessibilityRole}
      aria-label={accessibilityLabel}
      aria-describedby={accessibilityHint}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 20,
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default WebCompatibleModal;
