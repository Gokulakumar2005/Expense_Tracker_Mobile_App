import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { loginUser, clearAuthError } from '../../redux/slices/authSlice';
import { validateLogin } from '../../utils/validation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import COLORS from '../../constants/colors';

export const LoginScreen = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isActionLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (route.params?.registeredEmail) {
      setEmail(route.params.registeredEmail);
    }
  }, [route.params?.registeredEmail]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: '#F8FAFC' }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View
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
              style={{ fontSize: 24, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}
            >
              Welcome to Expense Tracker
            </Text>
            <Text
              style={{ fontSize: 14, color: '#64748B', marginTop: 4, textAlign: 'center' }}
            >
              Sign in to track your expenses and budgets
            </Text>
          </View>

          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => dispatch(clearAuthError())}
            />
          )}

          <View
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
              style={{ marginTop: 8 }}
            />
          </View>

          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 14, color: '#64748B' }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => {
                dispatch(clearAuthError());
                navigation.navigate('Register');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#2563EB' }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
