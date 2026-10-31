import React, { useRef, useEffect } from 'react';
import { formatINR } from '../utils/calc.js';
import './SpendingBarChart.css';

export default function SpendingBarChart({
  dailyData = [],
  onSelectDay,
  selectedDay = null,
  todayStr
}) {
  const scrollContainerRef = useRef(null);

  // Find max daily spend to scale bar heights
  const maxSpend = Math.max(1, ...dailyData.map((d) => d.amount || 0));

  // Auto-scroll to today if today is in this month
  useEffect(() => {
    if (!scrollContainerRef.current || !todayStr) return;
    const todayDay = Number(todayStr.split('-')[2]);
    const dayElement = scrollContainerRef.current.querySelector(
      `[data-day="${todayDay}"]`
    );
    if (dayElement) {
      dayElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [todayStr]);

  const hasAnySpend = dailyData.some((d) => d.amount > 0);

  if (!hasAnySpend) {
    return (
      <div className="bar-chart-empty">
        <p className="bar-empty-title">No daily spending recorded for this month</p>
        <span className="bar-empty-hint">Expenses added will appear here day by day</span>
      </div>
    );
  }

  const chartHeight = 110;

  return (
    <div className="spending-bar-chart-wrapper">
      <div className="bar-chart-legend">
        <span className="legend-hint">Tap any day to see its expenses</span>
        <span className="legend-max tabular">Peak: {formatINR(maxSpend)}</span>
      </div>

      <div className="bar-chart-scroll-area" ref={scrollContainerRef}>
        <div className="bar-chart-track">
          {dailyData.map((item) => {
            const isToday = todayStr === item.date;
            const isSelected = selectedDay && selectedDay.date === item.date;
            const hasSpending = item.amount > 0;

            // Scaled bar height between 4px (if spending) and 80px
            const barHeight = hasSpending
              ? Math.max(8, Math.round((item.amount / maxSpend) * 80))
              : 0;

            const isHighSpend = hasSpending && item.amount >= maxSpend * 0.75;

            return (
              <div
                key={item.date}
                data-day={item.day}
                className={`bar-day-column ${hasSpending ? 'has-spend' : ''} ${
                  isToday ? 'is-today' : ''
                } ${isSelected ? 'is-selected' : ''}`}
                onClick={() => {
                  if (onSelectDay) {
                    onSelectDay(item);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Day ${item.day}: ${formatINR(item.amount)} (${item.count} items)`}
              >
                {/* Bar representation */}
                <div
                  className="bar-container"
                  style={{ height: `${chartHeight - 30}px` }}
                >
                  {hasSpending ? (
                    <div
                      className={`bar-fill ${isHighSpend ? 'bar-high' : 'bar-normal'}`}
                      style={{ height: `${barHeight}px` }}
                    >
                      {item.amount >= maxSpend * 0.5 && (
                        <span className="bar-val-tooltip tabular">
                          {formatINR(item.amount)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="bar-empty-dot" />
                  )}
                </div>

                {/* Day label */}
                <div className="bar-day-label">
                  <span className={`day-number ${isToday ? 'today-pill' : ''}`}>
                    {item.day}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
