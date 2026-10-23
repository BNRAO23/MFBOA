'use client';

import React, { useState } from 'react';
import { ChannelType, FormType, FormSubmission } from '@/lib/types';
import { ORACLE_SCHEMES } from '@/lib/oracleDatabase';
import { 
  X, 
  Send, 
  Globe, 
  Mail, 
  MessageSquare, 
  Zap, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<FormSubmission>) => Promise<void>;
}

export function IntakeModal({ isOpen, onClose, onSubmit }: IntakeModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'PRESETS' | 'WEB' | 'EMAIL' | 'CHATBOT'>('PRESETS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [investorName, setInvestorName] = useState('Bonela Narasinga Rao');
  const [pan, setPan] = useState('ABCDE1234F');
  const [folioNumber, setFolioNumber] = useState('10482914/82');
  const [email, setEmail] = useState('narsing.rao@gmail.com');
  const [phone, setPhone] = useState('+91 98480 12345');
  const [schemeCode, setSchemeCode] = useState('PPFAS-FC-DIR');
  const [investmentAmount, setInvestmentAmount] = useState('500000');
  const [paymentMode, setPaymentMode] = useState<FormSubmission['paymentMode']>('NACH_MANDATE');
  const [bankAccountNumber, setBankAccountNumber] = useState('912010045678912');
  const [bankIfsc, setBankIfsc] = useState('UTIB0000045');
  const [bankName, setBankName] = useState('Axis Bank');

  // Email specific state
  const [emailSender, setEmailSender] = useState('ops-direct@clientportal.com');
  const [emailSubject, setEmailSubject] = useState('Mutual Fund Lumpsum Purchase Application - Ref #EM-9921');
  const [emailAttachment, setEmailAttachment] = useState('Purchase_Form_Signed_Aadhaar_PAN.pdf');

  // Chatbot specific state
  const [botPrompt, setBotPrompt] = useState('I want to invest ₹50,000 in Parag Parikh Flexi Cap Fund from my registered Axis Bank account.');

  const handlePresetSelect = async (preset: {
    channel: ChannelType;
    name: string;
    pan: string;
    folio: string;
    email: string;
    phone: string;
    scheme: string;
    amount: number;
    mode: FormSubmission['paymentMode'];
    acc: string;
    ifsc: string;
    bank: string;
    sourceRef: string;
  }) => {
    setIsSubmitting(true);
    try {
      const selectedScheme = ORACLE_SCHEMES.find(s => s.code === preset.scheme);
      await onSubmit({
        submissionChannel: preset.channel,
        formType: 'NEW_PURCHASE',
        investorName: preset.name,
        pan: preset.pan,
        folioNumber: preset.folio,
        email: preset.email,
        phone: preset.phone,
        schemeCode: preset.scheme,
        schemeName: selectedScheme?.name || preset.scheme,
        investmentAmount: preset.amount,
        paymentMode: preset.mode,
        bankAccountNumber: preset.acc,
        bankIfsc: preset.ifsc,
        bankName: preset.bank,
        sourceRef: preset.sourceRef,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (channel: ChannelType) => {
    setIsSubmitting(true);
    try {
      const selectedScheme = ORACLE_SCHEMES.find(s => s.code === schemeCode);
      let sourceRef = 'Web Application Direct Portal';
      let rawSnippet: string | undefined;

      if (channel === 'EMAIL') {
        sourceRef = `Email: "${emailSubject}" from <${emailSender}>`;
        rawSnippet = `Attachment: ${emailAttachment} | Ingested via IMAP Automated Daemon`;
      } else if (channel === 'CHATBOT') {
        sourceRef = 'WhatsApp / Web AI Chatbot Dialogue';
        rawSnippet = `User Utterance: "${botPrompt}"`;
      }

      await onSubmit({
        submissionChannel: channel,
        formType: 'NEW_PURCHASE',
        investorName,
        pan: pan.toUpperCase(),
        folioNumber: folioNumber || 'NEW',
        email,
        phone,
        schemeCode,
        schemeName: selectedScheme?.name || schemeCode,
        investmentAmount: Number(investmentAmount),
        paymentMode,
        bankAccountNumber,
        bankIfsc: bankIfsc.toUpperCase(),
        bankName,
        sourceRef,
        rawPayloadSnippet: rawSnippet,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="brand-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
                INTAKE SIMULATOR
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Multi-Channel Form Ingestion</span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFF', marginTop: '6px' }}>
              Ingest Mutual Fund Application Form
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Submit synthetic purchase forms to test the Parallel QA Critic, AM Approval Gate, and Feed Generation.
            </p>
          </div>
          <button onClick={onClose} className="btn-outline" style={{ padding: '6px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Channel Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '20px' }}>
          <button 
            className={`tab-btn ${activeTab === 'PRESETS' ? 'active' : ''}`}
            onClick={() => setActiveTab('PRESETS')}
          >
            <Sparkles size={15} color="#FBBF24" />
            1-Click Test Scenarios (Recommended)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'WEB' ? 'active' : ''}`}
            onClick={() => setActiveTab('WEB')}
          >
            <Globe size={15} />
            Web Form
          </button>
          <button 
            className={`tab-btn ${activeTab === 'EMAIL' ? 'active' : ''}`}
            onClick={() => setActiveTab('EMAIL')}
          >
            <Mail size={15} />
            Email Intake
          </button>
          <button 
            className={`tab-btn ${activeTab === 'CHATBOT' ? 'active' : ''}`}
            onClick={() => setActiveTab('CHATBOT')}
          >
            <MessageSquare size={15} />
            Chatbot Intake
          </button>
        </div>

        {/* Tab 1: 1-Click Presets */}
        {activeTab === 'PRESETS' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Preset 1: Clean STP */}
            <div 
              onClick={() => handlePresetSelect({
                channel: 'WEB',
                name: 'Bonela Narasinga Rao',
                pan: 'ABCDE1234F',
                folio: '10482914/82',
                email: 'narsing.rao@gmail.com',
                phone: '+91 98480 12345',
                scheme: 'PPFAS-FC-DIR',
                amount: 500000,
                mode: 'NACH_MANDATE',
                acc: '912010045678912',
                ifsc: 'UTIB0000045',
                bank: 'Axis Bank',
                sourceRef: 'Web Investor Portal #WEB-99120',
              })}
              style={{
                cursor: 'pointer',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399' }}>STP Clean Flow</span>
                <CheckCircle size={16} color="#10B981" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF', marginTop: '6px' }}>
                ₹5,00,000 · Bonela N. Rao
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Parag Parikh Flexi Cap · Active Axis Mandate · 100% QA Pass · Auto Feeds Dispatched
              </div>
            </div>

            {/* Preset 2: High Value Gate (> 1 Cr) */}
            <div 
              onClick={() => handlePresetSelect({
                channel: 'EMAIL',
                name: 'Vikramaditya Singhania',
                pan: 'CKLPR4412Q',
                folio: '99401287/01',
                email: 'v.singhania@corpventures.com',
                phone: '+91 99001 88888',
                scheme: 'SBI-BC-DIR',
                amount: 15000000, // ₹1.50 Crore
                mode: 'NEFT_RTGS',
                acc: '50100298412763',
                ifsc: 'ICIC0000004',
                bank: 'ICICI Bank',
                sourceRef: 'Email to ops@amc.com (Subject: HNW Purchase Form - SBI Bluechip)',
              })}
              style={{
                cursor: 'pointer',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FBBF24' }}>High Value (&gt; ₹1 Cr Gate)</span>
                <AlertTriangle size={16} color="#F59E0B" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF', marginTop: '6px' }}>
                ₹1.50 Crore · V. Singhania
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                SBI Bluechip · ICICI RTGS · Valid KYC · Triggers AM Ops Human Gate
              </div>
            </div>

            {/* Preset 3: Expired KYC Exception */}
            <div 
              onClick={() => handlePresetSelect({
                channel: 'CHATBOT',
                name: 'Ananya Deshmukh',
                pan: 'DJMNT5590K',
                folio: 'NEW',
                email: 'ananya.deshmukh@gmail.com',
                phone: '+91 98220 33445',
                scheme: 'HDFC-TOP100-DIR',
                amount: 25000,
                mode: 'UPI',
                acc: '62110984512',
                ifsc: 'SBIN0000691',
                bank: 'State Bank of India',
                sourceRef: 'WhatsApp Bot Chat #WA-8812',
              })}
              style={{
                cursor: 'pointer',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FB7185' }}>SEBI KYC Exception</span>
                <AlertTriangle size={16} color="#F43F5E" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF', marginTop: '6px' }}>
                ₹25,000 · Ananya Deshmukh
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                HDFC Top 100 · KYC Expired in KRA · Fails SEBI rule · AM Review Required
              </div>
            </div>

            {/* Preset 4: Inactive Bank Mandate Exception */}
            <div 
              onClick={() => handlePresetSelect({
                channel: 'EMAIL',
                name: 'Rajesh Kumar Verma',
                pan: 'EOPTR7731M',
                folio: 'NEW',
                email: 'rajesh.verma@enterprise.org',
                phone: '+91 98100 99221',
                scheme: 'NIPPON-SM-DIR',
                amount: 100000,
                mode: 'NACH_MANDATE',
                acc: '102938475612',
                ifsc: 'KKBK0000180',
                bank: 'Kotak Mahindra Bank',
                sourceRef: 'Email Intake forms@amc.org',
              })}
              style={{
                cursor: 'pointer',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FB7185' }}>Bank Mandate Inactive</span>
                <AlertTriangle size={16} color="#F43F5E" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF', marginTop: '6px' }}>
                ₹1,00,000 · Rajesh Verma
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Nippon Small Cap · Kotak Mandate INACTIVE in Oracle DB · AM Review Required
              </div>
            </div>
          </div>
        )}

        {/* Tab 2, 3, 4: Form Input Fields for Manual / Email / Chatbot */}
        {activeTab !== 'PRESETS' && (
          <div>
            {activeTab === 'EMAIL' && (
              <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Sender</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={emailSender} 
                      onChange={(e) => setEmailSender(e.target.value)} 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Attachment Filename</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={emailAttachment} 
                      onChange={(e) => setEmailAttachment(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'CHATBOT' && (
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Chatbot User Utterance / Prompt</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={botPrompt} 
                    onChange={(e) => setBotPrompt(e.target.value)} 
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Investor Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={investorName} 
                  onChange={(e) => setInvestorName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">PAN (10-Digit Alphanumeric)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={pan} 
                  onChange={(e) => setPan(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mutual Fund Scheme</label>
                <select 
                  className="form-select"
                  value={schemeCode}
                  onChange={(e) => setSchemeCode(e.target.value)}
                >
                  {ORACLE_SCHEMES.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.amc})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Application Amount (INR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={investmentAmount} 
                  onChange={(e) => setInvestmentAmount(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Folio Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={folioNumber} 
                  onChange={(e) => setFolioNumber(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select 
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                >
                  <option value="NACH_MANDATE">NACH / e-Mandate</option>
                  <option value="NET_BANKING">Net Banking</option>
                  <option value="NEFT_RTGS">NEFT / RTGS</option>
                  <option value="UPI">UPI Instant</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Registered Bank Account Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={bankAccountNumber} 
                  onChange={(e) => setBankAccountNumber(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bank IFSC Code</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={bankIfsc} 
                  onChange={(e) => setBankIfsc(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '10px' }}>
              <button onClick={onClose} className="btn-outline">
                Cancel
              </button>
              <button 
                onClick={() => handleManualSubmit(activeTab as ChannelType)}
                disabled={isSubmitting}
                className="btn-primary"
              >
                <Send size={16} />
                {isSubmitting ? 'Ingesting & Auditing...' : `Submit via ${activeTab}`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
