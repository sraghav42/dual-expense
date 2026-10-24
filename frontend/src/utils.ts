// Shared types and pure formatting/date helpers.

export type User = { id: number; name: string; payerAccent: string };
export type Category = { id: number; name: string; iconIdentifier: string };
export type Expense = {
  id: number;
  amount: number;
  expenseDate: string;
  payerId: number;
  payerName: string;
  categoryId: number;
  categoryName: string;
  description: string | null;
};
export type DashboardSummary = {
  householdTotal: number;
  userTotals: Array<{ userId: number; userName: string; total: number }>;
  topCategories: Array<{ userId: number; userName: string; categoryName: string; total: number }>;
};

const HOUSEHOLD_TIME_ZONE = 'America/New_York';

const easternDateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: HOUSEHOLD_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// All "current date" logic is pinned to US Eastern time, matching the backend,
// regardless of the browser's local time zone.
const easternISODate = (date: Date): string => {
  const parts = easternDateFormatter.formatToParts(date);
  const get = (type: string): string => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};

export const month = (): string => todayISO().slice(0, 7);
export const todayISO = (): string => easternISODate(new Date());
export const dateOffsetISO = (days: number): string => {
  const [year, monthNum, day] = todayISO().split('-').map(Number);
  // Anchor at UTC noon so the Eastern local time stays on the same calendar day.
  const date = new Date(Date.UTC(year, monthNum - 1, day, 12, 0, 0));
  date.setUTCDate(date.getUTCDate() + days);
  return easternISODate(date);
};
const monthKeyToDate = (value: string): Date => {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1);
};
export const monthToLabel = (value: string): string =>
  monthKeyToDate(value).toLocaleString('en-US', { month: 'long', year: 'numeric' });
export const addMonth = (value: string, delta: number): string => {
  const date = monthKeyToDate(value);
  date.setMonth(date.getMonth() + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
export const formatUsd = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

const CATEGORY_ICON_MAP: Record<string, string> = {
  'shopping-basket': 'shopping_basket',
  house: 'apartment',
  zap: 'bolt',
  utensils: 'restaurant',
  car: 'directions_car',
  popcorn: 'theater_comedy',
  spa: 'spa',
  checkroom: 'checkroom',
  ellipsis: 'more_horiz',
};

export const getCategoryIcon = (iconIdentifier: string): string => {
  return CATEGORY_ICON_MAP[iconIdentifier] || iconIdentifier || 'category';
};

export const getDateGroupLabel = (dateISO: string): string => {
  if (dateISO === todayISO()) return 'Today';
  if (dateISO === dateOffsetISO(-1)) return 'Yesterday';
  const [y, m, d] = dateISO.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
