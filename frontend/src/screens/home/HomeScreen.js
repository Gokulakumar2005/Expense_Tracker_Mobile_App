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
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchDashboard } from '../../redux/slices/dashboardSlice';
import { fetchMonthlySummary } from '../../redux/slices/monthlySlice';
import {
  fetchBudgets,
  fetchBudgetSummary,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../../redux/slices/budgetSlice';
import { createTransaction } from '../../redux/slices/transactionSlice';
import { formatCurrency } from '../../utils/currency';
import { getMonthName } from '../../utils/date';
import Card from '../../components/Card';
import BudgetCard from '../../components/BudgetCard';
import TransactionCard from '../../components/TransactionCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import AddExpenseModal from '../../components/AddExpenseModal';
import EditBudgetModal from '../../components/EditBudgetModal';
import ConfirmModal from '../../components/ConfirmModal';
import EndOfMonthModal from '../../components/EndOfMonthModal';
import Toast from '../../components/Toast';
import COLORS from '../../constants/colors';

export const HomeScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data: dashboard, isLoading, error } = useAppSelector(
    (state) => state.dashboard
  );
  const { budgets } = useAppSelector((state) => state.budgets);

  const [refreshing, setRefreshing] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [eomModalVisible, setEomModalVisible] = useState(false);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  // Budget modal on dashboard
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isSubmittingBudget, setIsSubmittingBudget] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState(null);
  const [isDeletingBudget, setIsDeletingBudget] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const loadData = useCallback(async () => {
    const params = { month: currentMonth, year: currentYear };
    await Promise.all([
      dispatch(fetchDashboard(params)),
      dispatch(fetchMonthlySummary(params)),
      dispatch(fetchBudgetSummary(params)),
      dispatch(fetchBudgets(params)),
    ]);
  }, [dispatch, currentMonth, currentYear]);

  // Load when screen mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Re-fetch automatically whenever user navigates back to Dashboard tab
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddTransaction = async (txData) => {
    setIsSubmittingTx(true);
    const result = await dispatch(createTransaction(txData));
    setIsSubmittingTx(false);

    if (!result.error) {
      setAddModalVisible(false);
      showToast(
        txData.transaction_type === 'INCOME'
          ? '✓ Income added successfully'
          : '✓ Expense added successfully',
        'success'
      );
      // Immediately refresh all financial summaries to update appropriate budget!
      await loadData();
    } else {
      showToast(result.payload || 'Failed to save transaction.', 'error');
    }
  };

  const handleSaveBudget = async (payload) => {
    setIsSubmittingBudget(true);
    let result;
    if (editingBudget) {
      result = await dispatch(updateBudget({ id: editingBudget.id, data: payload }));
    } else {
      result = await dispatch(createBudget(payload));
    }
    setIsSubmittingBudget(false);

    if (!result.error) {
      setBudgetModalVisible(false);
      showToast(
        editingBudget ? '✓ Budget updated successfully' : '✓ Budget created successfully',
        'success'
      );
      await loadData();
    } else {
      showToast(result.payload || 'Failed to save budget.', 'error');
    }
  };

  const handleConfirmDeleteBudget = async () => {
    if (!budgetToDelete) return;
    setIsDeletingBudget(true);
    const result = await dispatch(deleteBudget(budgetToDelete.id));
    setIsDeletingBudget(false);
    setDeleteModalVisible(false);

    if (!result.error) {
      showToast('✓ Budget deleted successfully', 'success');
      setBudgetToDelete(null);
      await loadData();
    } else {
      showToast('Failed to delete budget.', 'error');
    }
  };

  const userName = user?.first_name ? `${user.first_name}` : 'User';
  const recentTransactions = dashboard?.recent_transactions || [];
  const monthlyIncome = Number(dashboard?.monthly_income) || 0;
  const monthlyBudget = Number(dashboard?.monthly_budget) || 0;
  const monthlyExpense = Number(dashboard?.monthly_expense) || 0;
  const remainingBudget = Number(
    dashboard?.remaining_budget !== undefined
      ? dashboard.remaining_budget
      : monthlyBudget - monthlyExpense
  );
  const savings = Number(
    dashboard?.savings !== undefined
      ? dashboard.savings
      : monthlyIncome - monthlyExpense
  );
  const budgetPercentage = Number(dashboard?.budget_percentage) || 0;

  // Active budgets for this month: prefer category_budgets calculated by backend with live spent amounts
  const activeBudgets =
    dashboard?.category_budgets && dashboard.category_budgets.length > 0
      ? dashboard.category_budgets
      : (budgets || []).filter(
          (b) => Number(b.month) === currentMonth && Number(b.year) === currentYear
        );

  const currentMonthName = dashboard?.current_month_name || getMonthName(currentMonth);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      {/* Top Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 12,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
        }}
      >
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Welcome back
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 2 }}>
            Hello, {userName} 👋
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setEomModalVisible(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FEF3C7',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Month summary review"
          >
            <Text style={{ fontSize: 18 }}>🎉</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAddModalVisible(true)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#2563EB',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#2563EB',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 3,
            }}
            accessibilityLabel="Quick add transaction"
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
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
            colors={['#2563EB']}
          />
        }
      >
        {error && (
          <ErrorMessage
            message={error}
            onRetry={loadData}
          />
        )}

        {/* HERO CARD IN BLUE: TOTAL MONTHLY BUDGET WITH EXPENSES DEDUCTED */}
        <View
          style={{
            backgroundColor: '#2563EB',
            borderRadius: 24,
            padding: 22,
            marginBottom: 16,
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          {/* Header Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}
              >
                <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
              </View>
              <Text style={{ color: '#DBEAFE', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Total Monthly Budget
              </Text>
            </View>

            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                {currentMonthName} {currentYear}
              </Text>
            </View>
          </View>

          {/* Large Budget Amount */}
          <Text style={{ color: '#FFFFFF', fontSize: 34, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 }}>
            {formatCurrency(monthlyBudget)}
          </Text>

          <Text style={{ color: '#BFDBFE', fontSize: 12, fontWeight: '500', marginBottom: 14 }}>
            {monthlyBudget > 0
              ? `One Total Budget for Month • ${activeBudgets.length} ${activeBudgets.length === 1 ? 'Budget Active' : 'Budgets Active'}`
              : 'No budget set yet for this month'}
          </Text>

          {/* Progress Bar */}
          <View
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
              height: 8,
              borderRadius: 9999,
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <View
              style={{
                height: '100%',
                borderRadius: 9999,
                width: `${Math.min(100, Math.max(0, budgetPercentage))}%`,
                backgroundColor:
                  budgetPercentage > 100
                    ? '#FCA5A5'
                    : budgetPercentage >= 80
                    ? '#FDE047'
                    : '#FFFFFF',
              }}
            />
          </View>

          {/* Deductions Container: Budget - Expense = Remaining */}
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderRadius: 16,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Deducted Expenses */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#DBEAFE', fontSize: 11, fontWeight: '500' }}>
                Expenses Deducted
              </Text>
              <Text style={{ color: '#FECACA', fontSize: 16, fontWeight: '800', marginTop: 2 }}>
                - {formatCurrency(monthlyExpense)}
              </Text>
            </View>

            <View style={{ width: 1, height: 32, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginHorizontal: 8 }} />

            {/* Remaining Amount */}
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ color: '#DBEAFE', fontSize: 11, fontWeight: '500' }}>
                {remainingBudget >= 0 ? 'Remaining Budget' : 'Over Budget'}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '900',
                  marginTop: 2,
                  color: remainingBudget >= 0 ? '#86EFAC' : '#FCA5A5',
                }}
              >
                {formatCurrency(remainingBudget)}
              </Text>
            </View>
          </View>

          {/* Action Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => {
                setEditingBudget(null);
                setBudgetModalVisible(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Ionicons name="add" size={14} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700', marginLeft: 4 }}>
                Add New Budget
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Budget')}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ color: '#DBEAFE', fontSize: 11, fontWeight: '700', marginRight: 4 }}>
                Manage All
              </Text>
              <Ionicons name="arrow-forward" size={12} color="#DBEAFE" />
            </TouchableOpacity>
          </View>
        </View>

        {/* FINANCIAL SUMMARY ROW: INCOME, SAVINGS, BALANCE */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          {/* Monthly Income Card */}
          <Card style={{ flex: 1, padding: 14, backgroundColor: '#FFFFFF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="arrow-down" size={15} color="#16A34A" />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#15803D', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 }}>
                Income
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>This Month</Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#16A34A', marginTop: 2 }}>
              {formatCurrency(monthlyIncome)}
            </Text>
          </Card>

          {/* Actual Savings Card */}
          <Card style={{ flex: 1, padding: 14, backgroundColor: '#FFFFFF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="trending-up" size={15} color="#2563EB" />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#1D4ED8', backgroundColor: '#EFF6FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 }}>
                Savings
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>Income - Exp</Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '800',
                color: savings >= 0 ? '#2563EB' : '#DC2626',
                marginTop: 2,
              }}
            >
              {formatCurrency(savings)}
            </Text>
          </Card>

          {/* Total Balance Card */}
          <Card style={{ flex: 1, padding: 14, backgroundColor: '#FFFFFF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="cash-outline" size={15} color="#475569" />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#475569', backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9999 }}>
                Net
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' }}>Total Balance</Text>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A', marginTop: 2 }}>
              {formatCurrency(dashboard?.total_balance || 0)}
            </Text>
          </Card>
        </View>

        {/* ACTIVE BUDGETS ON DASHBOARD: IF 1 CREATED -> 1 SHOWN; IF 2 CREATED -> 2 SHOWN */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
                Active Budgets ({activeBudgets.length})
              </Text>
              <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                {activeBudgets.length > 0
                  ? `Tracking expenses for ${currentMonthName}`
                  : 'No budgets created yet for this month'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setEditingBudget(null);
                setBudgetModalVisible(true);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#EFF6FF',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 10,
              }}
            >
              <Ionicons name="add" size={16} color="#2563EB" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB', marginLeft: 4 }}>
                Add Budget
              </Text>
            </TouchableOpacity>
          </View>

          {activeBudgets.length > 0 ? (
            activeBudgets.map((b) => (
              <BudgetCard
                key={b.id || b.category}
                budget={b}
                onEdit={(item) => {
                  setEditingBudget(item);
                  setBudgetModalVisible(true);
                }}
                onDelete={(item) => {
                  setBudgetToDelete(item);
                  setDeleteModalVisible(true);
                }}
              />
            ))
          ) : (
            <Card style={{ padding: 18, alignItems: 'center', backgroundColor: '#FFFFFF' }}>
              <Ionicons name="calculator-outline" size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 4 }}>
                No Budgets Created
              </Text>
              <Text style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 12 }}>
                Create a budget for Rent, Food, or Transport to track limits.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditingBudget(null);
                  setBudgetModalVisible(true);
                }}
                style={{
                  backgroundColor: '#2563EB',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                  + Create Budget
                </Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>

        {/* RECENT TRANSACTIONS */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
            Recent Transactions
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Transactions')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#2563EB' }}>View All</Text>
          </TouchableOpacity>
        </View>

        {isLoading && !refreshing ? (
          <Loading message="Updating dashboard..." fullScreen={false} />
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onPress={() =>
                navigation.navigate('TransactionDetails', { id: tx.id })
              }
            />
          ))
        ) : (
          <EmptyState
            icon="receipt-outline"
            title="No Transactions Yet"
            description="Start tracking your finances by recording your first transaction."
            actionTitle="Add Transaction"
            onAction={() => setAddModalVisible(true)}
          />
        )}
      </ScrollView>

      {/* Add Transaction Modal */}
      <AddExpenseModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddTransaction}
        isLoading={isSubmittingTx}
      />

      {/* Edit / Create Budget Modal */}
      <EditBudgetModal
        visible={budgetModalVisible}
        budget={editingBudget}
        month={currentMonth}
        year={currentYear}
        onSave={handleSaveBudget}
        onClose={() => setBudgetModalVisible(false)}
        isLoading={isSubmittingBudget}
      />

      {/* Delete Budget Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Budget?"
        message={`Are you sure you want to delete the budget for ${budgetToDelete?.category}?`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        isLoading={isDeletingBudget}
        onConfirm={handleConfirmDeleteBudget}
        onCancel={() => {
          setDeleteModalVisible(false);
          setBudgetToDelete(null);
        }}
      />

      {/* End-of-Month Summary Modal */}
      <EndOfMonthModal
        visible={eomModalVisible}
        monthName={currentMonthName}
        year={currentYear}
        totalBudget={monthlyBudget}
        totalExpenses={monthlyExpense}
        remainingBudget={remainingBudget}
        totalIncome={monthlyIncome}
        savings={savings}
        onViewReport={() => navigation.navigate('Reports')}
        onClose={() => setEomModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
