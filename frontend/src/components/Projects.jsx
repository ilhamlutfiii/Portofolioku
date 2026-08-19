import { Link } from 'react-router-dom';

export default function Projects({ projects, loading, error }) {
  return (
    <div className="section-content">
      <h2>Featured Projects</h2>
      {loading && <p>Memuat proyek dari database...</p>}
      {error && <p className="error-text">{error}</p>}
      
      <div className="project-grid">
        {projects.map((p) => (
          <Link to={`/projects/${p.id}`} key={p.id} className="project-card-link">
            <div className="project-card">
              <span className="tech-badge">{p.tech_stack}</span>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <span className="read-more">Lihat Detail →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}