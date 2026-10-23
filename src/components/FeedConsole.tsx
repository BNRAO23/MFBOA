'use client';

import React, { useState } from 'react';
import { MutualFundTransaction } from '@/lib/types';
import { formatINR, maskPan, maskBankAccount } from '@/lib/utils';
import { 
  Send, 
  Database, 
  Download, 
  CheckCircle2, 
  Layers, 
  FileSpreadsheet, 
  ExternalLink 
} from 'lucide-react';

interface FeedConsoleProps {
  transactions: MutualFundTransaction[];
  isPiiMasked: boolean;
}

export function FeedConsole({ transactions, isPiiMasked }: FeedConsoleProps) {
  const [activeTab, setActiveTab] = useState<'AMC' | 'BANK'>('AMC');

  const readyFeeds = transactions.filter(t => t.amcFeed && t.bankFeed);

  const handleDownloadCsv = (type: 'amc' | 'bank') => {
    window.open(`/api/feeds?format=csv&type=${type}`, '_blank');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={20} color="#10B981" />
            Outcome Feeds Console (AMC & Bank Dispatch)
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Batch feeds dispatched by Process Agent following QA approval and Assistant Manager dual sign-off.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => handleDownloadCsv('amc')}
            className="btn-outline" 
            style={{ fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Download size={15} color="#38BDF8" />
            Download AMC Batch (CSV)
          </button>
          <button 
            onClick={() => handleDownloadCsv('bank')}
            className="btn-outline" 
            style={{ fontSize: '0.8rem', padding: '8px 12px' }}
          >
            <Download size={15} color="#10B981" />
            Download Bank Batch (CSV)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '18px' }}>
        <button 
          className={`tab-btn ${activeTab === 'AMC' ? 'active' : ''}`}
          onClick={() => setActiveTab('AMC')}
        >
          <Send size={15} color="#38BDF8" />
          AMC Feeds (CAMS & KFintech) ({readyFeeds.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'BANK' ? 'active' : ''}`}
          onClick={() => setActiveTab('BANK')}
        >
          <Database size={15} color="#10B981" />
          Bank Settlement Feeds (NACH & RTGS) ({readyFeeds.length})
        </button>
      </div>

      {readyFeeds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          No feeds dispatched yet. Complete straight-through transactions or approve pending AM Gate applications.
        </div>
      ) : activeTab === 'AMC' ? (
        /* AMC Feed Table */
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Feed Batch ID</th>
                <th>RTA / AMC</th>
                <th>Investor PAN</th>
                <th>Folio</th>
                <th>Scheme Code</th>
                <th>Amount (INR)</th>
                <th>AM Approval Ref</th>
                <th>Transmission</th>
              </tr>
            </thead>
            <tbody>
              {readyFeeds.map(t => {
                const f = t.amcFeed!;
                return (
                  <tr key={f.amcFeedId}>
                    <td>
                      <span className="mono-tag" style={{ fontSize: '0.75rem', color: '#38BDF8' }}>
                        {f.amcFeedId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFF' }}>{f.rtaName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.amcCode}</div>
                    </td>
                    <td>
                      <span className="mono-tag">{maskPan(f.pan, !isPiiMasked)}</span>
                    </td>
                    <td>{f.folioNumber}</td>
                    <td>
                      <span className="mono-tag" style={{ fontSize: '0.75rem' }}>{f.schemeCode}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#34D399' }}>
                      {formatINR(f.amount)}
                    </td>
                    <td>
                      <span className="mono-tag" style={{ fontSize: '0.7rem', color: f.amApprovalRef ? '#FBBF24' : '#94A3B8' }}>
                        {f.amApprovalRef || 'STP_AUTO'}
                      </span>
                    </td>
                    <td>
                      <span className="badge-status dispatched">
                        <CheckCircle2 size={12} />
                        SENT
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Bank Settlement Feed Table */
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Settlement ID</th>
                <th>Clearing Type</th>
                <th>Debit Investor Account</th>
                <th>IFSC</th>
                <th>Amount (INR)</th>
                <th>Credit Escrow Pool</th>
                <th>UTR / Batch Ref</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {readyFeeds.map(t => {
                const b = t.bankFeed!;
                return (
                  <tr key={b.bankFeedId}>
                    <td>
                      <span className="mono-tag" style={{ fontSize: '0.75rem', color: '#10B981' }}>
                        {b.bankFeedId}
                      </span>
                    </td>
                    <td>
                      <span className="mono-tag" style={{ color: '#38BDF8' }}>{b.clearingType}</span>
                    </td>
                    <td>
                      <span className="mono-tag">{maskBankAccount(b.investorAccount, !isPiiMasked)}</span>
                    </td>
                    <td>{b.investorIfsc}</td>
                    <td style={{ fontWeight: 700, color: '#34D399' }}>
                      {formatINR(b.amount)}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {b.amcPoolAccount}
                    </td>
                    <td>
                      <span className="mono-tag" style={{ fontSize: '0.7rem' }}>{b.utrOrBatchRef}</span>
                    </td>
                    <td>
                      <span className="badge-status dispatched">
                        <CheckCircle2 size={12} />
                        SETTLED
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
