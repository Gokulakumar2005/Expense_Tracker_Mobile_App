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
  style,
}) => {
  if (!budget) return null;

  const categoryMeta = getCategoryMeta(budget.category, 'EXPENSE');
  const spent = Number(budget.spent) || 0;
  const total = Number(budget.amount) || 0;
  const remaining = Number(budget.remaining !== undefined ? budget.remaining : total - spent);
  const percentage = Number(
    budget.percentage_used !== undefined
      ? budget.percentage_used
      : total > 0
      ? Math.round((spent / total) * 1000) / 10
      : 0
  );
  const isExceeded = budget.is_exceeded !== undefined ? budget.is_exceeded : spent > total;
  const isWarning = budget.is_warning !== undefined ? budget.is_warning : (!isExceeded && percentage >= 80);

  const getProgressColor = () => {
    if (isExceeded) return '#DC2626';
    if (isWarning) return '#F59E0B';
    return '#2563EB';
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
            paddingVertical: 3,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: '#FECACA',
          }}
        >
          <Ionicons name="alert-circle" size={12} color="#DC2626" />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#B91C1C', marginLeft: 4 }}>
            Budget Exceeded
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
            paddingVertical: 3,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: '#FDE68A',
          }}
        >
          <Ionicons name="warning" size={12} color="#D97706" />
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
          paddingVertical: 3,
          borderRadius: 9999,
          borderWidth: 1,
          borderColor: '#BBF7D0',
        }}
      >
        <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#15803D', marginLeft: 4 }}>
          On Track
        </Text>
      </View>
    );
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: isExceeded ? '#FECACA' : '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[cardStyle, style]}
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
              marginRight: 10,
              backgroundColor: `${categoryMeta.color}15`,
            }}
          >
            <Ionicons name={categoryMeta.icon} size={20} color={categoryMeta.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>{budget.category}</Text>
            <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500' }}>Monthly Budget</Text>
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
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    backgroundColor: '#EFF6FF',
                    marginRight: 4,
                  }}
                  accessibilityLabel={`Edit ${budget.category} budget`}
                >
                  <Ionicons name="pencil-outline" size={15} color="#2563EB" />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  onPress={() => onDelete(budget)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{
                    padding: 6,
                    borderRadius: 8,
                    backgroundColor: '#FEE2E2',
                  }}
                  accessibilityLabel={`Delete ${budget.category} budget`}
                >
                  <Ionicons name="trash-outline" size={15} color="#DC2626" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={{ width: '100%', backgroundColor: '#F1F5F9', height: 8, borderRadius: 9999, overflow: 'hidden', marginBottom: 12 }}>
        <View
          style={{
            height: '100%',
            borderRadius: 9999,
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            backgroundColor: getProgressColor(),
          }}
        />
      </View>

      {/* Financial Details Row: Budget, Spent, Remaining, Used */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC',
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <View>
          <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Budget</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A', marginTop: 2 }}>
            {formatCurrency(total)}
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Spent</Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B', marginTop: 2 }}>
            {formatCurrency(spent)}
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Remaining</Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '800',
              marginTop: 2,
              color: remaining >= 0 ? '#16A34A' : '#DC2626',
            }}
          >
            {formatCurrency(remaining)}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 10, color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Used</Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              color: getProgressColor(),
              marginTop: 2,
            }}
          >
            {percentage}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BudgetCard;
