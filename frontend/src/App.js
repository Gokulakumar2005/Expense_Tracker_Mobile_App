import React from 'react';
import { View, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NativeWindStyleSheet } from 'nativewind';
import store from './redux/store';
import RootNavigator from './navigation/RootNavigator';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

export default function App() {
  const content = (
    <>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      <RootNavigator />
    </>
  );

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        {Platform.OS === 'web' ? (
          <View style={{ flex: 1, height: '100%', width: '100%', backgroundColor: '#0B0F19', alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                flex: 1,
                width: '100%',
                maxWidth: 480,
                height: '100%',
                backgroundColor: '#F8FAFC',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 24,
                overflow: 'hidden',
              }}
            >
              {content}
            </View>
          </View>
        ) : (
          content
        )}
      </SafeAreaProvider>
    </Provider>
  );
}
