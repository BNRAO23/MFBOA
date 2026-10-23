'use client';

import React from 'react';
import { Shield, PlusCircle, RotateCcw, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface NavbarProps {
  onOpenIntake: () => void;
  onOpenEvals: () => void;
  onReset: () => void;
  isPiiMasked: boolean;
  onTogglePiiMask: () => void;
  pendingCount: number;
}

export function Navbar({
  onOpenIntake,
  onOpenEvals,
  onReset,
  isPiiMasked,
  onTogglePiiMask,
  pendingCount,
}: NavbarProps) {
  return (
    <header className="top-header">
      <div className="brand-wrapper">
        <div className="brand-icon-box">
          <Cpu size={24} />
        </div>
        <div className="brand-title-wrap">
          <h1>
            Mutual Fund Back Office Agent
            <span className="brand-badge">L3 BFSI Workflow</span>
          </h1>
          <p className="brand-subtitle">
            Autonomous Form Processing · Parallel QA Critic · AM Human Gate · SEBI / RTA Compliant
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* PII Masking Security Toggle */}
        <button
          onClick={onTogglePiiMask}
          className="btn-outline"
          title={isPiiMasked ? "PII is Masked (SEBI Compliance Mode)" : "PII is Revealed (Auditor Override Mode)"}
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <Shield size={16} color={isPiiMasked ? '#10B981' : '#F59E0B'} />
          <span>{isPiiMasked ? 'PII Masked' : 'Auditor View (Unmasked)'}</span>
        </button>

        {/* 1000 Historical Evals Button */}
        <button
          onClick={onOpenEvals}
          className="btn-outline"
          style={{ fontSize: '0.8rem', padding: '8px 12px' }}
        >
          <Activity size={16} color="#38BDF8" />
          <span>Run 1,000 Evals</span>
        </button>

        {/* Reset to Blueprint Baseline */}
        <button
          onClick={onReset}
          className="btn-outline"
          title="Reset pipeline to baseline sample forms"
          style={{ padding: '8px 10px' }}
        >
          <RotateCcw size={16} />
        </button>

        {/* Form Intake Trigger */}
        <button onClick={onOpenIntake} className="btn-primary">
          <PlusCircle size={18} />
          <span>Ingest New Form</span>
        </button>
      </div>
    </header>
  );
}
