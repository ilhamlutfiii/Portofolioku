export default function Hero() {
  return (
    <div className="section-content hero-box">
      <span className="badge">IT Support & Software Developer</span>
      <h1>Hai, Saya Ilham Lutfiansyah</h1>
      <p>
        Lulusan D4 Teknik Informatika yang berfokus pada pemeliharaan infrastruktur dan IT, pengembangan aplikasi web modern, 
        manajemen basis data, serta pengembangan perangkat lunak berbasis cloud.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="#projects" className="primary-btn">Jelajahi Portofolio</a>
        <a 
          href="#contact" 
          className="primary-btn" 
          style={{ background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8' }}
        >
          Hubungi Saya
        </a>
      </div>
    </div>
  );
}