import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ImageCropperModal from './ImageCropperModal';

export default function EditProfileModal({ isOpen, onClose }) {
  const { user, profile, fetchProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    college: profile?.college || '',
    phone: profile?.phone || '',
    dob: profile?.dob || '',
  });

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        full_name: profile.full_name || '',
        college: profile.college || '',
        phone: profile.phone || '',
        dob: profile.dob || '',
      });
    }
  }, [isOpen, profile]);

  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropType, setCropType] = useState(null);
  const [cropFileExt, setCropFileExt] = useState(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCropFileExt(file.name.split('.').pop());
    setCropType(type);

    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropDone = (croppedBlob) => {
    setCropImageSrc(null);
    if (!croppedBlob) return;
    
    const fileName = `${Math.random()}.${cropFileExt || 'jpg'}`;
    const file = new File([croppedBlob], fileName, { type: croppedBlob.type });
    
    if (cropType === 'avatar') {
      setAvatarFile(file);
    } else if (cropType === 'banner') {
      setBannerFile(file);
    }
  };

  const uploadFile = async (file, pathPrefix) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${pathPrefix}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('profile-assets')
      .upload(filePath, file, { upsert: true });
      
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-assets')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      let updates = { ...formData };

      if (avatarFile) {
        updates.avatar_url = await uploadFile(avatarFile, 'avatar');
      }
      if (bannerFile) {
        updates.banner_url = await uploadFile(bannerFile, 'banner');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile(user.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {cropImageSrc && (
        <ImageCropperModal 
          imageSrc={cropImageSrc}
          aspect={cropType === 'avatar' ? 1 : 16 / 9}
          onCropDone={handleCropDone}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem'
      }}>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} 
        />
        
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          style={{
            position: 'relative', width: '100%', maxWidth: '500px',
            background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
            borderRadius: '20px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 60px rgba(0,0,0,0.4)'
          }}
        >
          <button onClick={onClose} style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer'
          }}>
            <X size={20} />
          </button>

          <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '0 0 1.5rem', fontSize: '1.4rem' }}>
            Edit Profile
          </h2>

          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(228,71,46,0.1)', color: '#E4472E', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Avatar Image</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'avatar')} style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }} />
                  <div style={{ padding: '0.75rem', background: 'var(--glass-bg)', border: '1px dashed var(--glass-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    <Upload size={14} /> {avatarFile ? avatarFile.name : 'Choose File'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Banner Image</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e, 'banner')} style={{ position: 'absolute', opacity: 0, inset: 0, cursor: 'pointer' }} />
                  <div style={{ padding: '0.75rem', background: 'var(--glass-bg)', border: '1px dashed var(--glass-border)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                    <Upload size={14} /> {bannerFile ? bannerFile.name : 'Choose File'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Full Name</label>
              <input name="full_name" value={formData.full_name} onChange={handleChange} style={{ padding: '0.75rem', background: 'var(--nav-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>College / University</label>
              <input name="college" value={formData.college} onChange={handleChange} style={{ padding: '0.75rem', background: 'var(--nav-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Phone Number</label>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} style={{ padding: '0.75rem', background: 'var(--nav-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Date of Birth</label>
                <input name="dob" type="date" value={formData.dob} onChange={handleChange} style={{ padding: '0.75rem', background: 'var(--nav-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', colorScheme: 'dark' }} />
              </div>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              * Email cannot be changed directly here. Contact support to update your authentication email.
            </div>

            <button type="submit" disabled={loading} style={{
              marginTop: '1rem', width: '100%', padding: '0.9rem',
              background: 'linear-gradient(135deg, var(--ecell-vermilion), var(--ecell-cobalt))',
              color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
