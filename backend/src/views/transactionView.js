function renderTransaction(tx) {
  const amount = parseFloat(tx.amount);
  return {
    id: tx.id,
    user: tx.user_id,
    title: tx.title,
    amount: tx.amount,
    formatted_amount: amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    transaction_type: tx.transaction_type,
    category: tx.category,
    description: tx.description || '',
    transaction_date: tx.transaction_date instanceof Date
      ? tx.transaction_date.toISOString().split('T')[0]
      : (tx.transaction_date ? String(tx.transaction_date).split('T')[0] : null),
    created_at: tx.created_at,
    updated_at: tx.updated_at,
  };
}

function renderTransactions(transactions) {
  return transactions.map(renderTransaction);
}

export { renderTransaction, renderTransactions };
export default { renderTransaction, renderTransactions };
