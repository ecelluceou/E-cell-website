import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader } from '../../components/UI/Loader';
import { Trash2, Power, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const emptyForm = () => ({ title: '', message: '', button_text: 'Check it out', button_link: '' });

export default function ManagePopups() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm());

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from('popup_announcements')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) alert('Error loading popups (has supabase_admin_content.sql been run?): ' + error.message);
    setItems(data || []);
    setLoading(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('popup_announcements').insert({ ...formData, is_active: true });
    setSaving(false);
    if (error) return alert('Error adding popup: ' + error.message);
    setFormData(emptyForm());
    fetchItems();
  };

  const toggleActive = async (item) => {
    const { error } = await supabase
      .from('popup_announcements')
      .update({ is_active: !item.is_active })
      .eq('id', item.id);
    if (error) return alert('Error updating popup: ' + error.message);
    fetchItems();
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this popup announcement?')) return;
    const { error } = await supabase.from('popup_announcements').delete().eq('id', id);
    if (error) return alert('Error removing popup: ' + error.message);
    fetchItems();
  };

  if (loading && items.length === 0) return <Loader />;

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Popup Announcements</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Active popups appear once per visitor session on the home page. Newest active popup is shown first.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand-primary)' }}>Add Popup</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="admin-input" />
            <textarea placeholder="Message" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={5} className="admin-input" />
            <input placeholder="Button text (e.g. Check it out)" value={formData.button_text} onChange={e => setFormData({ ...formData, button_text: e.target.value })} className="admin-input" />
            <input placeholder="Button link (/events/Case-Study or https://...) — optional" value={formData.button_link} onChange={e => setFormData({ ...formData, button_link: e.target.value })} className="admin-input" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving} style={{ padding: '0.8rem', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> {saving ? 'Adding…' : 'Add Popup'}
            </motion.button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ background: 'var(--glass-bg)', padding: '1rem 1.25rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', border: '1px solid var(--glass-border)', opacity: item.is_active ? 1 : 0.6 }}>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--text-primary)' }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.message}</p>
                <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase', background: item.is_active ? 'rgba(229,169,0,0.15)' : 'rgba(255,255,255,0.1)', color: item.is_active ? '#E5A900' : 'var(--text-secondary)', display: 'inline-block', marginTop: '0.4rem' }}>
                  {item.is_active ? 'Live' : 'Off'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => toggleActive(item)} title={item.is_active ? 'Turn off' : 'Turn on'} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}><Power size={16} /></button>
                <button onClick={() => remove(item.id)} title="Remove" style={{ background: 'rgba(228,71,46,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: 'var(--brand-primary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No popups yet.</p>}
        </div>
      </div>

      <style>{`
        .admin-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.8rem 1rem;
          border-radius: 8px;
          color: var(--text-primary);
          font-family: inherit;
          width: 100%;
          box-sizing: border-box;
        }
        .admin-input:focus { outline: none; border-color: var(--brand-primary); }
      `}</style>
    </div>
  );
}
