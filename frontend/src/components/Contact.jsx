export default function Contact() {
  // Nomor WhatsApp disesuaikan dari CV (+6282334313084, angka 0 di depan diganti 62)
  const whatsappNumber = "6282334313084";
  const whatsappMessage = "Halo Ilham, saya ingin berdiskusi atau bekerja sama mengenai proyek.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="section-content contact-section">
      <h2>Contact</h2>
      <p>Mari terhubung atau diskusikan proyek Anda bersama saya.</p>
      
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Tombol Email */}
        <a href="mailto:ilhamlutfiansyahh@gmail.com" className="primary-btn">
          ✉️ Kirim Email
        </a>

        {/* Tombol WhatsApp */}
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="primary-btn"
          style={{ background: '#22c55e', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)' }}
        >
          💬 Chat WhatsApp
        </a>
      </div>
    </div>
  );
}