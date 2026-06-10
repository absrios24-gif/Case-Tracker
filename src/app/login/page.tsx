'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f0ede8', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif' }}>
      <div style={{ background:'#faf9f6', borderRadius:16, padding:36, width:380, boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:20, fontWeight:600, color:'#1a1917' }}>Welcome back</div>
          <div style={{ fontSize:13, color:'#9b9890', marginTop:4 }}>Sign in to your case tracker</div>
        </div>
        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'#c4bfb8', display:'block', marginBottom:4 }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{ width:'100%', background:'#f0ede8', border:'1px solid #e8e4de', borderRadius:8, padding:'8px 12px', fontSize:14, color:'#1a1917', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'#c4bfb8', display:'block', marginBottom:4 }}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{ width:'100%', background:'#f0ede8', border:'1px solid #e8e4de', borderRadius:8, padding:'8px 12px', fontSize:14, color:'#1a1917', outline:'none', boxSizing:'border-box' }} />
          </div>
          {error && <div style={{ fontSize:13, color:'#dc2626' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ background:'#1a1917', color:'#faf9f6', border:'none', borderRadius:9, padding:'10px', fontSize:14, fontWeight:500, cursor:'pointer', marginTop:4 }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={{ marginTop:16, textAlign:'center', fontSize:13, color:'#9b9890' }}>
          Don't have an account? <a href="/signup" style={{ color:'#1a1917', fontWeight:500 }}>Sign up</a>
        </div>
      </div>
    </div>
  )
}
