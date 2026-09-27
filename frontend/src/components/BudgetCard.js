import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/currency';
import { getCategoryMeta } from '../constants/categories';
import COLORS from '../constants/colors';

export const BudgetCard = ({
  budget,
  onPress,
  onEdit,
  onDelete,
  className = '',
  style,
}) => {
  if (!budget) return null;

  const categoryMeta = getCategoryMeta(budget.category, 'EXPENSE');
  const spent = Number(budget.spent) || 0;
  const total = Number(budget.amount) || 0;
  const remaining = Number(budget.remaining) || 0;
  const percentage = Number(budget.percentage_used) || 0;
  const isExceeded = budget.is_exceeded || spent > total;
  const isWarning = budget.is_warning || (percentage >= 80 && !isExceeded);

  const getProgressColor = () => {
    if (isExceeded) return COLORS.expense;
    if (isWarning) return COLORS.warning;
    return COLORS.primary;
  };

  const getStatusBadge = () => {
    if (isExceeded) {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FEE2E2',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: '#FECACA',
          }}
          className="flex-row items-center bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200"
        >
          <Ionicons name="alert-circle" size={12} color={COLORS.expense} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#B91C1C', marginLeft: 4 }}>
            Exceeded
          </Text>
        </View>
      );
    }
    if (isWarning) {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FEF3C7',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: '#FDE68A',
          }}
          className="flex-row items-center bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"
        >
          <Ionicons name="warning" size={12} color={COLORS.warning} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#B45309', marginLeft: 4 }}>
            Near Limit
          </Text>
        </View>
      );
    }
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#DCFCE7',
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: '#BBF7D0',
        }}
        className="flex-row items-center bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"
      >
        <Ionicons name="checkmark-circle" size={12} color={COLORS.income} />
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#15803D', marginLeft: 4 }}>
          On Track
        </Text>
      </View>
    );
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
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
      activeOpacity={onPress ? 0.7 : 1}
      style={[cardStyle, style]}
      className={`bg-white rounded-2xl p-4 mb-3.5 border border-slate-100 shadow-sm ${className}`}
    >
      {/* Header Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              backgroundColor: `${categoryMeta.color}15`,
            }}
          >
            <Ionicons name={categoryMeta.icon} size={20} color={categoryMeta.color} />
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>{budget.category}</Text>
            <Text style={{ fontSize: 12, color: '#94A3B8' }}>Monthly Budget</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {getStatusBadge()}
          {(onEdit || onDelete) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
              {onEdit && (
                <TouchableOpacity
                  onPress={() => onEdit(budget)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ padding: 6, borderRadius: 8, backgroundColor: '#F8FAFC', marginRight: 4 }}
                >
                  <Ionicons name="pencil-outline" size={15} color={COLORS.textSecondary} />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  onPress={() => onDelete(budget)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ padding: 6, borderRadius: 8, backgroundColor: '#FEE2E2' }}
                >
                  <Ionicons name="trash-outline" size={15} color={COLORS.expense} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{ width: '100%', backgroundColor: '#F1F5F9', height: 10, borderRadius: 9999, overflow: 'hidden', marginBottom: 12 }}>
        <View
          style={{
            height: '100%',
            borderRadius: 9999,
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            backgroundColor: getProgressColor(),
          }}
        />
      </View>

      {/* Financial Details Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 2 }}>
        <View>
          <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>Spent</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', marginTop: 2 }}>
            {formatCurrency(spent)}
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>Usage</Text>
          <Text
            style={{ fontSize: 14, fontWeight: '700', color: getProgressColor(), marginTop: 2 }}
          >
            {percentage}%
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 12, color: '#94A3B8', fontWeight: '500' }}>
            {remaining >= 0 ? 'Remaining' : 'Overspent'}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              marginTop: 2,
              color: remaining >= 0 ? '#1E293B' : '#DC2626',
            }}
          >
            {formatCurrency(Math.abs(remaining))}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BudgetCard;
