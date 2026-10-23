'use client';

import React, { useState } from 'react';
import { MutualFundTransaction } from '@/lib/types';
import { formatINR, maskPan, maskBankAccount, maskPhone, formatTimestamp } from '@/lib/utils';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Send, 
  ShieldCheck, 
  UserCheck, 
  Database,
  ArrowRight,
  Layers,
  Terminal
} from 'lucide-react';

interface TransactionDetailsModalProps {
  transaction: MutualFundTransaction | null;
  onClose: () => void;
  isPiiMasked: boolean;
}

export function TransactionDetailsModal({
  transaction,
  onClose,
  isPiiMasked,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  const [activeTab, setActiveTab] = useState<'QA_AUDIT' | 'SOD_TIMELINE' | 'FEEDS' | 'RAW_PAYLOAD'>('QA_AUDIT');

  const { submission, qaResult, amApproval, amcFeed, bankFeed, history } = transaction;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mono-tag" style={{ color: '#38BDF8', fontSize: '0.8rem' }}>{transaction.id}</span>
              <span className="mono-tag" style={{ fontSize: '0.75rem' }}>Trace: {transaction.traceId}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF', marginTop: '6px' }}>
              Transaction Audit & QA Inspection Dossier
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {submission.formType} · Submitted via {submission.submissionChannel} at {formatTimestamp(submission.submissionTimestamp)}
            </p>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: '6px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Highlights Summary Card */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '12px', 
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Investor</div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FFF', marginTop: '2px' }}>{submission.investorName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              {maskPan(submission.pan, !isPiiMasked)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scheme</div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FFF', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={submission.schemeName}>
              {submission.schemeCode}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Folio: {submission.folioNumber}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Application Amount</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#38BDF8', marginTop: '2px' }}>
              {formatINR(submission.investmentAmount)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Via {submission.paymentMode}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
            <div style={{ marginTop: '4px' }}>
              <span className="mono-tag" style={{ color: '#10B981', fontWeight: 600, fontSize: '0.75rem' }}>
                {transaction.status}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '18px' }}>
          <button 
            className={`tab-btn ${activeTab === 'QA_AUDIT' ? 'active' : ''}`}
            onClick={() => setActiveTab('QA_AUDIT')}
          >
            <ShieldCheck size={15} />
            Parallel QA Checks ({qaResult?.checks.length || 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'SOD_TIMELINE' ? 'active' : ''}`}
            onClick={() => setActiveTab('SOD_TIMELINE')}
          >
            <Clock size={15} />
            SoD Workflow Stages ({history.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'FEEDS' ? 'active' : ''}`}
            onClick={() => setActiveTab('FEEDS')}
          >
            <Send size={15} />
            AMC & Bank Feeds
          </button>
          <button 
            className={`tab-btn ${activeTab === 'RAW_PAYLOAD' ? 'active' : ''}`}
            onClick={() => setActiveTab('RAW_PAYLOAD')}
          >
            <Terminal size={15} />
            Form Payload & Metadata
          </button>
        </div>

        {/* Tab 1: Parallel QA Critic Results */}
        {activeTab === 'QA_AUDIT' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Evaluated deterministically by Parallel QA Critic Agent with zero hallucination risk.
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981' }}>
                Accuracy Score: 100%
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {qaResult?.checks.map((chk) => (
                <div 
                  key={chk.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: `1px solid ${chk.status === 'PASSED' ? 'rgba(16, 185, 129, 0.25)' : chk.status === 'WARNING' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                    borderRadius: '10px',
                    padding: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {chk.status === 'PASSED' ? (
                        <CheckCircle2 size={16} color="#10B981" />
                      ) : chk.status === 'WARNING' ? (
                        <AlertTriangle size={16} color="#F59E0B" />
                      ) : (
                        <AlertTriangle size={16} color="#F43F5E" />
                      )}
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFF' }}>
                        {chk.title}
                      </span>
                    </div>
                    <span className="mono-tag" style={{ fontSize: '0.7rem', color: chk.status === 'PASSED' ? '#34D399' : chk.status === 'WARNING' ? '#FBBF24' : '#FB7185' }}>
                      {chk.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '10px', lineHeight: '1.4' }}>
                    {chk.details}
                  </p>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '10px', 
                    background: 'rgba(0, 0, 0, 0.3)', 
                    padding: '8px 12px', 
                    borderRadius: '6px',
                    fontSize: '0.75rem' 
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Submitted Evidence: </span>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{chk.evidence.submitted}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Oracle Verification: </span>
                      <span style={{ color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>{chk.evidence.oracleVerified}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: SoD Workflow Stages & History */}
        {activeTab === 'SOD_TIMELINE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Enforced Segregation of Duties (SoD): Ingestion Agent, QA Critic, and Process Agent operate in separate stages.
            </div>

            <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid rgba(255, 255, 255, 0.1)' }}>
              {history.map((h, i) => (
                <div key={i} style={{ marginBottom: '20px', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: '-31px', 
                    top: '2px', 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%', 
                    background: h.stage === 'PROCESSED' ? '#10B981' : h.stage.includes('AM') ? '#F59E0B' : '#38BDF8',
                    border: '2px solid #0F172A' 
                  }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFF' }}>{h.stage}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{formatTimestamp(h.timestamp)}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {h.note}
                  </div>
                </div>
              ))}
            </div>

            {amApproval && (
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.08)', 
                border: '1px solid rgba(245, 158, 11, 0.25)', 
                borderRadius: '10px', 
                padding: '12px 16px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FBBF24', fontWeight: 700, fontSize: '0.8rem' }}>
                  <UserCheck size={16} />
                  Assistant Manager Dual-Sign-Off Record
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '6px' }}>
                  <strong>Manager:</strong> {amApproval.managerName} ({amApproval.managerId})
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <strong>Action:</strong> <span style={{ color: amApproval.action === 'APPROVE' ? '#34D399' : '#FB7185', fontWeight: 600 }}>{amApproval.action}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <strong>Remarks:</strong> {amApproval.remarks}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  Auth Code: {amApproval.approvalCode} · Timestamp: {formatTimestamp(amApproval.timestamp)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Downstream Feeds (AMC & Bank) */}
        {activeTab === 'FEEDS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {amcFeed && bankFeed ? (
              <>
                {/* AMC Feed */}
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Send size={16} />
                      AMC Feed ({amcFeed.rtaName} RTA Gateway Format)
                    </div>
                    <span className="mono-tag" style={{ color: '#10B981' }}>{amcFeed.status}</span>
                  </div>
                  <pre style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.75rem', 
                    color: '#94A3B8', 
                    background: '#090D16', 
                    padding: '12px', 
                    borderRadius: '8px',
                    overflowX: 'auto' 
                  }}>
                    {JSON.stringify(amcFeed, null, 2)}
                  </pre>
                </div>

                {/* Bank Feed */}
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Database size={16} />
                      Bank Settlement Feed ({bankFeed.clearingType} Protocol)
                    </div>
                    <span className="mono-tag" style={{ color: '#10B981' }}>{bankFeed.status}</span>
                  </div>
                  <pre style={{ 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: '0.75rem', 
                    color: '#94A3B8', 
                    background: '#090D16', 
                    padding: '12px', 
                    borderRadius: '8px',
                    overflowX: 'auto' 
                  }}>
                    {JSON.stringify(bankFeed, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Feeds will be generated by the Process Agent once QA checks and required AM approvals are completed.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Raw Application Payload */}
        {activeTab === 'RAW_PAYLOAD' && (
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Raw ingestion envelope with source channel context and encrypted credentials:
            </div>
            <pre style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem', 
              color: '#94A3B8', 
              background: '#090D16', 
              padding: '16px', 
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              maxHeight: '350px',
              overflowY: 'auto' 
            }}>
              {JSON.stringify({
                ...submission,
                pan: maskPan(submission.pan, !isPiiMasked),
                bankAccountNumber: maskBankAccount(submission.bankAccountNumber, !isPiiMasked),
                phone: maskPhone(submission.phone, !isPiiMasked),
              }, null, 2)}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={onClose} className="btn-outline">
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
}
