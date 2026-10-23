'use client';

import React from 'react';
import { AuditLogEntry } from '@/lib/types';
import { formatTimestamp } from '@/lib/utils';
import { Shield, ShieldAlert, Cpu, CheckCheck, UserCheck, Send, Lock } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  isPiiMasked: boolean;
}

export function AuditLogViewer({ logs, isPiiMasked }: AuditLogViewerProps) {
  const getActorBadge = (actor: AuditLogEntry['actor']) => {
    switch (actor) {
      case 'WORKFLOW_AGENT':
        return <span className="mono-tag" style={{ color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>WORKFLOW_AGENT</span>;
      case 'QA_CRITIC':
        return <span className="mono-tag" style={{ color: '#A855F7', borderColor: 'rgba(168, 85, 247, 0.3)' }}>QA_CRITIC</span>;
      case 'AM_OPERATIONS':
        return <span className="mono-tag" style={{ color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.3)' }}>AM_OPERATIONS</span>;
      case 'PROCESS_AGENT':
        return <span className="mono-tag" style={{ color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>PROCESS_AGENT</span>;
      default:
        return <span className="mono-tag">SYSTEM</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} color="#38BDF8" />
            SEBI Compliance & Security Audit Ledger
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Immutable, cryptographically hashed access log complying with SEBI data privacy, PII protection, and Segregation of Duties.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: isPiiMasked ? '#10B981' : '#F59E0B', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Shield size={14} />
            {isPiiMasked ? 'SEBI Masking Enforced (PAN/Acc Masked)' : 'Auditor Full Access Mode'}
          </span>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor (SoD)</th>
              <th>Action Trigger</th>
              <th>Audit Log Details</th>
              <th>Masked PII Envelope</th>
              <th>Integrity Hash</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td>{getActorBadge(log.actor)}</td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#FFF' }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '340px' }}>
                    {log.details}
                  </td>
                  <td>
                    <span className="mono-tag" style={{ fontSize: '0.7rem' }}>
                      {isPiiMasked ? log.maskedPii : log.maskedPii.replace(/\*/g, '•')}
                    </span>
                  </td>
                  <td>
                    <span className="mono-tag" style={{ fontSize: '0.65rem', color: '#64748B' }}>
                      {log.hash}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
