import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/currency';
import COLORS from '../constants/colors';

export const EndOfMonthModal = ({
  visible,
  monthName,
  year,
  totalBudget = 0,
  totalExpenses = 0,
  remainingBudget = 0,
  totalIncome = 0,
  savings = 0,
  onViewReport,
  onClose,
}) => {
  const hasIncome = totalIncome > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>

              <Text style={styles.emoji}>🎉</Text>
              <Text style={styles.title}>{monthName} {year} Completed</Text>

              <View style={styles.heroBox}>
                <Text style={styles.heroAmount}>{formatCurrency(remainingBudget)}</Text>
                <Text style={styles.heroLabel}>
                  {remainingBudget >= 0 ? 'Remaining Budget' : 'Budget Exceeded'}
                </Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Budget</Text>
                  <Text style={styles.statVal}>{formatCurrency(totalBudget)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Expenses</Text>
                  <Text style={styles.statVal}>{formatCurrency(totalExpenses)}</Text>
                </View>
                <View style={[styles.statRow, styles.highlightRow]}>
                  <Text style={styles.statLabelBold}>Remaining</Text>
                  <Text
                    style={[
                      styles.statValBold,
                      { color: remainingBudget >= 0 ? '#16A34A' : '#DC2626' },
                    ]}
                  >
                    {formatCurrency(remainingBudget)}
                  </Text>
                </View>

                {hasIncome && (
                  <View style={[styles.statRow, { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#E2E8F0' }]}>
                    <Text style={styles.statLabelBold}>Savings (Income - Exp)</Text>
                    <Text
                      style={[
                        styles.statValBold,
                        { color: savings >= 0 ? '#2563EB' : '#DC2626' },
                      ]}
                    >
                      {formatCurrency(savings)}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  if (onViewReport) onViewReport();
                }}
                style={styles.viewReportBtn}
              >
                <Text style={styles.viewReportText}>View Report</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
  },
  emoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  heroBox: {
    width: '100%',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  heroAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E40AF',
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 2,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  highlightRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 4,
    paddingTop: 6,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  statLabelBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  statValBold: {
    fontSize: 14,
    fontWeight: '800',
  },
  viewReportBtn: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  viewReportText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default EndOfMonthModal;
