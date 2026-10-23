'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { MetricsOverview } from '@/components/MetricsOverview';
import { ArchitectureFlow } from '@/components/ArchitectureFlow';
import { TransactionTable } from '@/components/TransactionTable';
import { AMApprovalModal } from '@/components/AMApprovalModal';
import { TransactionDetailsModal } from '@/components/TransactionDetailsModal';
import { IntakeModal } from '@/components/IntakeModal';
import { FeedConsole } from '@/components/FeedConsole';
import { MemoryInspector } from '@/components/MemoryInspector';
import { AuditLogViewer } from '@/components/AuditLogViewer';
import { BenchmarkModal } from '@/components/BenchmarkModal';
import { 
  MutualFundTransaction, 
  AuditLogEntry, 
  ExceptionMemoryRecord, 
  FormSubmission 
} from '@/lib/types';
import { 
  Workflow, 
  Layers, 
  Send, 
  BrainCircuit, 
  Shield, 
  Sparkles 
} from 'lucide-react';

export default function BackOfficeAgentDashboard() {
  const [transactions, setTransactions] = useState<MutualFundTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [exceptionMemory, setExceptionMemory] = useState<ExceptionMemoryRecord[]>([]);
  const [stats, setStats] = useState({
    totalIngested: 0,
    processedFeedDispatched: 0,
    pendingAmApproval: 0,
    rejected: 0,
    highValueCount: 0,
    qaAccuracyRate: '100%',
    slaComplianceRate: '100%',
  });

  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'ARCHITECTURE' | 'FEEDS' | 'MEMORY' | 'AUDIT'>('PIPELINE');
  const [isPiiMasked, setIsPiiMasked] = useState<boolean>(true);

  // Modals
  const [isIntakeOpen, setIsIntakeOpen] = useState<boolean>(false);
  const [isEvalsOpen, setIsEvalsOpen] = useState<boolean>(false);
  const [selectedTxForDetails, setSelectedTxForDetails] = useState<MutualFundTransaction | null>(null);
  const [selectedTxForAmApproval, setSelectedTxForAmApproval] = useState<MutualFundTransaction | null>(null);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const res = await fetch('/api/forms');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.transactions);
        setAuditLogs(data.data.auditLogs);
        setExceptionMemory(data.data.exceptionMemory);
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error('Failed to load forms data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalTurnoverInr = transactions
    .filter(t => t.status === 'FEED_DISPATCHED' || t.status === 'AM_APPROVED')
    .reduce((sum, t) => sum + t.submission.investmentAmount, 0);

  // Handle Form Submission
  const handleIngestForm = async (formData: Partial<FormSubmission>) => {
    const res = await fetch('/api/forms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const result = await res.json();
    if (result.success) {
      await fetchData();
      setActiveTab('PIPELINE');
    } else {
      alert(`Error ingesting form: ${result.error}`);
    }
  };

  // Handle AM Approval
  const handleAmApprove = async (txId: string, remarks: string, managerName: string) => {
    const res = await fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: txId,
        action: 'APPROVE',
        remarks,
        managerName,
      }),
    });
    const result = await res.json();
    if (result.success) {
      await fetchData();
    } else {
      throw new Error(result.error);
    }
  };

  // Handle AM Rejection
  const handleAmReject = async (txId: string, remarks: string, managerName: string) => {
    const res = await fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionId: txId,
        action: 'REJECT',
        remarks,
        managerName,
      }),
    });
    const result = await res.json();
    if (result.success) {
      await fetchData();
    } else {
      throw new Error(result.error);
    }
  };

  // Handle Pipeline Reset
  const handleReset = async () => {
    if (confirm('Reset the Back Office Agent pipeline to the baseline benchmark forms?')) {
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' }),
      });
      await fetchData();
    }
  };

  return (
    <div className="content-container">
      {/* Top Navigation */}
      <Navbar
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenEvals={() => setIsEvalsOpen(true)}
        onReset={handleReset}
        isPiiMasked={isPiiMasked}
        onTogglePiiMask={() => setIsPiiMasked(!isPiiMasked)}
        pendingCount={stats.pendingAmApproval}
      />

      {/* KPI Overview Metrics */}
      <MetricsOverview stats={stats} totalTurnoverInr={totalTurnoverInr} />

      {/* Dashboard Sub-navigation Tabs */}
      <nav className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'PIPELINE' ? 'active' : ''}`}
          onClick={() => setActiveTab('PIPELINE')}
        >
          <Layers size={16} />
          Active Pipeline & Transactions
          {stats.pendingAmApproval > 0 && (
            <span className="tab-badge">{stats.pendingAmApproval} AM Gate</span>
          )}
        </button>

        <button
          className={`tab-btn ${activeTab === 'ARCHITECTURE' ? 'active' : ''}`}
          onClick={() => setActiveTab('ARCHITECTURE')}
        >
          <Workflow size={16} />
          Architecture Blueprint Flow
        </button>

        <button
          className={`tab-btn ${activeTab === 'FEEDS' ? 'active' : ''}`}
          onClick={() => setActiveTab('FEEDS')}
        >
          <Send size={16} />
          AMC & Bank Outcome Feeds
        </button>

        <button
          className={`tab-btn ${activeTab === 'MEMORY' ? 'active' : ''}`}
          onClick={() => setActiveTab('MEMORY')}
        >
          <BrainCircuit size={16} />
          Short-Term & Exception Memory
        </button>

        <button
          className={`tab-btn ${activeTab === 'AUDIT' ? 'active' : ''}`}
          onClick={() => setActiveTab('AUDIT')}
        >
          <Shield size={16} />
          Compliance & PII Audit Trail
        </button>
      </nav>

      {/* Main View Display */}
      {activeTab === 'PIPELINE' && (
        <TransactionTable
          transactions={transactions}
          isPiiMasked={isPiiMasked}
          onSelectTransaction={(tx) => setSelectedTxForDetails(tx)}
          onOpenAmApproval={(tx) => setSelectedTxForAmApproval(tx)}
        />
      )}

      {activeTab === 'ARCHITECTURE' && (
        <ArchitectureFlow />
      )}

      {activeTab === 'FEEDS' && (
        <FeedConsole
          transactions={transactions}
          isPiiMasked={isPiiMasked}
        />
      )}

      {activeTab === 'MEMORY' && (
        <MemoryInspector
          exceptionMemory={exceptionMemory}
          transactions={transactions}
        />
      )}

      {activeTab === 'AUDIT' && (
        <AuditLogViewer
          logs={auditLogs}
          isPiiMasked={isPiiMasked}
        />
      )}

      {/* Modals */}
      <IntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onSubmit={handleIngestForm}
      />

      <AMApprovalModal
        transaction={selectedTxForAmApproval}
        onClose={() => setSelectedTxForAmApproval(null)}
        onApprove={handleAmApprove}
        onReject={handleAmReject}
        isPiiMasked={isPiiMasked}
      />

      <TransactionDetailsModal
        transaction={selectedTxForDetails}
        onClose={() => setSelectedTxForDetails(null)}
        isPiiMasked={isPiiMasked}
      />

      <BenchmarkModal
        isOpen={isEvalsOpen}
        onClose={() => setIsEvalsOpen(false)}
      />
    </div>
  );
}
