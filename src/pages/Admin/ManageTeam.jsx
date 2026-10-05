import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader } from '../../components/UI/Loader';
import { Trash2, Edit3, Image as ImageIcon, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageCropperModal from '../../components/UI/ImageCropperModal';
import { DEFAULT_TEAM } from '../../data/defaultTeam';

const getEmptyForm = () => ({ id: null, name: '', role: '', quote: '', image: '', instagram: '', linkedin: '' });

export default function ManageTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());

  const isEditing = !!formData.id;

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) alert('Error loading team (has supabase_admin_content.sql been run?): ' + error.message);
    setMembers(data || []);
    setLoading(false);
  }

  const importDefaults = async () => {
    if (!window.confirm('Import the current 6 team members into the database?')) return;
    const rows = DEFAULT_TEAM.map((m, i) => ({ ...m, sort_order: i }));
    const { error } = await supabase.from('team_members').insert(rows);
    if (error) return alert('Import failed: ' + error.message);
    fetchMembers();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropDone = async (croppedBlob) => {
    setCropImageSrc(null);
    if (!croppedBlob) return;
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const filePath = `team/${fileName}`;
    const file = new File([croppedBlob], fileName, { type: croppedBlob.type });
    try {
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image: data.publicUrl }));
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, ...fields } = formData;
    let error;
    if (id) {
      ({ error } = await supabase.from('team_members').update(fields).eq('id', id));
    } else {
      const nextOrder = members.length ? Math.max(...members.map(m => m.sort_order || 0)) + 1 : 0;
      ({ error } = await supabase.from('team_members').insert({ ...fields, sort_order: nextOrder }));
    }
    if (error) return alert('Error saving member: ' + error.message);
    setFormData(getEmptyForm());
    fetchMembers();
  };

  const editMember = (m) => setFormData({
    id: m.id, name: m.name || '', role: m.role || '', quote: m.quote || '',
    image: m.image || '', instagram: m.instagram || '', linkedin: m.linkedin || '',
  });

  const deleteMember = async (m) => {
    if (!window.confirm(`Remove ${m.name} from the team page?`)) return;
    const { error } = await supabase.from('team_members').delete().eq('id', m.id);
    if (error) return alert('Error removing member: ' + error.message);
    fetchMembers();
  };

  if (loading && members.length === 0) return <Loader />;

  return (
    <div>
      {cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          aspect={5 / 6}
          onCropDone={handleCropDone}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
      <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '2rem' }}>Manage Team</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)', alignSelf: 'start' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand-primary)' }}>{isEditing ? 'Edit Member' : 'Add Member'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="admin-input" />
            <input placeholder="Role (e.g. Treasurer)" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} required className="admin-input" />
            <textarea placeholder="Quote" value={formData.quote} onChange={e => setFormData({ ...formData, quote: e.target.value })} rows={3} className="admin-input" />
            <input placeholder="Instagram URL (optional)" value={formData.instagram} onChange={e => setFormData({ ...formData, instagram: e.target.value })} className="admin-input" />
            <input placeholder="LinkedIn URL (optional)" value={formData.linkedin} onChange={e => setFormData({ ...formData, linkedin: e.target.value })} className="admin-input" />

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Photo</label>
              {formData.image && <img src={formData.image} alt="preview" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} id="team-image-upload" style={{ display: 'none' }} />
                <label htmlFor="team-image-upload" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  <ImageIcon size={16} /> Upload
                </label>
                <input placeholder="Or image URL" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="admin-input" style={{ flex: 1 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ flex: 1, padding: '0.8rem', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isEditing ? 'Save Changes' : 'Add Member'}
              </motion.button>
              {isEditing && (
                <button type="button" onClick={() => setFormData(getEmptyForm())} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {members.length === 0 && (
            <div style={{ background: 'var(--glass-bg)', border: '1px dashed var(--glass-border)', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>
                No members in the database yet. The Team page is currently showing built-in defaults.
              </p>
              <button onClick={importDefaults} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.2rem', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                <Download size={16} /> Import current team
              </button>
            </div>
          )}
          {members.map(m => (
            <div key={m.id} style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                <img src={m.image || '/placeholder.jpg'} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--text-primary)' }}>{m.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{m.role}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => editMember(m)} title="Edit" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}><Edit3 size={16} /></button>
                <button onClick={() => deleteMember(m)} title="Remove" style={{ background: 'rgba(228,71,46,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: 'var(--brand-primary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
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
