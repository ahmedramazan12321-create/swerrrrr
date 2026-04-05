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
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Boş bırakma!");
    return;
  }

  fetch(API + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(res => res.json())
.then(data => {

  if (data.error) {
    alert("❌ Hata: " + data.error);
    return;
  }

  // 🔥 الحل هنا
  localStorage.setItem("userId", data.userId);

  alert("Giriş başarılı!");
  window.location.href = "dashboard.html";

})

// 🚪 4. Çıkış Yapma Fonksiyonu
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}
}
