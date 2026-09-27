import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import {
  fetchTransactions,
  setFilters,
  resetFilters,
} from '../../redux/slices/transactionSlice';
import TransactionCard from '../../components/TransactionCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';
import ErrorMessage from '../../components/ErrorMessage';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';
import COLORS from '../../constants/colors';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First', icon: 'arrow-down-outline' },
  { id: 'oldest', label: 'Oldest First', icon: 'arrow-up-outline' },
  { id: 'highest', label: 'Highest Amount', icon: 'trending-up-outline' },
  { id: 'lowest', label: 'Lowest Amount', icon: 'trending-down-outline' },
];

export const TransactionsScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { transactions, isLoading, error, filters } = useAppSelector(
    (state) => state.transactions
  );

  const [searchText, setSearchText] = useState(filters.search || '');
  const [showSortModal, setShowSortModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    dispatch(fetchTransactions(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTransactions(filters));
    setRefreshing(false);
  };

  const handleSearchSubmit = () => {
    dispatch(setFilters({ search: searchText.trim() }));
  };

  const handleTypeSelect = (type) => {
    dispatch(setFilters({ transaction_type: type === filters.transaction_type ? '' : type }));
  };

  const handleCategorySelect = (cat) => {
    dispatch(setFilters({ category: cat === filters.category ? '' : cat }));
  };

  const handleSortSelect = (sortId) => {
    dispatch(setFilters({ ordering: sortId }));
    setShowSortModal(false);
  };

  // Merge expense and income categories for filtering
  const allCategories = ['All', ...new Set([
    ...EXPENSE_CATEGORIES.map((c) => c.name),
    ...INCOME_CATEGORIES.map((c) => c.name),
  ])];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Search & Filter Bar */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
        }}
        className="bg-white px-5 pt-3 pb-3 border-b border-slate-100 shadow-sm"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Search Box */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F1F5F9',
              borderRadius: 12,
              paddingHorizontal: 12,
              height: 44,
            }}
          >
            <Ionicons name="search" size={18} color={COLORS.textSecondary} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              placeholder="Search by title or note..."
              placeholderTextColor={COLORS.textMuted}
              style={{ flex: 1, marginLeft: 8, fontSize: 14, color: '#0F172A', outlineWidth: 0 }}
            />
            {searchText ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('');
                  dispatch(setFilters({ search: '' }));
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Sort Button */}
          <TouchableOpacity
            onPress={() => setShowSortModal(true)}
            style={{
              width: 44,
              height: 44,
              backgroundColor: '#F1F5F9',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Sort transactions"
          >
            <Ionicons name="swap-vertical" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Type Filter Pills (All, Income, Expense) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 }}>
          <TouchableOpacity
            onPress={() => handleTypeSelect('')}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 9999,
              backgroundColor: filters.transaction_type === '' ? '#2563EB' : '#F1F5F9',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: filters.transaction_type === '' ? '#FFFFFF' : '#475569',
              }}
            >
              All Types
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTypeSelect('EXPENSE')}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 9999,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: filters.transaction_type === 'EXPENSE' ? '#DC2626' : '#F1F5F9',
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                marginRight: 6,
                backgroundColor: filters.transaction_type === 'EXPENSE' ? '#FFFFFF' : '#EF4444',
              }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: filters.transaction_type === 'EXPENSE' ? '#FFFFFF' : '#475569',
              }}
            >
              Expenses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTypeSelect('INCOME')}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 9999,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: filters.transaction_type === 'INCOME' ? '#16A34A' : '#F1F5F9',
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                marginRight: 6,
                backgroundColor: filters.transaction_type === 'INCOME' ? '#FFFFFF' : '#22C55E',
              }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: filters.transaction_type === 'INCOME' ? '#FFFFFF' : '#475569',
              }}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Horizontal Filter Pills */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={allCategories}
          keyExtractor={(item) => item}
          style={{ marginTop: 10 }}
          renderItem={({ item }) => {
            const isSelected =
              item === 'All' ? !filters.category : filters.category === item;
            return (
              <TouchableOpacity
                onPress={() => handleCategorySelect(item === 'All' ? '' : item)}
                style={{
                  marginRight: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 8,
                  backgroundColor: isSelected ? '#0F172A' : '#F1F5F9',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: isSelected ? '#FFFFFF' : '#475569',
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Main Transactions List */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 14 }}>
        {error && (
          <ErrorMessage
            message={error}
            onRetry={loadData}
          />
        )}

        {isLoading && !refreshing ? (
          <Loading message="Loading transactions..." fullScreen={false} />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 90 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
            renderItem={({ item }) => (
              <TransactionCard
                transaction={item}
                onPress={() =>
                  navigation.navigate('TransactionDetails', { id: item.id })
                }
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="file-tray-outline"
                title="No Transactions Found"
                description={
                  filters.search || filters.category || filters.transaction_type
                    ? 'Try clearing your filters or search term to see more results.'
                    : 'You have not added any transactions yet.'
                }
                actionTitle={
                  filters.search || filters.category || filters.transaction_type
                    ? 'Clear Filters'
                    : 'Add Transaction'
                }
                onAction={() => {
                  if (filters.search || filters.category || filters.transaction_type) {
                    setSearchText('');
                    dispatch(resetFilters());
                  } else {
                    navigation.navigate('AddTransaction');
                  }
                }}
              />
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate('AddTransaction')}
        activeOpacity={0.8}
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 9999,
          backgroundColor: '#2563EB',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#2563EB',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 6,
        }}
        accessibilityLabel="Add transaction"
      >
        <Ionicons name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>

      {/* Sort Options Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        >
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {SORT_OPTIONS.map((opt) => {
              const isSelected = filters.ordering === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => handleSortSelect(opt.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 14,
                    borderRadius: 14,
                    marginBottom: 8,
                    backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: '#BFDBFE',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={isSelected ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                      style={{
                        marginLeft: 12,
                        fontSize: 14,
                        fontWeight: '700',
                        color: isSelected ? '#1D4ED8' : '#1E293B',
                      }}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default TransactionsScreen;
