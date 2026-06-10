'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  name: string
  cares_id: string
  active: boolean
  mc: boolean
  flag: string
  last_ilp: string
  eval: string
  psych: string
  consent: string
  pa: string
  voucher: string
  housing: string
  referrals: string
  psych_conditions: string
  med_conditions: string
  notes: string
  barriers: string
  todo: string
  psych_date: string
  psych_attended: string
  phys_date: string
  phys_attended: string
  updated_at: string
}

const EVAL_OPTS = ['no','yes','scheduled','na','noncompliant']
const PSYCH_OPTS = ['no','started','yes','pending','na']
const CONSENT_OPTS = ['no','yes','refused','na']
const PA_OPTS = ['no','yes','applying','na']
const ATT_OPTS = ['pending','yes','noshow','na']
const LABELS: Record<string,string> = {
  yes:'Yes ✓',no:'No',started:'Started',pending:'Pending',na:'N/A',
  scheduled:'Scheduled',noncompliant:'Noncompliant',refused:'Refused',
  applying:'Applying',noshow:'No show'
}

function ilpColor(ilp: string) {
  if(!ilp||ilp==='INTAKE') return '#9b9890'
  const m=ilp.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/)
  if(!m) return '#9b9890'
  let yr=parseInt(m[3]); if(yr<100) yr+=2000
  const d=new Date(yr,parseInt(m[1])-1,parseInt(m[2]))
  const diff=(Date.now()-d.getTime())/864e5
  if(diff>14) return '#dc2626'
  if(diff>7) return '#d97706'
  return '#16a34a'
}

function progress(c: Client) {
  const na=['n/a','N/A','N','','no','No']
  const checks=[
    {v:c.eval,skip:c.eval==='na'},
    {v:c.psych,skip:c.psych==='na'},
    {v:c.consent,skip:c.consent==='na'},
    {v:c.pa,skip:c.pa==='na'},
    {v:na.includes(c.voucher)?'no':'yes',skip:false},
    {v:na.includes(c.housing)?'no':'yes',skip:false},
  ]
  let done=0,total=0
  checks.forEach(({v,skip})=>{if(!skip){total++;if(v==='yes')done++}})
  const pct=total>0?Math.round((done/total)*100):0
  const color=pct>=80?'#16a34a':pct>=40?'#d97706':'#dc2626'
  return {pct,color}
}

export default function Dashboard() {
  const router=useRouter()
  const [clients,setClients]=useState<Client[]>([])
  const [selected,setSelected]=useState<Client|null>(null)
  const [tab,setTab]=useState('overview')
  const [search,setSearch]=useState('')
  const [filter,setFilter]=useState('')
  const [sort,setSort]=useState('alpha')
  const [saved,setSaved]=useState(false)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{fetchClients()},[])

  async function fetchClients() {
    const {data,error}=await supabase.from('clients').select('*').order('name')
    if(error) console.error(error)
    else setClients(data||[])
    setLoading(false)
  }

  async function updateClient(id:string,field:string,value:string|boolean) {
    const {error}=await supabase.from('clients').update({[field]:value,updated_at:new Date().toLocaleDateString('en-US',{month:'numeric',day:'numeric',year:'2-digit'})}).eq('id',id)
    if(!error){
      setClients(prev=>prev.map(c=>c.id===id?{...c,[field]:value}:c))
      setSelected(prev=>prev?.id===id?{...prev,[field]:value} as Client:prev)
      setSaved(true)
      setTimeout(()=>setSaved(false),1600)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const na=['n/a','N/A','N','','no','No']

  function getFiltered() {
    return clients.filter(c=>{
      if(search&&!c.name.toLowerCase().includes(search.toLowerCase())&&!c.cares_id?.includes(search)) return false
      if(filter==='missing-psych'&&!['no','started',''].includes(c.psych||'')) return false
      if(filter==='missing-eval'&&!['no','scheduled','noncompliant',''].includes(c.eval||'')) return false
      if(filter==='no-pa'&&!['no',''].includes(c.pa||'')) return false
      if(filter==='no-consent'&&!['no','refused',''].includes(c.consent||'')) return false
      if(filter==='no-voucher'&&!na.includes(c.voucher||'')) return false
      if(filter==='has-todo'&&!c.todo?.trim()) return false
      if(filter==='red'&&c.flag!=='red') return false
      if(filter==='yellow'&&c.flag!=='yellow') return false
      return true
    }).sort((a,b)=>{
      if(sort==='progress-asc') return progress(a).pct-progress(b).pct
      if(sort==='progress-desc') return progress(b).pct-progress(a).pct
      return a.name.localeCompare(b.name)
    })
  }

  const filtered=getFiltered()
  const regular=filtered.filter(c=>c.active&&!c.mc&&c.last_ilp!=='INTAKE')
  const mc=filtered.filter(c=>c.active&&c.mc)
  const intakes=filtered.filter(c=>c.active&&!c.mc&&c.last_ilp==='INTAKE')
  const inactive=filtered.filter(c=>!c.active)

  function dotColor(c:Client) {
    if(c.mc) return '#d1d5db'
    if(c.last_ilp==='INTAKE') return '#3b82f6'
    const {pct}=progress(c)
    if(c.flag==='red') return '#dc2626'
    if(pct>=70) return '#16a34a'
    if(pct>=35) return '#d97706'
    return '#dc2626'
  }

  function valColor(val:string) {
    if(val==='yes') return '#16a34a'
    if(['no','noncompliant','refused'].includes(val)) return '#dc2626'
    if(['started','pending','applying','scheduled'].includes(val)) return '#7c3aed'
    return '#9b9890'
  }

  const inp:React.CSSProperties={background:'#f5f2ee',border:'1px solid #e8e4de',borderRadius:7,padding:'6px 9px',fontSize:12,color:'#1a1917',outline:'none',fontFamily:'Inter,sans-serif',width:'100%'}

  function Section({label,list}:{label:string,list:Client[]}) {
    if(!list.length) return null
    return <>
      <div style={{fontSize:9,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.12em',color:'#c4bfb8',padding:'10px 16px 4px'}}>{label} · {list.length}</div>
      {list.map(c=>(
        <div key={c.id}
          onClick={()=>{setSelected(c);setTab('overview')}}
          style={{display:'flex',alignItems:'center',gap:8,padding:'9px 16px',borderBottom:'1px solid #f5f2ee',cursor:'pointer',background:selected?.id===c.id?'#ede9e3':'transparent'}}>
          <div style={{width:7,height:7,borderRadius:'50%',background:dotColor(c),flexShrink:0}}/>
          <div style={{fontSize:12,fontWeight:500,color:c.mc?'#9b9890':'#1a1917',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
          {c.last_ilp&&c.last_ilp!=='INTAKE'&&<div style={{fontSize:10,fontFamily:'DM Mono,monospace',color:ilpColor(c.last_ilp),flexShrink:0}}>{c.last_ilp}</div>}
          {c.last_ilp==='INTAKE'&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:4,fontWeight:600,background:'#dbeafe',color:'#1d4ed8'}}>New</span>}
          {c.mc&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:4,fontWeight:600,background:'#f3f4f6',color:'#9ca3af'}}>M/C</span>}
        </div>
      ))}
    </>
  }

  return (
    <div style={{minHeight:'100vh',background:'#f0ede8',fontFamily:'Inter,sans-serif',color:'#1a1917',display:'flex',flexDirection:'column'}}>

      {/* HEADER */}
      <div style={{background:'#faf9f6',borderBottom:'1px solid #e8e4de',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{fontSize:15,fontWeight:600}}>Case Tracker</div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{fontSize:11,color:'#9b9890',fontFamily:'DM Mono,monospace'}}>{new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
          <button onClick={signOut} style={{background:'#faf9f6',border:'1px solid #e8e4de',borderRadius:8,padding:'6px 12px',fontSize:12,color:'#6b6860',cursor:'pointer',fontFamily:'Inter,sans-serif'}}>Sign out</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{display:'flex',gap:10,padding:'14px 24px',flexShrink:0,flexWrap:'wrap'}}>
        {[
          {num:clients.filter(c=>c.active&&!c.mc).length,lbl:'Active',color:'#3b82f6'},
          {num:clients.filter(c=>c.mc).length,lbl:'Missed Curfew',color:'#dc2626'},
          {num:clients.filter(c=>!c.active).length,lbl:'Non-Active',color:'#9b9890'},
        ].map(({num,lbl,color})=>(
          <div key={lbl} style={{background:'#faf9f6',border:'1px solid #e8e4de',borderRadius:10,padding:'10px 16px'}}>
            <div style={{fontSize:22,fontWeight:300,color,fontFamily:'DM Mono,monospace'}}>{num}</div>
            <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'0.08em',color:'#c4bfb8',marginTop:2}}>{lbl}</div>
          </div>
        ))}
      </div> 

      {/* TOOLBAR */}
      <div style={{padding:'0 24px 14px',display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',flexShrink:0}}>
        <input style={{...inp,width:200}} placeholder="Search client or CARES ID…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={{background:'#faf9f6',border:'1px solid #e8e4de',borderRadius:8,padding:'6px 10px',fontSize:12,color:'#6b6860',outline:'none',fontFamily:'Inter,sans-serif',cursor:'pointer'}} value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">All clients</option>
          <option value="missing-psych">Missing Psychosocial</option>
          <option value="missing-eval">Missing Psych Eval</option>
          <option value="no-pa">No PA Open</option>
          <option value="no-consent">No Consent</option>
          <option value="no-voucher">No Voucher</option>
          <option value="has-todo">Has Action Step</option>
          <option value="red">🔴 Urgent</option>
          <option value="yellow">🟡 Follow up</option>
        </select>
        <select style={{background:'#faf9f6',border:'1px solid #e8e4de',borderRadius:8,padding:'6px 10px',fontSize:12,color:'#6b6860',outline:'none',fontFamily:'Inter,sans-serif',cursor:'pointer'}} value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="alpha">A → Z</option>
          <option value="progress-asc">Needs most work first</option>
          <option value="progress-desc">Almost done first</option>
        </select>
        <div style={{marginLeft:'auto',fontSize:11,color:'#9b9890',fontFamily:'DM Mono,monospace'}}>{filtered.length} shown</div>
      </div>

      {/* MAIN */}
      <div style={{display:'flex',flex:1,overflow:'hidden'}}>

        {/* LIST */}
        <div style={{width:320,flexShrink:0,borderRight:'1px solid #e8e4de',overflowY:'auto',background:'#faf9f6'}}>
          {loading&&<div style={{padding:20,color:'#9b9890',fontSize:12}}>Loading clients…</div>}
          <Section label="Active Clients" list={regular}/>
          <div style={{opacity:0.6}}><Section label="Missed Curfew" list={mc}/></div>
          <Section label="New Intakes" list={intakes}/>
          <div style={{opacity:0.5}}><Section label="Non-Active" list={inactive}/></div>
        </div>

        {/* PANEL */}
        <div style={{flex:1,overflowY:'auto',padding:24,display:'flex',justifyContent:'center'}}>
          {!selected?(
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8,color:'#c4bfb8',flex:1}}>
              <div style={{fontSize:24}}>👈</div>
              <div style={{fontSize:13}}>Select a client to view details</div>
            </div>
          ):(
            <div style={{background:'#fff',borderRadius:16,width:'100%',maxWidth:540,boxShadow:'0 4px 20px rgba(0,0,0,0.06)',overflow:'hidden',alignSelf:'flex-start'}}>

              {/* HEAD */}
              <div style={{padding:'18px 20px 12px',borderBottom:'1px solid #f5f2ee'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:34,height:34,borderRadius:'50%',background:'#e8e4de',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,color:'#6b6860',flexShrink:0}}>
                      {(selected.name.split(',')[0]?.trim()[0]||'')+(selected.name.split(',')[1]?.trim()[0]||'')}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600}}>{selected.name}</div>
                      <div style={{fontSize:10,color:'#9b9890',fontFamily:'DM Mono,monospace',marginTop:1}}>
                        {selected.cares_id||'No CARES ID'} · Last ILP: <span style={{color:ilpColor(selected.last_ilp)}}>{selected.last_ilp||'—'}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={()=>setSelected(null)} style={{background:'transparent',border:'none',fontSize:18,color:'#c4bfb8',cursor:'pointer'}}>✕</button>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{flex:1,height:3,background:'#e8e4de',borderRadius:99,overflow:'hidden'}}>
                    <div style={{width:`${progress(selected).pct}%`,height:'100%',background:progress(selected).color,borderRadius:99}}/>
                  </div>
                  <div style={{fontSize:10,fontFamily:'DM Mono,monospace',color:progress(selected).color,width:28,textAlign:'right'}}>{progress(selected).pct}%</div>
                </div>
              </div>

              {/* TABS */}
              <div style={{display:'flex',borderBottom:'1px solid #f5f2ee',padding:'0 20px'}}>
                {['overview','checklist'].map(t=>(
                  <button key={t} onClick={()=>setTab(t)} style={{fontSize:11,fontWeight:500,padding:'9px 10px',borderBottom:tab===t?'2px solid #1a1917':'2px solid transparent',color:tab===t?'#1a1917':'#9b9890',cursor:'pointer',background:'none',fontFamily:'Inter,sans-serif'}}>
                    {t==='overview'?'Overview':'Client Checklist'}
                  </button>
                ))}
              </div>

              {/* OVERVIEW */}
              {tab==='overview'&&(
                <div style={{padding:'18px 20px',display:'flex',flexDirection:'column',gap:12}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                    {[
                      {lbl:'Psych Eval',field:'eval',opts:EVAL_OPTS},
                      {lbl:'Psychosocial',field:'psych',opts:PSYCH_OPTS},
                      {lbl:'Consent',field:'consent',opts:CONSENT_OPTS},
                      {lbl:'PA Open',field:'pa',opts:PA_OPTS},
                    ].map(({lbl,field,opts})=>(
                      <div key={String(field)} style={{background:'#f5f2ee',borderRadius:8,padding:'8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <span style={{fontSize:11,color:'#9b9890'}}>{lbl}</span>
                        <select style={{background:'transparent',border:'none',fontSize:11,fontWeight:600,fontFamily:'Inter,sans-serif',cursor:'pointer',outline:'none',color:valColor((selected as unknown as Record<string,string>)[field]||'')}}
                          value={(selected as unknown as Record<string,string>)[field]||'no'}
                          onChange={e=>updateClient(selected.id,field,e.target.value)}>
                          {opts.map(o=><option key={o} value={o}>{LABELS[o]||o}</option>)}
                        </select>
                      </div>
                    ))}
                    <div style={{background:'#f5f2ee',borderRadius:8,padding:'8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontSize:11,color:'#9b9890'}}>Voucher</span>
                      <span style={{fontSize:11,fontWeight:600,color:na.includes(selected.voucher||'')?'#dc2626':'#16a34a'}}>{na.includes(selected.voucher||'')?'No':selected.voucher}</span>
                    </div>
                    <div style={{background:'#f5f2ee',borderRadius:8,padding:'8px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span style={{fontSize:11,color:'#9b9890'}}>Housing</span>
                      <span style={{fontSize:11,fontWeight:600,color:na.includes(selected.housing||'')?'#dc2626':'#16a34a',maxWidth:100,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{na.includes(selected.housing||'')?'No':selected.housing}</span>
                    </div>
                  </div>

                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                    {[{lbl:'Psych Appt',df:'psych_date',af:'psych_attended'},{lbl:'Physical Appt',df:'phys_date',af:'phys_attended'}].map(({lbl,df,af})=>(
                      <div key={lbl} style={{background:'#f5f2ee',borderRadius:8,padding:'9px 11px'}}>
                        <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.09em',color:'#c4bfb8',marginBottom:6}}>{lbl}</div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                          <span style={{fontSize:10,color:'#9b9890'}}>Date</span>
                          <input style={{background:'transparent',border:'none',fontSize:11,fontWeight:500,fontFamily:'Inter,sans-serif',color:'#1a1917',outline:'none',textAlign:'right',width:100}}
                            placeholder="—" defaultValue={(selected as unknown as Record<string,string>)[df]||''}
                            onBlur={e=>updateClient(selected.id,df,e.target.value)}/>
                        </div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span style={{fontSize:10,color:'#9b9890'}}>Attended</span>
                          <select style={{background:'transparent',border:'none',fontSize:11,fontWeight:500,fontFamily:'Inter,sans-serif',color:'#1a1917',outline:'none',cursor:'pointer'}}
                            value={(selected as unknown as Record<string,string>)[af]||'pending'}
                            onChange={e=>updateClient(selected.id,af,e.target.value)}>
                            {ATT_OPTS.map(o=><option key={o} value={o}>{LABELS[o]||o}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {[{lbl:'Update',field:'notes',bg:'#eff6ff',lc:'#2563eb'},{lbl:'Barriers',field:'barriers',bg:'#fff1f2',lc:'#be123c'},{lbl:'Action Step / To Do',field:'todo',bg:'#f0fdf4',lc:'#15803d'}].map(({lbl,field,bg,lc})=>(
                    <div key={field} style={{borderRadius:9,padding:'10px 12px',background:bg}}>
                      <div style={{fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.09em',color:lc,marginBottom:5}}>{lbl}</div>
                      <textarea style={{width:'100%',background:'transparent',border:'none',resize:'none',fontSize:12,fontFamily:'Inter,sans-serif',color:'#374151',outline:'none',lineHeight:'1.6',minHeight:44}}
                        placeholder={`${lbl}…`}
                        defaultValue={(selected as unknown as Record<string,string>)[field]||''}
                        onBlur={e=>updateClient(selected.id,field,e.target.value)}/>
                    </div>
                  ))}

                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                    {[{lbl:'Last ILP',f:'last_ilp'},{lbl:'Voucher',f:'voucher'},{lbl:'Housing Plan',f:'housing'},{lbl:'Referrals',f:'referrals'}].map(({lbl,f})=>(
                      <div key={f}>
                        <div style={{fontSize:9,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'#c4bfb8',marginBottom:3}}>{lbl}</div>
                        <input style={inp} defaultValue={(selected as unknown as Record<string,string>)[f]||''} onBlur={e=>updateClient(selected.id,f,e.target.value)}/>
                      </div>
                    ))}
                  </div>

                  <div style={{fontSize:10,color:'#16a34a',fontFamily:'DM Mono,monospace',textAlign:'center',height:16}}>{saved?'✓ Saved':''}</div>
                  <button onClick={async()=>{if(!confirm('Move to non-active?'))return;await updateClient(selected.id,'active',false);setSelected(null)}}
                    style={{width:'100%',padding:7,background:'transparent',border:'1px solid #fecaca',color:'#dc2626',borderRadius:8,fontSize:11,fontWeight:500,cursor:'pointer',fontFamily:'Inter,sans-serif'}}>
                    Move to non-active
                  </button>
                </div>
              )}

              {/* CHECKLIST */}
              {tab==='checklist'&&(
                <div style={{padding:'18px 20px',display:'flex',flexDirection:'column',gap:12}}>
                  <div style={{background:'#f5f2ee',borderRadius:10,padding:'12px 14px',textAlign:'center'}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#1a1917'}}>Client Checklist</div>
                    <div style={{fontSize:11,color:'#9b9890',marginTop:2}}>Coming soon</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}