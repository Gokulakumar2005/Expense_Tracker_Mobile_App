import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppModal from './AppModal';
import Input from './Input';
import Button from './Button';
import { formatCurrency } from '../utils/currency';
import { getMonthName } from '../utils/date';
import { EXPENSE_CATEGORIES, getCategoryMeta } from '../constants/categories';
import COLORS from '../constants/colors';

export const EditBudgetModal = ({
  visible,
  budget,
  month,
  year,
  onSave,
  onClose,
  isLoading = false,
  error = null,
}) => {
  const isEditing = Boolean(budget);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]?.name || 'Monthly Expenses');
  const [amount, setAmount] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (budget) {
      setCategory(budget.category);
      setAmount(String(budget.amount));
    } else {
      setCategory(EXPENSE_CATEGORIES[0]?.name || 'Monthly Expenses');
      setAmount('');
    }
    setValidationError('');
  }, [budget, visible]);

  const currentBudget = Number(budget?.amount) || 0;
  const currentSpent = Number(budget?.spent) || 0;
  const newBudgetAmount = parseFloat(amount) || 0;
  const newRemaining = newBudgetAmount - currentSpent;

  const categoryMeta = getCategoryMeta(category, 'EXPENSE');

  const handleSave = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setValidationError('Please enter a valid budget amount greater than 0.');
      return;
    }
    setValidationError('');
    onSave({
      category,
      amount: num.toFixed(2),
      month,
      year,
    });
  };

  return (
    <AppModal
      visible={visible}
      onClose={onClose}
      title={isEditing ? 'Edit Budget' : 'Create Budget'}
      subtitle={`${getMonthName(month)} ${year}`}
      headerIcon={isEditing ? 'pencil' : 'calculator'}
      headerIconColor={COLORS.primary}
    >
      {/* Category Selection / Display */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 }}>
          Category
        </Text>
        {isEditing ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: 14,
              padding: 12,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: `${categoryMeta.color}15`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Ionicons name={categoryMeta.icon} size={18} color={categoryMeta.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>{category}</Text>
              <Text style={{ fontSize: 11, color: '#94A3B8' }}>Expense Category</Text>
            </View>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
            {EXPENSE_CATEGORIES.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.name)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    marginHorizontal: 4,
                    borderWidth: 1,
                    borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                    backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                  }}
                >
                  <Ionicons name={cat.icon} size={16} color={isSelected ? '#2563EB' : cat.color} />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 12,
                      fontWeight: '700',
                      color: isSelected ? '#1D4ED8' : '#334155',
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Budget Amount Input */}
      <Input
        label="Budget Amount (₹) *"
        placeholder="e.g. 7000"
        value={amount}
        onChangeText={(text) => {
          setAmount(text);
          if (validationError) setValidationError('');
        }}
        keyboardType="decimal-pad"
        error={validationError || error}
        leftIcon={<Text style={{ fontSize: 16, fontWeight: '800', color: '#334155', marginLeft: 4 }}>₹</Text>}
      />

      {/* Dynamic Calculation Preview Box */}
      <View
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 16,
          padding: 14,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#E2E8F0',
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }}>
          Budget Calculation Preview
        </Text>

        {isEditing && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: '#64748B' }}>Current Budget</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                {formatCurrency(currentBudget)}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: '#64748B' }}>Current Spent</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626' }}>
                {formatCurrency(currentSpent)}
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: 6 }} />
          </>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A' }}>New Remaining</Text>
            <Text style={{ fontSize: 11, color: '#94A3B8' }}>
              Formula: New Budget - Spent
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '900',
              color: newRemaining >= 0 ? '#16A34A' : '#DC2626',
            }}
          >
            {formatCurrency(newRemaining)}
          </Text>
        </View>

        {newRemaining < 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#FEE2E2', padding: 8, borderRadius: 8 }}>
            <Ionicons name="alert-circle" size={14} color="#DC2626" />
            <Text style={{ fontSize: 11, color: '#B91C1C', fontWeight: '700', marginLeft: 6 }}>
              Warning: Spending ({formatCurrency(currentSpent)}) exceeds this new budget!
            </Text>
          </View>
        )}
      </View>

      {/* Buttons */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
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
            backgroundColor: '#2563EB',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>
            {isLoading ? 'Updating...' : isEditing ? 'Update Budget' : 'Create Budget'}
          </Text>
        </TouchableOpacity>
      </View>
    </AppModal>
  );
};

export default EditBudgetModal;
