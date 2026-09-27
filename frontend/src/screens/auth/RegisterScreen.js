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
import { registerUser, clearAuthError } from '../../redux/slices/authSlice';
import { validateRegistration } from '../../utils/validation';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import COLORS from '../../constants/colors';

export const RegisterScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isActionLoading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleRegister = async () => {
    dispatch(clearAuthError());
    const validation = validateRegistration(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    await dispatch(registerUser(formData));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50"
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* App Branding */}
        <View className="items-center mb-6 mt-4" style={{ alignItems: 'center', marginBottom: 24, marginTop: 16 }}>
          <View
            className="w-14 h-14 rounded-2xl bg-blue-600 items-center justify-center mb-2 shadow-md"
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: '#2563EB',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              shadowColor: '#2563EB',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="person-add-outline" size={26} color={COLORS.white} />
          </View>
          <Text
            className="text-2xl font-extrabold text-slate-900"
            style={{ fontSize: 24, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}
          >
            Create an Account
          </Text>
          <Text
            className="text-sm text-slate-500 mt-1"
            style={{ fontSize: 14, color: '#64748B', marginTop: 4, textAlign: 'center' }}
          >
            Start managing your personal finances today
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
          <View className="flex-row gap-3" style={{ flexDirection: 'row', gap: 12 }}>
            <View className="flex-1" style={{ flex: 1 }}>
              <Input
                label="First Name"
                placeholder="John"
                value={formData.firstName}
                onChangeText={(text) => updateField('firstName', text)}
                autoCapitalize="words"
                error={formErrors.firstName}
              />
            </View>
            <View className="flex-1" style={{ flex: 1 }}>
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.lastName}
                onChangeText={(text) => updateField('lastName', text)}
                autoCapitalize="words"
                error={formErrors.lastName}
              />
            </View>
          </View>

          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} />
            }
            error={formErrors.email}
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            secureTextEntry
            leftIcon={
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
            }
            error={formErrors.password}
          />

          <Input
            label="Confirm Password"
            placeholder="Repeat password"
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            secureTextEntry
            leftIcon={
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textSecondary} />
            }
            error={formErrors.confirmPassword}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            isLoading={isActionLoading}
            className="mt-2"
            style={{ marginTop: 8 }}
          />
        </View>

        {/* Login Navigation */}
        <View
          className="flex-row items-center justify-center pb-6"
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 24 }}
        >
          <Text className="text-sm text-slate-500" style={{ fontSize: 14, color: '#64748B' }}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => {
              dispatch(clearAuthError());
              navigation.navigate('Login');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-sm font-bold text-blue-600" style={{ fontSize: 14, fontWeight: '700', color: '#2563EB' }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
