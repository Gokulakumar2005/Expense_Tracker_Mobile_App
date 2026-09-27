import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  createTransaction,
  updateTransaction,
  clearTransactionError,
} from '../../redux/slices/transactionSlice';
import { fetchDashboard } from '../../redux/slices/dashboardSlice';
import { fetchBudgetSummary } from '../../redux/slices/budgetSlice';
import { validateTransaction } from '../../utils/validation';
import { getTodayDateString } from '../../utils/date';
import { showNotice } from '../../utils/alert';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Header from '../../components/Header';
import ErrorMessage from '../../components/ErrorMessage';
import COLORS from '../../constants/colors';

export const AddTransactionScreen = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { isSubmitting, error } = useAppSelector((state) => state.transactions);

  const existingTx = route.params?.transaction;
  const isEditing = Boolean(existingTx);

  const [txType, setTxType] = useState(existingTx?.transaction_type || 'EXPENSE');
  const [title, setTitle] = useState(existingTx?.title || '');
  const [amount, setAmount] = useState(existingTx?.amount ? String(existingTx.amount) : '');
  const [category, setCategory] = useState(existingTx?.category || 'Food');
  const [transactionDate, setTransactionDate] = useState(
    existingTx?.transaction_date || getTodayDateString()
  );
  const [description, setDescription] = useState(existingTx?.description || '');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (!existingTx) {
      if (txType === 'INCOME') {
        setCategory('Salary');
      } else {
        setCategory('Food');
      }
    }
  }, [txType, existingTx]);

  const categories = txType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async () => {
    dispatch(clearTransactionError());

    const validation = validateTransaction({
      title,
      amount,
      category,
      transaction_date: transactionDate,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});

    const payload = {
      title: title.trim(),
      amount: parseFloat(amount).toFixed(2),
      transaction_type: txType,
      category: category.trim(),
      description: description.trim(),
      transaction_date: transactionDate,
    };

    let resultAction;
    if (isEditing) {
      resultAction = await dispatch(updateTransaction({ id: existingTx.id, data: payload }));
    } else {
      resultAction = await dispatch(createTransaction(payload));
    }

    if (!resultAction.error) {
      dispatch(fetchDashboard());
      dispatch(fetchBudgetSummary());

      showNotice({
        title: 'Success',
        message: isEditing
          ? 'Transaction updated successfully!'
          : 'Transaction added successfully!',
        onOk: () => navigation.goBack(),
      });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} className="flex-1 bg-slate-50">
      <Header
        title={isEditing ? 'Edit Transaction' : 'Add Transaction'}
        subtitle="Record your income or expense"
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        >
          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => dispatch(clearTransactionError())}
            />
          )}

          {/* Transaction Type Segmented Toggle */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#E2E8F0',
              padding: 4,
              borderRadius: 16,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => setTxType('EXPENSE')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: txType === 'EXPENSE' ? '#FFFFFF' : 'transparent',
                shadowColor: txType === 'EXPENSE' ? '#000000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
              }}
            >
              <Ionicons
                name="arrow-up-circle"
                size={18}
                color={txType === 'EXPENSE' ? COLORS.expense : COLORS.textMuted}
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontWeight: '700',
                  fontSize: 14,
                  color: txType === 'EXPENSE' ? '#DC2626' : '#64748B',
                }}
              >
                Expense
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTxType('INCOME')}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: txType === 'INCOME' ? '#FFFFFF' : 'transparent',
                shadowColor: txType === 'INCOME' ? '#000000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
              }}
            >
              <Ionicons
                name="arrow-down-circle"
                size={18}
                color={txType === 'INCOME' ? COLORS.income : COLORS.textMuted}
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontWeight: '700',
                  fontSize: 14,
                  color: txType === 'INCOME' ? '#16A34A' : '#64748B',
                }}
              >
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields Card */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              padding: 20,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: '#F1F5F9',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              marginBottom: 20,
            }}
          >
            {/* Title Input */}
            <Input
              label="Transaction Title *"
              placeholder="e.g. Grocery Store, Client Payment"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (formErrors.title) setFormErrors({ ...formErrors, title: null });
              }}
              error={formErrors.title}
              leftIcon={
                <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
              }
            />

            {/* Amount Input */}
            <Input
              label="Amount (₹) *"
              placeholder="0.00"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (formErrors.amount) setFormErrors({ ...formErrors, amount: null });
              }}
              keyboardType="decimal-pad"
              error={formErrors.amount}
              leftIcon={
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginLeft: 4 }}>₹</Text>
              }
            />

            {/* Date Input */}
            <Input
              label="Date (YYYY-MM-DD) *"
              placeholder="YYYY-MM-DD"
              value={transactionDate}
              onChangeText={(text) => {
                setTransactionDate(text);
                if (formErrors.transaction_date)
                  setFormErrors({ ...formErrors, transaction_date: null });
              }}
              error={formErrors.transaction_date}
              leftIcon={
                <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
              }
            />

            {/* Category Selection Grid */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8, marginLeft: 2 }}>
              Select Category *
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {categories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setCategory(cat.name);
                      if (formErrors.category)
                        setFormErrors({ ...formErrors, category: null });
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                      backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    }}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={16}
                      color={isSelected ? COLORS.primary : cat.color}
                    />
                    <Text
                      style={{
                        marginLeft: 6,
                        fontSize: 12,
                        fontWeight: '600',
                        color: isSelected ? '#1D4ED8' : '#334155',
                      }}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {formErrors.category && (
              <Text style={{ fontSize: 12, color: '#DC2626', marginBottom: 12 }}>{formErrors.category}</Text>
            )}

            {/* Description (Optional) */}
            <Input
              label="Note / Description (Optional)"
              placeholder="Add additional details about this transaction..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Submit Button */}
            <Button
              title={isEditing ? 'Update Transaction' : 'Save Transaction'}
              onPress={handleSubmit}
              isLoading={isSubmitting}
              style={{ marginTop: 8 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddTransactionScreen;
