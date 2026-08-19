import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import komponen bagian portofolio
import Login from './components/Login';
import AdminProjects from './components/AdminProjects';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Education from './components/Education';
import Services from './components/Services';
import Contact from './components/Contact';
import ProjectDetail from './components/ProjectDetail';

function MainLayout({ projects, loading, error }) {
  return (
    <>
      <nav className="main-nav">
        <div className="nav-logo">Ilham.dev</div>
        <div className="nav-links">
          <a href="#hero">Home</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#experience">Experience</a>
          <a href="#education">Education</a>
          <a href="#services">Services</a>
          <a href="#contact" className="contact-btn">Contact</a>
        </div>
      </nav>

      <section id="hero"><Hero /></section>
      <section id="about"><About /></section>
      <section id="skills"><Skills /></section>
      
      <section id="projects">
        <Projects projects={projects} loading={loading} error={error} />
      </section>

      <section id="experience"><Experience /></section>
      <section id="education"><Education /></section>
      <section id="services"><Services /></section>
      <section id="contact"><Contact /></section>

      <footer className="main-footer">
        <p>&copy; 2026 Ilham Lutfiansyah. Built with React, Golang, & PostgreSQL.</p>
      </footer>
    </>
  );
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk mengecek status login berdasarkan localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('adminToken'))
  );

  useEffect(() => {
    fetch('http://localhost:8080/api/projects')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil data dari server');
        return res.json();
      })
      .then((data) => {
        setProjects(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setError('Gagal terhubung ke backend Golang.');
        setLoading(false);
      });
  }, []);

  return (
    <Router>
      <div className="portfolio-wrapper">
        <Routes>
          {/* Halaman Utama Portofolio */}
          <Route path="/" element={<MainLayout projects={projects} loading={loading} error={error} />} />
          
          {/* Halaman Detail Proyek */}
          <Route path="/projects/:id" element={<ProjectDetail />} />

          {/* Halaman Login Admin */}
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

          {/* Halaman Admin yang diproteksi (jika belum login, dialihkan ke /login) */}
          <Route 
            path="/admin" 
            element={
              isAuthenticated ? <AdminProjects /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}