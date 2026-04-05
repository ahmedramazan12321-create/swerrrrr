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
    switch: "Hesabın yok mu? Üye Ol"
  },
  en: {
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    switch: "Don't have account? Sign up"
  },
  ar: {
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    switch: "ليس لديك حساب؟ سجل"
  }
};

function toggleLang(){
  let m=document.getElementById("langMenu");
  m.style.display=m.style.display==="block"?"none":"block";
}

function setLang(lang){
  localStorage.setItem("lang",lang);
  applyLang(lang);
}

function applyLang(lang){
  let t=texts[lang];
  if(!t) return;

  let title=document.getElementById("title");
  let btn=document.getElementById("btn");
  let email=document.querySelector("input[type='email']");
  let pass=document.querySelector("input[type='password']");
  let sw=document.getElementById("switch");

  if(title) title.innerText = location.href.includes("register") ? t.register : t.login;
  if(btn) btn.innerText = location.href.includes("register") ? t.register : t.login;
  if(email) email.placeholder = t.email;
  if(pass) pass.placeholder = t.password;
  if(sw) sw.innerText = t.switch;
}

window.onload=()=>{
  let lang=localStorage.getItem("lang")||"tr";
  applyLang(lang);
};

/* REGISTER */
function register(){
  let email=document.getElementById("email").value;
  let password=document.getElementById("password").value;

  fetch(API+"/register",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  })
  .then(r=>r.json())
  .then(data=>{
    if(data.error) return;

    document.getElementById("loader").style.display="flex";
    localStorage.setItem("userId",data.userId);

    setTimeout(()=>{
      window.location.href="dashboard.html";
    },2000);
  });
}

/* LOGIN */
function login(){
  let email=document.getElementById("loginEmail").value;
  let password=document.getElementById("loginPassword").value;

  fetch(API+"/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  })
  .then(r=>r.json())
  .then(data=>{
    if(data.error) return;

    document.getElementById("loader").style.display="flex";
    localStorage.setItem("userId",data.userId);

    setTimeout(()=>{
      window.location.href="dashboard.html";
    },1500);
  });
}
