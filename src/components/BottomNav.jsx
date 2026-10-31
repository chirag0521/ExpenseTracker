import React from 'react';
import { Sun, Plus, BarChart3, TrendingUp } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav({ activeTab, onTabChange, onOpenAdd }) {
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

        {/* Add Modal Trigger Button (Center Raised Sage Circle) */}
        <button
          type="button"
          className="nav-add-btn"
          onClick={onOpenAdd}
          aria-label="Add Expense"
        >
          <span className="add-circle">
            <Plus size={24} strokeWidth={2.6} />
          </span>
          <span className="nav-label">Add</span>
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

