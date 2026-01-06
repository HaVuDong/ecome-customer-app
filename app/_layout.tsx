import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '../src/shared/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../src/shared/contexts/AuthContext';
import { LoginScreen, RegisterScreen } from '../src/features/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Component xử lý navigation dựa trên auth state
function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  console.log('🔐 RootNavigator - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user?.email);

  // Hiển thị loading khi đang kiểm tra auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#ee4d2d" />
      </View>
    );
  }

  // Chưa đăng nhập - hiển thị màn hình auth
  if (!isAuthenticated) {
    console.log('🔐 Showing auth screen');
    if (showRegister) {
      return <RegisterScreen onNavigateToLogin={() => setShowRegister(false)} />;
    }
    return <LoginScreen onNavigateToRegister={() => setShowRegister(true)} />;
  }

  // Đã đăng nhập - hiển thị app chính
  console.log('🔐 Showing main app');
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
