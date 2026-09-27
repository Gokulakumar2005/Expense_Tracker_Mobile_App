import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  editable = true,
  className = '',
  inputClassName = '',
  containerClassName = '',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const containerStyle = {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: error ? '#EF4444' : isFocused ? '#2563EB' : '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: multiline ? 88 : 48,
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    paddingVertical: multiline ? 10 : 0,
    opacity: editable ? 1 : 0.7,
  };

  return (
    <View style={{ marginBottom: 16 }} className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text
          style={{ fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginLeft: 2 }}
          className="text-sm font-medium text-slate-700 mb-1.5 ml-0.5"
        >
          {label}
        </Text>
      )}

      <View
        style={[containerStyle, style]}
        className={`flex-row items-center bg-white border rounded-xl px-3.5 ${
          multiline ? 'py-2.5 items-start' : 'h-12'
        } ${
          error
            ? 'border-red-500 bg-red-50/20'
            : isFocused
            ? 'border-blue-600 shadow-sm'
            : 'border-slate-200'
        } ${!editable ? 'bg-slate-50 opacity-70' : ''} ${className}`}
      >
        {leftIcon && <View style={{ marginRight: 10 }}>{leftIcon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            flex: 1,
            color: '#0F172A',
            fontSize: 15,
            outlineWidth: 0,
            ...(multiline ? { minHeight: 70, textAlignVertical: 'top' } : {}),
          }}
          className={`flex-1 text-slate-900 text-base ${inputClassName}`}
          {...props}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ padding: 4 }}
            className="p-1"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>
        )}
      </View>

      {error ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginLeft: 4 }}>
          <Ionicons name="alert-circle-outline" size={14} color={COLORS.expense} />
          <Text
            style={{ fontSize: 12, color: '#DC2626', marginLeft: 4, fontWeight: '500' }}
            className="text-xs text-red-600 ml-1 font-medium"
          >
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default Input;
