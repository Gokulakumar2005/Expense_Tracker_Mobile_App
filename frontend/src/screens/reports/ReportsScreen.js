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
import { fetchReports } from '../../redux/slices/dashboardSlice';
import { formatCurrency } from '../../utils/currency';
import { getCategoryMeta } from '../../constants/categories';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import COLORS from '../../constants/colors';

export const ReportsScreen = () => {
  const dispatch = useAppDispatch();
  const { reports, isReportsLoading, error } = useAppSelector(
    (state) => state.dashboard
  );

  const [period, setPeriod] = useState('current_month');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    dispatch(fetchReports({ period }));
  }, [dispatch, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchReports({ period }));
    setRefreshing(false);
  };

  const incomeTotal = Number(reports?.income_total) || 0;
  const expenseTotal = Number(reports?.expense_total) || 0;
  const netSavings = Number(reports?.net_savings) || 0;
  const savingsRate = Number(reports?.savings_rate) || 0;
  const categoryBreakdown = reports?.category_breakdown || [];
  const monthlyTrends = reports?.monthly_trends || [];
  const budgetUsage = reports?.budget_usage || [];

  const maxTrendValue = Math.max(
    ...monthlyTrends.map((t) => Math.max(t.income, t.expense)),
    1
  );

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
        <View style={{ marginBottom: 10 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>Financial Reports</Text>
          <Text style={{ fontSize: 12, color: '#94A3B8' }}>
            Analytics & trends based on your real transactions
          </Text>
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 4, borderRadius: 12 }}>
          <TouchableOpacity
            onPress={() => setPeriod('current_month')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: period === 'current_month' ? '#FFFFFF' : 'transparent',
              shadowColor: period === 'current_month' ? '#000000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: period === 'current_month' ? '#2563EB' : '#64748B',
              }}
            >
              Current Month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPeriod('previous_month')}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: period === 'previous_month' ? '#FFFFFF' : 'transparent',
              shadowColor: period === 'previous_month' ? '#000000' : 'transparent',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: period === 'previous_month' ? '#2563EB' : '#64748B',
              }}
            >
              Previous Month
            </Text>
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
            onRetry={loadData}
          />
        )}

        {isReportsLoading && !refreshing ? (
          <Loading message="Generating financial reports..." fullScreen={false} />
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#334155' }}>
                Period: {reports?.period_label || 'Selected Period'}
              </Text>
              <View style={{ backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#1D4ED8' }}>
                  Savings Rate: {savingsRate}%
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <Card style={{ flex: 1, padding: 14, backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#15803D' }}>Total Income</Text>
                  <Ionicons name="arrow-down-circle" size={16} color={COLORS.income} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#16A34A' }}>
                  {formatCurrency(incomeTotal)}
                </Text>
              </Card>

              <Card style={{ flex: 1, padding: 14, backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#B91C1C' }}>Total Expense</Text>
                  <Ionicons name="arrow-up-circle" size={16} color={COLORS.expense} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#DC2626' }}>
                  {formatCurrency(expenseTotal)}
                </Text>
              </Card>
            </View>

            <Card style={{ padding: 16, backgroundColor: '#FFFFFF', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>Net Savings</Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '800',
                      marginTop: 2,
                      color: netSavings >= 0 ? '#0F172A' : '#DC2626',
                    }}
                  >
                    {formatCurrency(netSavings)}
                  </Text>
                </View>

                <View style={{ width: '48%' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 11, color: '#94A3B8' }}>Ratio</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#475569' }}>
                      {incomeTotal > 0
                        ? `${Math.round((expenseTotal / incomeTotal) * 100)}% Spent`
                        : '0%'}
                    </Text>
                  </View>
                  <View style={{ height: 8, width: '100%', backgroundColor: '#DCFCE7', borderRadius: 9999, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        backgroundColor: '#EF4444',
                        borderRadius: 9999,
                        width: `${Math.min(
                          100,
                          incomeTotal > 0 ? (expenseTotal / incomeTotal) * 100 : 0
                        )}%`,
                      }}
                    />
                  </View>
                </View>
              </View>
            </Card>

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
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
                    6-Month Spending Trend
                  </Text>
                  <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                    Income vs Expenses over time
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: '#22C55E', marginRight: 4 }} />
                    <Text style={{ fontSize: 11, color: '#64748B' }}>Income</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: '#EF4444', marginRight: 4 }} />
                    <Text style={{ fontSize: 11, color: '#64748B' }}>Expense</Text>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 150, paddingTop: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                {monthlyTrends.map((trend, idx) => {
                  const incomeHeight = maxTrendValue > 0 ? (trend.income / maxTrendValue) * 105 : 0;
                  const expenseHeight = maxTrendValue > 0 ? (trend.expense / maxTrendValue) * 105 : 0;

                  return (
                    <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', width: '100%', gap: 4, height: 110 }}>
                        <View
                          style={{
                            width: 12,
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                            backgroundColor: '#22C55E',
                            height: Math.max(4, incomeHeight),
                          }}
                        />
                        <View
                          style={{
                            width: 12,
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                            backgroundColor: '#EF4444',
                            height: Math.max(4, expenseHeight),
                          }}
                        />
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 8 }}>
                        {trend.month_name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

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
                marginBottom: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
                    Category-Wise Spending
                  </Text>
                  <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                    Where did your money go?
                  </Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B' }}>
                  {categoryBreakdown.length} Categories
                </Text>
              </View>

              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((item, idx) => {
                  const meta = getCategoryMeta(item.category, 'EXPENSE');
                  return (
                    <View key={idx} style={{ marginBottom: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 8,
                              backgroundColor: `${meta.color}15`,
                            }}
                          >
                            <Ionicons name={meta.icon} size={15} color={meta.color} />
                          </View>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1E293B' }}>
                            {item.category}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#94A3B8', marginLeft: 6 }}>
                            ({item.transaction_count} tx)
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginRight: 8 }}>
                            {formatCurrency(item.total_amount)}
                          </Text>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', width: 44, textAlign: 'right' }}>
                            {item.percentage}%
                          </Text>
                        </View>
                      </View>

                      <View style={{ width: '100%', backgroundColor: '#F1F5F9', height: 8, borderRadius: 9999, overflow: 'hidden' }}>
                        <View
                          style={{
                            height: '100%',
                            borderRadius: 9999,
                            width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                            backgroundColor: meta.color || COLORS.primary,
                          }}
                        />
                      </View>
                    </View>
                  );
                })
              ) : (
                <EmptyState
                  icon="pie-chart-outline"
                  title="No Expenses Recorded"
                  description="There are no expense transactions recorded for this period."
                />
              )}
            </View>

            {budgetUsage.length > 0 && (
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
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 2 }}>
                  Budget vs Actual
                </Text>
                <Text style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>
                  Budget compliance for this period
                </Text>

                {budgetUsage.map((b) => {
                  const spent = Number(b.spent) || 0;
                  const amt = Number(b.amount) || 0;
                  const pct = Number(b.percentage_used) || 0;
                  const exceeded = b.is_exceeded;

                  return (
                    <View key={b.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>{b.category}</Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '700',
                            color: exceeded ? '#DC2626' : '#475569',
                          }}
                        >
                          {formatCurrency(spent)} / {formatCurrency(amt)} ({pct}%)
                        </Text>
                      </View>
                      <View style={{ width: '100%', backgroundColor: '#F1F5F9', height: 8, borderRadius: 9999, overflow: 'hidden' }}>
                        <View
                          style={{
                            height: '100%',
                            borderRadius: 9999,
                            width: `${Math.min(100, Math.max(0, pct))}%`,
                            backgroundColor: exceeded
                              ? COLORS.expense
                              : pct >= 80
                              ? COLORS.warning
                              : COLORS.primary,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportsScreen;
