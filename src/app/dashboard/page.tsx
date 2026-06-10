const todayDate = new Date().toLocaleDateString('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export default function Dashboard() {
  return (
    <>
      <div className="dashboard-root">
        <header>
          <div>
            <div className="h-title">Client Tracker</div>
            <div className="h-date">{todayDate}</div>
          </div>
          <div className="h-right">
            <span id="save-ind">✓ Saved</span>
            <button className="btn btn-undo" disabled>↩ Undo</button>
            <button className="btn btn-ghost" type="button">⬇ Export</button>
            <button className="btn btn-green" type="button">+ Add client</button>
          </div>
        </header>

        <div className="stats-bar">
          <div className="stat">
            <div className="stat-num sn-blue">12</div>
            <div>
              <div className="stat-lbl">Active clients</div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-num sn-red">3</div>
            <div>
              <div className="stat-lbl">Missed curfew</div>
            </div>
          </div>
          <div className="stat">
            <div className="stat-num sn-gray">5</div>
            <div>
              <div className="stat-lbl">Non-active</div>
            </div>
          </div>
        </div>

        <div className="top-bar">
          <div className="view-toggle">
            <button className="vt-btn active" type="button">Simple</button>
            <button className="vt-btn" type="button">Detail</button>
          </div>
          <div className="divider" />
          <button className="res-hub-btn" type="button">☸ Resources</button>
        </div>

        <div className="toolbar">
          <input className="tb-search" type="text" placeholder="Search client or CARES ID…" />
          <select className="tb-select">
            <option value="">All clients</option>
            <option value="missing-psych">Missing Psychosocial</option>
            <option value="missing-eval">Missing Psych Eval</option>
          </select>
          <select className="tb-select">
            <option value="alpha">A → Z</option>
            <option value="ilp">ILP due soonest</option>
          </select>
          <span className="count-tag">20 results</span>
        </div>

        <div className="sec-label">
          <span>Active clients</span>
          <span className="sec-count">12</span>
        </div>
        <div className="simple-table">
          <div className="simple-row flag-none">
            <div>
              <div className="simple-name">Amena Rivera</div>
              <div className="simple-meta">CARES 9102 • Mindful living</div>
            </div>
            <div className="simple-pills">
              <span className="spill sp-done">Psych Eval</span>
              <span className="spill sp-prog">PA Open</span>
            </div>
            <div className="simple-meta">Next ILP: 7/18/26</div>
          </div>
          <div className="simple-row flag-yellow">
            <div>
              <div className="simple-name">Bobby Chen</div>
              <div className="simple-meta">CARES 8741 • Intake pending</div>
            </div>
            <div className="simple-pills">
              <span className="spill sp-no">Consent</span>
              <span className="spill sp-sched">Psych Appt</span>
            </div>
            <div className="simple-meta">ILP due: 6/30/26</div>
          </div>
        </div>

        <div className="sec-label" style={{ marginTop: 4 }}>
          <span>Missed Curfew</span>
          <span className="sec-count">3</span>
        </div>
        <div className="simple-table">
          <div className="simple-row flag-red">
            <div>
              <div className="simple-name">Carlos Mendez</div>
              <div className="simple-meta">CARES 8019 • Urgent follow-up</div>
            </div>
            <div className="simple-pills">
              <span className="spill sp-no">No-show</span>
              <span className="spill sp-prog">Barriers</span>
            </div>
            <div className="simple-meta">Last contact: 6/4/26</div>
          </div>
        </div>

        <div className="sec-label" style={{ marginTop: 4 }}>
          <span>Non-active</span>
          <span className="sec-count">5</span>
        </div>
        <div className="simple-table">
          <div className="simple-row flag-mc">
            <div>
              <div className="simple-name">Dana Patel</div>
              <div className="simple-meta">CARES 7720 • Re-engage</div>
            </div>
            <div className="simple-pills">
              <span className="spill sp-na">Inactive</span>
            </div>
            <div className="simple-meta">Next review: 7/10/26</div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --bg:#f0ede8;--card:#faf9f6;--border:#e8e4de;--accent:#3b7ef6;
          --text:#1a1917;--muted:#9b9890;--subtle:#6b6860;
          --sans:'Inter',sans-serif;--name-font:'Inter',sans-serif;--mono:'DM Mono',monospace;
          --green:#15803d;--red:#b91c1c;--yellow:#92400e;--purple:#6d28d9;--blue:#1d4ed8;
        }
        *{box-sizing:border-box;margin:0;padding:0;}
        .dashboard-root{background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh;padding:24px 28px;}
        header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px;}
        .h-title{font-family:var(--name-font);font-size:1.25rem;font-weight:600;letter-spacing:-0.02em;}
        .h-date{font-size:0.68rem;color:var(--muted);font-family:var(--mono);margin-top:2px;}
        .h-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .btn{font-family:var(--sans);font-size:0.76rem;font-weight:600;border-radius:8px;padding:7px 14px;cursor:pointer;border:none;transition:opacity 0.15s;}
        .btn:hover{opacity:0.82;}
        .btn-green{background:#15803d;color:#fff;}
        .btn-ghost{background:var(--card);border:1px solid var(--border);color:var(--subtle);}
        .btn-undo{background:var(--card);border:1px solid var(--border);color:var(--subtle);opacity:0.4;cursor:not-allowed;}
        #save-ind{font-size:0.67rem;font-family:var(--mono);color:var(--green);opacity:1;transition:opacity 0.4s;}
        .stats-bar{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;}
        .stat{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 16px;display:flex;align-items:center;gap:10px;}
        .stat-num{font-size:1.5rem;font-weight:300;font-family:var(--mono);line-height:1;}
        .stat-lbl{font-size:0.6rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted);margin-top:1px;}
        .sn-blue{color:var(--accent);}
        .sn-red{color:#dc2626;}
        .sn-gray{color:var(--muted);}
        .top-bar{display:flex;align-items:center;gap:8px;margin-bottom:18px;flex-wrap:wrap;}
        .view-toggle{display:flex;gap:4px;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:3px;}
        .vt-btn{font-size:0.75rem;font-weight:600;padding:6px 14px;border-radius:7px;border:none;cursor:pointer;background:transparent;color:var(--subtle);font-family:var(--sans);transition:all 0.15s;}
        .vt-btn.active{background:var(--text);color:#fff;}
        .divider{width:1px;height:20px;background:var(--border);}
        .res-hub-btn{font-size:0.76rem;font-weight:600;padding:6px 13px;border-radius:8px;background:#EAF3DE;color:#15803d;border:1px solid #86efac;cursor:pointer;font-family:var(--sans);}
        .toolbar{display:flex;gap:8px;align-items:center;margin-bottom:18px;flex-wrap:wrap;}
        .tb-search{background:var(--card);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:7px 13px;font-family:var(--sans);font-size:0.8rem;outline:none;width:220px;}
        .tb-search::placeholder{color:var(--muted);}
        .tb-search:focus{border-color:var(--accent);}
        .tb-select{background:var(--card);border:1px solid var(--border);color:var(--subtle);border-radius:8px;padding:7px 11px;font-family:var(--sans);font-size:0.76rem;cursor:pointer;outline:none;}
        .count-tag{font-size:0.7rem;color:var(--muted);font-family:var(--mono);margin-left:auto;}
        .sec-label{font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.09em;color:var(--muted);margin-bottom:10px;display:flex;align-items:center;gap:7px;}
        .sec-count{background:var(--border);border-radius:999px;padding:1px 7px;font-family:var(--mono);font-size:0.65rem;}
        .simple-table{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:24px;}
        .simple-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #f3f4f6;cursor:pointer;border-left:3px solid transparent;transition:background 0.1s;}
        .simple-row:hover{background:#f8faff;}
        .simple-row.flag-red{border-left-color:#ef4444;background:#fff8f8;}
        .simple-row.flag-yellow{border-left-color:#f59e0b;background:#fffdf5;}
        .simple-row.flag-mc{opacity:0.5;}
        .simple-row.flag-red:hover{background:#fff3f3;}
        .simple-row.flag-yellow:hover{background:#fffbeb;}
        .simple-name{font-family:var(--name-font);font-weight:800;font-size:0.82rem;color:var(--text);}
        .simple-meta{font-size:0.63rem;color:var(--muted);font-family:var(--mono);display:block;margin-top:1px;}
        .simple-pills{display:flex;gap:4px;flex-wrap:wrap;flex:1;}
        .spill{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:999px;font-size:0.63rem;font-weight:600;white-space:nowrap;}
        .sp-done{background:#dcfce7;color:#15803d;border:1px solid #86efac;}
        .sp-no{background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;}
        .sp-prog{background:#ede9fe;color:#6d28d9;border:1px solid #c4b5fd;}
        .sp-na{background:#f3f4f6;color:#9ca3af;border:1px solid #e5e7eb;}
        .sp-sched{background:#dbeafe;color:#1d4ed8;border:1px solid #93c5fd;}
      `}</style>
    </>
  )
}
