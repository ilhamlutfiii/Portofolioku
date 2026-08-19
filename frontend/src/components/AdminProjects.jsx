import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  
  // State Form Proyek
  const [form, setForm] = useState({ title: '', description: '', tech_stack: '', about: '' });
  const [editingId, setEditingId] = useState(null);

  // State Form Gambar Galeri & File Upload
  const [imageForm, setImageForm] = useState({ project_id: '', caption: '', image_url: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingImageId, setEditingImageId] = useState(null);

  // Ambil token dari localStorage untuk dikirim ke backend
  const getAuthHeaders = (isMultipart = false) => {
    const token = localStorage.getItem('adminToken');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    // Jika bukan multipart (upload file), set Content-Type ke application/json
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  };

  // Ambil data proyek beserta relasi images (Publik)
  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/projects');
      const data = await res.json();
      setProjects(data || []);
    } catch (err) {
      console.error("Gagal memuat data proyek", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  // Submit Proyek (Tambah / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `http://localhost:8080/api/admin/projects/${editingId}`
      : 'http://localhost:8080/api/admin/projects';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: getAuthHeaders(false),
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          tech_stack: form.tech_stack,
          about: form.about
        })
      });

      if (res.status === 401) {
        alert("Sesi Anda telah habis. Silakan login kembali.");
        handleLogout();
        return;
      }

      if (res.ok) {
        setForm({ title: '', description: '', tech_stack: '', about: '' });
        setEditingId(null);
        fetchProjects();
        alert(editingId ? "Proyek berhasil diupdate!" : "Proyek berhasil ditambahkan!");
      } else {
        alert("Gagal menyimpan proyek.");
      }
    } catch (err) {
      console.error("Gagal menyimpan data proyek", err);
    }
  };

  // Submit Gambar Galeri dengan Upload File
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = imageForm.image_url;

    // 1. Jika ada file baru yang dipilih dari file manager, upload dulu ke backend
    if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);

      try {
        const uploadRes = await fetch('http://localhost:8080/api/admin/upload', {
          method: 'POST',
          headers: getAuthHeaders(true), // Menggunakan helper header auth tanpa Content-Type manual (browser otomatis atur multipart boundary)
          body: formData,
        });

        if (uploadRes.status === 401) {
          alert("Sesi Anda telah habis. Silakan login kembali.");
          handleLogout();
          return;
        }

        if (!uploadRes.ok) throw new Error("Gagal mengupload gambar ke server");

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.image_url; 
      } catch (err) {
        console.error("Error upload:", err);
        alert("Gagal mengupload file gambar.");
        return;
      }
    }

    if (!imageUrl) {
      alert("Silakan pilih file gambar terlebih dahulu!");
      return;
    }

    // 2. Simpan atau Update data ke tabel project_images
    const url = editingImageId 
      ? `http://localhost:8080/api/admin/project-images/${editingImageId}`
      : 'http://localhost:8080/api/admin/project-images';
    const method = editingImageId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: getAuthHeaders(false),
        body: JSON.stringify({
          project_id: parseInt(imageForm.project_id),
          image_url: imageUrl,
          caption: imageForm.caption
        })
      });

      if (res.status === 401) {
        alert("Sesi Anda telah habis. Silakan login kembali.");
        handleLogout();
        return;
      }

      if (res.ok) {
        setImageForm({ project_id: '', caption: '', image_url: '' });
        setSelectedFile(null);
        setEditingImageId(null);
        fetchProjects();
        alert(editingImageId ? "Gambar galeri berhasil diupdate!" : "Gambar galeri berhasil ditambahkan!");
      } else {
        alert("Gagal menyimpan gambar galeri.");
      }
    } catch (err) {
      console.error("Gagal menyimpan gambar galeri", err);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack,
      about: project.about
    });
  };

  const handleEditImage = (img) => {
    setEditingImageId(img.id);
    setImageForm({
      project_id: img.project_id,
      image_url: img.image_url,
      caption: img.caption
    });
    setSelectedFile(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus proyek ini?")) {
      try {
        const res = await fetch(`http://localhost:8080/api/admin/projects/${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders(false)
        });
        
        if (res.status === 401) {
          alert("Sesi Anda telah habis.");
          handleLogout();
          return;
        }

        if (res.ok) {
          fetchProjects();
          alert("Proyek berhasil dihapus!");
        }
      } catch (err) {
        console.error("Gagal menghapus proyek", err);
      }
    }
  };

  const handleDeleteImage = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus gambar galeri ini?")) {
      try {
        const res = await fetch(`http://localhost:8080/api/admin/project-images/${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders(false)
        });

        if (res.status === 401) {
          alert("Sesi Anda telah habis.");
          handleLogout();
          return;
        }

        if (res.ok) {
          fetchProjects();
          alert("Gambar galeri berhasil dihapus!");
        }
      } catch (err) {
        console.error("Gagal menghapus gambar", err);
      }
    }
  };

  return (
    <div className="section-content" style={{ paddingTop: '50px', paddingBottom: '50px', maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Admin Dashboard - Kelola Portofolio</h2>
        <button 
          onClick={handleLogout} 
          style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
        >
          Logout
        </button>
      </div>

      {/* --- BAGIAN 1: KELOLA PROYEK --- */}
      <form onSubmit={handleSubmit} style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '40px' }}>
        <h3 style={{ color: '#38bdf8', marginBottom: '20px' }}>{editingId ? "Edit Proyek" : "Tambah Proyek Baru"}</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8' }}>Judul Proyek</label>
          <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required style={{ width: '100%', padding: '10px', background: '#0b0f19', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8' }}>Deskripsi Singkat</label>
          <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} required rows="2" style={{ width: '100%', padding: '10px', background: '#0b0f19', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8' }}>Tech Stack (pisahkan dengan koma)</label>
          <input type="text" value={form.tech_stack} onChange={(e) => setForm({...form, tech_stack: e.target.value})} required style={{ width: '100%', padding: '10px', background: '#0b0f19', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8' }}>Tentang Proyek</label>
          <textarea value={form.about} onChange={(e) => setForm({...form, about: e.target.value})} rows="3" style={{ width: '100%', padding: '10px', background: '#0b0f19', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" className="primary-btn" style={{ cursor: 'pointer', border: 'none' }}>{editingId ? "Update Proyek" : "Simpan Proyek"}</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', description: '', tech_stack: '', about: '' }); }} style={{ marginLeft: '10px', background: '#374151', color: '#fff', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Batal</button>
        )}
      </form>

      {/* Tabel Daftar Proyek */}
      <h3 style={{ marginBottom: '15px' }}>Daftar Proyek</h3>
      <div style={{ overflowX: 'auto', marginBottom: '50px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111827', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1f2937' }}>
          <thead>
            <tr style={{ background: '#1f2937', textAlign: 'left', color: '#f8fafc' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Judul</th>
              <th style={{ padding: '12px' }}>Tech Stack</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
                <td style={{ padding: '12px', color: '#94a3b8' }}>{p.id}</td>
                <td style={{ padding: '12px', fontWeight: '600' }}>{p.title}</td>
                <td style={{ padding: '12px', color: '#38bdf8' }}>{p.tech_stack}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(p)} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- BAGIAN 2: KELOLA GALERI GAMBAR PROYEK (DENGAN UPLOAD FILE) --- */}
      <form onSubmit={handleImageSubmit} style={{ background: '#111827', padding: '24px', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '40px' }}>
        <h3 style={{ color: '#38bdf8', marginBottom: '20px' }}>{editingImageId ? "Edit Gambar Galeri" : "Tambah Gambar Galeri Baru"}</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8' }}>Pilih Proyek</label>
          <select value={imageForm.project_id} onChange={(e) => setImageForm({...imageForm, project_id: e.target.value})} required style={{ width: '100%', padding: '10px', background: '#0b0f19', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }}>
            <option value="">-- Pilih Proyek --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.id} - {p.title}</option>
            ))}
          </select>
        </div>

        {/* Input Pilih File dari File Manager */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8' }}>Pilih File Gambar dari Komputer</label>
          <input 
            type="file" 
            accept="image/*,video/mp4,video/webm,video/ogg"
            onChange={(e) => setSelectedFile(e.target.files[0])} 
            style={{ width: '100%', padding: '10px', background: '#0b0f19', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} 
          />
          {imageForm.image_url && !selectedFile && (
            <p style={{ fontSize: '0.85rem', color: '#38bdf8', marginTop: '5px' }}>File aktif: {imageForm.image_url}</p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8' }}>Caption Badge (Contoh: Halaman Home, Dashboard, dll)</label>
          <input type="text" value={imageForm.caption} onChange={(e) => setImageForm({...imageForm, caption: e.target.value})} required placeholder="contoh: Halaman Utama" style={{ width: '100%', padding: '10px', background: '#0b0f19', border: '1px solid #374151', color: '#fff', borderRadius: '6px', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" className="primary-btn" style={{ cursor: 'pointer', border: 'none' }}>{editingImageId ? "Update Gambar" : "Simpan Gambar"}</button>
        {editingImageId && (
          <button type="button" onClick={() => { setEditingImageId(null); setImageForm({ project_id: '', image_url: '', caption: '' }); setSelectedFile(null); }} style={{ marginLeft: '10px', background: '#374151', color: '#fff', padding: '12px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Batal</button>
        )}
      </form>

      {/* Tabel Daftar Gambar Galeri */}
      <h3 style={{ marginBottom: '15px' }}>Daftar Gambar Galeri Proyek</h3>
      <div style={{ overflowX: 'auto', paddingBottom: '50px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111827', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1f2937' }}>
          <thead>
            <tr style={{ background: '#1f2937', textAlign: 'left', color: '#f8fafc' }}>
              <th style={{ padding: '12px' }}>ID Proyek</th>
              <th style={{ padding: '12px' }}>URL / Path Gambar</th>
              <th style={{ padding: '12px' }}>Caption</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {projects.flatMap(p => p.images || []).length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  Belum ada data gambar galeri. Silakan upload melalui form di atas.
                </td>
              </tr>
            ) : (
              projects.map((p) => (
                <React.Fragment key={p.id}>
                  {p.images && p.images.map((img) => (
                    <tr key={img.id} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '12px', color: '#38bdf8', fontWeight: '600' }}>Proyek #{p.id} ({p.title})</td>
                      <td style={{ padding: '12px', color: '#94a3b8', wordBreak: 'break-all' }}>{img.image_url}</td>
                      <td style={{ padding: '12px' }}>{img.caption}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button onClick={() => handleEditImage(img)} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Edit</button>
                        <button onClick={() => handleDeleteImage(img.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}