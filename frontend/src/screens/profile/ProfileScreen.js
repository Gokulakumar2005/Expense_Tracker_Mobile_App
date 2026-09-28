import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const [isEditing, setIsEditing] = useState(false);
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

  const handleStartEdit = () => {
    dispatch(clearAuthError());
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setFormErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    dispatch(clearAuthError());
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setFormErrors({});
    setIsEditing(false);
  };

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
      setIsEditing(false);
      showNotice({
        title: 'Success',
        message: 'Profile updated successfully!',
      });
    }
  };

  const handleLogout = () => {
    confirmDialog({
      title: 'Log Out',
      message: 'Are you sure you want to log out of Expense Tracker?',
      confirmText: 'Log Out',
      isDestructive: true,
      onConfirm: () => {
        dispatch(logoutUser());
      },
    });
  };

  const initials = `${user?.first_name?.[0] || 'U'}${user?.last_name?.[0] || ''}`.toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header title="My Profile" subtitle="Account settings & preferences" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

          <View
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
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#FFFFFF' }}>
                {initials}
              </Text>
            </View>

            <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A', textAlign: 'center' }}>
              {user?.first_name || ''} {user?.last_name || ''}
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 2 }}>
              {user?.email}
            </Text>

            {user?.created_at && (
              <View
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
                <Text style={{ fontSize: 12, color: '#475569', marginLeft: 6, fontWeight: '500' }}>
                  Member since {formatDate(user.created_at)}
                </Text>
              </View>
            )}
          </View>

          <View
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
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: '#0F172A',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Personal Details
              </Text>
              {!isEditing && (
                <TouchableOpacity
                  onPress={handleStartEdit}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#EFF6FF',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 9999,
                  }}
                >
                  <Ionicons name="pencil" size={13} color="#2563EB" />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: '#2563EB',
                      marginLeft: 4,
                    }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!isEditing ? (
              <View style={{ gap: 12 }}>
                <View
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    First Name
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#0F172A', marginTop: 4 }}>
                    {user?.first_name || 'Not set'}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Last Name
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#0F172A', marginTop: 4 }}>
                    {user?.last_name || 'Not set'}
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: '#F8FAFC',
                    padding: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>
                    Email Address
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#0F172A', marginTop: 4 }}>
                    {user?.email || 'Not set'}
                  </Text>
                </View>

                <Button
                  title="Update Profile Details"
                  onPress={handleStartEdit}
                  icon={<Ionicons name="create-outline" size={18} color="#FFFFFF" />}
                  style={{ marginTop: 6 }}
                />
              </View>
            ) : (
              <View>
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
                  label="Email Address (Account ID)"
                  value={user?.email || ''}
                  editable={false}
                  leftIcon={
                    <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
                  }
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Cancel"
                      onPress={handleCancelEdit}
                      variant="secondary"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      title="Submit"
                      onPress={handleUpdate}
                      isLoading={isActionLoading}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          <View
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
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#0F172A',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              App & Security
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.income} />
                <Text style={{ fontSize: 14, color: '#334155', marginLeft: 10, fontWeight: '500' }}>
                  Authentication
                </Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>
                JWT Protected
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#F1F5F9',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="server-outline" size={18} color={COLORS.primary} />
                <Text style={{ fontSize: 14, color: '#334155', marginLeft: 10, fontWeight: '500' }}>
                  Database
                </Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>
                PostgreSQL
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="phone-portrait-outline" size={18} color={COLORS.textSecondary} />
                <Text style={{ fontSize: 14, color: '#334155', marginLeft: 10, fontWeight: '500' }}>
                  Version
                </Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>
                1.0.0
              </Text>
            </View>
          </View>

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
