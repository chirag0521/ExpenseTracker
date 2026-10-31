import React, { useState } from 'react';
import { formatINR } from '../utils/calc.js';
import { getCategoryConfig } from '../utils/categories.js';
import './DonutChart.css';

/**
 * Calculates coordinates on circle
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

/**
 * Creates SVG path for a donut segment
 */
function createDonutSlice(centerX, centerY, innerR, outerR, startAngle, endAngle) {
  // If slice is a full circle (single category 100%)
  if (endAngle - startAngle >= 359.99) {
    endAngle = 359.99;
  }

  const startOuter = polarToCartesian(centerX, centerY, outerR, startAngle);
  const endOuter = polarToCartesian(centerX, centerY, outerR, endAngle);
  const startInner = polarToCartesian(centerX, centerY, innerR, endAngle);
  const endInner = polarToCartesian(centerX, centerY, innerR, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${endInner.x} ${endInner.y}`,
    'Z'
  ].join(' ');
}

export default function DonutChart({
  breakdown = [],
  totalSpent = 0,
  onSelectCategory,
  selectedCategory = null
}) {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const activeCategory = hoveredCategory || selectedCategory;
  const activeItem = activeCategory
    ? breakdown.find((b) => b.category === activeCategory)
    : null;

  if (!breakdown || breakdown.length === 0 || totalSpent <= 0) {
    return (
      <div className="donut-empty-card">
        <div className="donut-empty-circle">
          <span className="donut-empty-text">No spending yet</span>
        </div>
        <p className="donut-empty-sub">Add expenses to view category breakdown</p>
      </div>
    );
  }

  const size = 200;
  const center = size / 2;
  const outerR = 86;
  const innerR = 56;

  let cumulativeAngle = 0;
  const slices = breakdown.map((item) => {
    const fraction = item.amount / totalSpent;
    const sweepAngle = Math.max(0.5, fraction * 360);
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sweepAngle;
    cumulativeAngle = endAngle;

    const config = getCategoryConfig(item.category);
    const isSelected = activeCategory === item.category;

    const pathData = createDonutSlice(
      center,
      center,
      isSelected ? innerR - 2 : innerR,
      isSelected ? outerR + 3 : outerR,
      startAngle,
      endAngle
    );

    return {
      category: item.category,
      amount: item.amount,
      percentage: item.percentage,
      color: config.chartColor,
      textColor: config.text,
      pathData,
      isSelected
    };
  });

  return (
    <div className="donut-chart-container">
      <div className="donut-svg-wrapper">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="donut-svg"
        >
          {slices.map((slice) => (
            <path
              key={slice.category}
              d={slice.pathData}
              fill={slice.color}
              stroke="#FFFDF9"
              strokeWidth="2"
              className={`donut-slice ${slice.isSelected ? 'slice-active' : ''}`}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory(
                    selectedCategory === slice.category ? null : slice.category
                  );
                }
              }}
              onMouseEnter={() => setHoveredCategory(slice.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              role="button"
              aria-label={`${slice.category}: ${formatINR(slice.amount)} (${Math.round(slice.percentage)}%)`}
            />
          ))}
        </svg>

        {/* Center typographic element */}
        <div className="donut-center-content">
          {activeItem ? (
            <>
              <span className="donut-center-label">{activeItem.category}</span>
              <span className="donut-center-amount num">
                {formatINR(activeItem.amount)}
              </span>
              <span className="donut-center-pct">
                {Math.round(activeItem.percentage)}% of total
              </span>
            </>
          ) : (
            <>
              <span className="donut-center-label">Total Spent</span>
              <span className="donut-center-amount num">
                {formatINR(totalSpent)}
              </span>
              <span className="donut-center-pct">
                {breakdown.length} {breakdown.length === 1 ? 'category' : 'categories'}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
