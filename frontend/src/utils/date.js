export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getMonthName = (monthNumber) => {
  const index = Number(monthNumber) - 1;
  return MONTH_NAMES[index] || '';
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = Number(parts[1]) - 1;
      const day = parts[2];
      const monthAbbr = MONTH_NAMES[monthIndex]?.substring(0, 3) || parts[1];
      return `${day} ${monthAbbr} ${year}`;
    }
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentMonthAndYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    monthName: MONTH_NAMES[now.getMonth()],
  };
};
