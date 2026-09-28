import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchMonthlySummary, downloadMonthlyPdf } from '../../redux/slices/monthlySlice';
import { formatCurrency } from '../../utils/currency';
import { getMonthName } from '../../utils/date';
import { getCategoryMeta } from '../../constants/categories';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import Toast from '../../components/Toast';
import MonthYearPicker from '../../components/MonthYearPicker';
import COLORS from '../../constants/colors';

export const ReportsScreen = () => {
  const dispatch = useAppDispatch();
  const {
    month,
    year,
    periodLabel,
    totalIncome,
    totalBudget,
    totalExpenses,
    remainingBudget,
    savings,
    savingsRate,
    categories,
    categoryBreakdown,
    transactions,
    monthlyTrends,
    loading,
    pdfDownloading,
    error,
  } = useAppSelector((state) => state.monthly);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(month || currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(year || currentDate.getFullYear());
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  const loadData = useCallback(() => {
    dispatch(fetchMonthlySummary({ month: selectedMonth, year: selectedYear }));
  }, [dispatch, selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMonthlySummary({ month: selectedMonth, year: selectedYear }));
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

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const action = await dispatch(
        downloadMonthlyPdf({ month: selectedMonth, year: selectedYear })
      );

      if (action.error) {
        showToast(action.payload || 'Unable to generate PDF. Please try again.', 'error');
        setDownloading(false);
        return;
      }

      const res = action.payload;
      if (!res?.base64) {
        showToast('PDF data could not be generated. Please try again.', 'error');
        setDownloading(false);
        return;
      }

      const filename =
        res.filename ||
        `PocketTrack_Report_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.pdf`;

      if (Platform.OS === 'web') {
        const byteCharacters = atob(res.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, res.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: `Monthly Financial Report - ${getMonthName(selectedMonth)} ${selectedYear}`,
            UTI: 'com.adobe.pdf',
          });
        }
      }

      showToast('✓ Report downloaded successfully', 'success');
    } catch (err) {
      console.error('PDF Download Error:', err);
      showToast('Unable to download PDF. Please try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const maxTrendValue = Math.max(
    ...monthlyTrends.map((t) => Math.max(t.income, t.expense)),
    1
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
              Financial Reports
            </Text>
            <Text style={{ fontSize: 12, color: '#94A3B8' }}>
              Comprehensive monthly analytics & breakdown
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDownloadPdf}
            disabled={downloading || pdfDownloading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#2563EB',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              shadowColor: '#2563EB',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons
              name={downloading || pdfDownloading ? 'hourglass-outline' : 'download-outline'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
              {downloading || pdfDownloading ? 'Generating...' : 'Download PDF'}
            </Text>
          </TouchableOpacity>
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
            onRetry={loadData}
          />
        )}

        {loading && !refreshing ? (
          <Loading message="Generating financial reports..." fullScreen={false} />
        ) : (
          <>
            {/* Period Title Bar */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#1E293B' }}>
                {getMonthName(selectedMonth)} {selectedYear}
              </Text>
              <View
                style={{
                  backgroundColor: '#EFF6FF',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 9999,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#1D4ED8' }}>
                  Savings Rate: {savingsRate}%
                </Text>
              </View>
            </View>

            {/* MONTHLY SUMMARY CARD (5 Centralized Metrics) */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: 18,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#F1F5F9',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  marginBottom: 12,
                }}
              >
                Monthly Summary
              </Text>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: '#F0FDF4',
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#DCFCE7',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#15803D', fontWeight: '600' }}>
                    Total Income
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#16A34A', marginTop: 2 }}>
                    {formatCurrency(totalIncome)}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: '#EFF6FF',
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#DBEAFE',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#1D4ED8', fontWeight: '600' }}>
                    Total Budget
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#2563EB', marginTop: 2 }}>
                    {formatCurrency(totalBudget)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <View
                  style={{
                    flex: 1,
                    backgroundColor: '#FEF2F2',
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#FEE2E2',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#B91C1C', fontWeight: '600' }}>
                    Total Expenses
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#DC2626', marginTop: 2 }}>
                    {formatCurrency(totalExpenses)}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    backgroundColor: remainingBudget >= 0 ? '#F8FAFC' : '#FEF2F2',
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: remainingBudget >= 0 ? '#E2E8F0' : '#FECACA',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '600' }}>
                    Remaining Budget
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '800',
                      color: remainingBudget >= 0 ? '#16A34A' : '#DC2626',
                      marginTop: 2,
                    }}
                  >
                    {formatCurrency(remainingBudget)}
                  </Text>
                </View>
              </View>

              {/* SAVINGS ROW (Distinct from Remaining Budget) */}
              <View
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 14,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A' }}>
                    Savings (Income - Expenses)
                  </Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                    Actual money saved this month
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '900',
                    color: savings >= 0 ? '#2563EB' : '#DC2626',
                  }}
                >
                  {formatCurrency(savings)}
                </Text>
              </View>
            </View>

            {/* BUDGET VS ACTUAL TABLE */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: 18,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#F1F5F9',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
                    Budget vs Actual
                  </Text>
                  <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                    Spending limit compliance
                  </Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B' }}>
                  {categories.length} Categories
                </Text>
              </View>

              {categories.length > 0 ? (
                categories.map((b) => {
                  const spent = Number(b.spent) || 0;
                  const budgetAmt = Number(b.budget) || 0;
                  const rem = Number(b.remaining !== undefined ? b.remaining : budgetAmt - spent);
                  const pct = Number(b.percentage_used) || 0;
                  const isExceeded = b.is_exceeded || spent > budgetAmt;

                  return (
                    <View
                      key={b.id || b.category}
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F1F5F9',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>
                          {b.category}
                        </Text>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: '700',
                              color: isExceeded ? '#DC2626' : '#1E293B',
                            }}
                          >
                            {formatCurrency(spent)} / {formatCurrency(budgetAmt)}
                          </Text>
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: '600',
                              color: rem >= 0 ? '#16A34A' : '#DC2626',
                            }}
                          >
                            {rem >= 0 ? `Remaining: ${formatCurrency(rem)}` : `Exceeded by: ${formatCurrency(Math.abs(rem))}`}
                          </Text>
                        </View>
                      </View>

                      {/* Progress Bar */}
                      <View
                        style={{
                          width: '100%',
                          backgroundColor: '#F1F5F9',
                          height: 7,
                          borderRadius: 9999,
                          overflow: 'hidden',
                          marginTop: 4,
                        }}
                      >
                        <View
                          style={{
                            height: '100%',
                            borderRadius: 9999,
                            width: `${Math.min(100, Math.max(0, pct))}%`,
                            backgroundColor: isExceeded
                              ? '#DC2626'
                              : pct >= 80
                              ? '#F59E0B'
                              : '#2563EB',
                          }}
                        />
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic', paddingVertical: 8 }}>
                  No category budgets defined for {getMonthName(selectedMonth)} {selectedYear}.
                </Text>
              )}
            </View>

            {/* EXPENSE BREAKDOWN */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: 18,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#F1F5F9',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
                    Expense Breakdown
                  </Text>
                  <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                    Where your money went this month
                  </Text>
                </View>
              </View>

              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((item, idx) => {
                  const meta = getCategoryMeta(item.category, 'EXPENSE');
                  return (
                    <View key={idx} style={{ marginBottom: 12 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 8,
                              backgroundColor: `${meta.color}15`,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 8,
                            }}
                          >
                            <Ionicons name={meta.icon} size={14} color={meta.color} />
                          </View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B' }}>
                            {item.category}
                          </Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: '#0F172A', marginRight: 8 }}>
                            {formatCurrency(item.total_amount)}
                          </Text>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748B', width: 38, textAlign: 'right' }}>
                            {item.percentage}%
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          width: '100%',
                          backgroundColor: '#F1F5F9',
                          height: 6,
                          borderRadius: 9999,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            height: '100%',
                            borderRadius: 9999,
                            width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                            backgroundColor: meta.color || '#2563EB',
                          }}
                        />
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic', paddingVertical: 8 }}>
                  No expense breakdown available for this month.
                </Text>
              )}
            </View>

            {/* TRANSACTIONS SECTION (Strictly for this month) */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 24,
                padding: 18,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#F1F5F9',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
                  Transactions ({transactions.length})
                </Text>
                <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                  {getMonthName(selectedMonth)} {selectedYear}
                </Text>
              </View>

              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isIncome = tx.transaction_type === 'INCOME';
                  return (
                    <View
                      key={tx.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F1F5F9',
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }} numberOfLines={1}>
                          {tx.title || tx.description || tx.category}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                          {tx.transaction_date} • {tx.category}
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '800',
                          color: isIncome ? '#16A34A' : '#DC2626',
                        }}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </Text>
                    </View>
                  );
                })
              ) : (
                <EmptyState
                  icon="receipt-outline"
                  title="No transactions found"
                  description={`There are no transactions for ${getMonthName(selectedMonth)} ${selectedYear}.`}
                />
              )}
            </View>

            {/* 6-MONTH SPENDING TREND */}
            {monthlyTrends.length > 0 && (
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 24,
                  padding: 18,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#F1F5F9',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
                      6-Month Trend
                    </Text>
                    <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                      Income vs Expenses
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginRight: 4 }} />
                      <Text style={{ fontSize: 11, color: '#64748B' }}>Income</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626', marginRight: 4 }} />
                      <Text style={{ fontSize: 11, color: '#64748B' }}>Expense</Text>
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: 120,
                    paddingTop: 10,
                  }}
                >
                  {monthlyTrends.map((trend, idx) => {
                    const incH = maxTrendValue > 0 ? (trend.income / maxTrendValue) * 80 : 0;
                    const expH = maxTrendValue > 0 ? (trend.expense / maxTrendValue) * 80 : 0;
                    return (
                      <View key={idx} style={{ alignItems: 'center', flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 85 }}>
                          <View
                            style={{
                              width: 10,
                              height: Math.max(4, incH),
                              backgroundColor: '#16A34A',
                              borderRadius: 3,
                            }}
                          />
                          <View
                            style={{
                              width: 10,
                              height: Math.max(4, expH),
                              backgroundColor: '#DC2626',
                              borderRadius: 3,
                            }}
                          />
                        </View>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#64748B', marginTop: 6 }}>
                          {trend.month_name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportsScreen;
