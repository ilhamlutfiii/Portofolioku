export default function Skills() {
  const skillCategories = [
    { title: "Pemrograman", skills: ["PHP", "Python", "Golang", "JavaScript"] },
    { title: "Framework Web", skills: ["Laravel", "CodeIgniter", "ReactJS"] },
    { title: "Database", skills: ["PostgreSQL", "MySQL", "Microsoft Access (.mdb)"] },
    { title: "IT & Tools", skills: ["IT Troubleshooting", "CCTV Technician", "Remote Desktop", "Ultraviewer / Anydesk", "VS Code"] }
  ];

  return (
    <div className="section-content">
      <h2>Skills</h2>
      <div className="skills-category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {skillCategories.map((cat, idx) => (
          <div key={idx} className="skill-card">
            <h3 style={{ fontSize: '1.1rem', color: '#38bdf8', marginBottom: '12px' }}>{cat.title}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {cat.skills.map((s, i) => (
                <span key={i} className="tech-badge" style={{ margin: 0 }}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}