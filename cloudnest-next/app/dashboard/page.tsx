'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (userData) setUser(JSON.parse(userData));
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchFiles();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleStar = async (id: string) => {
    await api.patch(`/files/${id}/star`);
    fetchFiles();
  };

  const handleTrash = async (id: string) => {
    await api.patch(`/files/${id}/trash`);
    fetchFiles();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const filteredFiles = files.filter(f => {
    if (activeTab === 'starred') return f.isStarred && !f.isTrashed;
    if (activeTab === 'trash') return f.isTrashed;
    return !f.isTrashed;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType?.startsWith('video/')) return '🎬';
    if (mimeType?.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📄';
    return '📁';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-blue-500">☁️ CloudNest</h2>

        {/* Upload */}
        <label className="bg-blue-500 text-white text-center py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition font-semibold">
          {uploading ? '⏳ Uploading...' : '+ Upload File'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {[
            { id: 'all', icon: '🗂️', label: 'All Files' },
            { id: 'starred', icon: '⭐', label: 'Starred' },
            { id: 'trash', icon: '🗑️', label: 'Trash' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-500'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="mt-auto border-t pt-4">
          <p className="font-semibold text-sm text-gray-700">👤 {user?.name}</p>
          <p className="text-xs text-gray-400 mb-3">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-500 py-2 rounded-lg text-sm hover:bg-red-100 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {activeTab === 'all' && '🗂️ All Files'}
          {activeTab === 'starred' && '⭐ Starred'}
          {activeTab === 'trash' && '🗑️ Trash'}
        </h2>

        {filteredFiles.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-5xl mb-4">☁️</p>
            <p>Koi file nahi hai abhi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFiles.map(file => (
              <div key={file.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
                {/* Preview */}
                <div className="h-28 bg-gray-50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  {file.mimeType?.startsWith('image/') ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span className="text-4xl">{getIcon(file.mimeType)}</span>
                  )}
                </div>

                {/* Info */}
                <p className="text-sm font-semibold text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-400 mb-2">{formatSize(file.size)}</p>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => handleStar(file.id)} className="text-lg hover:scale-110 transition">
                    {file.isStarred ? '⭐' : '☆'}
                  </button>
                  <a href={file.url} target="_blank" rel="noreferrer" className="text-lg hover:scale-110 transition">
                    🔗
                  </a>
                  <button onClick={() => handleTrash(file.id)} className="text-lg hover:scale-110 transition">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}