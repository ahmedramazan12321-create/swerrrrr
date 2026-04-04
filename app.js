// 🌐 رابط السيرفر
const API = "http://localhost:3000";

// 🔥 تسجيل
function register() {
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;

  if (!email.endsWith("@gmail.com")) {
    alert("Email @gmail.com ile bitmeli!");
    return;
  }

  if (password.length < 6) {
    alert("Şifre en az 6 karakter olmalı!");
    return;
  }

  fetch(API + "/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("Bu email zaten kayıtlı ❌");
    } else {
      alert("Kayıt başarılı ✅");
      window.location.href = "login.html";
    }
  });
}


// 🔥 تسجيل دخول
function login() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  fetch(API + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      alert("Email veya şifre yanlış ❌");
    } else {
      // 🔥 حفظ بيانات المستخدم
      localStorage.setItem("userId", data.id);
      localStorage.setItem("userEmail", data.email);

      alert("Giriş başarılı ✅");
      window.location.href = "dashboard.html";
    }
  });
}