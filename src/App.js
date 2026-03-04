import React, { useState, useRef, useCallback } from "react";

/* ─── CONSTANTS ─────────────────────────────────────────── */
const STAGES = [
  {
    id: 'prospect',
    label: 'Prospect',
    color: '#94a3b8',
    bg: '#f1f5f9',
    icon: '🔍',
  },
  {
    id: 'discovery',
    label: 'Discovery',
    color: '#f59e0b',
    bg: '#fffbeb',
    icon: '💬',
  },
  {
    id: 'qualified',
    label: 'Qualified',
    color: '#3b82f6',
    bg: '#eff6ff',
    icon: '✅',
  },
  {
    id: 'proposal',
    label: 'Proposal',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    icon: '📄',
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    color: '#ec4899',
    bg: '#fdf2f8',
    icon: '🤝',
  },
  {
    id: 'closed_won',
    label: 'Closed Won',
    color: '#22c55e',
    bg: '#f0fdf4',
    icon: '🏆',
  },
  {
    id: 'closed_lost',
    label: 'Closed Lost',
    color: '#ef4444',
    bg: '#fef2f2',
    icon: '❌',
  },
];

const SECTIONS = [
  { id: 'overview', icon: '🏢', label: 'Overview' },
  { id: 'stakeholders', icon: '👥', label: 'Stakeholders' },
  { id: 'opportunity', icon: '💼', label: 'Opportunity' },
  { id: 'strategy', icon: '🎯', label: 'Strategy' },
  { id: 'score', icon: '📊', label: 'Score' },
];

const ROLES = [
  'Economic Buyer',
  'Champion',
  'Influencer',
  'End User',
  'Blocker',
  'Technical Buyer',
];
const RELATIONSHIP = ['❄️ Cold', '🌤 Warm', '🔥 Advocate', '⚠️ Blocker'];
const WHITESPACE = [
  'Sponsored Jobs',
  'Resume Search',
  'Assessments',
  'Employer Branding',
  'Indeed Flex',
  'Hiring Events',
  'Smart Sourcing',
  'Programmatic',
];
const MEDDIC = [
  { key: 'metrics', label: 'Metrics', desc: 'Quantifiable business impact' },
  {
    key: 'economicBuyer',
    label: 'Economic Buyer',
    desc: 'Who controls budget?',
  },
  {
    key: 'decisionCriteria',
    label: 'Decision Criteria',
    desc: 'How will they decide?',
  },
  {
    key: 'decisionProcess',
    label: 'Decision Process',
    desc: 'Steps to a decision',
  },
  { key: 'pain', label: 'Identify Pain', desc: 'Core business problem' },
  { key: 'champion', label: 'Champion', desc: 'Who advocates internally?' },
  {
    key: 'competition',
    label: 'Competition',
    desc: 'Who else are they considering?',
  },
];

const ROLE_ICONS = {
  'Economic Buyer': '💰',
  Champion: '🏆',
  Influencer: '💡',
  'End User': '👤',
  Blocker: '🚫',
  'Technical Buyer': '🔧',
};
const REL_COLORS = {
  '❄️ Cold': '#bfdbfe',
  '🌤 Warm': '#fde68a',
  '🔥 Advocate': '#bbf7d0',
  '⚠️ Blocker': '#fecaca',
};

const blankAccount = () => ({
  id: Date.now(),
  name: '',
  industry: '',
  size: '',
  revenue: '',
  location: '',
  website: '',
  notes: '',
  hiringVolume: '',
  currentATS: '',
  competitorSpend: '',
  renewalDate: '',
  indeedUsage: '',
  whiteSpace: [],
  goal: '',
  plan30: '',
  plan60: '',
  plan90: '',
  risks: '',
  execSponsor: '',
  stage: 'prospect',
  dealValue: '',
  closeDate: '',
  stakeholders: [],
  meddic: {
    metrics: 0,
    economicBuyer: 0,
    decisionCriteria: 0,
    decisionProcess: 0,
    pain: 0,
    champion: 0,
    competition: 0,
  },
  meddicNotes: {},
  createdAt: new Date().toLocaleDateString(),
});

/* ─── SMALL UI COMPONENTS ────────────────────────────────── */
const Field = ({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  type = 'text',
}) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 5,
        }}
      >
        {label}
      </div>
    )}
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        style={{
          width: '100%',
          padding: '9px 12px',
          borderRadius: 8,
          border: '1.5px solid #e2e8f0',
          fontSize: 13,
          fontFamily: 'inherit',
          background: '#fafafa',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
          color: '#1e293b',
        }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '9px 12px',
          borderRadius: 8,
          border: '1.5px solid #e2e8f0',
          fontSize: 13,
          fontFamily: 'inherit',
          background: '#fafafa',
          outline: 'none',
          boxSizing: 'border-box',
          color: '#1e293b',
        }}
      />
    )}
  </div>
);

const Sel = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 5,
        }}
      >
        {label}
      </div>
    )}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '9px 12px',
        borderRadius: 8,
        border: '1.5px solid #e2e8f0',
        fontSize: 13,
        fontFamily: 'inherit',
        background: '#fafafa',
        outline: 'none',
        color: '#1e293b',
        cursor: 'pointer',
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

const Card = ({ children, style }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: 14,
      border: '1px solid #e8edf5',
      padding: 22,
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      ...style,
    }}
  >
    {children}
  </div>
);

const Btn = ({
  children,
  onClick,
  variant = 'primary',
  small,
  disabled,
  style: sx,
}) => {
  const base = {
    border: 'none',
    borderRadius: 8,
    cursor: disabled ? 'default' : 'pointer',
    fontFamily: 'inherit',
    fontWeight: 600,
    transition: 'all 0.15s',
    opacity: disabled ? 0.45 : 1,
    ...sx,
  };
  const variants = {
    primary: {
      background: '#1d4ed8',
      color: '#fff',
      padding: small ? '7px 14px' : '10px 20px',
      fontSize: small ? 13 : 14,
    },
    ghost: {
      background: '#f1f5f9',
      color: '#334155',
      padding: small ? '7px 14px' : '10px 20px',
      fontSize: small ? 13 : 14,
    },
    danger: {
      background: '#fee2e2',
      color: '#dc2626',
      padding: small ? '7px 12px' : '9px 16px',
      fontSize: small ? 12 : 13,
    },
    success: {
      background: '#dcfce7',
      color: '#16a34a',
      padding: small ? '7px 14px' : '10px 20px',
      fontSize: small ? 13 : 14,
    },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </button>
  );
};

const ScoreDots = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        onClick={() => onChange(n === value ? 0 : n)}
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background:
            n <= value
              ? value >= 4
                ? '#22c55e'
                : value >= 2
                ? '#f59e0b'
                : '#ef4444'
              : '#e2e8f0',
          transition: 'all 0.2s',
          transform: n <= value ? 'scale(1.15)' : 'scale(1)',
        }}
      />
    ))}
  </div>
);

/* ─── DEAL STAGE BADGE ───────────────────────────────────── */
const StageBadge = ({ stageId, size = 'sm' }) => {
  const s = STAGES.find((x) => x.id === stageId) || STAGES[0];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1.5px solid ${s.color}33`,
        borderRadius: 20,
        padding: size === 'sm' ? '3px 10px' : '5px 14px',
        fontSize: size === 'sm' ? 11 : 13,
        fontWeight: 700,
      }}
    >
      {s.icon} {s.label}
    </span>
  );
};

/* ─── PDF EXPORT ─────────────────────────────────────────── */
const exportPDF = (account) => {
  const meddicScore = Math.round(
    (Object.values(account.meddic).reduce((a, b) => a + b, 0) / (7 * 5)) * 100
  );
  const stage = STAGES.find((s) => s.id === account.stage) || STAGES[0];
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Account Plan - ${
    account.name
  }</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;color:#1e293b;background:#fff;padding:40px;font-size:13px}
    h1{font-family:'Playfair Display',serif;font-size:28px;color:#0f172a;margin-bottom:4px}
    h2{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin:24px 0 12px;border-bottom:1px solid #e8edf5;padding-bottom:6px}
    h3{font-size:13px;font-weight:700;color:#0f172a;margin-bottom:6px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
    .card{background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0}
    .badge{display:inline-block;background:${stage.bg};color:${
    stage.color
  };border:1.5px solid ${
    stage.color
  }44;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700}
    .row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #f1f5f9}
    .chip{display:inline-block;background:#eff6ff;color:#2563eb;border-radius:20px;padding:3px 10px;margin:3px;font-size:12px;font-weight:600}
    .score-bar{height:8px;border-radius:4px;background:#e2e8f0;margin-top:4px}
    .score-fill{height:8px;border-radius:4px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th{background:#f1f5f9;padding:8px 10px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b}
    td{padding:8px 10px;border-bottom:1px solid #f1f5f9;font-size:13px}
    .plan-box{background:#f8fafc;border-radius:8px;padding:14px;border-left:3px solid}
    footer{margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;display:flex;justify-content:space-between}
  </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
    <div>
      <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">INDEED ENTERPRISE · ACCOUNT PLAN</div>
      <h1>${account.name || 'Unnamed Account'}</h1>
      <div style="color:#64748b;font-size:14px;margin-top:4px">${
        account.industry || ''
      }${account.industry && account.location ? ' · ' : ''}${
    account.location || ''
  }</div>
    </div>
    <div style="text-align:right">
      <div class="badge">${stage.icon} ${stage.label}</div>
      <div style="margin-top:8px;font-size:13px;color:#64748b">MEDDIC Score: <strong style="color:#0f172a">${meddicScore}%</strong></div>
      ${
        account.dealValue
          ? `<div style="font-size:16px;font-weight:700;color:#1d4ed8;margin-top:4px">${account.dealValue}</div>`
          : ''
      }
    </div>
  </div>

  <h2>Account Overview</h2>
  <div class="grid">
    <div class="card">
      <h3>Company Details</h3>
      ${[
        ['Size', account.size],
        ['Revenue', account.revenue],
        ['Industry', account.industry],
        ['HQ', account.location],
        ['Website', account.website],
      ]
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<div class="row"><span style="color:#64748b">${k}</span><span style="font-weight:600">${v}</span></div>`
        )
        .join('')}
    </div>
    <div class="card">
      <h3>Hiring Intelligence</h3>
      ${[
        ['Monthly Volume', account.hiringVolume],
        ['Current ATS', account.currentATS],
        ['Competitor Spend', account.competitorSpend],
        ['Renewal Date', account.renewalDate],
      ]
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<div class="row"><span style="color:#64748b">${k}</span><span style="font-weight:600">${v}</span></div>`
        )
        .join('')}
    </div>
  </div>
  ${
    account.notes
      ? `<div class="card" style="margin-top:12px"><h3>Notes</h3><p style="margin-top:6px;color:#475569;line-height:1.6">${account.notes}</p></div>`
      : ''
  }

  ${
    account.stakeholders.length > 0
      ? `
  <h2>Stakeholder Map</h2>
  <table>
    <tr><th>Name</th><th>Title</th><th>Role</th><th>Relationship</th><th>Priorities</th></tr>
    ${account.stakeholders
      .map(
        (s) =>
          `<tr><td><strong>${s.name}</strong></td><td>${s.title}</td><td>${
            s.role
          }</td><td>${s.relationship}</td><td style="color:#64748b">${
            s.priorities || '—'
          }</td></tr>`
      )
      .join('')}
  </table>`
      : ''
  }

  <h2>Opportunity Analysis</h2>
  <div class="grid">
    <div class="card">
      <h3>Current Indeed Usage</h3>
      <p style="margin-top:6px;color:#475569">${
        account.indeedUsage || 'Not specified'
      }</p>
    </div>
    <div class="card">
      <h3>White Space — Untapped Products</h3>
      <div style="margin-top:8px">${
        account.whiteSpace.length > 0
          ? account.whiteSpace
              .map((w) => `<span class="chip">${w}</span>`)
              .join('')
          : "<span style='color:#94a3b8'>None identified</span>"
      }</div>
    </div>
  </div>

  <h2>MEDDIC Qualification (${meddicScore}%)</h2>
  <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;margin-top:8px">
    ${MEDDIC.map(
      ({ key, label }) => `<div style="text-align:center">
      <div style="font-size:11px;font-weight:700;color:#64748b;margin-bottom:6px">${
        label.split(' ')[0]
      }</div>
      <div class="score-bar"><div class="score-fill" style="width:${
        (account.meddic[key] / 5) * 100
      }%;background:${
        account.meddic[key] >= 4
          ? '#22c55e'
          : account.meddic[key] >= 2
          ? '#f59e0b'
          : '#e2e8f0'
      }"></div></div>
      <div style="font-size:13px;font-weight:700;margin-top:4px">${
        account.meddic[key]
      }/5</div>
    </div>`
    ).join('')}
  </div>

  ${
    account.goal || account.plan30 || account.plan60 || account.plan90
      ? `
  <h2>Account Strategy</h2>
  ${
    account.goal
      ? `<div style="margin-bottom:12px"><strong>Goal:</strong> <span style="color:#1d4ed8">${
          account.goal
        }</span>${
          account.execSponsor
            ? ` &nbsp;·&nbsp; <strong>Exec Sponsor:</strong> ${account.execSponsor}`
            : ''
        }</div>`
      : ''
  }
  <div class="grid" style="grid-template-columns:1fr 1fr 1fr">
    ${[
      ['30 Days', '#dbeafe', '#1d4ed8', account.plan30],
      ['60 Days', '#dcfce7', '#16a34a', account.plan60],
      ['90 Days', '#fef9c3', '#ca8a04', account.plan90],
    ]
      .filter(([, , , v]) => v)
      .map(
        ([l, bg, col, v]) =>
          `<div class="plan-box" style="background:${bg};border-color:${col}"><div style="font-weight:700;color:${col};margin-bottom:6px">⏱ ${l}</div><p style="color:#475569;line-height:1.6">${v}</p></div>`
      )
      .join('')}
  </div>
  ${
    account.risks
      ? `<div class="card" style="margin-top:12px"><h3>⚠️ Risks</h3><p style="margin-top:6px;color:#475569">${account.risks}</p></div>`
      : ''
  }`
      : ''
  }

  <footer>
    <span>Indeed Enterprise Account Planner · Confidential</span>
    <span>Generated ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}</span>
  </footer>
  </body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `AccountPlan_${(account.name || 'Account').replace(
    /\s+/g,
    '_'
  )}.html`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ─── MAIN APP ───────────────────────────────────────────── */
export default function App() {
  const [accounts, setAccounts] = useState([blankAccount()]);
  const [activeAccountId, setActiveAccountId] = useState(accounts[0].id);
  const [activeSection, setActiveSection] = useState(0);
  const [showStakeholderForm, setShowStakeholderForm] = useState(false);
  const [editingStakeholderIdx, setEditingStakeholderIdx] = useState(null);
  const [newStakeholder, setNewStakeholder] = useState({
    name: '',
    title: '',
    role: 'Economic Buyer',
    relationship: '❄️ Cold',
    email: '',
    linkedin: '',
    priorities: '',
    notes: '',
  });
  const [showNewAccountModal, setShowNewAccountModal] = useState(false);
  const [kanban, setKanban] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const account = accounts.find((a) => a.id === activeAccountId) || accounts[0];
  const updateAccount = (key, val) =>
    setAccounts((prev) =>
      prev.map((a) => (a.id === activeAccountId ? { ...a, [key]: val } : a))
    );
  const updateMeddic = (key, val) =>
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === activeAccountId
          ? { ...a, meddic: { ...a.meddic, [key]: val } }
          : a
      )
    );
  const updateMeddicNote = (key, val) =>
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === activeAccountId
          ? { ...a, meddicNotes: { ...a.meddicNotes, [key]: val } }
          : a
      )
    );
  const toggleWhiteSpace = (item) =>
    updateAccount(
      'whiteSpace',
      account.whiteSpace.includes(item)
        ? account.whiteSpace.filter((x) => x !== item)
        : [...account.whiteSpace, item]
    );

  const addAccount = () => {
    const a = blankAccount();
    setAccounts((p) => [...p, a]);
    setActiveAccountId(a.id);
    setActiveSection(0);
    setShowNewAccountModal(false);
  };
  const deleteAccount = (id) => {
    if (accounts.length === 1) return;
    const remaining = accounts.filter((a) => a.id !== id);
    setAccounts(remaining);
    if (activeAccountId === id) setActiveAccountId(remaining[0].id);
  };

  const saveStakeholder = () => {
    const updated =
      editingStakeholderIdx !== null
        ? account.stakeholders.map((s, i) =>
            i === editingStakeholderIdx ? newStakeholder : s
          )
        : [...account.stakeholders, newStakeholder];
    updateAccount('stakeholders', updated);
    setShowStakeholderForm(false);
    setEditingStakeholderIdx(null);
    setNewStakeholder({
      name: '',
      title: '',
      role: 'Economic Buyer',
      relationship: '❄️ Cold',
      email: '',
      linkedin: '',
      priorities: '',
      notes: '',
    });
  };

  const meddicScore = Math.round(
    (Object.values(account.meddic).reduce((a, b) => a + b, 0) / (7 * 5)) * 100
  );
  const completeness = [
    account.name && account.industry,
    account.stakeholders.length > 0,
    account.stakeholders.some((s) => s.role === 'Champion'),
    account.stakeholders.some((s) => s.role === 'Economic Buyer'),
    account.whiteSpace.length > 0,
    Object.values(account.meddic).some((v) => v > 0),
    !!account.goal,
    !!(account.plan30 || account.plan60 || account.plan90),
  ];
  const completePct = Math.round(
    (completeness.filter(Boolean).length / completeness.length) * 100
  );

  const handleExport = () => {
    exportPDF(account);
    setExportMsg('✅ Exported!');
    setTimeout(() => setExportMsg(''), 2500);
  };

  /* ── KANBAN VIEW ── */
  if (kanban)
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0f172a',
          fontFamily: "'DM Sans','Segoe UI',sans-serif",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
        <div
          style={{
            background: '#1e293b',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 0',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              📋
            </div>
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15 }}>
              Account Planner
            </span>
            <span
              style={{
                background: '#6366f1',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
              }}
            >
              PIPELINE
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn onClick={addAccount} small>
              + New Account
            </Btn>
            <Btn onClick={() => setKanban(false)} variant="ghost" small>
              📋 Planner View
            </Btn>
          </div>
        </div>
        <div style={{ padding: '28px 24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 16, minWidth: 'max-content' }}>
            {STAGES.map((stage) => {
              const stageAccounts = accounts.filter(
                (a) => a.stage === stage.id
              );
              const totalValue = stageAccounts.reduce((sum, a) => {
                const v =
                  parseFloat((a.dealValue || '').replace(/[^0-9.]/g, '')) || 0;
                return sum + v;
              }, 0);
              return (
                <div
                  key={stage.id}
                  style={{
                    width: 240,
                    background: '#1e293b',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom: '2px solid ' + stage.color,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#f8fafc',
                        }}
                      >
                        {stage.icon} {stage.label}
                      </div>
                      <div
                        style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}
                      >
                        {stageAccounts.length} account
                        {stageAccounts.length !== 1 ? 's' : ''}
                        {totalValue > 0
                          ? ` · $${totalValue.toLocaleString()}`
                          : ''}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: stage.color,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      padding: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      minHeight: 200,
                    }}
                  >
                    {stageAccounts.map((acc) => {
                      const ms = Math.round(
                        (Object.values(acc.meddic).reduce((a, b) => a + b, 0) /
                          (7 * 5)) *
                          100
                      );
                      return (
                        <div
                          key={acc.id}
                          onClick={() => {
                            setActiveAccountId(acc.id);
                            setKanban(false);
                            setActiveSection(0);
                          }}
                          style={{
                            background: '#0f172a',
                            borderRadius: 10,
                            padding: 14,
                            cursor: 'pointer',
                            border: '1px solid #334155',
                            transition: 'border 0.15s',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.borderColor = '#3b82f6')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.borderColor = '#334155')
                          }
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              color: '#f1f5f9',
                              fontSize: 14,
                              marginBottom: 2,
                            }}
                          >
                            {acc.name || 'Unnamed'}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: '#64748b',
                              marginBottom: 8,
                            }}
                          >
                            {acc.industry || '—'}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              MEDDIC
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color:
                                  ms >= 70
                                    ? '#22c55e'
                                    : ms >= 40
                                    ? '#f59e0b'
                                    : '#ef4444',
                              }}
                            >
                              {ms}%
                            </div>
                          </div>
                          <div
                            style={{
                              height: 4,
                              background: '#1e293b',
                              borderRadius: 4,
                              marginTop: 4,
                            }}
                          >
                            <div
                              style={{
                                height: 4,
                                borderRadius: 4,
                                width: `${ms}%`,
                                background:
                                  ms >= 70
                                    ? '#22c55e'
                                    : ms >= 40
                                    ? '#f59e0b'
                                    : '#ef4444',
                                transition: 'width 0.3s',
                              }}
                            />
                          </div>
                          {acc.dealValue && (
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: '#60a5fa',
                                marginTop: 8,
                              }}
                            >
                              {acc.dealValue}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {stageAccounts.length === 0 && (
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#475569',
                          fontSize: 12,
                          padding: '20px 0',
                        }}
                      >
                        No accounts
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );

  /* ── PLANNER VIEW ── */
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg,#f0f4ff 0%,#fafbff 60%,#f0faf5 100%)',
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box} textarea,input,select{font-family:inherit}
        ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:#f1f5f9} ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
      `}</style>

      {/* TOP BAR */}
      <div
        style={{
          background: '#0f172a',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 0',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
            }}
          >
            📋
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>
              Account Planner
            </div>
            <div style={{ fontSize: 10, color: '#475569' }}>
              Indeed Enterprise Sales
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Btn onClick={() => setKanban(true)} variant="ghost" small>
            🗂 Pipeline View
          </Btn>
          <Btn onClick={handleExport} variant="success" small>
            {exportMsg || '⬇ Export PDF'}
          </Btn>
          <Btn onClick={() => setShowNewAccountModal(true)} small>
            + New Account
          </Btn>
        </div>
      </div>

      {/* ACCOUNT TABS */}
      <div
        style={{
          background: '#1e293b',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          overflowX: 'auto',
        }}
      >
        {accounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => {
              setActiveAccountId(acc.id);
              setActiveSection(0);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              cursor: 'pointer',
              borderBottom:
                acc.id === activeAccountId
                  ? '2.5px solid #3b82f6'
                  : '2.5px solid transparent',
              background:
                acc.id === activeAccountId
                  ? 'rgba(59,130,246,0.1)'
                  : 'transparent',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: acc.id === activeAccountId ? '#60a5fa' : '#94a3b8',
              }}
            >
              {acc.name || 'New Account'}
            </span>
            <StageBadge stageId={acc.stage} />
            {accounts.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAccount(acc.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: 14,
                  lineHeight: 1,
                  padding: '0 2px',
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* SECTION NAV */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #e8edf5',
          padding: '0 24px',
          display: 'flex',
        }}
      >
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(i)}
            style={{
              padding: '14px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              color: activeSection === i ? '#1d4ed8' : '#64748b',
              borderBottom:
                activeSection === i
                  ? '2.5px solid #1d4ed8'
                  : '2.5px solid transparent',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {s.icon} {s.label}
          </button>
        ))}
        {/* stage selector inline */}
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 0',
          }}
        >
          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
            Stage:
          </span>
          <select
            value={account.stage}
            onChange={(e) => updateAccount('stage', e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: 8,
              border: '1.5px solid #e2e8f0',
              fontSize: 12,
              fontFamily: 'inherit',
              background: '#fafafa',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.label}
              </option>
            ))}
          </select>
          <Field
            value={account.dealValue}
            onChange={(v) => updateAccount('dealValue', v)}
            placeholder="💰 Deal value"
            style={{ margin: 0 }}
          />
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div
        style={{
          background: '#fff',
          padding: '0 24px 12px',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#94a3b8',
            marginBottom: 5,
          }}
        >
          <span>Plan completeness</span>
          <span
            style={{
              fontWeight: 700,
              color:
                completePct >= 80
                  ? '#16a34a'
                  : completePct >= 50
                  ? '#d97706'
                  : '#dc2626',
            }}
          >
            {completePct}%
          </span>
        </div>
        <div style={{ height: 5, background: '#f1f5f9', borderRadius: 4 }}>
          <div
            style={{
              height: 5,
              borderRadius: 4,
              width: `${completePct}%`,
              background:
                completePct >= 80
                  ? '#22c55e'
                  : completePct >= 50
                  ? '#f59e0b'
                  : '#ef4444',
              transition: 'width 0.4s',
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 940, margin: '0 auto', padding: '28px 20px' }}>
        {/* ── OVERVIEW ── */}
        {activeSection === 0 && (
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 22,
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 6px',
              }}
            >
              Account Overview
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Capture the key facts about this account
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
              }}
            >
              <Card>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 16,
                  }}
                >
                  Company Details
                </div>
                <Field
                  label="Company Name"
                  value={account.name}
                  onChange={(v) => updateAccount('name', v)}
                  placeholder="e.g. Acme Corp"
                />
                <Field
                  label="Industry"
                  value={account.industry}
                  onChange={(v) => updateAccount('industry', v)}
                  placeholder="e.g. Technology, Healthcare"
                />
                <Field
                  label="Company Size"
                  value={account.size}
                  onChange={(v) => updateAccount('size', v)}
                  placeholder="e.g. 5,000–10,000 employees"
                />
                <Field
                  label="Annual Revenue"
                  value={account.revenue}
                  onChange={(v) => updateAccount('revenue', v)}
                  placeholder="e.g. $500M"
                />
                <Field
                  label="HQ Location"
                  value={account.location}
                  onChange={(v) => updateAccount('location', v)}
                  placeholder="City, Country"
                />
                <Field
                  label="Website"
                  value={account.website}
                  onChange={(v) => updateAccount('website', v)}
                  placeholder="https://..."
                />
              </Card>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <Card>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 16,
                    }}
                  >
                    Hiring Intelligence
                  </div>
                  <Field
                    label="Monthly Hiring Volume"
                    value={account.hiringVolume}
                    onChange={(v) => updateAccount('hiringVolume', v)}
                    placeholder="e.g. 200 roles/month"
                  />
                  <Field
                    label="Current ATS / HR Stack"
                    value={account.currentATS}
                    onChange={(v) => updateAccount('currentATS', v)}
                    placeholder="e.g. Workday + LinkedIn"
                  />
                  <Field
                    label="Est. Competitor Spend"
                    value={account.competitorSpend}
                    onChange={(v) => updateAccount('competitorSpend', v)}
                    placeholder="e.g. $150K/year"
                  />
                  <Field
                    label="Contract Renewal Date"
                    value={account.renewalDate}
                    onChange={(v) => updateAccount('renewalDate', v)}
                    placeholder="e.g. Q3 2025"
                  />
                  <Field
                    label="Target Close Date"
                    value={account.closeDate}
                    onChange={(v) => updateAccount('closeDate', v)}
                    placeholder="e.g. Dec 2025"
                  />
                </Card>
                <Card>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 12,
                    }}
                  >
                    Strategic Notes
                  </div>
                  <Field
                    value={account.notes}
                    onChange={(v) => updateAccount('notes', v)}
                    placeholder="Recent news, strategic priorities, key pain points…"
                    multiline
                  />
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ── STAKEHOLDERS ── */}
        {activeSection === 1 && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 22,
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '0 0 4px',
                  }}
                >
                  Stakeholder Map
                </h2>
                <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
                  Build your buying committee
                </p>
              </div>
              <Btn
                onClick={() => {
                  setShowStakeholderForm(true);
                  setEditingStakeholderIdx(null);
                  setNewStakeholder({
                    name: '',
                    title: '',
                    role: 'Economic Buyer',
                    relationship: '❄️ Cold',
                    email: '',
                    linkedin: '',
                    priorities: '',
                    notes: '',
                  });
                }}
              >
                + Add Stakeholder
              </Btn>
            </div>

            {account.stakeholders.length === 0 && !showStakeholderForm && (
              <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <div
                  style={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}
                >
                  No stakeholders yet
                </div>
                <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 4 }}>
                  Map your buying committee to understand the deal
                </div>
              </Card>
            )}

            {account.stakeholders.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))',
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {account.stakeholders.map((s, i) => (
                  <Card key={i} style={{ position: 'relative' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          background: REL_COLORS[s.relationship] || '#e2e8f0',
                          borderRadius: 8,
                          padding: '3px 9px',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {s.relationship}
                      </div>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          onClick={() => {
                            setNewStakeholder({ ...s });
                            setEditingStakeholderIdx(i);
                            setShowStakeholderForm(true);
                          }}
                          style={{
                            background: '#f1f5f9',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            updateAccount(
                              'stakeholders',
                              account.stakeholders.filter((_, j) => j !== i)
                            )
                          }
                          style={{
                            background: '#fee2e2',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 26, marginBottom: 4 }}>
                      {ROLE_ICONS[s.role] || '👤'}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      {s.name || '—'}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: '#64748b',
                        marginBottom: 8,
                      }}
                    >
                      {s.title}
                    </div>
                    <span
                      style={{
                        background: '#f1f5f9',
                        borderRadius: 20,
                        padding: '3px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#334155',
                      }}
                    >
                      {s.role}
                    </span>
                    {s.priorities && (
                      <p
                        style={{
                          fontSize: 12,
                          color: '#475569',
                          marginTop: 10,
                          marginBottom: 4,
                          lineHeight: 1.5,
                        }}
                      >
                        🎯 {s.priorities}
                      </p>
                    )}
                    {s.email && (
                      <div
                        style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}
                      >
                        ✉️ {s.email}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {showStakeholderForm && (
              <Card style={{ border: '2px solid #3b82f6', marginTop: 16 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#0f172a',
                    marginBottom: 18,
                  }}
                >
                  {editingStakeholderIdx !== null
                    ? 'Edit Stakeholder'
                    : 'New Stakeholder'}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0 20px',
                  }}
                >
                  <Field
                    label="Full Name"
                    value={newStakeholder.name}
                    onChange={(v) =>
                      setNewStakeholder((s) => ({ ...s, name: v }))
                    }
                    placeholder="Jane Smith"
                  />
                  <Field
                    label="Job Title"
                    value={newStakeholder.title}
                    onChange={(v) =>
                      setNewStakeholder((s) => ({ ...s, title: v }))
                    }
                    placeholder="CHRO"
                  />
                  <Sel
                    label="Role in Deal"
                    value={newStakeholder.role}
                    onChange={(v) =>
                      setNewStakeholder((s) => ({ ...s, role: v }))
                    }
                    options={ROLES}
                  />
                  <Sel
                    label="Relationship"
                    value={newStakeholder.relationship}
                    onChange={(v) =>
                      setNewStakeholder((s) => ({ ...s, relationship: v }))
                    }
                    options={RELATIONSHIP}
                  />
                  <Field
                    label="Email"
                    value={newStakeholder.email}
                    onChange={(v) =>
                      setNewStakeholder((s) => ({ ...s, email: v }))
                    }
                    placeholder="jane@company.com"
                  />
                  <Field
                    label="LinkedIn"
                    value={newStakeholder.linkedin}
                    onChange={(v) =>
                      setNewStakeholder((s) => ({ ...s, linkedin: v }))
                    }
                    placeholder="linkedin.com/in/..."
                  />
                </div>
                <Field
                  label="Priorities / KPIs"
                  value={newStakeholder.priorities}
                  onChange={(v) =>
                    setNewStakeholder((s) => ({ ...s, priorities: v }))
                  }
                  placeholder="e.g. Reduce time-to-hire, improve diversity…"
                />
                <Field
                  label="Notes"
                  value={newStakeholder.notes}
                  onChange={(v) =>
                    setNewStakeholder((s) => ({ ...s, notes: v }))
                  }
                  placeholder="Communication style, concerns, last touchpoint…"
                  multiline
                />
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    justifyContent: 'flex-end',
                  }}
                >
                  <Btn
                    onClick={() => setShowStakeholderForm(false)}
                    variant="ghost"
                  >
                    Cancel
                  </Btn>
                  <Btn onClick={saveStakeholder}>Save</Btn>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── OPPORTUNITY ── */}
        {activeSection === 2 && (
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 22,
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 6px',
              }}
            >
              Opportunity Analysis
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Identify white space and qualify the deal with MEDDIC
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                marginBottom: 20,
              }}
            >
              <Card>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 14,
                  }}
                >
                  Current Indeed Usage
                </div>
                <Field
                  value={account.indeedUsage}
                  onChange={(v) => updateAccount('indeedUsage', v)}
                  placeholder="e.g. $80K Sponsored Jobs, no Resume access…"
                  multiline
                />
              </Card>
              <Card>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 14,
                  }}
                >
                  White Space — Untapped Products
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {WHITESPACE.map((item) => (
                    <button
                      key={item}
                      onClick={() => toggleWhiteSpace(item)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '2px solid',
                        transition: 'all 0.15s',
                        borderColor: account.whiteSpace.includes(item)
                          ? '#1d4ed8'
                          : '#e2e8f0',
                        background: account.whiteSpace.includes(item)
                          ? '#eff6ff'
                          : '#fafafa',
                        color: account.whiteSpace.includes(item)
                          ? '#1d4ed8'
                          : '#64748b',
                      }}
                    >
                      {account.whiteSpace.includes(item) ? '✓ ' : ''}
                      {item}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
            <Card>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  MEDDIC Qualification
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Overall:</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color:
                        meddicScore >= 70
                          ? '#16a34a'
                          : meddicScore >= 40
                          ? '#d97706'
                          : '#dc2626',
                    }}
                  >
                    {meddicScore}%
                  </div>
                </div>
              </div>
              {MEDDIC.map(({ key, label, desc }) => (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 1fr 130px',
                    gap: 14,
                    alignItems: 'center',
                    padding: '11px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0f172a',
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}
                    >
                      {desc}
                    </div>
                  </div>
                  <input
                    value={account.meddicNotes[key] || ''}
                    onChange={(e) => updateMeddicNote(key, e.target.value)}
                    placeholder={`Notes…`}
                    style={{
                      padding: '8px 11px',
                      borderRadius: 8,
                      border: '1.5px solid #e2e8f0',
                      fontSize: 12,
                      fontFamily: 'inherit',
                      outline: 'none',
                      background: '#fafafa',
                      width: '100%',
                    }}
                  />
                  <ScoreDots
                    value={account.meddic[key]}
                    onChange={(v) => updateMeddic(key, v)}
                  />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ── STRATEGY ── */}
        {activeSection === 3 && (
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 22,
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 6px',
              }}
            >
              Account Strategy
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Define your playbook and execution plan
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
                marginBottom: 20,
              }}
            >
              <Card>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 14,
                  }}
                >
                  Account Goal
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {[
                    '🌱 Land & Expand',
                    '🔒 Protect & Retain',
                    '📈 Grow Revenue',
                    '🚀 Strategic Close',
                  ].map((g) => (
                    <button
                      key={g}
                      onClick={() => updateAccount('goal', g)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '2px solid',
                        transition: 'all 0.15s',
                        borderColor: account.goal === g ? '#1d4ed8' : '#e2e8f0',
                        background: account.goal === g ? '#eff6ff' : '#fafafa',
                        color: account.goal === g ? '#1d4ed8' : '#64748b',
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <Field
                  label="Executive Sponsor"
                  value={account.execSponsor}
                  onChange={(v) => updateAccount('execSponsor', v)}
                  placeholder="Internal exec sponsoring this account"
                />
              </Card>
              <Card>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 14,
                  }}
                >
                  ⚠️ Risks & Mitigation
                </div>
                <Field
                  value={account.risks}
                  onChange={(v) => updateAccount('risks', v)}
                  placeholder="Key deal risks and how you plan to mitigate them…"
                  multiline
                />
              </Card>
            </div>
            <Card>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 18,
                }}
              >
                30 / 60 / 90 Day Action Plan
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 16,
                }}
              >
                {[
                  ['30 Days', 'plan30', '#dbeafe', '#1d4ed8'],
                  ['60 Days', 'plan60', '#dcfce7', '#16a34a'],
                  ['90 Days', 'plan90', '#fef9c3', '#ca8a04'],
                ].map(([label, key, bg, color]) => (
                  <div
                    key={key}
                    style={{ background: bg, borderRadius: 10, padding: 16 }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color,
                        marginBottom: 10,
                      }}
                    >
                      ⏱ {label}
                    </div>
                    <textarea
                      value={account[key]}
                      onChange={(e) => updateAccount(key, e.target.value)}
                      placeholder={`Actions for ${label.toLowerCase()}…`}
                      rows={5}
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'rgba(255,255,255,0.6)',
                        borderRadius: 8,
                        padding: 10,
                        fontSize: 12,
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                        boxSizing: 'border-box',
                        color: '#1e293b',
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── SCORE ── */}
        {activeSection === 4 && (
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 22,
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 6px',
              }}
            >
              Account Score
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Health and readiness of this account plan
            </p>

            {/* Deal stage pipeline */}
            <Card style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 16,
                }}
              >
                Deal Stage Pipeline
              </div>
              <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
                {STAGES.map((s, i) => {
                  const isActive = account.stage === s.id;
                  const isPast =
                    STAGES.findIndex((x) => x.id === account.stage) > i;
                  return (
                    <button
                      key={s.id}
                      onClick={() => updateAccount('stage', s.id)}
                      style={{
                        flex: 1,
                        padding: '10px 4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s',
                        background: isActive
                          ? s.color
                          : isPast
                          ? '#e2e8f0'
                          : '#f8fafc',
                        color: isActive
                          ? '#fff'
                          : isPast
                          ? '#94a3b8'
                          : '#64748b',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: 11,
                        borderRadius:
                          i === 0
                            ? '8px 0 0 8px'
                            : i === STAGES.length - 1
                            ? '0 8px 8px 0'
                            : '0',
                        borderRight:
                          i < STAGES.length - 1 ? '1px solid #e2e8f0' : 'none',
                      }}
                    >
                      <div style={{ fontSize: 16 }}>{s.icon}</div>
                      <div style={{ marginTop: 2 }}>{s.label}</div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 20,
              }}
            >
              <Card style={{ textAlign: 'center', padding: '36px 24px' }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 16,
                  }}
                >
                  MEDDIC Score
                </div>
                <div
                  style={{
                    position: 'relative',
                    width: 150,
                    height: 150,
                    margin: '0 auto 20px',
                  }}
                >
                  <svg
                    width="150"
                    height="150"
                    style={{ transform: 'rotate(-90deg)' }}
                  >
                    <circle
                      cx="75"
                      cy="75"
                      r="60"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="11"
                    />
                    <circle
                      cx="75"
                      cy="75"
                      r="60"
                      fill="none"
                      stroke={
                        meddicScore >= 70
                          ? '#22c55e'
                          : meddicScore >= 40
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                      strokeWidth="11"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 60 * (1 - meddicScore / 100)
                      }`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.6s' }}
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%,-50%)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 800,
                        color: '#0f172a',
                      }}
                    >
                      {meddicScore}%
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      qualified
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  {meddicScore >= 80
                    ? '🟢 Well-qualified'
                    : meddicScore >= 50
                    ? '🟡 Keep qualifying'
                    : '🔴 Early stage'}
                </div>
              </Card>

              <Card>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 14,
                  }}
                >
                  Plan Completeness
                </div>
                {[
                  ['Account Overview', completeness[0]],
                  ['Stakeholders Added', completeness[1]],
                  ['Champion Identified', completeness[2]],
                  ['Economic Buyer Mapped', completeness[3]],
                  ['White Space Tagged', completeness[4]],
                  ['MEDDIC Scored', completeness[5]],
                  ['Account Goal Set', completeness[6]],
                  ['90-Day Plan Written', completeness[7]],
                ].map(([label, done]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '9px 0',
                      borderBottom: '1px solid #f8fafc',
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#334155' }}>
                      {label}
                    </span>
                    <span style={{ fontSize: 16 }}>{done ? '✅' : '⬜'}</span>
                  </div>
                ))}
              </Card>

              <Card style={{ gridColumn: 'span 2' }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 16,
                  }}
                >
                  MEDDIC Breakdown
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7,1fr)',
                    gap: 12,
                  }}
                >
                  {MEDDIC.map(({ key, label }) => (
                    <div key={key} style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          height: 80,
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            borderRadius: 6,
                            height: `${Math.max(
                              (account.meddic[key] / 5) * 80,
                              4
                            )}px`,
                            background:
                              account.meddic[key] >= 4
                                ? '#22c55e'
                                : account.meddic[key] >= 2
                                ? '#f59e0b'
                                : '#e2e8f0',
                            minHeight: 4,
                            transition: 'height 0.4s',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#64748b',
                        }}
                      >
                        {label.split(' ')[0]}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#0f172a',
                          marginTop: 2,
                        }}
                      >
                        {account.meddic[key]}/5
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Bottom Nav */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 32,
            paddingTop: 18,
            borderTop: '1px solid #e8edf5',
          }}
        >
          <Btn
            onClick={() => setActiveSection((a) => Math.max(0, a - 1))}
            variant="ghost"
            disabled={activeSection === 0}
          >
            ← Previous
          </Btn>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {SECTIONS.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveSection(i)}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  background: activeSection === i ? '#1d4ed8' : '#e2e8f0',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
          <Btn
            onClick={() =>
              setActiveSection((a) => Math.min(SECTIONS.length - 1, a + 1))
            }
            disabled={activeSection === SECTIONS.length - 1}
          >
            Next →
          </Btn>
        </div>
      </div>

      {/* NEW ACCOUNT MODAL */}
      {showNewAccountModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <Card style={{ width: 380, padding: 32 }}>
            <div
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 20,
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: 8,
              }}
            >
              New Account
            </div>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              Start a fresh account plan. You can fill in details inside the
              planner.
            </p>
            <div
              style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}
            >
              <Btn
                onClick={() => setShowNewAccountModal(false)}
                variant="ghost"
              >
                Cancel
              </Btn>
              <Btn onClick={addAccount}>Create Account</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
