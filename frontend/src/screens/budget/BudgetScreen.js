import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
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
import { fetchMonthlySummary } from '../../redux/slices/monthlySlice';
import { formatCurrency } from '../../utils/currency';
import { getMonthName } from '../../utils/date';
import BudgetCard from '../../components/BudgetCard';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import EditBudgetModal from '../../components/EditBudgetModal';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';
import MonthYearPicker from '../../components/MonthYearPicker';
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

  // Modals state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const loadData = useCallback(async () => {
    const params = { month: selectedMonth, year: selectedYear };
    await Promise.all([
      dispatch(fetchBudgets(params)),
      dispatch(fetchBudgetSummary(params)),
      dispatch(fetchMonthlySummary(params)),
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
    setModalVisible(true);
  };

  const openEditModal = (budget) => {
    dispatch(clearBudgetError());
    setEditingBudget(budget);
    setModalVisible(true);
  };

  const handleSaveBudget = async (payload) => {
    dispatch(clearBudgetError());
    let result;
    if (editingBudget) {
      result = await dispatch(updateBudget({ id: editingBudget.id, data: payload }));
    } else {
      result = await dispatch(createBudget(payload));
    }

    if (!result.error) {
      setModalVisible(false);
      showToast(
        editingBudget ? '✓ Budget updated successfully' : '✓ Budget created successfully',
        'success'
      );
      const params = { month: selectedMonth, year: selectedYear };
      dispatch(fetchBudgets(params));
      dispatch(fetchBudgetSummary(params));
      dispatch(fetchMonthlySummary(params));
      dispatch(fetchDashboard(params));
    }
  };

  const promptDeleteBudget = (budget) => {
    setBudgetToDelete(budget);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!budgetToDelete) return;
    setIsDeleting(true);
    const result = await dispatch(deleteBudget(budgetToDelete.id));
    setIsDeleting(false);
    setDeleteModalVisible(false);

    if (!result.error) {
      showToast('✓ Budget deleted successfully', 'success');
      const params = { month: selectedMonth, year: selectedYear };
      dispatch(fetchBudgets(params));
      dispatch(fetchBudgetSummary(params));
      dispatch(fetchMonthlySummary(params));
      dispatch(fetchDashboard(params));
    } else {
      showToast('Failed to delete budget. Please try again.', 'error');
    }
  };

  const totalBudget = Number(summary?.total_budget) || 0;
  const totalSpent = Number(summary?.total_spent) || 0;
  const remainingBudget = Number(summary?.remaining_budget ?? (totalBudget - totalSpent)) || 0;
  const percentageUsed = Number(summary?.percentage_used) || 0;
  const exceededCount = summary?.exceeded_count || 0;
  const warningCount = summary?.warning_count || 0;
  const totalIncome = Number(summary?.total_income) || 0;
  const savings = Number(summary?.savings ?? (totalIncome - totalSpent)) || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Floating Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      {/* Top Header */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>
              Budget Planner
            </Text>
            <Text style={{ fontSize: 12, color: '#94A3B8' }}>
              Set spending limits and track planned limits
            </Text>
          </View>

          <Button
            title="Add Budget"
            size="sm"
            onPress={openCreateModal}
            icon={<Ionicons name="add" size={16} color={COLORS.white} />}
          />
        </View>

        {/* Month Selector Component */}
        <MonthYearPicker
          month={selectedMonth}
          year={selectedYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
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

        {/* Centralized Summary Card */}
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
            elevation: 2,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              Total Monthly Budget
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '800',
                color: percentageUsed > 100 ? '#DC2626' : percentageUsed >= 80 ? '#D97706' : '#2563EB',
              }}
            >
              {percentageUsed}% used
            </Text>
          </View>

          <Text style={{ fontSize: 26, fontWeight: '900', color: '#0F172A', marginBottom: 12 }}>
            {formatCurrency(totalBudget)}
          </Text>

          {/* Progress Bar */}
          <View
            style={{
              width: '100%',
              backgroundColor: '#F1F5F9',
              height: 10,
              borderRadius: 9999,
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            <View
              style={{
                height: '100%',
                borderRadius: 9999,
                width: `${Math.min(100, Math.max(0, percentageUsed))}%`,
                backgroundColor:
                  percentageUsed > 100
                    ? '#DC2626'
                    : percentageUsed >= 80
                    ? '#F59E0B'
                    : '#2563EB',
              }}
            />
          </View>

          {/* Key Metrics Grid */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 4,
            }}
          >
            <View>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>Spent</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 2 }}>
                {formatCurrency(totalSpent)}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>Remaining Budget</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '800',
                  marginTop: 2,
                  color: remainingBudget >= 0 ? '#16A34A' : '#DC2626',
                }}
              >
                {formatCurrency(remainingBudget)}
              </Text>
            </View>

            {totalIncome > 0 && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '600' }}>Savings</Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '800',
                    marginTop: 2,
                    color: savings >= 0 ? '#2563EB' : '#DC2626',
                  }}
                >
                  {formatCurrency(savings)}
                </Text>
              </View>
            )}
          </View>

          {(exceededCount > 0 || warningCount > 0) && (
            <View
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: '#F1F5F9',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="alert-circle"
                size={16}
                color={exceededCount > 0 ? '#DC2626' : '#F59E0B'}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: exceededCount > 0 ? '#B91C1C' : '#B45309',
                  marginLeft: 6,
                  flex: 1,
                  fontWeight: '600',
                }}
              >
                {exceededCount > 0
                  ? `${exceededCount} category budget limits exceeded!`
                  : `${warningCount} categories reached 80% or more of their planned limit.`}
              </Text>
            </View>
          )}
        </View>

        {/* Category Budgets Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>
            Category Budgets ({budgets.length})
          </Text>
        </View>

        {/* Category Budgets List or Empty State */}
        {isLoading && !refreshing ? (
          <Loading message="Loading budget..." fullScreen={false} />
        ) : budgets.length > 0 ? (
          budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={openEditModal}
              onDelete={promptDeleteBudget}
            />
          ))
        ) : (
          <EmptyState
            icon="calculator-outline"
            title="No budget created"
            description="Create a monthly budget to start tracking your spending."
            actionTitle="Create Budget"
            onAction={openCreateModal}
          />
        )}
      </ScrollView>

      {/* Edit / Create Budget Modal */}
      <EditBudgetModal
        visible={modalVisible}
        budget={editingBudget}
        month={selectedMonth}
        year={selectedYear}
        onSave={handleSaveBudget}
        onClose={() => setModalVisible(false)}
        isLoading={isSubmitting}
        error={error}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Budget?"
        message={`This budget for '${budgetToDelete?.category}' will be permanently removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setBudgetToDelete(null);
        }}
      />
    </SafeAreaView>
  );
};

export default BudgetScreen;
