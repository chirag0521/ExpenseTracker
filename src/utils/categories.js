/**
 * Categories configuration with distinct dark pastel colors and icons
 */

export const CATEGORIES = [
  {
    id: 'Food',
    label: 'Food',
    bg: 'rgba(240, 178, 122, 0.14)',
    border: 'rgba(240, 178, 122, 0.35)',
    text: '#FAD7A0',
    chartColor: '#F0B27A',
    iconName: 'Utensils'
  },
  {
    id: 'Travel',
    label: 'Travel',
    bg: 'rgba(126, 178, 221, 0.14)',
    border: 'rgba(126, 178, 221, 0.35)',
    text: '#BAE0F7',
    chartColor: '#7EB2DD',
    iconName: 'Car'
  },
  {
    id: 'Recharge/Bills',
    label: 'Recharge/Bills',
    bg: 'rgba(229, 216, 140, 0.14)',
    border: 'rgba(229, 216, 140, 0.35)',
    text: '#FEFCBF',
    chartColor: '#E5D88C',
    iconName: 'Receipt'
  },
  {
    id: 'Shopping',
    label: 'Shopping',
    bg: 'rgba(232, 167, 184, 0.14)',
    border: 'rgba(232, 167, 184, 0.35)',
    text: '#FCE4EC',
    chartColor: '#E8A7B8',
    iconName: 'ShoppingBag'
  },
  {
    id: 'Health',
    label: 'Health',
    bg: 'rgba(118, 215, 196, 0.14)',
    border: 'rgba(118, 215, 196, 0.35)',
    text: '#A3E4D7',
    chartColor: '#76D7C4',
    iconName: 'HeartPulse'
  },
  {
    id: 'Entertainment',
    label: 'Entertainment',
    bg: 'rgba(159, 168, 218, 0.14)',
    border: 'rgba(159, 168, 218, 0.35)',
    text: '#C5CAE9',
    chartColor: '#9FA8DA',
    iconName: 'Sparkles'
  },
  {
    id: 'Rent',
    label: 'Rent',
    bg: 'rgba(133, 146, 158, 0.14)',
    border: 'rgba(133, 146, 158, 0.35)',
    text: '#D5D8DC',
    chartColor: '#85929E',
    iconName: 'Home'
  },
  {
    id: 'Other',
    label: 'Other',
    bg: 'rgba(174, 182, 191, 0.14)',
    border: 'rgba(174, 182, 191, 0.35)',
    text: '#EAEDED',
    chartColor: '#AEB6BF',
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
      bg: 'rgba(174, 182, 191, 0.14)',
      border: 'rgba(174, 182, 191, 0.35)',
      text: '#EAEDED',
      chartColor: '#AEB6BF',
      iconName: 'MoreHorizontal'
    }
  );
}
