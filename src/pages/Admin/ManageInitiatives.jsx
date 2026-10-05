import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader } from '../../components/UI/Loader';
import { Plus, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageCropperModal from '../../components/UI/ImageCropperModal';

const DEFAULT_INITIATIVE = {
  id: 'startup-support',
  title: 'Building a Startup? E-Cell Wants to Help!',
  description: `Working on an early idea, an MVP, or building a venture that's already generating revenue?

E-Cell UCEOU is here to support student founders with dedicated mentors, investor access, technical resources, and institutional backing.

📌 No idea is too early-stage. 

Fill out a quick form and tell us what you're building — we'll take it from there. Let's build something real.`,
  link: 'https://forms.gle/7yk9PFLKEtyVqPr98',
  image: '',
  status: 'active'
};

export default function ManageInitiatives() {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropFileExt, setCropFileExt] = useState(null);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      id: '',
      title: '',
      description: '',
      image: '',
      link: '',
      members_only: false,
      status: 'active'
    };
  }

  useEffect(() => {
    fetchInitiatives();
  }, []);

  async function fetchInitiatives() {
    setLoading(true);
    const { data, error } = await supabase.from('initiatives').select('*').order('created_at', { ascending: false });
    const list = data ? [...data] : [];
    if (!list.some(item => item.id === DEFAULT_INITIATIVE.id)) {
      list.push(DEFAULT_INITIATIVE);
    }
    setInitiatives(list);
    setLoading(false);
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    setCropFileExt(fileExt);

    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleCropDone = async (croppedBlob) => {
    setCropImageSrc(null); // Close modal
    if (!croppedBlob) return;
    
    const fileName = `${Math.random()}.jpg`;
    const filePath = `initiatives/${fileName}`;
    const file = new File([croppedBlob], fileName, { type: croppedBlob.type });

    try {
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      setFormData({ ...formData, image: data.publicUrl });
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      ...formData,
    };

    const { error } = await supabase.from('initiatives').upsert(payload, { onConflict: 'id' });
    if (error) {
      alert('Error saving initiative: ' + error.message);
    }

    setFormData(getEmptyForm());
    setIsEditing(false);
    await fetchInitiatives();
  };

  const editInitiative = (initiative) => {
    setFormData({
      ...initiative,
    });
    setIsEditing(true);
  };

  const deleteInitiative = async (id) => {
    if (window.confirm('Are you sure you want to delete this initiative?')) {
      await supabase.from('initiatives').delete().eq('id', id);
      fetchInitiatives();
    }
  };

  if (loading && initiatives.length === 0) return <Loader />;

  return (
    <div>
      {cropImageSrc && (
        <ImageCropperModal 
          imageSrc={cropImageSrc}
          aspect={16 / 9} // Banner aspect ratio
          onCropDone={handleCropDone}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
      <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '2rem' }}>Manage Initiatives</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Form Panel */}
        <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand-primary)' }}>
            {isEditing ? 'Edit Initiative' : 'Create New Initiative'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <input 
              placeholder="Initiative ID (e.g. startup-support)" 
              value={formData.id} 
              onChange={e => setFormData({...formData, id: e.target.value})} 
              disabled={isEditing}
              required
              className="admin-input" 
            />

            <input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="admin-input" />
            
            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={6} className="admin-input" />
            
            <input placeholder="External Link / Form Link" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="admin-input" />

            <select 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})} 
              className="admin-input" 
              style={{ cursor: 'pointer' }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={formData.members_only ? 'members' : 'open'}
              onChange={e => setFormData({...formData, members_only: e.target.value === 'members'})}
              className="admin-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="open">🌐 Open for All</option>
              <option value="members">👑 Members Only (visible to all, joining needs membership)</option>
            </select>

            {/* Image Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Banner Image</label>
              {formData.image && <img src={formData.image} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} id="image-upload" style={{ display: 'none' }} />
                <label htmlFor="image-upload" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <ImageIcon size={16} /> Upload Banner
                </label>
                <input placeholder="Or enter Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="admin-input" style={{ flex: 1 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ flex: 1, padding: '0.8rem', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isEditing ? 'Save Changes' : 'Create Initiative'}
              </motion.button>
              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(false); setFormData(getEmptyForm()); }} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {initiatives.map(initiative => (
            <div key={initiative.id} style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={initiative.image || '/placeholder.jpg'} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--text-primary)' }}>{initiative.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      background: initiative.status === 'inactive' ? 'rgba(255,255,255,0.1)' : 'rgba(229,169,0,0.15)',
                      color: initiative.status === 'inactive' ? 'var(--text-secondary)' : '#E5A900'
                    }}>
                      {initiative.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => editInitiative(initiative)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: 'white', cursor: 'pointer' }}><Edit3 size={16} /></button>
                <button onClick={() => deleteInitiative(initiative.id)} style={{ background: 'rgba(228,71,46,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: 'var(--brand-primary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {initiatives.length === 0 && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>No initiatives found.</p>}
        </div>
      </div>
      
      {/* Global styles for admin inputs to reuse */}
      <style>{`
        .admin-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.8rem 1rem;
          border-radius: 8px;
          color: white;
          font-family: inherit;
          width: 100%;
          box-sizing: border-box;
        }
        .admin-input:focus {
          outline: none;
          border-color: var(--brand-primary);
        }
      `}</style>
    </div>
  );
}
