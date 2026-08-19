export default function Experience() {
  const experiences = [
    {
      role: "Freelance IT & Web Developer",
      company: "Lutfi Dot iCom (Malang & Bekasi)",
      period: "Maret 2025 - Sekarang",
      desc: "Melakukan perbaikan hardware, pembangunan website bisnis/tugas, pemasangan CCTV, serta pembuatan desain grafis."
    },
    {
      role: "Support & Implementation Staff",
      company: "PT Radian Multi Prima (Armadillo Accounting)",
      period: "Mei 2025 - Mei 2026",
      desc: "Melayani dukungan pelanggan via remote/kunjungan, instalasi client-server aplikasi, manajemen database Access, hingga pembuatan konten pemasaran."
    },
    {
      role: "Magang IT & Administrasi",
      company: "PT PLN (Persero) Nusantara Power UP Muara Tawar",
      period: "2023 (3 Bulan)",
      desc: "Membuat website pengelolaan aset IT perusahaan, troubleshooting jaringan, printer, serta mendukung pekerjaan administrasi."
    }
  ];

  return (
    <div className="section-content">
      <h2>Experience</h2>
      <div className="timeline-container">
        {experiences.map((exp, index) => (
          <div key={index} className="timeline-item">
            <span className="year">{exp.period}</span>
            <h3>{exp.role} <span style={{ color: '#38bdf8', fontSize: '1rem' }}>@ {exp.company}</span></h3>
            <p>{exp.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}