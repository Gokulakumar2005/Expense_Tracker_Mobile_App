import React from 'react';
import { View, TouchableOpacity } from 'react-native';

export const Card = ({
  children,
  onPress,
  className = '',
  style = {},
  activeOpacity = 0.7,
}) => {
  const baseStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  };

  const baseClass = "bg-white rounded-2xl p-4 border border-slate-100 shadow-sm";

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={[baseStyle, style]}
        className={`${baseClass} ${className}`}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[baseStyle, style]} className={`${baseClass} ${className}`}>
      {children}
    </View>
  );
};

export default Card;
