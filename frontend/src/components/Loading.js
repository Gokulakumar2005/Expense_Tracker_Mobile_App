import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import COLORS from '../constants/colors';

export const Loading = ({
  message = 'Loading...',
  fullScreen = true,
  size = 'large',
  color = COLORS.primary,
}) => {
  if (fullScreen) {
    return (
      <View
        className="flex-1 items-center justify-center bg-slate-50 p-6"
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', padding: 24 }}
      >
        <ActivityIndicator size={size} color={color} />
        {message ? (
          <Text
            className="text-sm font-medium text-slate-500 mt-3 text-center"
            style={{ fontSize: 14, fontWeight: '500', color: '#64748B', marginTop: 12, textAlign: 'center' }}
          >
            {message}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      className="py-6 items-center justify-center"
      style={{ paddingVertical: 24, alignItems: 'center', justifyContent: 'center' }}
    >
      <ActivityIndicator size={size} color={color} />
      {message ? (
        <Text
          className="text-xs font-medium text-slate-400 mt-2 text-center"
          style={{ fontSize: 12, fontWeight: '500', color: '#94A3B8', marginTop: 8, textAlign: 'center' }}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
};

export default Loading;
