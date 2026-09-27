import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '../hooks/reduxHooks';
import SplashScreen from '../screens/SplashScreen';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
