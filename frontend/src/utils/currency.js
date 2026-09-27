export const formatCurrency = (amount, symbol = '₹') => {
  const numericAmount = Number(amount) || 0;
  return `${symbol}${numericAmount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCompactCurrency = (amount, symbol = '₹') => {
  const num = Number(amount) || 0;
  if (Math.abs(num) >= 10000000) {
    return `${symbol}${(num / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `${symbol}${(num / 100000).toFixed(1)}L`;
  }
  if (Math.abs(num) >= 1000) {
    return `${symbol}${(num / 1000).toFixed(1)}k`;
  }
  return `${symbol}${num.toFixed(0)}`;
};
