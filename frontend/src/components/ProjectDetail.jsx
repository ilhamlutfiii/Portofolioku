import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(`http://localhost:8080/api/projects/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Proyek tidak ditemukan');
        return res.json();
      })
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setError('Gagal memuat detail proyek.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="status-box">Memuat detail proyek...</div>;
  if (error) return <div className="error-box">{error}</div>;

  // Fungsi navigasi carousel
  const nextSlide = () => {
    if (project && project.images) {
      setCurrentIndex((prevIndex) => 
        prevIndex + 2 >= project.images.length ? 0 : prevIndex + 2
      );
    }
  };

  const prevSlide = () => {
    if (project && project.images) {
      setCurrentIndex((prevIndex) => 
        prevIndex - 2 < 0 ? Math.max(0, project.images.length - 2) : prevIndex - 2
      );
    }
  };

  // Batasi maksimal 2 media yang dirender sekaligus jika lebih dari 2 (mode carousel)
  const displayedImages = project?.images 
    ? project.images.length > 2 
      ? project.images.slice(currentIndex, currentIndex + 2) 
      : project.images 
    : [];

  // Fungsi helper untuk mendeteksi apakah URL adalah video
  const isVideoFile = (url) => {
    if (!url) return false;
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  return (
    <div className="section-content project-detail-page" style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <Link to="/" className="back-btn">← Kembali ke Beranda</Link>
      
      {project && (
        <div className="detail-container">
          <span className="tech-badge">{project.tech_stack}</span>
          <h1>{project.title}</h1>
          <p className="detail-desc">{project.description}</p>
          
          {project.images && project.images.length > 0 && (
            <div className="project-gallery">
              <h3>Galeri Proyek</h3>
              <div className="carousel-wrapper">
                {project.images.length > 2 && (
                  <button className="carousel-btn prev" onClick={prevSlide}>❮</button>
                )}
                
                <div className="gallery-grid">
                  {displayedImages.map((img, index) => (
                    <div key={index} className="gallery-item-card">
                      {/* Subjudul / Badge diletakkan di atas media */}
                      {img.caption && <span className="image-caption-badge">{img.caption}</span>}
                      
                      {/* Render Video atau Gambar secara otomatis berdasarkan ekstensi file */}
                      {isVideoFile(img.image_url) ? (
                        <video 
                          src={img.image_url} 
                          controls 
                          className="gallery-img" 
                          style={{ 
                            width: '100%', 
                            height: '250px',           // Sesuaikan tinggi fix jika diinginkan (misal 250px)
                            objectFit: 'contain',        // Agar video pas tanpa merusak rasio (bisa diganti 'contain' jika ingin full terlihat)
                            borderRadius: '8px' 
                          }}
                        />
                      ) : (
                        <img 
                          src={img.image_url} 
                          alt={img.caption || `Preview`} 
                          className="gallery-img" 
                        />
                      )}
                    </div>
                  ))}
                </div>

                {project.images.length > 2 && (
                  <button className="carousel-btn next" onClick={nextSlide}>❯</button>
                )}
              </div>
              {project.images.length > 2 && (
                <p className="carousel-indicator">
                  Menampilkan {currentIndex + 1} - {Math.min(currentIndex + 2, project.images.length)} dari {project.images.length} media
                </p>
              )}
            </div>
          )}

          <div className="additional-info" style={{ marginTop: '30px' }}>
            <h3>Tentang Proyek</h3>
            <p className="detail-about-text" style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginTop: '10px' }}>
              {project.about}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}