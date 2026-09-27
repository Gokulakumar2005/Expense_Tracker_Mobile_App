import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import COLORS from '../constants/colors';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline', 'ghost'
  size = 'md', // 'sm', 'md', 'lg'
  isLoading = false,
  disabled = false,
  icon,
  className = '',
  textClassName = '',
  style,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-slate-200 active:bg-slate-300';
      case 'danger':
        return 'bg-red-600 active:bg-red-700';
      case 'outline':
        return 'bg-transparent border border-blue-600 active:bg-blue-50';
      case 'ghost':
        return 'bg-transparent active:bg-slate-100';
      case 'primary':
      default:
        return 'bg-blue-600 active:bg-blue-700';
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return 'text-slate-800 font-semibold';
      case 'danger':
        return 'text-white font-semibold';
      case 'outline':
        return 'text-blue-600 font-semibold';
      case 'ghost':
        return 'text-slate-700 font-semibold';
      case 'primary':
      default:
        return 'text-white font-semibold';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-3 rounded-lg';
      case 'lg':
        return 'py-4 px-6 rounded-2xl';
      case 'md':
      default:
        return 'py-3.5 px-5 rounded-xl';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'md':
      default:
        return 'text-base';
    }
  };

  const baseInlineStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
    paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 14,
    paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 24 : 18,
    backgroundColor:
      variant === 'primary'
        ? COLORS.primary
        : variant === 'danger'
        ? COLORS.expense
        : variant === 'secondary'
        ? '#E2E8F0'
        : 'transparent',
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: variant === 'outline' ? COLORS.primary : 'transparent',
    opacity: disabled ? 0.5 : 1,
  };

  const textInlineStyle = {
    color:
      variant === 'primary' || variant === 'danger'
        ? '#FFFFFF'
        : variant === 'outline'
        ? COLORS.primary
        : '#0F172A',
    fontWeight: '600',
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15,
    textAlign: 'center',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      style={[baseInlineStyle, style]}
      className={`flex-row items-center justify-center shadow-sm ${getVariantStyle()} ${getSizeStyle()} ${
        disabled ? 'opacity-50' : 'opacity-100'
      } ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text
            style={textInlineStyle}
            className={`${getTextStyle()} ${getTextSize()} text-center ${textClassName}`}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
