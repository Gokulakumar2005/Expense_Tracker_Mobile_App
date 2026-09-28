import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMonthName } from '../utils/date';
import COLORS from '../constants/colors';

export const MonthYearPicker = ({
  month,
  year,
  onPrevMonth,
  onNextMonth,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={onPrevMonth}
        style={styles.arrowBtn}
        accessibilityLabel="Previous month"
      >
        <Ionicons name="chevron-back" size={18} color="#1E293B" />
      </TouchableOpacity>

      <View style={styles.textContainer}>
        <Ionicons name="calendar-outline" size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
        <Text style={styles.monthText}>
          {getMonthName(month)} {year}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onNextMonth}
        style={styles.arrowBtn}
        accessibilityLabel="Next month"
      >
        <Ionicons name="chevron-forward" size={18} color="#1E293B" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
  },
  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
});

export default MonthYearPicker;
