import React from 'react';
import {
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Sparkles,
  Home,
  MoreHorizontal
} from 'lucide-react';
import { getCategoryConfig } from '../utils/categories.js';
import './CategoryChip.css';

const ICON_MAP = {
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Sparkles,
  Home,
  MoreHorizontal
};

export default function CategoryChip({
  category,
  isSelected = false,
  onClick,
  size = 'medium' // 'small' | 'medium'
}) {
  const config = getCategoryConfig(category);
  const IconComponent = ICON_MAP[config.iconName] || MoreHorizontal;

  const style = isSelected
    ? {
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text,
        fontWeight: 600
      }
    : {
        backgroundColor: '#FFFDF9',
        borderColor: '#EDE4D8',
        color: '#6E645A'
      };

  return (
    <button
      type="button"
      className={`category-chip ${isSelected ? 'selected' : ''} ${size}`}
      style={style}
      onClick={onClick}
      aria-pressed={isSelected}
    >
      <span
        className="chip-icon"
        style={{
          color: isSelected ? config.text : '#8A7F74'
        }}
      >
        <IconComponent size={size === 'small' ? 14 : 16} strokeWidth={2.2} />
      </span>
      <span className="chip-label">{config.label}</span>
    </button>
  );
}
