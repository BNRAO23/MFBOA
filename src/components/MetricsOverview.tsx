'use client';

import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Zap } from 'lucide-react';
import { formatINRCompact } from '@/lib/utils';

interface MetricsProps {
  stats: {
    totalIngested: number;
    processedFeedDispatched: number;
    pendingAmApproval: number;
    rejected: number;
    highValueCount: number;
    qaAccuracyRate: string;
    slaComplianceRate: string;
  };
  totalTurnoverInr: number;
}

export function MetricsOverview({ stats, totalTurnoverInr }: MetricsProps) {
  return (
    <div className="metrics-grid">
      {/* Total Ingested */}
      <div className="glass-panel metric-card cyan">
        <div className="metric-top">
          <span className="metric-label">Pipeline Ingestion</span>
          <div className="metric-icon-wrap" style={{ color: '#38BDF8' }}>
            <Layers size={18} />
          </div>
        </div>
        <div>
          <div className="metric-val">{stats.totalIngested}</div>
          <div className="metric-sub">Multi-channel: Web, Email, Bot</div>
        </div>
      </div>

      {/* Straight-Through Processed */}
      <div className="glass-panel metric-card emerald">
        <div className="metric-top">
          <span className="metric-label">Feeds Dispatched (STP)</span>
          <div className="metric-icon-wrap" style={{ color: '#10B981' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div>
          <div className="metric-val">{stats.processedFeedDispatched}</div>
          <div className="metric-sub">AMC (CAMS/KFin) & Bank Feeds Live</div>
        </div>
      </div>

      {/* AM Approval Gate */}
      <div className="glass-panel metric-card amber">
        <div className="metric-top">
          <span className="metric-label">AM Approval Gate</span>
          <div className="metric-icon-wrap" style={{ color: '#F59E0B' }}>
            <AlertTriangle size={18} />
          </div>
        </div>
        <div>
          <div className="metric-val" style={{ color: stats.pendingAmApproval > 0 ? '#FBBF24' : '#FFF' }}>
            {stats.pendingAmApproval}
          </div>
          <div className="metric-sub">
            {stats.pendingAmApproval > 0
              ? 'Exceptions & High-Value (>₹1Cr) Awaiting Sign-off'
              : 'All High-Value & Exceptions Cleared'}
          </div>
        </div>
      </div>

      {/* QA Accuracy Score */}
      <div className="glass-panel metric-card purple">
        <div className="metric-top">
          <span className="metric-label">QA Critic Accuracy</span>
          <div className="metric-icon-wrap" style={{ color: '#A855F7' }}>
            <ShieldCheck size={18} />
          </div>
        </div>
        <div>
          <div className="metric-val">{stats.qaAccuracyRate}</div>
          <div className="metric-sub">Deterministic SEBI / Oracle / Bank Checks</div>
        </div>
      </div>

      {/* Settlement Latency SLA */}
      <div className="glass-panel metric-card cyan">
        <div className="metric-top">
          <span className="metric-label">Settlement SLA</span>
          <div className="metric-icon-wrap" style={{ color: '#38BDF8' }}>
            <Clock size={18} />
          </div>
        </div>
        <div>
          <div className="metric-val">T+1</div>
          <div className="metric-sub">&lt; 5 min per form (Benchmark met)</div>
        </div>
      </div>

      {/* Total Volume */}
      <div className="glass-panel metric-card emerald">
        <div className="metric-top">
          <span className="metric-label">Processed Value</span>
          <div className="metric-icon-wrap" style={{ color: '#10B981' }}>
            <Zap size={18} />
          </div>
        </div>
        <div>
          <div className="metric-val">{formatINRCompact(totalTurnoverInr)}</div>
          <div className="metric-sub">{stats.highValueCount} Ticket(s) &gt; ₹1.00 Cr</div>
        </div>
      </div>
    </div>
  );
}
