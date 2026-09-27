import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

export const ErrorMessage = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
  onDismiss,
  className = '',
}) => {
  if (!message) return null;

  return (
    <View
      className={`bg-rose-50 border border-rose-200 rounded-2xl p-4 my-3 flex-row items-center justify-between ${className}`}
      style={{
        backgroundColor: '#FFF1F2',
        borderWidth: 1,
        borderColor: '#FECDD3',
        borderRadius: 16,
        padding: 16,
        marginVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View
        className="flex-row items-center flex-1 mr-2"
        style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}
      >
        <Ionicons name="alert-circle" size={22} color={COLORS.expense} />
        <Text
          className="text-sm font-medium text-rose-800 ml-2.5 flex-1"
          style={{ fontSize: 14, fontWeight: '500', color: '#9F1239', marginLeft: 10, flex: 1 }}
        >
          {message}
        </Text>
      </View>

      <View className="flex-row items-center" style={{ flexDirection: 'row', alignItems: 'center' }}>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="bg-rose-600 px-3 py-1.5 rounded-lg mr-1.5"
            style={{ backgroundColor: '#E11D48', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6 }}
          >
            <Text className="text-xs font-semibold text-white" style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>
              Retry
            </Text>
          </TouchableOpacity>
        )}

        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            className="p-1"
            style={{ padding: 4 }}
          >
            <Ionicons name="close" size={18} color={COLORS.expenseDark} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ErrorMessage;
