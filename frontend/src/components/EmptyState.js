import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import COLORS from '../constants/colors';

export const EmptyState = ({
  icon = 'wallet-outline',
  title = 'No Data Found',
  description = 'There are no records to display at this moment.',
  actionTitle,
  onAction,
  className = '',
}) => {
  return (
    <View
      className={`items-center justify-center py-12 px-6 ${className}`}
      style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 }}
    >
      <View
        className="w-18 h-18 rounded-full bg-blue-50 items-center justify-center mb-4"
        style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
      >
        <Ionicons name={icon} size={36} color={COLORS.primary} />
      </View>
      <Text
        className="text-lg font-bold text-slate-800 text-center mb-1.5"
        style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', textAlign: 'center', marginBottom: 6 }}
      >
        {title}
      </Text>
      <Text
        className="text-sm text-slate-500 text-center leading-5 max-w-xs mb-6"
        style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, maxWidth: 320, marginBottom: 24 }}
      >
        {description}
      </Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          size="sm"
          className="px-6"
        />
      )}
    </View>
  );
};

export default EmptyState;
