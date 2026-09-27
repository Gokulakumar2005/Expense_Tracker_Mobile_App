import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

export const Header = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightComponent,
  className = '',
  style,
}) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
        },
        style,
      ]}
      className={`flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100 ${className}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              marginRight: 12,
              padding: 6,
              borderRadius: 9999,
              backgroundColor: '#F1F5F9',
            }}
            className="mr-3 p-1.5 rounded-full bg-slate-100"
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 18, fontWeight: '700', color: '#0F172A' }}
            className="text-xl font-bold text-slate-900"
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}
              className="text-xs text-slate-500 mt-0.5"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightComponent && <View style={{ marginLeft: 8 }}>{rightComponent}</View>}
    </View>
  );
};

export default Header;
