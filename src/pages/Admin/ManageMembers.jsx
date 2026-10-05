import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader } from '../../components/UI/Loader';
import { Crown, Search } from 'lucide-react';

export default function ManageMembers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.rpc('admin_list_members');
    if (error) setError(error.message); else { setError(''); setUsers(data || []); }
    setLoading(false);
  }

  async function toggle(u) {
    const next = !u.is_member;
    setUsers(list => list.map(x => x.id === u.id ? { ...x, is_member: next } : x));
    const { error } = await supabase.from('profiles').update({ is_member: next }).eq('id', u.id);
    if (error) { alert('Failed: ' + error.message); load(); }
  }

  const q = query.trim().toLowerCase();
  const shown = users.filter(u => !q || [u.full_name, u.email, u.college].some(v => v?.toLowerCase().includes(q)));

  if (loading && users.length === 0) return <Loader />;

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Manage Members</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Mark users who have taken membership. Only members can register for members-only events.
        ({users.filter(u => u.is_member).length} members)
      </p>
      {error && <p style={{ color: 'var(--brand-primary)' }}>Error: {error}. Did you run supabase_members_only.sql?</p>}

      <div style={{ position: 'relative', maxWidth: '420px', marginBottom: '1.5rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input
          placeholder="Search name, email or college"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem 0.75rem 2.4rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'inherit' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {shown.map(u => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.8rem 1rem' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{u.full_name || 'Unnamed user'}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{u.email}{u.college ? ` · ${u.college}` : ''}</div>
            </div>
            <button
              onClick={() => toggle(u)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '9999px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem',
                background: u.is_member ? 'rgba(229,169,0,0.15)' : 'rgba(255,255,255,0.08)',
                color: u.is_member ? '#E5A900' : 'var(--text-secondary)',
                border: `1px solid ${u.is_member ? 'rgba(229,169,0,0.4)' : 'rgba(255,255,255,0.12)'}` }}
            >
              <Crown size={14} /> {u.is_member ? 'Member' : 'Make Member'}
            </button>
          </div>
        ))}
        {shown.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No users found.</p>}
      </div>
    </div>
  );
}
