// 🌐 1. API Bağlantı Ayarı
const API = window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://swerrrrr.onrender.com";

// 📝 2. Kayıt Olma Fonksiyonu (Register)
function register() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  // Temel Kontroller
  if (!email || !password) {
    alert("Lütfen tüm alanları doldurun! ⚠️");
    return;
  }

  if (!email.endsWith("@gmail.com")) {
    alert("Geçerli bir Gmail adresi giriniz! (@gmail.com) 📧");
    return;
  }

  if (password.length < 6) {
    alert("Şifreniz güvenlik için en az 6 karakter olmalı! 🔒");
    return;
  }

  // Fetch İşlemi
  fetch(API + "/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("❌ Hata: " + data.error);
    } else {
      alert("Kayıt başarılı! Giriş yapabilirsiniz. ✅");
      window.location.href = "login.html";
    }
  })
  .catch(err => {
    console.error("Kayıt hatası:", err);
    alert("Sunucuya bağlanılamadı. Lütfen internetinizi kontrol edin! 🌐");
  });
}

// 🔑 3. Giriş Yapma Fonksiyonu (Login)
function login() {
  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Email ve şifre boş bırakılamaz! ⚠️");
    return;
  }

  fetch(API + "/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("❌ Giriş Başarısız: " + data.error);
    } else {
      // 🚀 VERİLERİ SAKLA (Kritik Bölge)
      // Server'dan gelen verilerin isimlerine (data.id vb.) dikkat!
      localStorage.setItem("userId", data.id); 
      localStorage.setItem("currentUser", data.email);
      localStorage.setItem("userBalance", data.balance || 0);

      alert("Giriş başarılı! Hoş geldiniz. ✅");
      window.location.href = "dashboard.html";
    }
  })
  .catch(err => {
    console.error("Giriş hatası:", err);
    alert("Sunucu şu an yanıt vermiyor, lütfen biraz sonra tekrar deneyin! 🔥");
  });
}

// 🚪 4. Çıkış Yapma Fonksiyonu
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
