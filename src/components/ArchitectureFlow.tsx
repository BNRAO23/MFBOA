'use client';

import React, { useState } from 'react';
import { 
  Inbox, 
  Workflow, 
  CheckCheck, 
  UserCheck, 
  Send, 
  Database, 
  FileCheck2, 
  BrainCircuit, 
  CreditCard,
  Building2,
  Mail,
  Globe,
  MessageSquare,
  ShieldCheck,
  Info
} from 'lucide-react';

interface ArchitectureFlowProps {
  activeStage?: string;
  onSelectNode?: (nodeId: string) => void;
}

export function ArchitectureFlow({ activeStage }: ArchitectureFlowProps) {
  const [selectedNode, setSelectedNode] = useState<string>('fund_agent');

  const nodesInfo: Record<string, { title: string; desc: string; guardrail: string }> = {
    intake: {
      title: 'Form Intake Layer',
      desc: 'Ingests investor mutual fund applications from Email Systems (parsed scans/PDFs), Web Applications (distributor/investor portal), and Chatbots (conversational AI).',
      guardrail: 'Guardrail: PII encrypted upon intake and assigned immutable Trace ID.',
    },
    fund_agent: {
      title: 'Mutual Fund Workflow Agent',
      desc: 'Orchestrates the deterministic pipeline. Integrates with Oracle Database for ground truth, manages Short-term pipeline state, and queries Long-term Exception Memory.',
      guardrail: 'Guardrail: ReAct pattern disabled; strictly deterministic sequential workflow to eliminate hallucination risk.',
    },
    qa_checks: {
      title: 'Parallel QA Critic Checks',
      desc: 'Runs 5 fan-out independent audits: 1. SEBI KYC/AML check, 2. Oracle Investor & Folio match, 3. Bank Mandate & Third-party check, 4. Scheme minimum & Cut-off time, 5. High-Value Threshold (> ₹1 Cr).',
      guardrail: 'Guardrail: Segregation of Duties (SoD) — QA Critic is independent and cannot process or dispatch feeds.',
    },
    am_gate: {
      title: 'AM Approval Gate (Human-in-the-Loop)',
      desc: 'Mandatory human approval gate. Escalates whenever a QA rule fails OR transaction amount exceeds ₹1.00 Crore ($10M INR) as mandated by SEBI / AMC risk policy.',
      guardrail: 'Guardrail: Must never process transactions without required approvals. Dual sign-off remarks logged to audit ledger.',
    },
    process_agent: {
      title: 'Process Agent & Outcome Feeds',
      desc: 'Executes approved transactions. Dispatches AMC Feed (CAMS/KFintech batch) and Bank Feed (NACH ACH Debit / RTGS settlement).',
      guardrail: 'Guardrail: 100% compliance with RTA file formatting specs and T+1 settlement window.',
    },
    oracle_db: {
      title: 'Oracle Database Ground Truth',
      desc: 'Authoritative backend storing Investor KYC Status, Aadhaar linking, Registered Bank Mandates & Limits, Active Folios, and Scheme Masters.',
      guardrail: 'Guardrail: Authorised read-only queries with strict access logging.',
    },
    memories: {
      title: 'Short-term & Exception Memory',
      desc: 'Short-term memory holds active transaction state. Long-term memory indexes past exception resolutions and SEBI circular precedents for pattern matching.',
      guardrail: 'Guardrail: Past resolutions serve as advisory recommendations to Assistant Manager Ops.',
    }
  };

  const current = nodesInfo[selectedNode] || nodesInfo['fund_agent'];

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Workflow size={20} color="#38BDF8" />
            L3 Architecture Blueprint Flow
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Single workflow agent with parallel QA and human approval gate (Ascent Architecture Pattern)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="brand-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)', color: '#A5B4FC' }}>
            Autonomy: L3 Human-in-the-Loop
          </span>
          <span className="brand-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34D399' }}>
            Segregation of Duties (SoD)
          </span>
        </div>
      </div>

      {/* Visual Flowchart Canvas */}
      <div className="arch-diagram-canvas">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', position: 'relative' }}>
          
          {/* Node 1: Form Intake */}
          <div 
            onClick={() => setSelectedNode('intake')}
            style={{
              cursor: 'pointer',
              background: selectedNode === 'intake' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${selectedNode === 'intake' ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: selectedNode === 'intake' ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase' }}>Trigger</span>
              <Inbox size={16} color="#38BDF8" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>Form Intake</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Email, Web, Chatbot
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              <span className="mono-tag" style={{ fontSize: '0.65rem' }}>Email</span>
              <span className="mono-tag" style={{ fontSize: '0.65rem' }}>Web</span>
              <span className="mono-tag" style={{ fontSize: '0.65rem' }}>Bot</span>
            </div>
          </div>

          {/* Node 2: Mutual Fund Workflow Agent */}
          <div 
            onClick={() => setSelectedNode('fund_agent')}
            style={{
              cursor: 'pointer',
              background: selectedNode === 'fund_agent' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${selectedNode === 'fund_agent' ? '#6366F1' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: selectedNode === 'fund_agent' ? '0 0 20px rgba(99, 102, 241, 0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase' }}>Workflow Agent</span>
              <Workflow size={16} color="#818CF8" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>Mutual Fund Agent</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Ingests, coordinates, dispatches
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#C7D2FE', background: 'rgba(99, 102, 241, 0.1)', padding: '3px 6px', borderRadius: '4px' }}>
              Oracle DB · Memory Connected
            </div>
          </div>

          {/* Node 3: Parallel QA Critic */}
          <div 
            onClick={() => setSelectedNode('qa_checks')}
            style={{
              cursor: 'pointer',
              background: selectedNode === 'qa_checks' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${selectedNode === 'qa_checks' ? '#A855F7' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: selectedNode === 'qa_checks' ? '0 0 20px rgba(168, 85, 247, 0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C084FC', textTransform: 'uppercase' }}>Critic (Fan-out)</span>
              <CheckCheck size={16} color="#C084FC" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>Parallel QA Checks</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Compliance, data & rules
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#E9D5FF', background: 'rgba(168, 85, 247, 0.1)', padding: '3px 6px', borderRadius: '4px' }}>
              5 Fan-Out Rules · 100% Precision
            </div>
          </div>

          {/* Node 4: AM Human Gate */}
          <div 
            onClick={() => setSelectedNode('am_gate')}
            style={{
              cursor: 'pointer',
              background: selectedNode === 'am_gate' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${selectedNode === 'am_gate' ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: selectedNode === 'am_gate' ? '0 0 20px rgba(245, 158, 11, 0.3)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase' }}>Human Gate</span>
              <UserCheck size={16} color="#FBBF24" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>AM Approval Gate</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Assistant Manager Ops
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#FDE68A', background: 'rgba(245, 158, 11, 0.1)', padding: '3px 6px', borderRadius: '4px' }}>
              &gt; ₹1.00 Cr or Exceptions
            </div>
          </div>

          {/* Node 5: Process Agent & Outcome Feeds */}
          <div 
            onClick={() => setSelectedNode('process_agent')}
            style={{
              cursor: 'pointer',
              background: selectedNode === 'process_agent' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${selectedNode === 'process_agent' ? '#10B981' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: selectedNode === 'process_agent' ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase' }}>Outcome Feeds</span>
              <Send size={16} color="#34D399" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>Process Agent</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                AMC Feed & Bank Feed
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
              <span className="mono-tag" style={{ fontSize: '0.65rem', color: '#6EE7B7' }}>CAMS/KFin</span>
              <span className="mono-tag" style={{ fontSize: '0.65rem', color: '#6EE7B7' }}>NACH/RTGS</span>
            </div>
          </div>

        </div>

        {/* Supporting Systems Banner */}
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button 
            onClick={() => setSelectedNode('oracle_db')} 
            className="btn-outline"
            style={{ 
              fontSize: '0.75rem', 
              padding: '6px 12px',
              borderColor: selectedNode === 'oracle_db' ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)' 
            }}
          >
            <Database size={14} color="#38BDF8" />
            Oracle Database (Ground Truth Master)
          </button>
          <button 
            onClick={() => setSelectedNode('memories')} 
            className="btn-outline"
            style={{ 
              fontSize: '0.75rem', 
              padding: '6px 12px',
              borderColor: selectedNode === 'memories' ? '#A855F7' : 'rgba(255, 255, 255, 0.1)' 
            }}
          >
            <BrainCircuit size={14} color="#A855F7" />
            Short-Term Memory & Exception Memory
          </button>
        </div>
      </div>

      {/* Selected Node Details Box */}
      <div style={{ 
        marginTop: '16px', 
        padding: '14px 18px', 
        background: 'rgba(255, 255, 255, 0.02)', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <Info size={20} color="#38BDF8" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#FFF' }}>
            {current.title}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {current.desc}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#FBBF24', marginTop: '4px', fontWeight: 600 }}>
            {current.guardrail}
          </div>
        </div>
      </div>
    </div>
  );
}
