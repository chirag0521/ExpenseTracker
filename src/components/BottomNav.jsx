import React from 'react';
import { Sun, BarChart3, TrendingUp } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      <div className="bottom-nav-inner">
        {/* Today Tab */}
        <button
          type="button"
          className={`nav-item ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => onTabChange('today')}
          aria-label="Today"
        >
          <span className="nav-icon-wrapper">
            <Sun size={20} strokeWidth={2.2} />
          </span>
          <span className="nav-label">Today</span>
        </button>

        {/* Reports Tab */}
        <button
          type="button"
          className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => onTabChange('reports')}
          aria-label="Reports"
        >
          <span className="nav-icon-wrapper">
            <BarChart3 size={20} strokeWidth={2.2} />
          </span>
          <span className="nav-label">Reports</span>
        </button>

        {/* IPO Tab */}
        <button
          type="button"
          className={`nav-item ${activeTab === 'ipo' ? 'active' : ''}`}
          onClick={() => onTabChange('ipo')}
          aria-label="IPO Tracker"
        >
          <span className="nav-icon-wrapper">
            <TrendingUp size={20} strokeWidth={2.2} />
          </span>
          <span className="nav-label">IPO</span>
        </button>
      </div>
    </nav>
  );
}
