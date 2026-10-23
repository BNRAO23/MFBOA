'use client';

import React, { useState } from 'react';
import { 
  MutualFundTransaction, 
  ChannelType 
} from '@/lib/types';
import { 
  formatINR, 
  formatINRCompact, 
  maskPan, 
  formatTimestamp 
} from '@/lib/utils';
import { 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  Mail, 
  Globe, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText,
  Clock
} from 'lucide-react';

interface TransactionTableProps {
  transactions: MutualFundTransaction[];
  isPiiMasked: boolean;
  onSelectTransaction: (tx: MutualFundTransaction) => void;
  onOpenAmApproval: (tx: MutualFundTransaction) => void;
}

export function TransactionTable({
  transactions,
  isPiiMasked,
  onSelectTransaction,
  onOpenAmApproval,
}: TransactionTableProps) {
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING_AM' | 'DISPATCHED' | 'HIGH_VALUE' | 'EXCEPTIONS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter(tx => {
    // Tab filter
    if (filterTab === 'PENDING_AM' && tx.status !== 'AM_GATE_REQUIRED') return false;
    if (filterTab === 'DISPATCHED' && tx.status !== 'FEED_DISPATCHED') return false;
    if (filterTab === 'HIGH_VALUE' && tx.submission.investmentAmount < 10000000) return false;
    if (filterTab === 'EXCEPTIONS' && !tx.qaResult?.gateReasons.includes('QA_EXCEPTION')) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tx.submission.investorName.toLowerCase().includes(q);
      const matchPan = tx.submission.pan.toLowerCase().includes(q);
      const matchFolio = tx.submission.folioNumber.toLowerCase().includes(q);
      const matchScheme = tx.submission.schemeName.toLowerCase().includes(q);
      const matchId = tx.id.toLowerCase().includes(q);
      if (!matchName && !matchPan && !matchFolio && !matchScheme && !matchId) return false;
    }

    return true;
  });

  const getChannelBadge = (ch: ChannelType) => {
    switch (ch) {
      case 'WEB':
        return <span className="channel-pill web"><Globe size={11} /> Web</span>;
      case 'EMAIL':
        return <span className="channel-pill email"><Mail size={11} /> Email</span>;
      case 'CHATBOT':
        return <span className="channel-pill chatbot"><MessageSquare size={11} /> Bot</span>;
    }
  };

  const getStatusBadge = (tx: MutualFundTransaction) => {
    switch (tx.status) {
      case 'FEED_DISPATCHED':
        return (
          <span className="badge-status dispatched">
            <CheckCircle size={12} />
            Feeds Dispatched
          </span>
        );
      case 'AM_GATE_REQUIRED':
        return (
          <span className="badge-status am-gate">
            <AlertTriangle size={12} />
            AM Gate Required
          </span>
        );
      case 'AM_APPROVED':
        return (
          <span className="badge-status dispatched">
            <UserCheck size={12} />
            AM Approved
          </span>
        );
      case 'AM_REJECTED':
        return (
          <span className="badge-status rejected">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="badge-status validating">
            <Clock size={12} />
            Validating
          </span>
        );
    }
  };

  const pendingAmCount = transactions.filter(t => t.status === 'AM_GATE_REQUIRED').length;

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Table Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className={`tab-btn ${filterTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterTab('ALL')}
          >
            All Forms ({transactions.length})
          </button>
          <button 
            className={`tab-btn ${filterTab === 'PENDING_AM' ? 'active' : ''}`}
            onClick={() => setFilterTab('PENDING_AM')}
          >
            AM Approval Gate
            {pendingAmCount > 0 && <span className="tab-badge">{pendingAmCount}</span>}
          </button>
          <button 
            className={`tab-btn ${filterTab === 'DISPATCHED' ? 'active' : ''}`}
            onClick={() => setFilterTab('DISPATCHED')}
          >
            Dispatched (STP)
          </button>
          <button 
            className={`tab-btn ${filterTab === 'HIGH_VALUE' ? 'active' : ''}`}
            onClick={() => setFilterTab('HIGH_VALUE')}
          >
            High Value (&gt; ₹1 Cr)
          </button>
          <button 
            className={`tab-btn ${filterTab === 'EXCEPTIONS' ? 'active' : ''}`}
            onClick={() => setFilterTab('EXCEPTIONS')}
          >
            Exceptions Flagged
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search Investor, PAN, Scheme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Channel & Ref</th>
              <th>Investor & PAN</th>
              <th>Scheme / Folio</th>
              <th>Amount (INR)</th>
              <th>Parallel QA Critic</th>
              <th>Pipeline Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No transactions match the selected filter or search criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const isHighVal = tx.submission.investmentAmount >= 10000000;
                return (
                  <tr key={tx.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>{getChannelBadge(tx.submission.submissionChannel)}</div>
                        <span className="mono-tag" style={{ fontSize: '0.7rem' }}>{tx.id}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#FFF' }}>
                        {tx.submission.investorName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                        PAN: {maskPan(tx.submission.pan, !isPiiMasked)}
                      </div>
                    </td>

                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ 
                        fontWeight: 500, 
                        color: 'var(--text-main)', 
                        fontSize: '0.8rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }} title={tx.submission.schemeName}>
                        {tx.submission.schemeName}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Folio: {tx.submission.folioNumber}
                      </div>
                    </td>

                    <td>
                      <div style={{ 
                        fontWeight: 700, 
                        color: isHighVal ? '#FBBF24' : '#FFF',
                        fontSize: '0.9rem'
                      }}>
                        {formatINR(tx.submission.investmentAmount)}
                      </div>
                      {isHighVal && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          color: '#F59E0B', 
                          fontWeight: 700,
                          background: 'rgba(245, 158, 11, 0.1)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          marginTop: '2px'
                        }}>
                          HIGH VALUE &gt; 1 CR
                        </span>
                      )}
                    </td>

                    <td>
                      {tx.qaResult ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {tx.qaResult.passedAllChecks ? (
                              <CheckCircle size={14} color="#10B981" />
                            ) : (
                              <AlertTriangle size={14} color="#F43F5E" />
                            )}
                            <span style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 600,
                              color: tx.qaResult.passedAllChecks ? '#34D399' : '#FB7185'
                            }}>
                              {tx.qaResult.passedAllChecks ? '100% Passed' : 'Exceptions Found'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                            {tx.qaResult.checks.length} Rules Fan-out
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>In Progress</span>
                      )}
                    </td>

                    <td>
                      {getStatusBadge(tx)}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {tx.status === 'AM_GATE_REQUIRED' && (
                          <button
                            onClick={() => onOpenAmApproval(tx)}
                            className="btn-amber"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.75rem', 
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            <UserCheck size={14} />
                            AM Review
                          </button>
                        )}
                        <button
                          onClick={() => onSelectTransaction(tx)}
                          className="btn-outline"
                          style={{ 
                            padding: '6px 10px', 
                            fontSize: '0.75rem', 
                            borderRadius: '6px' 
                          }}
                          title="View Full Audit & QA Evidence"
                        >
                          <Eye size={14} />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
