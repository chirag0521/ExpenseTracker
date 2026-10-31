/**
 * Categories configuration with distinct pastel colors and icons
 */

export const CATEGORIES = [
  {
    id: 'Food',
    label: 'Food',
    bg: '#FDF0E7',
    border: '#F4C7AB',
    text: '#82431C',
    chartColor: '#F4C7AB',
    iconName: 'Utensils'
  },
  {
    id: 'Travel',
    label: 'Travel',
    bg: '#EDF5FA',
    border: '#BBD5E8',
    text: '#1C4A6B',
    chartColor: '#BBD5E8',
    iconName: 'Car'
  },
  {
    id: 'Recharge/Bills',
    label: 'Recharge/Bills',
    bg: '#FAF5DC',
    border: '#F6E3A1',
    text: '#70580E',
    chartColor: '#F6E3A1',
    iconName: 'Receipt'
  },
  {
    id: 'Shopping',
    label: 'Shopping',
    bg: '#FCECEF',
    border: '#F2C4CE',
    text: '#7A2437',
    chartColor: '#F2C4CE',
    iconName: 'ShoppingBag'
  },
  {
    id: 'Health',
    label: 'Health',
    bg: '#EAF3E7',
    border: '#A8C3A0',
    text: '#2D5925',
    chartColor: '#A8C3A0',
    iconName: 'HeartPulse'
  },
  {
    id: 'Entertainment',
    label: 'Entertainment',
    bg: '#F0ECF8',
    border: '#CFC5E8',
    text: '#453874',
    chartColor: '#CFC5E8',
    iconName: 'Sparkles'
  },
  {
    id: 'Rent',
    label: 'Rent',
    bg: '#F6ECE5',
    border: '#E5C3B2',
    text: '#6A3D29',
    chartColor: '#E5C3B2',
    iconName: 'Home'
  },
  {
    id: 'Other',
    label: 'Other',
    bg: '#EFECE7',
    border: '#D5D1C8',
    text: '#4D4740',
    chartColor: '#D5D1C8',
    iconName: 'MoreHorizontal'
  }
];

export const CATEGORY_MAP = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {});

export function getCategoryConfig(id) {
  return CATEGORY_MAP[id] || CATEGORY_MAP['Other'];
}
