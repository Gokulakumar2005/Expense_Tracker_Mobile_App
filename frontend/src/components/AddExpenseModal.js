import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppModal from './AppModal';
import Input from './Input';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { getTodayDateString } from '../utils/date';
import COLORS from '../constants/colors';

export const AddExpenseModal = ({
  visible,
  onClose,
  onSave,
  isLoading = false,
  error = null,
  initialType = 'EXPENSE',
}) => {
  const [txType, setTxType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(getTodayDateString());
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      setTxType(initialType);
      setAmount('');
      setTitle('');
      setCategory(initialType === 'INCOME' ? 'Salary' : 'Food');
      setDate(getTodayDateString());
      setDescription('');
      setErrors({});
    }
  }, [visible, initialType]);

  const categories = txType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (newType) => {
    setTxType(newType);
    setCategory(newType === 'INCOME' ? 'Salary' : 'Food');
  };

  const handleSave = () => {
    const errs = {};
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      errs.amount = 'Amount must be greater than 0';
    }
    if (!category) {
      errs.category = 'Please select a category';
    }
    if (!date) {
      errs.date = 'Date is required';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    onSave({
      title: title.trim() || `${category} ${txType === 'INCOME' ? 'Income' : 'Expense'}`,
      amount: num.toFixed(2),
      transaction_type: txType,
      category: category.trim(),
      description: description.trim(),
      transaction_date: date,
    });
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={txType === 'INCOME' ? 'Add Income' : 'Add Expense'}
      subtitle="Record actual financial transaction"
      headerIcon={txType === 'INCOME' ? 'arrow-down-circle' : 'arrow-up-circle'}
      headerIconColor={txType === 'INCOME' ? '#16A34A' : '#DC2626'}
    >
      {/* Type Toggle */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#F1F5F9',
          borderRadius: 14,
          padding: 4,
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => handleTypeChange('EXPENSE')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: txType === 'EXPENSE' ? '#FFFFFF' : 'transparent',
            shadowColor: txType === 'EXPENSE' ? '#000000' : 'transparent',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: txType === 'EXPENSE' ? '#DC2626' : '#64748B',
            }}
          >
            Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTypeChange('INCOME')}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: txType === 'INCOME' ? '#FFFFFF' : 'transparent',
            shadowColor: txType === 'INCOME' ? '#000000' : 'transparent',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: txType === 'INCOME' ? '#16A34A' : '#64748B',
            }}
          >
            Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount */}
      <Input
        label="Amount (₹) *"
        placeholder="0.00"
        value={amount}
        onChangeText={(text) => {
          setAmount(text);
          if (errors.amount) setErrors({ ...errors, amount: null });
        }}
        keyboardType="decimal-pad"
        error={errors.amount}
        leftIcon={<Text style={{ fontSize: 16, fontWeight: '800', color: '#334155', marginLeft: 4 }}>₹</Text>}
      />

      {/* Category selector */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 }}>
          Category *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
          {categories.map((cat) => {
            const isSelected = category === cat.name;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => {
                  setCategory(cat.name);
                  if (errors.category) setErrors({ ...errors, category: null });
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  marginHorizontal: 4,
                  borderWidth: 1,
                  borderColor: isSelected ? (txType === 'INCOME' ? '#16A34A' : '#2563EB') : '#E2E8F0',
                  backgroundColor: isSelected ? (txType === 'INCOME' ? '#DCFCE7' : '#EFF6FF') : '#F8FAFC',
                }}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={isSelected ? (txType === 'INCOME' ? '#15803D' : '#1D4ED8') : cat.color}
                />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 12,
                    fontWeight: '700',
                    color: isSelected ? (txType === 'INCOME' ? '#15803D' : '#1D4ED8') : '#334155',
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {errors.category && (
          <Text style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{errors.category}</Text>
        )}
      </View>

      {/* Description / Title */}
      <Input
        label="Description (Optional)"
        placeholder="e.g. Lunch, Groceries, Client project"
        value={description}
        onChangeText={setDescription}
        leftIcon={<Ionicons name="document-text-outline" size={18} color="#64748B" />}
      />

      {/* Date */}
      <Input
        label="Date (YYYY-MM-DD) *"
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={(text) => {
          setDate(text);
          if (errors.date) setErrors({ ...errors, date: null });
        }}
        error={errors.date}
        leftIcon={<Ionicons name="calendar-outline" size={18} color="#64748B" />}
      />

      {error ? (
        <Text style={{ fontSize: 12, color: '#DC2626', marginBottom: 12, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}

      {/* Buttons */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <TouchableOpacity
          onPress={onClose}
          disabled={isLoading}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 14,
            backgroundColor: '#F1F5F9',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#475569' }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 14,
            backgroundColor: txType === 'INCOME' ? '#16A34A' : '#2563EB',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: txType === 'INCOME' ? '#16A34A' : '#2563EB',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>
            {isLoading ? 'Saving...' : txType === 'INCOME' ? 'Add Income' : 'Add Expense'}
          </Text>
        </TouchableOpacity>
      </View>
    </AppModal>
  );
};

export default AddExpenseModal;
