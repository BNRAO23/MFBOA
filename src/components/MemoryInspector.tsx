'use client';

import React, { useState } from 'react';
import { ExceptionMemoryRecord, MutualFundTransaction } from '@/lib/types';
import { BrainCircuit, Layers, Database, ShieldCheck, BookOpen } from 'lucide-react';

interface MemoryInspectorProps {
  exceptionMemory: ExceptionMemoryRecord[];
  transactions: MutualFundTransaction[];
}

export function MemoryInspector({ exceptionMemory, transactions }: MemoryInspectorProps) {
  const [activeTab, setActiveTab] = useState<'EXCEPTION_MEMORY' | 'SHORT_TERM'>('EXCEPTION_MEMORY');

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BrainCircuit size={20} color="#A855F7" />
            Agent Memory Architecture
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Short-term memory maintains active form state; Long-term Exception Memory indexes past resolutions for pattern recognition.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`tab-btn ${activeTab === 'EXCEPTION_MEMORY' ? 'active' : ''}`}
            onClick={() => setActiveTab('EXCEPTION_MEMORY')}
          >
            <BookOpen size={14} />
            Long-Term Exception Memory ({exceptionMemory.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'SHORT_TERM' ? 'active' : ''}`}
            onClick={() => setActiveTab('SHORT_TERM')}
          >
            <Layers size={14} />
            Short-Term Active Pipeline ({transactions.length})
          </button>
        </div>
      </div>

      {activeTab === 'EXCEPTION_MEMORY' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {exceptionMemory.map((mem) => (
            <div 
              key={mem.id}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="mono-tag" style={{ fontSize: '0.7rem', color: '#C084FC' }}>{mem.id}</span>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    background: 'rgba(245, 158, 11, 0.15)', 
                    color: '#FBBF24',
                    fontWeight: 600 
                  }}>
                    {mem.occurrenceCount} historical cases
                  </span>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFF', marginBottom: '6px' }}>
                  {mem.mismatchType}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '10px' }}>
                  <strong style={{ color: '#E2E8F0' }}>Advisory Pattern:</strong> {mem.suggestedResolution}
                </div>
              </div>

              {mem.sebiCircularReference && (
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--text-dim)', 
                  fontFamily: 'var(--font-mono)', 
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                  paddingTop: '8px' 
                }}>
                  Ref: {mem.sebiCircularReference}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Trace ID</th>
                <th>Transaction</th>
                <th>Active Stage</th>
                <th>Memory Allocation</th>
                <th>TTL / Lifetime</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td><span className="mono-tag" style={{ color: '#38BDF8' }}>{tx.traceId}</span></td>
                  <td style={{ fontWeight: 600 }}>{tx.submission.investorName} ({tx.id})</td>
                  <td><span className="mono-tag">{tx.status}</span></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ephemeral Execution Context (Session Buffer)</td>
                  <td style={{ fontSize: '0.75rem', color: '#10B981' }}>Retained until T+1 Dispatch</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
