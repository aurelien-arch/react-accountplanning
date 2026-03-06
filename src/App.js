import React, { useState, useEffect, useCallback } from "react";

/*
  ╔══════════════════════════════════════════════════════════════╗
  ║         INDEED ENTERPRISE ACCOUNT PLANNER — PRO             ║
  ║         Connected to Google Sheets via Apps Script           ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  SETUP INSTRUCTIONS:                                         ║
  ║  1. Go to sheets.google.com → create a new sheet            ║
  ║  2. Name it "Account Planner"                               ║
  ║  3. Go to Extensions → Apps Script                          ║
  ║  4. Paste the Apps Script code (see APPS_SCRIPT_CODE below) ║
  ║  5. Click Deploy → New Deployment → Web App                 ║
  ║     - Execute as: Me                                         ║
  ║     - Who has access: Anyone                                 ║
  ║  6. Copy the Web App URL                                     ║
  ║  7. Replace SHEET_URL below with your URL                   ║
  ╚══════════════════════════════════════════════════════════════╝

  APPS_SCRIPT_CODE — paste this in your Google Apps Script editor:

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  var action = data.action;

  if (action === "save") {
    var tab = sheet.getSheetByName("Accounts") || sheet.insertSheet("Accounts");
    var rows = tab.getDataRange().getValues();
    var id = data.account.id;
    var found = false;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] == id) {
        tab.getRange(i + 1, 1, 1, 3).setValues([[id, data.account.name, JSON.stringify(data.account)]]);
        found = true; break;
      }
    }
    if (!found) {
      if (rows.length === 0 || (rows.length === 1 && rows[0][0] === "")) {
        tab.getRange(1, 1, 1, 3).setValues([["ID", "Name", "Data"]]);
      }
      tab.appendRow([id, data.account.name, JSON.stringify(data.account)]);
    }
    return ContentService.createTextOutput(JSON.stringify({status:"ok"})).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "delete") {
    var tab = sheet.getSheetByName("Accounts");
    if (!tab) return ContentService.createTextOutput(JSON.stringify({status:"ok"})).setMimeType(ContentService.MimeType.JSON);
    var rows = tab.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] == data.id) { tab.deleteRow(i + 1); break; }
    }
    return ContentService.createTextOutput(JSON.stringify({status:"ok"})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var tab = sheet.getSheetByName("Accounts");
  if (!tab) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  var rows = tab.getDataRange().getValues();
  var accounts = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][2]) { try { accounts.push(JSON.parse(rows[i][2])); } catch(e) {} }
  }
  return ContentService.createTextOutput(JSON.stringify(accounts)).setMimeType(ContentService.MimeType.JSON);
}
*/

// ─── PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ───────────
const SHEET_URL = "https://script.google.com/a/macros/indeed.com/s/AKfycbxL-onOOm3SzjEDj8aZBZblm4oUAXm2CHiexojaqcTs1QH3HKYtjxyOg-8aj9ZHMLnn/exec";
// ───────────────────────────────────────────────────────────────

const STAGES = [
  { id:"prospect",    label:"Prospect",    color:"#94a3b8", bg:"#f1f5f9", icon:"🔍" },
  { id:"discovery",   label:"Discovery",   color:"#f59e0b", bg:"#fffbeb", icon:"💬" },
  { id:"qualified",   label:"Qualified",   color:"#3b82f6", bg:"#eff6ff", icon:"✅" },
  { id:"proposal",    label:"Proposal",    color:"#8b5cf6", bg:"#f5f3ff", icon:"📄" },
  { id:"negotiation", label:"Negotiation", color:"#ec4899", bg:"#fdf2f8", icon:"🤝" },
  { id:"closed_won",  label:"Closed Won",  color:"#22c55e", bg:"#f0fdf4", icon:"🏆" },
  { id:"closed_lost", label:"Closed Lost", color:"#ef4444", bg:"#fef2f2", icon:"❌" },
];

const SECTIONS = [
  { id:"overview",     icon:"🏢", label:"Overview" },
  { id:"stakeholders", icon:"👥", label:"Stakeholders" },
  { id:"opportunity",  icon:"💼", label:"Opportunity" },
  { id:"strategy",     icon:"🎯", label:"Strategy" },
  { id:"score",        icon:"📊", label:"Score" },
];

const ROLES = ["Economic Buyer","Champion","Influencer","End User","Blocker","Technical Buyer"];
const RELATIONSHIP = ["❄️ Cold","🌤 Warm","🔥 Advocate","⚠️ Blocker"];
const WHITESPACE = ["Sponsored Jobs","Resume Search","Assessments","Employer Branding","Indeed Flex","Hiring Events","Smart Sourcing","Programmatic"];
const MEDDIC = [
  { key:"metrics",         label:"Metrics",          desc:"Quantifiable business impact" },
  { key:"economicBuyer",   label:"Economic Buyer",   desc:"Who controls budget?" },
  { key:"decisionCriteria",label:"Decision Criteria",desc:"How will they decide?" },
  { key:"decisionProcess", label:"Decision Process", desc:"Steps to a decision" },
  { key:"pain",            label:"Identify Pain",    desc:"Core business problem" },
  { key:"champion",        label:"Champion",         desc:"Who advocates internally?" },
  { key:"competition",     label:"Competition",      desc:"Who are they considering?" },
];
const ROLE_ICONS = { "Economic Buyer":"💰","Champion":"🏆","Influencer":"💡","End User":"👤","Blocker":"🚫","Technical Buyer":"🔧" };
const REL_COLORS = { "❄️ Cold":"#bfdbfe","🌤 Warm":"#fde68a","🔥 Advocate":"#bbf7d0","⚠️ Blocker":"#fecaca" };
const TEAM = ["Carlos","Frédéric","Dorothée","Martin","Mélanie","Loïc","Tristan","Geoffray","Johanna","Estelle","Taoufik","Aurélien"];

const blankAccount = (rep="") => ({
  id: Date.now().toString(),
  name:"", industry:"", size:"", revenue:"", location:"", website:"", notes:"",
  hiringVolume:"", currentATS:"", competitorSpend:"", renewalDate:"", indeedUsage:"",
  whiteSpace:[], goal:"", plan30:"", plan60:"", plan90:"", risks:"", execSponsor:"",
  stage:"prospect", dealValue:"", closeDate:"", rep,
  stakeholders:[],
  meddic:{ metrics:0,economicBuyer:0,decisionCriteria:0,decisionProcess:0,pain:0,champion:0,competition:0 },
  meddicNotes:{},
  createdAt: new Date().toLocaleDateString(),
  updatedAt: new Date().toLocaleString(),
});

/* ── UI HELPERS ── */
const Field = ({ label, value, onChange, placeholder, multiline, disabled }) => (
  <div style={{ marginBottom:13 }}>
    {label && <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5 }}>{label}</div>}
    {multiline
      ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} disabled={disabled}
          style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:13,fontFamily:"inherit",background: disabled?"#f8fafc":"#fafafa",resize:"vertical",outline:"none",boxSizing:"border-box",color:"#1e293b" }}/>
      : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
          style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:13,fontFamily:"inherit",background: disabled?"#f8fafc":"#fafafa",outline:"none",boxSizing:"border-box",color:"#1e293b" }}/>
    }
  </div>
);

const Sel = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom:13 }}>
    {label && <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:5 }}>{label}</div>}
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:13,fontFamily:"inherit",background:"#fafafa",outline:"none",color:"#1e293b",cursor:"pointer" }}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background:"#fff",borderRadius:14,border:"1px solid #e8edf5",padding:22,boxShadow:"0 1px 6px rgba(0,0,0,0.05)",...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant="primary", small, disabled, style:sx }) => {
  const base = { border:"none",borderRadius:8,cursor:disabled?"default":"pointer",fontFamily:"inherit",fontWeight:600,transition:"all 0.15s",opacity:disabled?0.45:1,...sx };
  const variants = {
    primary: { background:"#1d4ed8",color:"#fff",padding:small?"7px 14px":"10px 20px",fontSize:small?13:14 },
    ghost:   { background:"#f1f5f9",color:"#334155",padding:small?"7px 14px":"10px 20px",fontSize:small?13:14 },
    danger:  { background:"#fee2e2",color:"#dc2626",padding:small?"6px 12px":"9px 16px",fontSize:small?12:13 },
    success: { background:"#dcfce7",color:"#16a34a",padding:small?"7px 14px":"10px 20px",fontSize:small?13:14 },
    warning: { background:"#fffbeb",color:"#d97706",padding:small?"7px 14px":"10px 20px",fontSize:small?13:14 },
  };
  return <button onClick={onClick} disabled={disabled} style={{...base,...variants[variant]}}>{children}</button>;
};

const ScoreDots = ({ value, onChange }) => (
  <div style={{ display:"flex",gap:4 }}>
    {[1,2,3,4,5].map(n=>(
      <button key={n} onClick={()=>onChange(n===value?0:n)} style={{ width:20,height:20,borderRadius:"50%",border:"none",cursor:"pointer",
        background:n<=value?(value>=4?"#22c55e":value>=2?"#f59e0b":"#ef4444"):"#e2e8f0",
        transition:"all 0.2s",transform:n<=value?"scale(1.15)":"scale(1)" }}/>
    ))}
  </div>
);

const StageBadge = ({ stageId }) => {
  const s = STAGES.find(x=>x.id===stageId)||STAGES[0];
  return <span style={{ background:s.bg,color:s.color,border:`1.5px solid ${s.color}44`,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:700 }}>{s.icon} {s.label}</span>;
};

const Toast = ({ msg, type }) => (
  <div style={{ position:"fixed",bottom:24,right:24,zIndex:9999,background:type==="error"?"#fef2f2":type==="success"?"#f0fdf4":"#eff6ff",
    border:`1.5px solid ${type==="error"?"#fca5a5":type==="success"?"#86efac":"#93c5fd"}`,
    borderRadius:10,padding:"12px 20px",fontSize:14,fontWeight:600,
    color:type==="error"?"#dc2626":type==="success"?"#16a34a":"#1d4ed8",
    boxShadow:"0 4px 20px rgba(0,0,0,0.1)",display:"flex",alignItems:"center",gap:8 }}>
    {type==="error"?"❌":type==="success"?"✅":"⏳"} {msg}
  </div>
);

/* ── SETUP SCREEN ── */
const SetupScreen = ({ onConfigured }) => (
  <div style={{ minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans','Segoe UI',sans-serif",padding:24 }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600;700&display=swap');`}</style>
    <div style={{ maxWidth:640,width:"100%" }}>
      <div style={{ textAlign:"center",marginBottom:40 }}>
        <div style={{ width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px" }}>📋</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:700,color:"#f8fafc",margin:"0 0 8px" }}>Account Planner Setup</h1>
        <p style={{ color:"#94a3b8",fontSize:15,margin:0 }}>Connect to Google Sheets in 3 steps to enable team collaboration</p>
      </div>

      {[
        { n:1, title:"Create a Google Sheet", steps:[
          "Go to sheets.google.com",
          'Create a new blank spreadsheet',
          'Name it "Account Planner"',
          "Go to Extensions → Apps Script"
        ]},
        { n:2, title:"Paste the Apps Script code", steps:[
          "Delete all existing code in the editor",
          "Copy the Apps Script code from the comment at the top of App.jsx",
          "Paste it into the Apps Script editor",
          "Click Save (💾)"
        ]},
        { n:3, title:"Deploy & get your URL", steps:[
          "Click Deploy → New Deployment",
          'Select type: "Web App"',
          'Set "Execute as": Me — "Who has access": Anyone',
          "Click Deploy → Copy the Web App URL",
          "Paste the URL into App.jsx where it says YOUR_APPS_SCRIPT_URL_HERE",
          "Redeploy your Vercel app"
        ]},
      ].map(({ n, title, steps }) => (
        <div key={n} style={{ background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:20,marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
            <div style={{ width:28,height:28,borderRadius:"50%",background:"#3b82f6",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0 }}>{n}</div>
            <div style={{ fontSize:15,fontWeight:700,color:"#f1f5f9" }}>{title}</div>
          </div>
          <ul style={{ margin:0,paddingLeft:20 }}>
            {steps.map((s,i)=><li key={i} style={{ color:"#94a3b8",fontSize:13,marginBottom:4,lineHeight:1.5 }}>{s}</li>)}
          </ul>
        </div>
      ))}

      <div style={{ background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.3)",borderRadius:12,padding:16,marginBottom:24 }}>
        <div style={{ fontSize:13,color:"#93c5fd",fontWeight:600,marginBottom:6 }}>💡 Already configured?</div>
        <div style={{ fontSize:13,color:"#64748b" }}>If you've already set up your Google Sheet and pasted the URL into the code, click below to go directly to the app.</div>
      </div>

      <button onClick={onConfigured} style={{ width:"100%",padding:"14px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#3b82f6,#6366f1)",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit" }}>
        Open Account Planner →
      </button>
    </div>
  </div>
);

/* ── MAIN APP ── */
export default function App() {
  const isConfigured = SHEET_URL !== "YOUR_APPS_SCRIPT_URL_HERE";
  const [showSetup, setShowSetup] = useState(!isConfigured);
  const [accounts, setAccounts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showStakeholderForm, setShowStakeholderForm] = useState(false);
  const [editingStakeholderIdx, setEditingStakeholderIdx] = useState(null);
  const [newStakeholder, setNewStakeholder] = useState({ name:"",title:"",role:"Economic Buyer",relationship:"❄️ Cold",email:"",linkedin:"",priorities:"",notes:"" });
  const [kanban, setKanban] = useState(false);
  const [currentRep, setCurrentRep] = useState("");
  const [repSet, setRepSet] = useState(false);
  const [filterRep, setFilterRep] = useState("All");
  const [filterStage, setFilterStage] = useState("All");

  const showToast = (msg, type="info") => {
    setToast({ msg, type });
    setTimeout(()=>setToast(null), 3000);
  };

  /* ── FETCH ALL ACCOUNTS ── */
  const fetchAccounts = useCallback(async () => {
    if (!isConfigured) return;
    setLoading(true);
    try {
      const res = await fetch(SHEET_URL);
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
      if (data.length > 0 && !activeId) setActiveId(data[0].id);
    } catch(e) {
      showToast("Could not load accounts from Google Sheets", "error");
    }
    setLoading(false);
  }, [isConfigured, activeId]);

  useEffect(() => { if (isConfigured && repSet) fetchAccounts(); }, [isConfigured, repSet]);

  /* ── AUTO-SAVE ── */
  const saveAccount = useCallback(async (acc) => {
    if (!isConfigured) return;
    setSaving(true);
    try {
      await fetch(SHEET_URL, {
        method:"POST",
        body: JSON.stringify({ action:"save", account:{ ...acc, updatedAt: new Date().toLocaleString() } }),
      });
      showToast("Saved to Google Sheets ✓", "success");
    } catch(e) {
      showToast("Save failed — check your connection", "error");
    }
    setSaving(false);
  }, [isConfigured]);

  const deleteAccountRemote = async (id) => {
    try {
      await fetch(SHEET_URL, { method:"POST", body: JSON.stringify({ action:"delete", id }) });
    } catch(e) {}
  };

  const account = accounts.find(a=>a.id===activeId);

  const updateAccount = (key, val) => {
    if (!account) return;
    const updated = { ...account, [key]:val };
    setAccounts(prev=>prev.map(a=>a.id===activeId?updated:a));
    clearTimeout(window._saveTimer);
    window._saveTimer = setTimeout(()=>saveAccount(updated), 1200);
  };

  const updateMeddic = (key, val) => {
    if (!account) return;
    const updated = { ...account, meddic:{ ...account.meddic, [key]:val } };
    setAccounts(prev=>prev.map(a=>a.id===activeId?updated:a));
    clearTimeout(window._saveTimer);
    window._saveTimer = setTimeout(()=>saveAccount(updated), 1200);
  };

  const updateMeddicNote = (key, val) => {
    if (!account) return;
    const updated = { ...account, meddicNotes:{ ...account.meddicNotes, [key]:val } };
    setAccounts(prev=>prev.map(a=>a.id===activeId?updated:a));
    clearTimeout(window._saveTimer);
    window._saveTimer = setTimeout(()=>saveAccount(updated), 1200);
  };

  const toggleWhiteSpace = (item) => {
    if (!account) return;
    updateAccount("whiteSpace", account.whiteSpace.includes(item)?account.whiteSpace.filter(x=>x!==item):[...account.whiteSpace,item]);
  };

  const addAccount = () => {
    const a = blankAccount(currentRep);
    setAccounts(prev=>[...prev,a]);
    setActiveId(a.id);
    setActiveSection(0);
    saveAccount(a);
  };

  const deleteAccount = async (id) => {
    if (accounts.length===1) { showToast("Can't delete the last account","error"); return; }
    const remaining = accounts.filter(a=>a.id!==id);
    setAccounts(remaining);
    if (activeId===id) setActiveId(remaining[0].id);
    await deleteAccountRemote(id);
    showToast("Account deleted","success");
  };

  const saveStakeholder = () => {
    if (!account) return;
    const updated = editingStakeholderIdx!==null
      ? account.stakeholders.map((s,i)=>i===editingStakeholderIdx?newStakeholder:s)
      : [...account.stakeholders, newStakeholder];
    updateAccount("stakeholders", updated);
    setShowStakeholderForm(false);
    setEditingStakeholderIdx(null);
    setNewStakeholder({ name:"",title:"",role:"Economic Buyer",relationship:"❄️ Cold",email:"",linkedin:"",priorities:"",notes:"" });
  };

  const meddicScore = account ? Math.round((Object.values(account.meddic).reduce((a,b)=>a+b,0)/(7*5))*100) : 0;
  const completeness = account ? [
    !!(account.name && account.industry),
    account.stakeholders.length>0,
    account.stakeholders.some(s=>s.role==="Champion"),
    account.stakeholders.some(s=>s.role==="Economic Buyer"),
    account.whiteSpace.length>0,
    Object.values(account.meddic).some(v=>v>0),
    !!account.goal,
    !!(account.plan30||account.plan60||account.plan90),
  ] : [];
  const completePct = completeness.length ? Math.round((completeness.filter(Boolean).length/completeness.length)*100) : 0;

  const filteredAccounts = accounts.filter(a=>
    (filterRep==="All" || a.rep===filterRep) &&
    (filterStage==="All" || a.stage===filterStage)
  );

  /* ── SETUP SCREEN ── */
  if (showSetup) return <SetupScreen onConfigured={()=>setShowSetup(false)} />;

  /* ── REP SELECTION ── */
  if (!repSet) return (
    <div style={{ minHeight:"100vh",background:"linear-gradient(135deg,#0f172a,#1e293b)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600;700&display=swap');`}</style>
      <Card style={{ width:380,textAlign:"center",padding:40 }}>
        <div style={{ fontSize:40,marginBottom:16 }}>👋</div>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:24,color:"#0f172a",margin:"0 0 8px" }}>Who are you?</h2>
        <p style={{ color:"#64748b",fontSize:14,marginBottom:24 }}>Select your name so your accounts are tracked correctly</p>
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:24 }}>
          {TEAM.map(name=>(
            <button key={name} onClick={()=>setCurrentRep(name)}
              style={{ padding:"10px 16px",borderRadius:8,border:`2px solid ${currentRep===name?"#1d4ed8":"#e2e8f0"}`,
                background:currentRep===name?"#eff6ff":"#fafafa",
                color:currentRep===name?"#1d4ed8":"#334155",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s" }}>
              {currentRep===name?"✓ ":""}{name}
            </button>
          ))}
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:12,color:"#64748b",marginBottom:6 }}>Or type your name:</div>
          <input value={currentRep} onChange={e=>setCurrentRep(e.target.value)} placeholder="Your name..."
            style={{ width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box" }}/>
        </div>
        <Btn onClick={()=>{ if(currentRep.trim()) setRepSet(true); }} disabled={!currentRep.trim()} style={{ width:"100%" }}>
          Enter Account Planner →
        </Btn>
      </Card>
    </div>
  );

  /* ── KANBAN ── */
  if (kanban) return (
    <div style={{ minHeight:"100vh",background:"#0f172a",fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ background:"#1e293b",padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,padding:"14px 0" }}>
          <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>📋</div>
          <span style={{ color:"#f8fafc",fontWeight:700,fontSize:15 }}>Pipeline View</span>
          <span style={{ background:"rgba(255,255,255,0.1)",color:"#94a3b8",fontSize:11,padding:"2px 8px",borderRadius:20 }}>👤 {currentRep}</span>
        </div>
        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <select value={filterRep} onChange={e=>setFilterRep(e.target.value)}
            style={{ padding:"6px 10px",borderRadius:8,border:"1px solid #334155",background:"#1e293b",color:"#94a3b8",fontSize:12,fontFamily:"inherit",outline:"none" }}>
            <option value="All">All Reps</option>
            {[...new Set(accounts.map(a=>a.rep).filter(Boolean))].map(r=><option key={r} value={r}>{r}</option>)}
          </select>
          <Btn onClick={addAccount} small>+ New Account</Btn>
          <Btn onClick={()=>setKanban(false)} variant="ghost" small>📋 Planner View</Btn>
        </div>
      </div>
      <div style={{ padding:"28px 24px",overflowX:"auto" }}>
        <div style={{ display:"flex",gap:16,minWidth:"max-content" }}>
          {STAGES.map(stage=>{
            const stageAccounts = filteredAccounts.filter(a=>a.stage===stage.id);
            const totalValue = stageAccounts.reduce((sum,a)=>{ const v=parseFloat((a.dealValue||"").replace(/[^0-9.]/g,""))||0; return sum+v; },0);
            return (
              <div key={stage.id} style={{ width:240,background:"#1e293b",borderRadius:12,overflow:"hidden" }}>
                <div style={{ padding:"12px 16px",borderBottom:`2px solid ${stage.color}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:"#f8fafc" }}>{stage.icon} {stage.label}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{stageAccounts.length} account{stageAccounts.length!==1?"s":""}{totalValue>0?` · $${totalValue.toLocaleString()}`:""}</div>
                  </div>
                </div>
                <div style={{ padding:10,display:"flex",flexDirection:"column",gap:8,minHeight:180 }}>
                  {stageAccounts.map(acc=>{
                    const ms = Math.round((Object.values(acc.meddic).reduce((a,b)=>a+b,0)/(7*5))*100);
                    return (
                      <div key={acc.id} onClick={()=>{ setActiveId(acc.id);setKanban(false);setActiveSection(0); }}
                        style={{ background:"#0f172a",borderRadius:10,padding:14,cursor:"pointer",border:"1px solid #334155",transition:"border 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.borderColor="#3b82f6"}
                        onMouseLeave={e=>e.currentTarget.style.borderColor="#334155"}>
                        <div style={{ fontWeight:700,color:"#f1f5f9",fontSize:14,marginBottom:2 }}>{acc.name||"Unnamed"}</div>
                        <div style={{ fontSize:11,color:"#64748b",marginBottom:6 }}>{acc.industry||"—"} {acc.rep?`· ${acc.rep}`:""}</div>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                          <div style={{ fontSize:11,color:"#64748b" }}>MEDDIC</div>
                          <div style={{ fontSize:12,fontWeight:700,color:ms>=70?"#22c55e":ms>=40?"#f59e0b":"#ef4444" }}>{ms}%</div>
                        </div>
                        <div style={{ height:4,background:"#1e293b",borderRadius:4,marginTop:4 }}>
                          <div style={{ height:4,borderRadius:4,width:`${ms}%`,background:ms>=70?"#22c55e":ms>=40?"#f59e0b":"#ef4444",transition:"width 0.3s" }}/>
                        </div>
                        {acc.dealValue&&<div style={{ fontSize:13,fontWeight:700,color:"#60a5fa",marginTop:8 }}>{acc.dealValue}</div>}
                        {acc.updatedAt&&<div style={{ fontSize:10,color:"#475569",marginTop:6 }}>Updated: {acc.updatedAt}</div>}
                      </div>
                    );
                  })}
                  {stageAccounts.length===0&&<div style={{ textAlign:"center",color:"#475569",fontSize:12,padding:"20px 0" }}>No accounts</div>}
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
    <div style={{ minHeight:"100vh",background:"linear-gradient(135deg,#f0f4ff 0%,#fafbff 60%,#f0faf5 100%)",fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box} textarea,input,select{font-family:inherit}
        ::-webkit-scrollbar{width:6px;height:6px} ::-webkit-scrollbar-track{background:#f1f5f9} ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px}
      `}</style>

      {/* TOP BAR */}
      <div style={{ background:"#0f172a",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 0" }}>
          <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#3b82f6,#6366f1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>📋</div>
          <div>
            <div style={{ fontSize:14,fontWeight:700,color:"#f8fafc" }}>Account Planner</div>
            <div style={{ fontSize:10,color:"#475569" }}>Indeed Enterprise · {currentRep}</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          {saving&&<span style={{ fontSize:12,color:"#60a5fa" }}>⏳ Saving…</span>}
          <Btn onClick={fetchAccounts} variant="ghost" small disabled={loading}>{loading?"⟳ Loading…":"⟳ Refresh"}</Btn>
          <Btn onClick={()=>setKanban(true)} variant="ghost" small>🗂 Pipeline</Btn>
          <Btn onClick={addAccount} small>+ New Account</Btn>
        </div>
      </div>

      {/* ACCOUNT TABS */}
      <div style={{ background:"#1e293b",padding:"0 24px",display:"flex",alignItems:"center",gap:0,overflowX:"auto" }}>
        {/* filters */}
        <select value={filterRep} onChange={e=>setFilterRep(e.target.value)}
          style={{ padding:"6px 10px",borderRadius:8,border:"1px solid #334155",background:"#0f172a",color:"#94a3b8",fontSize:11,fontFamily:"inherit",outline:"none",marginRight:8,flexShrink:0 }}>
          <option value="All">All Reps</option>
          {[...new Set(accounts.map(a=>a.rep).filter(Boolean))].map(r=><option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStage} onChange={e=>setFilterStage(e.target.value)}
          style={{ padding:"6px 10px",borderRadius:8,border:"1px solid #334155",background:"#0f172a",color:"#94a3b8",fontSize:11,fontFamily:"inherit",outline:"none",marginRight:12,flexShrink:0 }}>
          <option value="All">All Stages</option>
          {STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
        </select>
        {loading
          ? <div style={{ color:"#475569",fontSize:13,padding:"14px 0" }}>Loading accounts…</div>
          : filteredAccounts.length===0
            ? <div style={{ color:"#475569",fontSize:13,padding:"14px 0" }}>No accounts yet — click + New Account</div>
            : filteredAccounts.map(acc=>(
              <div key={acc.id} onClick={()=>{ setActiveId(acc.id);setActiveSection(0); }}
                style={{ display:"flex",alignItems:"center",gap:7,padding:"10px 14px",cursor:"pointer",
                  borderBottom:acc.id===activeId?"2.5px solid #3b82f6":"2.5px solid transparent",
                  background:acc.id===activeId?"rgba(59,130,246,0.1)":"transparent",transition:"all 0.15s",whiteSpace:"nowrap" }}>
                <span style={{ fontSize:12,fontWeight:600,color:acc.id===activeId?"#60a5fa":"#94a3b8" }}>{acc.name||"New Account"}</span>
                <StageBadge stageId={acc.stage}/>
                {acc.rep&&<span style={{ fontSize:10,color:"#475569" }}>{acc.rep}</span>}
                <button onClick={e=>{ e.stopPropagation();deleteAccount(acc.id); }}
                  style={{ background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:14,lineHeight:1,padding:"0 2px" }}>×</button>
              </div>
            ))
        }
      </div>

      {!account ? (
        <div style={{ textAlign:"center",padding:"80px 24px" }}>
          <div style={{ fontSize:48,marginBottom:16 }}>📋</div>
          <div style={{ fontSize:18,fontWeight:600,color:"#64748b" }}>No account selected</div>
          <div style={{ fontSize:14,color:"#94a3b8",marginTop:6,marginBottom:24 }}>Create your first account plan to get started</div>
          <Btn onClick={addAccount}>+ Create First Account</Btn>
        </div>
      ) : (
        <>
          {/* SECTION NAV */}
          <div style={{ background:"#fff",borderBottom:"1px solid #e8edf5",padding:"0 24px",display:"flex",alignItems:"center" }}>
            {SECTIONS.map((s,i)=>(
              <button key={s.id} onClick={()=>setActiveSection(i)} style={{ padding:"13px 18px",border:"none",background:"none",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",
                color:activeSection===i?"#1d4ed8":"#64748b",borderBottom:activeSection===i?"2.5px solid #1d4ed8":"2.5px solid transparent",transition:"all 0.15s",whiteSpace:"nowrap" }}>
                {s.icon} {s.label}
              </button>
            ))}
            <div style={{ marginLeft:"auto",display:"flex",alignItems:"center",gap:8,padding:"6px 0" }}>
              <span style={{ fontSize:12,color:"#64748b",fontWeight:600 }}>Stage:</span>
              <select value={account.stage} onChange={e=>updateAccount("stage",e.target.value)}
                style={{ padding:"5px 9px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:12,fontFamily:"inherit",background:"#fafafa",outline:"none",cursor:"pointer" }}>
                {STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
              </select>
              <input value={account.dealValue} onChange={e=>updateAccount("dealValue",e.target.value)} placeholder="💰 Deal value"
                style={{ padding:"5px 9px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:12,fontFamily:"inherit",background:"#fafafa",outline:"none",width:130 }}/>
            </div>
          </div>

          {/* PROGRESS */}
          <div style={{ background:"#fff",padding:"6px 24px 12px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ fontSize:11,color:"#94a3b8",whiteSpace:"nowrap" }}>Plan: <strong style={{ color:completePct>=80?"#16a34a":completePct>=50?"#d97706":"#dc2626" }}>{completePct}%</strong></div>
            <div style={{ flex:1,height:5,background:"#f1f5f9",borderRadius:4 }}>
              <div style={{ height:5,borderRadius:4,width:`${completePct}%`,background:completePct>=80?"#22c55e":completePct>=50?"#f59e0b":"#ef4444",transition:"width 0.4s" }}/>
            </div>
            {account.updatedAt&&<div style={{ fontSize:11,color:"#94a3b8",whiteSpace:"nowrap" }}>Last saved: {account.updatedAt} by {account.rep}</div>}
          </div>

          <div style={{ maxWidth:940,margin:"0 auto",padding:"26px 20px" }}>

            {/* OVERVIEW */}
            {activeSection===0&&(
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#0f172a",margin:"0 0 6px" }}>Account Overview</h2>
                <p style={{ color:"#64748b",fontSize:14,marginBottom:22 }}>Core facts about this account</p>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
                  <Card>
                    <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>Company Details</div>
                    <Field label="Company Name" value={account.name} onChange={v=>updateAccount("name",v)} placeholder="e.g. Acme Corp"/>
                    <Field label="Industry" value={account.industry} onChange={v=>updateAccount("industry",v)} placeholder="e.g. Technology, Healthcare"/>
                    <Field label="Company Size" value={account.size} onChange={v=>updateAccount("size",v)} placeholder="e.g. 5,000–10,000 employees"/>
                    <Field label="Annual Revenue" value={account.revenue} onChange={v=>updateAccount("revenue",v)} placeholder="e.g. $500M"/>
                    <Field label="HQ Location" value={account.location} onChange={v=>updateAccount("location",v)} placeholder="City, Country"/>
                    <Field label="Website" value={account.website} onChange={v=>updateAccount("website",v)} placeholder="https://..."/>
                  </Card>
                  <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
                    <Card>
                      <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>Hiring Intelligence</div>
                      <Field label="Monthly Hiring Volume" value={account.hiringVolume} onChange={v=>updateAccount("hiringVolume",v)} placeholder="e.g. 200 roles/month"/>
                      <Field label="Current ATS / HR Stack" value={account.currentATS} onChange={v=>updateAccount("currentATS",v)} placeholder="e.g. Workday + LinkedIn"/>
                      <Field label="Est. Competitor Spend" value={account.competitorSpend} onChange={v=>updateAccount("competitorSpend",v)} placeholder="e.g. $150K/year"/>
                      <Field label="Contract Renewal Date" value={account.renewalDate} onChange={v=>updateAccount("renewalDate",v)} placeholder="e.g. Q3 2025"/>
                      <Field label="Target Close Date" value={account.closeDate} onChange={v=>updateAccount("closeDate",v)} placeholder="e.g. Dec 2025"/>
                    </Card>
                    <Card>
                      <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12 }}>Strategic Notes</div>
                      <Field value={account.notes} onChange={v=>updateAccount("notes",v)} placeholder="Recent news, strategic priorities, pain points…" multiline/>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* STAKEHOLDERS */}
            {activeSection===1&&(
              <div>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
                  <div>
                    <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#0f172a",margin:"0 0 4px" }}>Stakeholder Map</h2>
                    <p style={{ color:"#64748b",fontSize:14,margin:0 }}>Build your buying committee</p>
                  </div>
                  <Btn onClick={()=>{ setShowStakeholderForm(true);setEditingStakeholderIdx(null);setNewStakeholder({ name:"",title:"",role:"Economic Buyer",relationship:"❄️ Cold",email:"",linkedin:"",priorities:"",notes:"" }); }}>+ Add Stakeholder</Btn>
                </div>
                {account.stakeholders.length===0&&!showStakeholderForm&&(
                  <Card style={{ textAlign:"center",padding:"40px 24px" }}>
                    <div style={{ fontSize:36,marginBottom:10 }}>👥</div>
                    <div style={{ fontSize:15,fontWeight:600,color:"#64748b" }}>No stakeholders yet</div>
                    <div style={{ fontSize:13,color:"#94a3b8",marginTop:4 }}>Map the buying committee to understand the deal</div>
                  </Card>
                )}
                {account.stakeholders.length>0&&(
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14,marginBottom:18 }}>
                    {account.stakeholders.map((s,i)=>(
                      <Card key={i}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                          <div style={{ background:REL_COLORS[s.relationship]||"#e2e8f0",borderRadius:8,padding:"3px 9px",fontSize:11,fontWeight:600 }}>{s.relationship}</div>
                          <div style={{ display:"flex",gap:5 }}>
                            <button onClick={()=>{ setNewStakeholder({...s});setEditingStakeholderIdx(i);setShowStakeholderForm(true); }} style={{ background:"#f1f5f9",border:"none",borderRadius:6,padding:"4px 7px",cursor:"pointer",fontSize:11 }}>✏️</button>
                            <button onClick={()=>updateAccount("stakeholders",account.stakeholders.filter((_,j)=>j!==i))} style={{ background:"#fee2e2",border:"none",borderRadius:6,padding:"4px 7px",cursor:"pointer",fontSize:11 }}>🗑️</button>
                          </div>
                        </div>
                        <div style={{ fontSize:24,marginBottom:4 }}>{ROLE_ICONS[s.role]||"👤"}</div>
                        <div style={{ fontSize:14,fontWeight:700,color:"#0f172a" }}>{s.name||"—"}</div>
                        <div style={{ fontSize:12,color:"#64748b",marginBottom:8 }}>{s.title}</div>
                        <span style={{ background:"#f1f5f9",borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600,color:"#334155" }}>{s.role}</span>
                        {s.priorities&&<p style={{ fontSize:12,color:"#475569",marginTop:9,marginBottom:3,lineHeight:1.5 }}>🎯 {s.priorities}</p>}
                        {s.email&&<div style={{ fontSize:11,color:"#94a3b8",marginTop:5 }}>✉️ {s.email}</div>}
                      </Card>
                    ))}
                  </div>
                )}
                {showStakeholderForm&&(
                  <Card style={{ border:"2px solid #3b82f6",marginTop:14 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:"#0f172a",marginBottom:16 }}>{editingStakeholderIdx!==null?"Edit Stakeholder":"New Stakeholder"}</div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px" }}>
                      <Field label="Full Name" value={newStakeholder.name} onChange={v=>setNewStakeholder(s=>({...s,name:v}))} placeholder="Jane Smith"/>
                      <Field label="Job Title" value={newStakeholder.title} onChange={v=>setNewStakeholder(s=>({...s,title:v}))} placeholder="CHRO"/>
                      <Sel label="Role in Deal" value={newStakeholder.role} onChange={v=>setNewStakeholder(s=>({...s,role:v}))} options={ROLES}/>
                      <Sel label="Relationship" value={newStakeholder.relationship} onChange={v=>setNewStakeholder(s=>({...s,relationship:v}))} options={RELATIONSHIP}/>
                      <Field label="Email" value={newStakeholder.email} onChange={v=>setNewStakeholder(s=>({...s,email:v}))} placeholder="jane@company.com"/>
                      <Field label="LinkedIn" value={newStakeholder.linkedin} onChange={v=>setNewStakeholder(s=>({...s,linkedin:v}))} placeholder="linkedin.com/in/..."/>
                    </div>
                    <Field label="Priorities / KPIs" value={newStakeholder.priorities} onChange={v=>setNewStakeholder(s=>({...s,priorities:v}))} placeholder="e.g. Reduce time-to-hire, improve diversity…"/>
                    <Field label="Notes" value={newStakeholder.notes} onChange={v=>setNewStakeholder(s=>({...s,notes:v}))} placeholder="Communication style, concerns, last touchpoint…" multiline/>
                    <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
                      <Btn onClick={()=>setShowStakeholderForm(false)} variant="ghost">Cancel</Btn>
                      <Btn onClick={saveStakeholder}>Save Stakeholder</Btn>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* OPPORTUNITY */}
            {activeSection===2&&(
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#0f172a",margin:"0 0 6px" }}>Opportunity Analysis</h2>
                <p style={{ color:"#64748b",fontSize:14,marginBottom:22 }}>Identify white space and qualify with MEDDIC</p>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>
                  <Card>
                    <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>Current Indeed Usage</div>
                    <Field value={account.indeedUsage} onChange={v=>updateAccount("indeedUsage",v)} placeholder="e.g. $80K Sponsored Jobs, no Resume access…" multiline/>
                  </Card>
                  <Card>
                    <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>White Space — Untapped Products</div>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                      {WHITESPACE.map(item=>(
                        <button key={item} onClick={()=>toggleWhiteSpace(item)} style={{ padding:"6px 13px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:"2px solid",transition:"all 0.15s",
                          borderColor:account.whiteSpace.includes(item)?"#1d4ed8":"#e2e8f0",
                          background:account.whiteSpace.includes(item)?"#eff6ff":"#fafafa",
                          color:account.whiteSpace.includes(item)?"#1d4ed8":"#64748b" }}>
                          {account.whiteSpace.includes(item)?"✓ ":""}{item}
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>
                <Card>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                    <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em" }}>MEDDIC Qualification</div>
                    <div style={{ fontSize:14,fontWeight:700,color:meddicScore>=70?"#16a34a":meddicScore>=40?"#d97706":"#dc2626" }}>{meddicScore}% qualified</div>
                  </div>
                  {MEDDIC.map(({key,label,desc})=>(
                    <div key={key} style={{ display:"grid",gridTemplateColumns:"150px 1fr 130px",gap:12,alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f1f5f9" }}>
                      <div>
                        <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{label}</div>
                        <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{desc}</div>
                      </div>
                      <input value={account.meddicNotes[key]||""} onChange={e=>updateMeddicNote(key,e.target.value)} placeholder="Notes…"
                        style={{ padding:"7px 10px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:12,fontFamily:"inherit",outline:"none",background:"#fafafa",width:"100%" }}/>
                      <ScoreDots value={account.meddic[key]} onChange={v=>updateMeddic(key,v)}/>
                    </div>
                  ))}
                </Card>
              </div>
            )}

            {/* STRATEGY */}
            {activeSection===3&&(
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#0f172a",margin:"0 0 6px" }}>Account Strategy</h2>
                <p style={{ color:"#64748b",fontSize:14,marginBottom:22 }}>Define your playbook and execution plan</p>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20 }}>
                  <Card>
                    <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>Account Goal</div>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginBottom:16 }}>
                      {["🌱 Land & Expand","🔒 Protect & Retain","📈 Grow Revenue","🚀 Strategic Close"].map(g=>(
                        <button key={g} onClick={()=>updateAccount("goal",g)} style={{ padding:"7px 13px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",border:"2px solid",transition:"all 0.15s",
                          borderColor:account.goal===g?"#1d4ed8":"#e2e8f0",
                          background:account.goal===g?"#eff6ff":"#fafafa",
                          color:account.goal===g?"#1d4ed8":"#64748b" }}>{g}</button>
                      ))}
                    </div>
                    <Field label="Executive Sponsor" value={account.execSponsor} onChange={v=>updateAccount("execSponsor",v)} placeholder="Internal exec sponsoring this account"/>
                  </Card>
                  <Card>
                    <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>⚠️ Risks & Mitigation</div>
                    <Field value={account.risks} onChange={v=>updateAccount("risks",v)} placeholder="Key deal risks and how you plan to mitigate them…" multiline/>
                  </Card>
                </div>
                <Card>
                  <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16 }}>30 / 60 / 90 Day Action Plan</div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
                    {[["30 Days","plan30","#dbeafe","#1d4ed8"],["60 Days","plan60","#dcfce7","#16a34a"],["90 Days","plan90","#fef9c3","#ca8a04"]].map(([label,key,bg,color])=>(
                      <div key={key} style={{ background:bg,borderRadius:10,padding:14 }}>
                        <div style={{ fontSize:13,fontWeight:700,color,marginBottom:8 }}>⏱ {label}</div>
                        <textarea value={account[key]} onChange={e=>updateAccount(key,e.target.value)} placeholder={`Actions for ${label.toLowerCase()}…`} rows={5}
                          style={{ width:"100%",border:"none",background:"rgba(255,255,255,0.6)",borderRadius:8,padding:10,fontSize:12,fontFamily:"inherit",resize:"vertical",outline:"none",boxSizing:"border-box",color:"#1e293b" }}/>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* SCORE */}
            {activeSection===4&&(
              <div>
                <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#0f172a",margin:"0 0 6px" }}>Account Score</h2>
                <p style={{ color:"#64748b",fontSize:14,marginBottom:22 }}>Health and readiness of this account plan</p>
                <Card style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>Deal Stage Pipeline</div>
                  <div style={{ display:"flex",gap:0 }}>
                    {STAGES.map((s,i)=>{
                      const isActive=account.stage===s.id;
                      const isPast=STAGES.findIndex(x=>x.id===account.stage)>i;
                      return (
                        <button key={s.id} onClick={()=>updateAccount("stage",s.id)}
                          style={{ flex:1,padding:"9px 4px",border:"none",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",
                            background:isActive?s.color:isPast?"#e2e8f0":"#f8fafc",
                            color:isActive?"#fff":isPast?"#94a3b8":"#64748b",fontWeight:isActive?700:500,fontSize:10,
                            borderRadius:i===0?"8px 0 0 8px":i===STAGES.length-1?"0 8px 8px 0":"0",
                            borderRight:i<STAGES.length-1?"1px solid #e2e8f0":"none" }}>
                          <div style={{ fontSize:14 }}>{s.icon}</div>
                          <div style={{ marginTop:2 }}>{s.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
                  <Card style={{ textAlign:"center",padding:"32px 24px" }}>
                    <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>MEDDIC Score</div>
                    <div style={{ position:"relative",width:140,height:140,margin:"0 auto 16px" }}>
                      <svg width="140" height="140" style={{ transform:"rotate(-90deg)" }}>
                        <circle cx="70" cy="70" r="55" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
                        <circle cx="70" cy="70" r="55" fill="none"
                          stroke={meddicScore>=70?"#22c55e":meddicScore>=40?"#f59e0b":"#ef4444"}
                          strokeWidth="10" strokeDasharray={`${2*Math.PI*55}`}
                          strokeDashoffset={`${2*Math.PI*55*(1-meddicScore/100)}`}
                          strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.6s" }}/>
                      </svg>
                      <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center" }}>
                        <div style={{ fontSize:30,fontWeight:800,color:"#0f172a" }}>{meddicScore}%</div>
                        <div style={{ fontSize:10,color:"#94a3b8" }}>qualified</div>
                      </div>
                    </div>
                    <div style={{ fontSize:13,color:"#64748b" }}>{meddicScore>=80?"🟢 Well-qualified":meddicScore>=50?"🟡 Keep qualifying":"🔴 Early stage"}</div>
                  </Card>
                  <Card>
                    <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:13 }}>Plan Completeness</div>
                    {[["Account Overview",completeness[0]],["Stakeholders Added",completeness[1]],["Champion Identified",completeness[2]],
                      ["Economic Buyer Mapped",completeness[3]],["White Space Tagged",completeness[4]],["MEDDIC Scored",completeness[5]],
                      ["Account Goal Set",completeness[6]],["90-Day Plan Written",completeness[7]]
                    ].map(([label,done])=>(
                      <div key={label} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f8fafc" }}>
                        <span style={{ fontSize:13,color:"#334155" }}>{label}</span>
                        <span style={{ fontSize:15 }}>{done?"✅":"⬜"}</span>
                      </div>
                    ))}
                  </Card>
                  <Card style={{ gridColumn:"span 2" }}>
                    <div style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>MEDDIC Breakdown</div>
                    <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:12 }}>
                      {MEDDIC.map(({key,label})=>(
                        <div key={key} style={{ textAlign:"center" }}>
                          <div style={{ height:75,display:"flex",alignItems:"flex-end",justifyContent:"center",marginBottom:7 }}>
                            <div style={{ width:24,borderRadius:6,height:`${Math.max((account.meddic[key]/5)*75,4)}px`,
                              background:account.meddic[key]>=4?"#22c55e":account.meddic[key]>=2?"#f59e0b":"#e2e8f0",minHeight:4,transition:"height 0.4s" }}/>
                          </div>
                          <div style={{ fontSize:10,fontWeight:700,color:"#64748b" }}>{label.split(" ")[0]}</div>
                          <div style={{ fontSize:12,fontWeight:700,color:"#0f172a",marginTop:2 }}>{account.meddic[key]}/5</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Bottom nav */}
            <div style={{ display:"flex",justifyContent:"space-between",marginTop:30,paddingTop:16,borderTop:"1px solid #e8edf5" }}>
              <Btn onClick={()=>setActiveSection(a=>Math.max(0,a-1))} variant="ghost" disabled={activeSection===0}>← Previous</Btn>
              <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                {SECTIONS.map((_,i)=>(
                  <div key={i} onClick={()=>setActiveSection(i)} style={{ width:7,height:7,borderRadius:"50%",cursor:"pointer",background:activeSection===i?"#1d4ed8":"#e2e8f0",transition:"all 0.2s" }}/>
                ))}
              </div>
              <Btn onClick={()=>setActiveSection(a=>Math.min(SECTIONS.length-1,a+1))} disabled={activeSection===SECTIONS.length-1}>Next →</Btn>
            </div>
          </div>
        </>
      )}

      {toast&&<Toast msg={toast.msg} type={toast.type}/>}
    </div>
  );
}
