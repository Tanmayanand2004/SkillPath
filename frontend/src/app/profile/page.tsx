"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, LogOut, Save, Camera } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const router = useRouter();
  const { user, token, logout, updateUser, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    bio: '',
    profile_pic_url: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      setFormData({
        full_name: user.full_name || '',
        display_name: user.display_name || '',
        bio: user.bio || '',
        profile_pic_url: user.profile_pic_url || ''
      });
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-slate-400">Loading profile...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        updateUser(data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Link href="/dashboard" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            SkillPath
          </Link>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Sidebar / Avatar Area */}
          <div className="col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <div className="relative inline-block mb-4">
                {formData.profile_pic_url ? (
                  <img 
                    src={formData.profile_pic_url} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-indigo-900/50 border-4 border-indigo-500/30 flex items-center justify-center">
                    <User className="w-12 h-12 text-indigo-300" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full border-2 border-[#0A0A0B] cursor-pointer hover:bg-indigo-500 transition-colors">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-xl font-bold">{user.username}</h3>
              <p className="text-slate-400 text-sm mb-4">{user.email}</p>
              
              <div className="pt-4 border-t border-white/10 flex justify-between text-sm">
                <span className="text-slate-400">Paths Generated</span>
                <span className="font-semibold text-indigo-400">3</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
              
              {message.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.display_name}
                      onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
                      placeholder="Johnny"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Profile Picture URL</label>
                  <input 
                    type="url" 
                    value={formData.profile_pic_url}
                    onChange={(e) => setFormData({...formData, profile_pic_url: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
                    placeholder="https://example.com/avatar.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
                  <textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                    placeholder="Tell us about your learning goals..."
                  />
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

