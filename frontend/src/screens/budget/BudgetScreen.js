import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchBudgets,
  fetchBudgetSummary,
  createBudget,
  updateBudget,
  deleteBudget,
  clearBudgetError,
} from '../../redux/slices/budgetSlice';
import { fetchDashboard } from '../../redux/slices/dashboardSlice';
import { formatCurrency } from '../../utils/currency';
import { getMonthName } from '../../utils/date';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { validateBudget } from '../../utils/validation';
import { confirmDialog } from '../../utils/alert';
import BudgetCard from '../../components/BudgetCard';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import COLORS from '../../constants/colors';

export const BudgetScreen = () => {
  const dispatch = useAppDispatch();
  const { budgets, summary, isLoading, isSubmitting, error } = useAppSelector(
    (state) => state.budgets
  );

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formCategory, setFormCategory] = useState(EXPENSE_CATEGORIES[0]?.name || 'Food');
  const [formAmount, setFormAmount] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const loadData = useCallback(async () => {
    const params = { month: selectedMonth, year: selectedYear };
    await Promise.all([
      dispatch(fetchBudgets(params)),
      dispatch(fetchBudgetSummary(params)),
    ]);
  }, [dispatch, selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const openCreateModal = () => {
    dispatch(clearBudgetError());
    setEditingBudget(null);
    setFormCategory(EXPENSE_CATEGORIES[0]?.name || 'Food');
    setFormAmount('');
    setFormErrors({});
    setModalVisible(true);
  };

  const openEditModal = (budget) => {
    dispatch(clearBudgetError());
    setEditingBudget(budget);
    setFormCategory(budget.category);
    setFormAmount(String(budget.amount));
    setFormErrors({});
    setModalVisible(true);
  };

  const handleDeleteBudget = (budget) => {
    confirmDialog({
      title: 'Delete Budget',
      message: `Are you sure you want to delete the budget for ${budget.category}?`,
      confirmText: 'Delete',
      isDestructive: true,
      onConfirm: async () => {
        await dispatch(deleteBudget(budget.id));
        const params = { month: selectedMonth, year: selectedYear };
        dispatch(fetchBudgets(params));
        dispatch(fetchBudgetSummary(params));
        dispatch(fetchDashboard());
      },
    });
  };

  const handleSaveBudget = async () => {
    dispatch(clearBudgetError());

    const validation = validateBudget({
      category: formCategory,
      amount: formAmount,
      month: selectedMonth,
      year: selectedYear,
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setFormErrors({});

    const payload = {
      category: formCategory,
      amount: parseFloat(formAmount).toFixed(2),
      month: selectedMonth,
      year: selectedYear,
    };

    let result;
    if (editingBudget) {
      result = await dispatch(updateBudget({ id: editingBudget.id, data: payload }));
    } else {
      result = await dispatch(createBudget(payload));
    }

    if (!result.error) {
      setModalVisible(false);
      const params = { month: selectedMonth, year: selectedYear };
      dispatch(fetchBudgets(params));
      dispatch(fetchBudgetSummary(params));
      dispatch(fetchDashboard());
    }
  };

  const totalBudget = Number(summary?.total_budget) || 0;
  const totalSpent = Number(summary?.total_spent) || 0;
  const remainingBudget = Number(summary?.remaining_budget) || 0;
  const percentageUsed = Number(summary?.percentage_used) || 0;
  const exceededCount = summary?.exceeded_count || 0;
  const warningCount = summary?.warning_count || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>Budget Planner</Text>
            <Text style={{ fontSize: 12, color: '#94A3B8' }}>Set limits and track spending</Text>
          </View>

          <Button
            title="Add Budget"
            size="sm"
            onPress={openCreateModal}
            icon={<Ionicons name="add" size={16} color={COLORS.white} />}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F1F5F9',
            borderRadius: 14,
            padding: 6,
            marginTop: 4,
          }}
        >
          <TouchableOpacity
            onPress={handlePrevMonth}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            }}
          >
            <Ionicons name="chevron-back" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>

          <TouchableOpacity
            onPress={handleNextMonth}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            }}
          >
            <Ionicons name="chevron-forward" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => dispatch(clearBudgetError())}
          />
        )}

        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: '#F1F5F9',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Total Monthly Budget
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B' }}>
              {percentageUsed}% used
            </Text>
          </View>

          <Text style={{ fontSize: 26, fontWeight: '900', color: '#0F172A', marginBottom: 12 }}>
            {formatCurrency(totalBudget)}
          </Text>

          <View style={{ width: '100%', backgroundColor: '#F1F5F9', height: 10, borderRadius: 9999, overflow: 'hidden', marginBottom: 12 }}>
            <View
              style={{
                height: '100%',
                borderRadius: 9999,
                width: `${Math.min(100, Math.max(0, percentageUsed))}%`,
                backgroundColor:
                  percentageUsed > 100
                    ? COLORS.expense
                    : percentageUsed >= 80
                    ? COLORS.warning
                    : COLORS.primary,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2 }}>
            <View>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>Spent</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 2 }}>
                {formatCurrency(totalSpent)}
              </Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>
                {remainingBudget >= 0 ? 'Remaining' : 'Over Limit'}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  marginTop: 2,
                  color: remainingBudget >= 0 ? '#16A34A' : '#DC2626',
                }}
              >
                {formatCurrency(Math.abs(remainingBudget))}
              </Text>
            </View>
          </View>

          {(exceededCount > 0 || warningCount > 0) && (
            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="alert-circle"
                size={16}
                color={exceededCount > 0 ? COLORS.expense : COLORS.warning}
              />
              <Text style={{ fontSize: 12, color: '#475569', marginLeft: 6, flex: 1, fontWeight: '500' }}>
                {exceededCount > 0
                  ? `${exceededCount} categories exceeded their budgeted limit!`
                  : `${warningCount} categories reached 80% or more of their limit.`}
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>
            Category Budgets ({budgets.length})
          </Text>
        </View>

        {isLoading && !refreshing ? (
          <Loading message="Loading budgets..." fullScreen={false} />
        ) : budgets.length > 0 ? (
          budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={openEditModal}
              onDelete={handleDeleteBudget}
            />
          ))
        ) : (
          <EmptyState
            icon="calculator-outline"
            title="No Budgets Set"
            description={`You haven't set any budgets for ${getMonthName(
              selectedMonth
            )} ${selectedYear}. Set one to avoid overspending!`}
            actionTitle="Create First Budget"
            onAction={openCreateModal}
          />
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        >
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
                {editingBudget ? 'Edit Budget' : 'Add Category Budget'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
              Budget period: {getMonthName(selectedMonth)} {selectedYear}
            </Text>

            <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 }}>
              Expense Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              {EXPENSE_CATEGORIES.map((cat) => {
                const isSelected = formCategory === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setFormCategory(cat.name)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      marginRight: 8,
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
            </ScrollView>

            <Input
              label="Monthly Budget Amount (₹) *"
              placeholder="e.g. 5000.00"
              value={formAmount}
              onChangeText={(text) => {
                setFormAmount(text);
                if (formErrors.amount) setFormErrors({ ...formErrors, amount: null });
              }}
              keyboardType="decimal-pad"
              error={formErrors.amount}
              leftIcon={
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#334155', marginLeft: 4 }}>₹</Text>
              }
            />

            <Button
              title={editingBudget ? 'Save Changes' : 'Create Budget'}
              onPress={handleSaveBudget}
              isLoading={isSubmitting}
              style={{ marginTop: 8 }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default BudgetScreen;
