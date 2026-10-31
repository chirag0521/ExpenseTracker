/**
 * Categories configuration tailored for the Twilight Plum & Pastel Lilac palette
 */

export const CATEGORIES = [
  {
    id: 'Food',
    label: 'Food',
    bg: 'rgba(114, 37, 72, 0.22)',
    border: 'rgba(194, 89, 127, 0.45)',
    text: '#F5BACD',
    chartColor: '#C2597F',
    iconName: 'Utensils'
  },
  {
    id: 'Travel',
    label: 'Travel',
    bg: 'rgba(150, 130, 185, 0.22)',
    border: 'rgba(150, 130, 185, 0.45)',
    text: '#E5DCF2',
    chartColor: '#9682B9',
    iconName: 'Car'
  },
  {
    id: 'Recharge/Bills',
    label: 'Recharge/Bills',
    bg: 'rgba(230, 196, 122, 0.18)',
    border: 'rgba(230, 196, 122, 0.4)',
    text: '#FBE6B1',
    chartColor: '#E6C47A',
    iconName: 'Receipt'
  },
  {
    id: 'Shopping',
    label: 'Shopping',
    bg: 'rgba(168, 59, 106, 0.22)',
    border: 'rgba(168, 59, 106, 0.45)',
    text: '#FAD1E1',
    chartColor: '#A83B6A',
    iconName: 'ShoppingBag'
  },
  {
    id: 'Health',
    label: 'Health',
    bg: 'rgba(110, 207, 168, 0.18)',
    border: 'rgba(110, 207, 168, 0.4)',
    text: '#B6EED7',
    chartColor: '#6ECFA8',
    iconName: 'HeartPulse'
  },
  {
    id: 'Entertainment',
    label: 'Entertainment',
    bg: 'rgba(180, 151, 223, 0.22)',
    border: 'rgba(180, 151, 223, 0.45)',
    text: '#EDE3FC',
    chartColor: '#B497DF',
    iconName: 'Sparkles'
  },
  {
    id: 'Rent',
    label: 'Rent',
    bg: 'rgba(119, 92, 136, 0.22)',
    border: 'rgba(119, 92, 136, 0.45)',
    text: '#D7C7E4',
    chartColor: '#775C88',
    iconName: 'Home'
  },
  {
    id: 'Other',
    label: 'Other',
    bg: 'rgba(154, 145, 168, 0.18)',
    border: 'rgba(154, 145, 168, 0.4)',
    text: '#EFEBF4',
    chartColor: '#9A91A8',
    iconName: 'MoreHorizontal'
  }
];

export const CATEGORY_MAP = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {});

export function getCategoryConfig(id) {
  return (
    CATEGORY_MAP[id] || {
      id,
      label: id || 'Other',
      bg: 'rgba(154, 145, 168, 0.18)',
      border: 'rgba(154, 145, 168, 0.4)',
      text: '#EFEBF4',
      chartColor: '#9A91A8',
      iconName: 'MoreHorizontal'
    }
  );
}
