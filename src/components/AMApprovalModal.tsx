'use client';

import React, { useState } from 'react';
import { MutualFundTransaction } from '@/lib/types';
import { formatINR, maskPan, maskBankAccount } from '@/lib/utils';
import { 
  UserCheck, 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Database, 
  FileText, 
  BrainCircuit,
  Lock
} from 'lucide-react';

interface AMApprovalModalProps {
  transaction: MutualFundTransaction | null;
  onClose: () => void;
  onApprove: (txId: string, remarks: string, managerName: string) => Promise<void>;
  onReject: (txId: string, remarks: string, managerName: string) => Promise<void>;
  isPiiMasked: boolean;
}

export function AMApprovalModal({
  transaction,
  onClose,
  onApprove,
  onReject,
  isPiiMasked,
}: AMApprovalModalProps) {
  if (!transaction) return null;

  const [managerName, setManagerName] = useState('Bonela Narasinga Rao (AM Operations)');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isHighValue = transaction.submission.investmentAmount >= 10000000;
  const hasQaException = transaction.qaResult?.gateReasons.includes('QA_EXCEPTION');

  // Pre-fill smart recommended remarks based on past exception memory patterns
  const handleQuickRemarks = (text: string) => {
    setRemarks(text);
  };

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!remarks.trim()) {
      setErrorMsg('Mandatory: Assistant Manager remarks and audit sign-off justification are required.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (action === 'APPROVE') {
        await onApprove(transaction.id, remarks, managerName);
      } else {
        await onReject(transaction.id, remarks, managerName);
      }
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Error recording AM decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
                HUMAN-IN-THE-LOOP GATE
              </span>
              <span className="mono-tag" style={{ fontSize: '0.75rem' }}>{transaction.id}</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF', marginTop: '6px' }}>
              Assistant Manager Operations Sign-Off
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Dual control verification required prior to settlement and AMC feed dispatch (SEBI SoD Enforced).
            </p>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: '6px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Escalation Reasons Banner */}
        <div style={{ 
          background: 'rgba(245, 158, 11, 0.1)', 
          border: '1px solid rgba(245, 158, 11, 0.3)', 
          borderRadius: '12px', 
          padding: '14px 16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FBBF24', fontWeight: 700, fontSize: '0.85rem' }}>
            <ShieldAlert size={18} />
            Escalation Trigger Detected:
          </div>
          <ul style={{ paddingLeft: '24px', marginTop: '6px', fontSize: '0.8rem', color: '#FDE68A', lineHeight: '1.5' }}>
            {isHighValue && (
              <li>
                <strong>High-Value Transaction:</strong> Application amount of {formatINR(transaction.submission.investmentAmount)} meets or exceeds ₹1.00 Crore limit. AM Ops risk sign-off required.
              </li>
            )}
            {hasQaException && (
              <li>
                <strong>QA Critic Exception Flag:</strong> {transaction.qaResult?.exceptionSummary || 'Discrepancy detected during parallel compliance check.'}
              </li>
            )}
          </ul>
        </div>

        {/* Verification Matrix: Submitted Data vs Oracle Ground Truth */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Left: Submitted Form */}
          <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.8rem', marginBottom: '10px' }}>
              <FileText size={15} />
              Applicant Submitted Form Data
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Investor:</span> <strong>{transaction.submission.investorName}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>PAN:</span> <span className="mono-tag">{maskPan(transaction.submission.pan, !isPiiMasked)}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Amount:</span> <strong style={{ color: '#38BDF8' }}>{formatINR(transaction.submission.investmentAmount)}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Scheme:</span> {transaction.submission.schemeName}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Bank A/C:</span> <span className="mono-tag">{maskBankAccount(transaction.submission.bankAccountNumber, !isPiiMasked)}</span> ({transaction.submission.bankIfsc})</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Channel:</span> {transaction.submission.submissionChannel} ({transaction.submission.sourceRef})</div>
            </div>
          </div>

          {/* Right: Oracle DB Match & Evidence */}
          <div style={{ background: 'rgba(0, 0, 0, 0.35)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 600, fontSize: '0.8rem', marginBottom: '10px' }}>
              <Database size={15} />
              Oracle Master Records (Ground Truth)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              {transaction.qaResult?.checks.map((chk) => (
                <div key={chk.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{chk.title}:</span>
                  <span style={{ 
                    fontWeight: 600, 
                    fontSize: '0.75rem',
                    color: chk.status === 'PASSED' ? '#34D399' : chk.status === 'WARNING' ? '#FBBF24' : '#FB7185'
                  }}>
                    {chk.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Long-Term Exception Memory Advisory */}
        <div style={{ 
          background: 'rgba(168, 85, 247, 0.08)', 
          border: '1px solid rgba(168, 85, 247, 0.25)', 
          borderRadius: '12px', 
          padding: '12px 14px', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#C084FC', fontWeight: 600, fontSize: '0.8rem', marginBottom: '4px' }}>
            <BrainCircuit size={16} />
            Exception Memory Pattern Recommendation:
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
            {isHighValue 
              ? 'Pattern: High-ticket single transaction. Standard resolution: Confirm Escrow RTGS credit receipt and verify PAN with KRA. Once satisfied, AM Ops may approve.'
              : 'Pattern: SEBI / Mandate discrepancy. Standard resolution: Do not override if KYC or Mandate is inactive. Request investor re-KYC or instant payment link.'}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => handleQuickRemarks('Verified Escrow RTGS credit confirmation and KRA status. Approved for batch processing.')}
              className="btn-outline" 
              style={{ fontSize: '0.7rem', padding: '3px 8px' }}
            >
              + "Verified RTGS Escrow credit & KRA"
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickRemarks('Investor identity and high-value authorization confirmed per SEBI PMLA guidelines.')}
              className="btn-outline" 
              style={{ fontSize: '0.7rem', padding: '3px 8px' }}
            >
              + "Authorized per SEBI PMLA"
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickRemarks('Rejected: Bank mandate inactive / KYC non-compliant. Investor notified for resubmission.')}
              className="btn-outline" 
              style={{ fontSize: '0.7rem', padding: '3px 8px', color: '#FB7185' }}
            >
              + "Reject: Inactive mandate / KYC"
            </button>
          </div>
        </div>

        {/* Manager Input & Sign-off */}
        <div className="form-group">
          <label className="form-label">Authorized Manager Name & Title</label>
          <input
            type="text"
            className="form-input"
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Approval Remarks / Audit Sign-off Justification <span style={{ color: '#F43F5E' }}>*</span>
          </label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Document rationale, verification reference numbers, and reason for approval/rejection..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {errorMsg && (
          <div style={{ color: '#FB7185', fontSize: '0.8rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} />
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            <Lock size={13} />
            Dual-control audit timestamp and cryptographic hash will be created.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleAction('REJECT')}
              disabled={isSubmitting}
              className="btn-rose"
              style={{ padding: '10px 18px', fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <XCircle size={16} />
              Reject Form
            </button>
            <button
              onClick={() => handleAction('APPROVE')}
              disabled={isSubmitting}
              className="btn-emerald"
              style={{ padding: '10px 22px', fontSize: '0.85rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CheckCircle2 size={16} />
              {isSubmitting ? 'Signing...' : 'Authorize & Dispatch Feeds'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
