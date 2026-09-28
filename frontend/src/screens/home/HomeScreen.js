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
import { fetchDashboard } from '../../redux/slices/dashboardSlice';
import { formatCurrency } from '../../utils/currency';
import Card from '../../components/Card';
import TransactionCard from '../../components/TransactionCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import COLORS from '../../constants/colors';

export const HomeScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data: dashboard, isLoading, error } = useAppSelector(
    (state) => state.dashboard
  );

  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    await dispatch(fetchDashboard());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const userName = user?.first_name ? `${user.first_name}` : 'User';
  const recentTransactions = dashboard?.recent_transactions || [];
  const monthlyBudget = Number(dashboard?.monthly_budget) || 0;
  const budgetSpent = Number(dashboard?.budget_spent) || 0;
  const remainingBudget = Number(dashboard?.remaining_budget) || 0;
  const budgetPercentage = Number(dashboard?.budget_percentage) || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

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

        <TouchableOpacity
          onPress={() => navigation.navigate('AddTransaction')}
          style={{
            width: 42,
            height: 42,
            borderRadius: 9999,
            backgroundColor: '#2563EB',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
          accessibilityLabel="Add new transaction"
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </TouchableOpacity>
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
            onRetry={loadData}
          />
        )}

        <View
          style={{
            backgroundColor: '#2563EB',
            borderRadius: 24,
            padding: 22,
            marginBottom: 16,
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#DBEAFE', fontSize: 13, fontWeight: '600' }}>
              Total Balance
            </Text>
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                {dashboard?.current_month_name || 'Active'}
              </Text>
            </View>
          </View>

          <Text style={{ color: '#FFFFFF', fontSize: 32, fontWeight: '900', letterSpacing: -0.5, marginBottom: 16 }}>
            {formatCurrency(dashboard?.total_balance || 0)}
          </Text>

          <View style={{ height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginBottom: 14 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 34, height: 34, borderRadius: 9999, backgroundColor: 'rgba(34, 197, 94, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="arrow-down" size={18} color="#4ADE80" />
              </View>
              <View>
                <Text style={{ color: '#DBEAFE', fontSize: 11 }}>Monthly Income</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
                  {formatCurrency(dashboard?.monthly_income || 0)}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 34, height: 34, borderRadius: 9999, backgroundColor: 'rgba(239, 68, 68, 0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="arrow-up" size={18} color="#FB7185" />
              </View>
              <View>
                <Text style={{ color: '#DBEAFE', fontSize: 11 }}>Monthly Expense</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
                  {formatCurrency(dashboard?.monthly_expense || 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Card style={{ flex: 1, padding: 14, backgroundColor: '#FFFFFF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="trending-up" size={18} color={COLORS.income} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#15803D', backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 }}>
                Income
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>All Time Income</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A', marginTop: 2 }}>
              {formatCurrency(dashboard?.total_income || 0)}
            </Text>
          </Card>

          <Card style={{ flex: 1, padding: 14, backgroundColor: '#FFFFFF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="trending-down" size={18} color={COLORS.expense} />
              </View>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#B91C1C', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 }}>
                Expense
              </Text>
            </View>
            <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>All Time Expenses</Text>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A', marginTop: 2 }}>
              {formatCurrency(dashboard?.total_expense || 0)}
            </Text>
          </Card>
        </View>

        <Card
          onPress={() => navigation.navigate('Budget')}
          style={{ marginBottom: 20, padding: 18, backgroundColor: '#FFFFFF' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="pie-chart-outline" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>
                  Monthly Budget
                </Text>
                <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                  {dashboard?.current_month_name || 'This Month'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB', marginRight: 4 }}>Manage</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </View>
          </View>

          <View style={{ width: '100%', backgroundColor: '#F1F5F9', height: 10, borderRadius: 9999, overflow: 'hidden', marginBottom: 12 }}>
            <View
              style={{
                height: '100%',
                borderRadius: 9999,
                width: `${Math.min(100, Math.max(0, budgetPercentage))}%`,
                backgroundColor:
                  budgetPercentage > 100
                    ? COLORS.expense
                    : budgetPercentage >= 80
                    ? COLORS.warning
                    : COLORS.primary,
              }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>Budget</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 2 }}>
                {formatCurrency(monthlyBudget)}
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>Used</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 2 }}>
                {formatCurrency(budgetSpent)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>Remaining</Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  marginTop: 2,
                  color: remainingBudget >= 0 ? '#16A34A' : '#DC2626',
                }}
              >
                {formatCurrency(remainingBudget)}
              </Text>
            </View>
          </View>
        </Card>

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
            description="Start tracking your finances by adding your first income or expense."
            actionTitle="Add Transaction"
            onAction={() => navigation.navigate('AddTransaction')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
