import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';
import { getCategoryMeta } from '../constants/categories';
import COLORS from '../constants/colors';

export const TransactionCard = ({
  transaction,
  onPress,
  className = '',
  style,
}) => {
  if (!transaction) return null;

  const isIncome = transaction.transaction_type === 'INCOME';
  const categoryMeta = getCategoryMeta(transaction.category, transaction.transaction_type);

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[cardStyle, style]}
      className={`bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between border border-slate-100 shadow-sm ${className}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }} className="flex-row items-center flex-1 mr-3">
        {/* Category Icon Badge */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
            backgroundColor: `${categoryMeta.color}18`,
          }}
          className="w-12 h-12 rounded-xl items-center justify-center mr-3.5"
        >
          <Ionicons
            name={categoryMeta.icon || (isIncome ? 'arrow-down-outline' : 'arrow-up-outline')}
            size={22}
            color={categoryMeta.color || (isIncome ? COLORS.income : COLORS.expense)}
          />
        </View>

        {/* Transaction Info */}
        <View style={{ flex: 1 }} className="flex-1">
          <Text
            style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}
            className="text-base font-semibold text-slate-900"
            numberOfLines={1}
          >
            {transaction.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }} className="flex-row items-center mt-1">
            <Text
              style={{ fontSize: 12, fontWeight: '500', color: '#64748B', marginRight: 6 }}
              className="text-xs font-medium text-slate-500 mr-2"
            >
              {transaction.category}
            </Text>
            <Text style={{ fontSize: 12, color: '#CBD5E1' }} className="text-xs text-slate-400">•</Text>
            <Text
              style={{ fontSize: 12, color: '#94A3B8', marginLeft: 6 }}
              className="text-xs text-slate-400 ml-2"
            >
              {formatDate(transaction.transaction_date)}
            </Text>
          </View>
        </View>
      </View>

      {/* Amount and Type Badge */}
      <View style={{ alignItems: 'flex-end' }} className="items-end">
        <Text
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: isIncome ? '#16A34A' : '#DC2626',
          }}
          className={`text-base font-bold ${
            isIncome ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 9999,
            marginTop: 4,
            backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2',
          }}
          className={`px-2 py-0.5 rounded-full mt-1 ${
            isIncome ? 'bg-emerald-50' : 'bg-rose-50'
          }`}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 0.5,
              color: isIncome ? '#15803D' : '#B91C1C',
            }}
            className={`text-[10px] font-semibold tracking-wider ${
              isIncome ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {isIncome ? 'INCOME' : 'EXPENSE'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionCard;
