const API = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://swerrrrr.onrender.com";

/* 🌐 LANGUAGE */
const texts = {
  tr: {
    login: "Giriş Yap",
    register: "Kayıt Ol",
    email: "E-posta",
    password: "Şifre",
    switch: "Hesabın yok mu? Üye Ol",
    emailUsed: "Bu email zaten kullanılmış!",
    success: "Kayıt başarılı!"
  },
  en: {
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    switch: "Don't have account? Sign up",
    emailUsed: "This email is already used!",
    success: "Registration successful!"
  },
  ar: {
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    switch: "ليس لديك حساب؟ سجل",
    emailUsed: "هذا البريد مستخدم بالفعل!",
    success: "تم التسجيل بنجاح!"
  }
};

/* 🌐 LANG FUNCTIONS */
function toggleLang(){
  let m = document.getElementById("langMenu");
  m.style.display = m.style.display === "block" ? "none" : "block";
}

function setLang(lang){
  localStorage.setItem("lang", lang);
  applyLang(lang);
}

function applyLang(lang){
  let t = texts[lang];
  if(!t) return;

  let title = document.getElementById("title");
  let btn = document.getElementById("btn");
  let email = document.querySelector("input[type='email']");
  let pass = document.querySelector("input[type='password']");
  let sw = document.getElementById("switch");

  if(title) title.innerText = location.href.includes("register") ? t.register : t.login;
  if(btn) btn.innerText = location.href.includes("register") ? t.register : t.login;
  if(email) email.placeholder = t.email;
  if(pass) pass.placeholder = t.password;
  if(sw) sw.innerText = t.switch;
}

function getLang(){
  return localStorage.getItem("lang") || "tr";
}

window.onload = () => {
  applyLang(getLang());
};

/* REGISTER */
function register(){
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let msg = document.getElementById("msg");
  let t = texts[getLang()];

  fetch(API + "/register", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  })
  .then(r => r.json())
  .then(data => {

    if(data.error){
      if(msg){
        msg.innerText = t.emailUsed;
        msg.style.color = "red";
      }
      return;
    }

    if(msg){
      msg.innerText = t.success;
      msg.style.color = "lightgreen";
    }

    document.getElementById("loader").style.display = "flex";
    localStorage.setItem("userId", data.userId);

    setTimeout(()=>{
      window.location.href = "dashboard.html";
    },2000);

  })
  .catch(() => {
    if(msg){
      msg.innerText = "Server error!";
      msg.style.color = "orange";
    }
  });
}

/* LOGIN */
function login(){
  let email = document.getElementById("loginEmail").value;
  let password = document.getElementById("loginPassword").value;
  let msg = document.getElementById("msg");
  let t = texts[getLang()];

  fetch(API + "/login", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  })
  .then(r => r.json())
  .then(data => {

    if(data.error){
      if(msg){
        msg.innerText = "Hatalı giriş!";
        msg.style.color = "red";
      }
      return;
    }

    document.getElementById("loader").style.display = "flex";
    localStorage.setItem("userId", data.userId);

    setTimeout(()=>{
      window.location.href = "dashboard.html";
    },1500);

  })
  .catch(() => {
    if(msg){
      msg.innerText = "Server error!";
      msg.style.color = "orange";
    }
  });
}