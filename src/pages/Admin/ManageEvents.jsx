import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader } from '../../components/UI/Loader';
import { Plus, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageCropperModal from '../../components/UI/ImageCropperModal';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
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
      tagline: '',
      date: '',
      time: '',
      location: '',
      category: '',
      description: '',
      highlights: [''],
      tags: [''],
      image: '',
      status: 'upcoming',
      registration_status: 'registrations_open',
      show_participant_count: true,
      registration_type: 'solo',
      members_only: false,
      max_team_size: '',
      prize: '',
      team_size: ''
    };
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase.from('events').select('*').order('date', { ascending: false });
    if (!error) setEvents(data || []);
    setLoading(false);
  }

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    setCropFileExt(fileExt);

    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropDone = async (croppedBlob) => {
    setCropImageSrc(null); // Close modal
    if (!croppedBlob) return;
    
    const fileName = `${Math.random()}.jpg`;
    const filePath = `events/${fileName}`;
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
      date: formData.date ? new Date(formData.date).toISOString() : null,
      highlights: formData.highlights.filter(h => h.trim() !== ''),
      tags: formData.tags.filter(t => t.trim() !== ''),
      max_team_size: formData.registration_type === 'team' && formData.max_team_size !== '' && formData.max_team_size != null
        ? Math.max(1, parseInt(formData.max_team_size, 10)) : null
    };

    if (isEditing) {
      await supabase.from('events').update(payload).eq('id', formData.id);
    } else {
      await supabase.from('events').insert([payload]);
    }

    setFormData(getEmptyForm());
    setIsEditing(false);
    await fetchEvents();
  };

  const editEvent = (event) => {
    setFormData({
      ...event,
      date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
      highlights: event.highlights?.length ? event.highlights : [''],
      tags: event.tags?.length ? event.tags : [''],
      status: event.status || 'upcoming',
      show_participant_count: event.show_participant_count !== false,
      members_only: !!event.members_only,
      max_team_size: event.max_team_size ?? '',
      registration_type: event.registration_type || (event.title?.toLowerCase().includes('case study') ? 'team' : 'solo')
    });
    setIsEditing(true);
  };

  const deleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await supabase.from('events').delete().eq('id', id);
      fetchEvents();
    }
  };

  if (loading && events.length === 0) return <Loader />;

  return (
    <div>
      {cropImageSrc && (
        <ImageCropperModal 
          imageSrc={cropImageSrc}
          aspect={16 / 9} // Event banner aspect ratio
          onCropDone={handleCropDone}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
      <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '2rem' }}>Manage Events</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Form Panel */}
        <div style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--brand-primary)' }}>
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <input 
              placeholder="Event ID (e.g. startup-bootcamp)" 
              value={formData.id} 
              onChange={e => setFormData({...formData, id: e.target.value})} 
              disabled={isEditing}
              required
              className="admin-input" 
            />

            <input placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="admin-input" />
            <input placeholder="Tagline" value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} className="admin-input" />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="admin-input" style={{ flex: 1 }} />
              <input placeholder="Time String (e.g. 10:00 AM)" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="admin-input" style={{ flex: 1 }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <input placeholder="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="admin-input" style={{ flex: 1 }} />
              <select 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})} 
                className="admin-input" 
                style={{ flex: 1, cursor: 'pointer' }}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="postponed">Postponed</option>
                <option value="preponed">Preponed</option>
                <option value="ended">Ended</option>
              </select>
            </div>

            {/* Registration Status + Show Participant Count */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select 
                value={formData.registration_status} 
                onChange={e => setFormData({...formData, registration_status: e.target.value})} 
                className="admin-input" 
                style={{ flex: 1, cursor: 'pointer' }}
              >
                <option value="registrations_open">🟢 Registrations Open</option>
                <option value="registrations_closed">🔴 Registrations Closed</option>
                <option value="coming_soon">⏳ Coming Soon</option>
                <option value="free_entry">✨ Free Entry</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <input 
                  type="checkbox" 
                  checked={formData.show_participant_count} 
                  onChange={e => setFormData({...formData, show_participant_count: e.target.checked})} 
                />
                Show Participant Count
              </label>
            </div>

            {/* Access: open to all vs members only */}
            <select
              value={formData.members_only ? 'members' : 'open'}
              onChange={e => setFormData({...formData, members_only: e.target.value === 'members'})}
              className="admin-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="open">🌐 Open for All</option>
              <option value="members">👑 Members Only (visible to all, registration needs membership)</option>
            </select>

            {/* Registration Type: solo vs team */}
            <select
              value={formData.registration_type}
              onChange={e => setFormData({...formData, registration_type: e.target.value})}
              className="admin-input"
              style={{ cursor: 'pointer' }}
            >
              <option value="solo">👤 Solo Registration (direct sign-up)</option>
              <option value="team">👥 Team Registration (create / join team)</option>
            </select>

            {formData.registration_type === 'team' && (
              <input
                type="number"
                min="1"
                placeholder="Max members per team (leave empty for no limit)"
                value={formData.max_team_size}
                onChange={e => setFormData({...formData, max_team_size: e.target.value})}
                className="admin-input"
              />
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <input placeholder="Prize / Reward (e.g. ₹5000 Cash)" value={formData.prize || ''} onChange={e => setFormData({...formData, prize: e.target.value})} className="admin-input" style={{ flex: 1 }} />
              <input placeholder="Team Size (e.g. 2-4)" value={formData.team_size || ''} onChange={e => setFormData({...formData, team_size: e.target.value})} className="admin-input" style={{ flex: 1 }} />
            </div>
            <input placeholder="Category (e.g. Workshop)" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="admin-input" />
            <textarea placeholder="About this Event" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="admin-input" />

            {/* Highlights Array */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>What to Expect (Highlights)</label>
              {formData.highlights.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input placeholder="E.g. Lean startup methodology crash course" value={h} onChange={e => handleArrayChange('highlights', i, e.target.value)} className="admin-input" style={{ flex: 1 }} />
                  {formData.highlights.length > 1 && (
                    <button type="button" onClick={() => removeArrayItem('highlights', i)} style={{ background: 'rgba(228,71,46,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: 'var(--brand-primary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addArrayItem('highlights')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={14} /> Add Highlight
              </button>
            </div>

            {/* Image Upload */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Event Image</label>
              {formData.image && <img src={formData.image} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem' }} />}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} id="image-upload" style={{ display: 'none' }} />
                <label htmlFor="image-upload" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <ImageIcon size={16} /> Upload Image
                </label>
                <input placeholder="Or enter Image URL" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="admin-input" style={{ flex: 1 }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ flex: 1, padding: '0.8rem', background: 'var(--brand-primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isEditing ? 'Save Changes' : 'Create Event'}
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
          {events.map(event => (
            <div key={event.id} style={{ background: 'var(--glass-bg)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={event.image || '/placeholder.jpg'} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: 'var(--text-primary)' }}>{event.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</p>
                    {/* Registration Status Badge */}
                    {event.registration_status && (
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: event.registration_status === 'registrations_open' ? 'rgba(22,140,131,0.15)'
                          : event.registration_status === 'registrations_closed' ? 'rgba(228,71,46,0.12)'
                          : event.registration_status === 'coming_soon' ? 'rgba(229,169,0,0.12)'
                          : 'rgba(255,255,255,0.08)',
                        color: event.registration_status === 'registrations_open' ? '#168C83'
                          : event.registration_status === 'registrations_closed' ? '#E4472E'
                          : event.registration_status === 'coming_soon' ? '#E5A900'
                          : 'var(--text-secondary)'
                      }}>
                        {event.registration_status.replace(/_/g, ' ')}
                      </span>
                    )}
                    {event.status && event.status !== 'upcoming' && event.status !== 'active' ? (
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: event.status === 'ended' ? 'rgba(255,255,255,0.1)' : 'rgba(229,169,0,0.15)',
                        color: event.status === 'ended' ? 'var(--text-secondary)' : '#E5A900'
                      }}>
                        {event.status}
                      </span>
                    ) : (event.status === 'active' || (event.date && new Date(event.date) <= new Date() && event.status !== 'ended')) ? (
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: 'rgba(22,140,131,0.15)',
                        color: 'var(--ecell-teal, #168C83)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                        Active
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => editEvent(event)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: 'white', cursor: 'pointer' }}><Edit3 size={16} /></button>
                <button onClick={() => deleteEvent(event.id)} style={{ background: 'rgba(228,71,46,0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: 'var(--brand-primary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
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
