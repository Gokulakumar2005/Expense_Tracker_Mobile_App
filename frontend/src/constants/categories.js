export const EXPENSE_CATEGORIES = [
  { id: 'Food', name: 'Food', icon: 'restaurant-outline', color: '#F97316' },
  { id: 'Transport', name: 'Transport', icon: 'car-outline', color: '#0EA5E9' },
  { id: 'Shopping', name: 'Shopping', icon: 'cart-outline', color: '#EC4899' },
  { id: 'Bills', name: 'Bills', icon: 'receipt-outline', color: '#8B5CF6' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'film-outline', color: '#6366F1' },
  { id: 'Health', name: 'Health', icon: 'medkit-outline', color: '#EF4444' },
  { id: 'Education', name: 'Education', icon: 'school-outline', color: '#14B8A6' },
  { id: 'Travel', name: 'Travel', icon: 'airplane-outline', color: '#3B82F6' },
  { id: 'Rent', name: 'Rent', icon: 'home-outline', color: '#EAB308' },
  { id: 'Subscriptions', name: 'Subscriptions', icon: 'repeat-outline', color: '#A855F7' },
  { id: 'Other', name: 'Other', icon: 'grid-outline', color: '#64748B' },
];

export const INCOME_CATEGORIES = [
  { id: 'Salary', name: 'Salary', icon: 'cash-outline', color: '#16A34A' },
  { id: 'Freelance', name: 'Freelance', icon: 'laptop-outline', color: '#0D9488' },
  { id: 'Investment', name: 'Investment', icon: 'trending-up-outline', color: '#2563EB' },
  { id: 'Business', name: 'Business', icon: 'briefcase-outline', color: '#7C3AED' },
  { id: 'Gift', name: 'Gift', icon: 'gift-outline', color: '#DB2777' },
  { id: 'Other', name: 'Other', icon: 'wallet-outline', color: '#64748B' },
];

export const getCategoryMeta = (categoryName, type = 'EXPENSE') => {
  const list = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const match = list.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
  if (match) return match;

  const fallback = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(
    c => c.name.toLowerCase() === (categoryName || '').toLowerCase()
  );
  return fallback || { id: categoryName, name: categoryName, icon: 'pricetag-outline', color: '#64748B' };
};
