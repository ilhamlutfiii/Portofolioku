export default function Education() {
  return (
    <div className="section-content">
      <h2>Education</h2>
      <div className="timeline-container">
        <div className="timeline-item">
          <span className="year">2020 - 2024</span>
          <h3>D4 Teknik Informatika</h3>
          <p style={{ color: '#38bdf8', fontWeight: '600', marginBottom: '6px' }}>Politeknik Negeri Malang | Kota Malang</p>
          <p>Fokus mendalam pada rekayasa perangkat lunak, sistem jaringan, dan manajemen basis data.</p>
        </div>
        <div className="timeline-item" style={{ marginTop: '20px' }}>
          <span className="year">2017 - 2020</span>
          <h3>Teknik Komputer dan Jaringan</h3>
          <p style={{ color: '#38bdf8', fontWeight: '600', marginBottom: '6px' }}>SMKs Al-Mahrusiyah | Kota Kediri</p>
          <p>Mempelajari perakitan komputer, instalasi sistem operasi, serta infrastruktur jaringan dasar.</p>
        </div>
      </div>
    </div>
  );
}