import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Dashboard() {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Files fetch karo
  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // File upload
  const handleUpload = async (e) => {
    const file = e.target.files[0];
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

  // Star toggle
  const handleStar = async (id) => {
    await api.patch(`/files/${id}/star`);
    fetchFiles();
  };

  // Trash
  const handleTrash = async (id) => {
    await api.patch(`/files/${id}/trash`);
    fetchFiles();
  };

  // Filter files
  const filteredFiles = files.filter(f => {
    if (activeTab === 'starred') return f.isStarred && !f.isTrashed;
    if (activeTab === 'trash') return f.isTrashed;
    return !f.isTrashed;
  });

  // File size format
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // File icon
  const getIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType?.startsWith('video/')) return '🎬';
    if (mimeType?.startsWith('audio/')) return '🎵';
    if (mimeType === 'application/pdf') return '📄';
    return '📁';
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>☁️ CloudNest</h2>

        {/* Upload Button */}
        <label style={styles.uploadBtn}>
          {uploading ? '⏳ Uploading...' : '+ Upload File'}
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>

        {/* Navigation */}
        <nav style={styles.nav}>
          {[
            { id: 'all', icon: '🗂️', label: 'All Files' },
            { id: 'starred', icon: '⭐', label: 'Starred' },
            { id: 'trash', icon: '🗑️', label: 'Trash' },
          ].map(item => (
            <div
              key={item.id}
              style={{
                ...styles.navItem,
                background: activeTab === item.id ? '#E0F2FE' : 'transparent',
                color: activeTab === item.id ? '#0096C7' : '#64748B',
              }}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon} {item.label}
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div style={styles.userSection}>
          <p style={styles.userName}>👤 {user?.name}</p>
          <p style={styles.userEmail}>{user?.email}</p>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        <h2 style={styles.pageTitle}>
          {activeTab === 'all' && '🗂️ All Files'}
          {activeTab === 'starred' && '⭐ Starred'}
          {activeTab === 'trash' && '🗑️ Trash'}
        </h2>

        {filteredFiles.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '48px' }}>☁️</p>
            <p>Koi file nahi hai abhi</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredFiles.map(file => (
              <div key={file.id} style={styles.card}>
                {/* File Preview */}
                <div style={styles.preview}>
                  {file.mimeType?.startsWith('image/') ? (
                    <img src={file.url} alt={file.name} style={styles.image} />
                  ) : (
                    <span style={{ fontSize: '48px' }}>{getIcon(file.mimeType)}</span>
                  )}
                </div>

                {/* File Info */}
                <div style={styles.fileInfo}>
                  <p style={styles.fileName}>{file.name}</p>
                  <p style={styles.fileSize}>{formatSize(file.size)}</p>
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                  <button
                    style={styles.actionBtn}
                    onClick={() => handleStar(file.id)}
                    title="Star"
                  >
                    {file.isStarred ? '⭐' : '☆'}
                  </button>
                  
                   <a href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.actionBtn}
                    title="Open"
                  >
                    🔗
                  </a>
                  <button
                    style={{ ...styles.actionBtn, color: '#DC2626' }}
                    onClick={() => handleTrash(file.id)}
                    title="Trash"
                  >
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

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F4F9FD',
    fontFamily: 'Arial, sans-serif',
  },
  sidebar: {
    width: '260px',
    background: 'white',
    padding: '24px 16px',
    boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logo: {
    color: '#0096C7',
    fontSize: '22px',
    margin: 0,
  },
  uploadBtn: {
    display: 'block',
    background: '#0096C7',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  userSection: {
    marginTop: 'auto',
    borderTop: '1px solid #E2E8F0',
    paddingTop: '16px',
  },
  userName: {
    margin: '0 0 4px 0',
    fontWeight: 'bold',
    color: '#1E293B',
    fontSize: '14px',
  },
  userEmail: {
    margin: '0 0 12px 0',
    color: '#64748B',
    fontSize: '12px',
  },
  logoutBtn: {
    width: '100%',
    padding: '8px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  main: {
    flex: 1,
    padding: '32px',
  },
  pageTitle: {
    color: '#1E293B',
    marginBottom: '24px',
  },
  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: '80px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  preview: {
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F8FAFC',
    borderRadius: '8px',
    marginBottom: '12px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  fileInfo: {
    marginBottom: '8px',
  },
  fileName: {
    margin: '0 0 4px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1E293B',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileSize: {
    margin: 0,
    fontSize: '12px',
    color: '#94A3B8',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    textDecoration: 'none',
  },
};

export default Dashboard;