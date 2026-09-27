import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { loginUser, clearAuthError } from '../../redux/slices/authSlice';
import { validateLogin } from '../../utils/validation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import COLORS from '../../constants/colors';

export const LoginScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isActionLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const handleLogin = async () => {
    dispatch(clearAuthError());
    const validation = validateLogin({ email, password });
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    await dispatch(loginUser({ email, password }));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50"
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingVertical: 48,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* App Branding */}
        <View className="items-center mb-8" style={{ alignItems: 'center', marginBottom: 32 }}>
          <View
            className="w-16 h-16 rounded-2xl bg-blue-600 items-center justify-center mb-3 shadow-md"
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: '#2563EB',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              shadowColor: '#2563EB',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="wallet-outline" size={32} color={COLORS.white} />
          </View>
          <Text
            className="text-2xl font-extrabold text-slate-900"
            style={{ fontSize: 24, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}
          >
            Welcome to PocketTrack
          </Text>
          <Text
            className="text-sm text-slate-500 mt-1"
            style={{ fontSize: 14, color: '#64748B', marginTop: 4, textAlign: 'center' }}
          >
            Sign in to track your expenses and budgets
          </Text>
        </View>

        {/* Global Error Banner */}
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => dispatch(clearAuthError())}
          />
        )}

        {/* Form Inputs */}
        <View
          className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6"
          style={{
            backgroundColor: '#FFFFFF',
            padding: 24,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#F1F5F9',
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (formErrors.email) setFormErrors({ ...formErrors, email: null });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
            }
            error={formErrors.email}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (formErrors.password) setFormErrors({ ...formErrors, password: null });
            }}
            secureTextEntry
            leftIcon={
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
            }
            error={formErrors.password}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            isLoading={isActionLoading}
            className="mt-2"
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Register Navigation */}
        <View
          className="flex-row items-center justify-center"
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text className="text-sm text-slate-500" style={{ fontSize: 14, color: '#64748B' }}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => {
              dispatch(clearAuthError());
              navigation.navigate('Register');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-sm font-bold text-blue-600" style={{ fontSize: 14, fontWeight: '700', color: '#2563EB' }}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
