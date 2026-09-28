import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchTransactionDetail,
  deleteTransaction,
  clearSelectedTransaction,
} from '../../redux/slices/transactionSlice';
import { fetchDashboard } from '../../redux/slices/dashboardSlice';
import { fetchBudgetSummary, fetchBudgets } from '../../redux/slices/budgetSlice';
import { fetchMonthlySummary } from '../../redux/slices/monthlySlice';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { getCategoryMeta } from '../../constants/categories';
import Header from '../../components/Header';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';
import Toast from '../../components/Toast';
import COLORS from '../../constants/colors';

export const TransactionDetailsScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const dispatch = useAppDispatch();
  const { selectedTransaction: tx, isLoading, isSubmitting } = useAppSelector(
    (state) => state.transactions
  );

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    dispatch(fetchTransactionDetail(id));
    return () => {
      dispatch(clearSelectedTransaction());
    };
  }, [dispatch, id]);

  const handleDeleteConfirm = async () => {
    const res = await dispatch(deleteTransaction(id));
    setDeleteModalVisible(false);
    if (!res.error) {
      dispatch(fetchDashboard());
      dispatch(fetchBudgetSummary());
      dispatch(fetchBudgets());
      dispatch(fetchMonthlySummary());
      showToast('✓ Transaction deleted successfully');
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } else {
      showToast('Failed to delete transaction.', 'error');
    }
  };

  const handleEdit = () => {
    if (tx) {
      navigation.navigate('AddTransaction', { transaction: tx });
    }
  };

  if (isLoading || !tx) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        <Header title="Transaction Details" showBack onBack={() => navigation.goBack()} />
        <Loading message="Loading transaction details..." />
      </SafeAreaView>
    );
  }

  const isIncome = tx.transaction_type === 'INCOME';
  const categoryMeta = getCategoryMeta(tx.category, tx.transaction_type);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      <Header
        title="Transaction Details"
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={handleEdit}
            style={{ padding: 8, borderRadius: 10, backgroundColor: '#EFF6FF' }}
          >
            <Ionicons name="pencil" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 24,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#F1F5F9',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              backgroundColor: `${categoryMeta.color}15`,
            }}
          >
            <Ionicons
              name={categoryMeta.icon}
              size={32}
              color={categoryMeta.color}
            />
          </View>

          <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 4 }}>
            {tx.title}
          </Text>

          <Text
            style={{
              fontSize: 28,
              fontWeight: '900',
              letterSpacing: -0.5,
              marginBottom: 8,
              color: isIncome ? '#16A34A' : '#DC2626',
            }}
          >
            {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
          </Text>

          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 9999,
              backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: isIncome ? '#15803D' : '#B91C1C',
              }}
            >
              {tx.transaction_type}
            </Text>
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
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
            Transaction Information
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="pricetag-outline" size={18} color={COLORS.textSecondary} />
              <Text style={{ fontSize: 14, color: '#64748B', marginLeft: 10 }}>Category</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>{tx.category}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
              <Text style={{ fontSize: 14, color: '#64748B', marginLeft: 10 }}>Transaction Date</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A' }}>
              {formatDate(tx.transaction_date)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
              <Text style={{ fontSize: 14, color: '#64748B', marginLeft: 10 }}>Recorded At</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#475569' }}>
              {formatDate(tx.created_at)}
            </Text>
          </View>

          <View style={{ paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="reader-outline" size={18} color={COLORS.textSecondary} />
              <Text style={{ fontSize: 14, color: '#64748B', marginLeft: 10 }}>Note</Text>
            </View>
            <Text style={{ fontSize: 14, color: '#1E293B', lineHeight: 20, paddingLeft: 28 }}>
              {tx.description ? tx.description : 'No notes attached to this transaction.'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Button
            title="Edit Transaction"
            onPress={handleEdit}
            variant="outline"
            icon={<Ionicons name="pencil-outline" size={18} color={COLORS.primary} />}
            style={{ flex: 1 }}
          />

          <Button
            title="Delete"
            onPress={() => setDeleteModalVisible(true)}
            variant="danger"
            isLoading={isSubmitting}
            icon={<Ionicons name="trash-outline" size={18} color={COLORS.white} />}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal (Requirement 17) */}
      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Transaction?"
        message="This transaction will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive
        isLoading={isSubmitting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default TransactionDetailsScreen;
