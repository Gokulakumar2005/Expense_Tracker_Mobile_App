import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  updateProfile,
  logoutUser,
  fetchProfile,
  clearAuthError,
} from '../../redux/slices/authSlice';
import { validateProfile } from '../../utils/validation';
import { formatDate } from '../../utils/date';
import { confirmDialog, showNotice } from '../../utils/alert';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Header from '../../components/Header';
import ErrorMessage from '../../components/ErrorMessage';
import COLORS from '../../constants/colors';

export const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const { user, isActionLoading, error } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  const handleUpdate = async () => {
    dispatch(clearAuthError());
    const validation = validateProfile({ firstName, lastName });
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});
    const res = await dispatch(
      updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() })
    );

    if (!res.error) {
      showNotice({
        title: 'Success',
        message: 'Profile updated successfully!',
      });
    }
  };

  const handleLogout = () => {
    confirmDialog({
      title: 'Log Out',
      message: 'Are you sure you want to log out of PocketTrack?',
      confirmText: 'Log Out',
      isDestructive: true,
      onConfirm: () => {
        dispatch(logoutUser());
      },
    });
  };

  const initials = `${firstName?.[0] || 'U'}${lastName?.[0] || ''}`.toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-slate-50" style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="My Profile" subtitle="Account settings & preferences" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, paddingTop: 16 }}
        >
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => dispatch(clearAuthError())}
            />
          )}

          {/* User Hero Avatar Card */}
          <View
            className="bg-white rounded-3xl p-6 items-center border border-slate-100 shadow-sm mb-5"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#F1F5F9',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              className="w-20 h-20 rounded-full bg-blue-600 items-center justify-center mb-3 shadow-md shadow-blue-500/30"
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#2563EB',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <Text className="text-2xl font-black text-white" style={{ fontSize: 24, fontWeight: '900', color: '#FFFFFF' }}>
                {initials}
              </Text>
            </View>

            <Text className="text-xl font-bold text-slate-900 text-center" style={{ fontSize: 20, fontWeight: '700', color: '#0F172A', textAlign: 'center' }}>
              {firstName} {lastName}
            </Text>
            <Text className="text-sm text-slate-500 text-center mt-0.5" style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 2 }}>
              {user?.email}
            </Text>

            {user?.created_at && (
              <View
                className="flex-row items-center mt-3 bg-slate-100 px-3 py-1 rounded-full"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 12,
                  backgroundColor: '#F1F5F9',
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 9999,
                }}
              >
                <Ionicons name="calendar-outline" size={13} color={COLORS.textSecondary} />
                <Text className="text-xs text-slate-600 ml-1.5 font-medium" style={{ fontSize: 12, color: '#475569', marginLeft: 6, fontWeight: '500' }}>
                  Member since {formatDate(user.created_at)}
                </Text>
              </View>
            )}
          </View>

          {/* Edit Profile Form */}
          <View
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-5"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 20,
              borderWidth: 1,
              borderColor: '#F1F5F9',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text
              className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs"
              style={{ fontSize: 12, fontWeight: '700', color: '#0F172A', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}
            >
              Edit Personal Info
            </Text>

            <Input
              label="First Name"
              placeholder="First Name"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (formErrors.firstName) setFormErrors({ ...formErrors, firstName: null });
              }}
              error={formErrors.firstName}
              leftIcon={
                <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} />
              }
            />

            <Input
              label="Last Name"
              placeholder="Last Name"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (formErrors.lastName) setFormErrors({ ...formErrors, lastName: null });
              }}
              error={formErrors.lastName}
              leftIcon={
                <Ionicons name="person-outline" size={18} color={COLORS.textSecondary} />
              }
            />

            <Input
              label="Email Address (Read-only)"
              value={user?.email || ''}
              editable={false}
              leftIcon={
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
              }
            />

            <Button
              title="Update Profile"
              onPress={handleUpdate}
              isLoading={isActionLoading}
              className="mt-2"
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Security & System Info */}
          <View
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-5"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 20,
              borderWidth: 1,
              borderColor: '#F1F5F9',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text
              className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs"
              style={{ fontSize: 12, fontWeight: '700', color: '#0F172A', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}
            >
              App & Security
            </Text>

            <View
              className="flex-row items-center justify-between py-2.5 border-b border-slate-100"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
              }}
            >
              <View className="flex-row items-center" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.income} />
                <Text className="text-sm text-slate-700 ml-2.5 font-medium" style={{ fontSize: 14, color: '#334155', marginLeft: 10, fontWeight: '500' }}>
                  Authentication
                </Text>
              </View>
              <Text className="text-xs font-semibold text-slate-500" style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>
                JWT Protected
              </Text>
            </View>

            <View
              className="flex-row items-center justify-between py-2.5 border-b border-slate-100"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
              }}
            >
              <View className="flex-row items-center" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="server-outline" size={18} color={COLORS.primary} />
                <Text className="text-sm text-slate-700 ml-2.5 font-medium" style={{ fontSize: 14, color: '#334155', marginLeft: 10, fontWeight: '500' }}>
                  Database
                </Text>
              </View>
              <Text className="text-xs font-semibold text-slate-500" style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>
                PostgreSQL
              </Text>
            </View>

            <View
              className="flex-row items-center justify-between py-2.5"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}
            >
              <View className="flex-row items-center" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="phone-portrait-outline" size={18} color={COLORS.textSecondary} />
                <Text className="text-sm text-slate-700 ml-2.5 font-medium" style={{ fontSize: 14, color: '#334155', marginLeft: 10, fontWeight: '500' }}>
                  Version
                </Text>
              </View>
              <Text className="text-xs font-semibold text-slate-500" style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>
                1.0.0
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="danger"
            icon={<Ionicons name="log-out-outline" size={20} color={COLORS.white} />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
