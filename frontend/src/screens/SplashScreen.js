import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../hooks/reduxHooks';
import { checkStoredAuth } from '../redux/slices/authSlice';
import COLORS from '../constants/colors';

export const SplashScreen = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      dispatch(checkStoredAuth());
    };
    initAuth();
  }, [dispatch]);

  return (
    <View
      className="flex-1 bg-blue-600 items-center justify-center px-6"
      style={{ flex: 1, backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}
    >
      <View
        className="w-24 h-24 rounded-3xl bg-white/20 items-center justify-center mb-6 shadow-lg"
        style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }}
      >
        <Ionicons name="wallet" size={48} color={COLORS.white} />
      </View>

      <Text
        className="text-3xl font-extrabold text-white tracking-wider mb-2"
        style={{ fontSize: 30, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, marginBottom: 8 }}
      >
        PocketTrack
      </Text>
      <Text
        className="text-base text-blue-100 font-medium text-center mb-10"
        style={{ fontSize: 16, color: '#DBEAFE', fontWeight: '500', textAlign: 'center', marginBottom: 40 }}
      >
        Smart Financial Tracking Made Simple
      </Text>

      <ActivityIndicator size="large" color={COLORS.white} />
    </View>
  );
};

export default SplashScreen;
