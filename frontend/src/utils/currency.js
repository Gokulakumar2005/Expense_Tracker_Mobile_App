export const formatCurrency = (amount, symbol = '₹') => {
  const numericAmount = Number(amount) || 0;
  const isNegative = numericAmount < 0;
  const formatted = Math.abs(numericAmount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
};

export const formatCompactCurrency = (amount, symbol = '₹') => {
  const num = Number(amount) || 0;
  const isNegative = num < 0;
  const abs = Math.abs(num);
  let valStr;
  if (abs >= 10000000) {
    valStr = `${(abs / 10000000).toFixed(1)}Cr`;
  } else if (abs >= 100000) {
    valStr = `${(abs / 100000).toFixed(1)}L`;
  } else if (abs >= 1000) {
    valStr = `${(abs / 1000).toFixed(1)}k`;
  } else {
    valStr = abs.toFixed(0);
  }
  return `${isNegative ? '-' : ''}${symbol}${valStr}`;
};

export default { formatCurrency, formatCompactCurrency };
