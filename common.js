// 🌐 حفظ اللغة وتطبيقها بكل الصفحات
function setLang(lang){
  localStorage.setItem("lang", lang);
  applyLang(lang);
}

// 🔥 تطبيق اللغة عند فتح الصفحة
window.addEventListener("load", function(){
  let lang = localStorage.getItem("lang") || "tr";

  if(typeof applyLang === "function"){
    applyLang(lang);
  }
});

// ❌ إغلاق قائمة اللغة لما تضغط برا
document.addEventListener("click", function(e){
  let menu = document.getElementById("langMenu");
  let btn = document.querySelector(".lang-btn");

  if(!menu || !btn) return;

  if(!menu.contains(e.target) && !btn.contains(e.target)){
    menu.style.display = "none";
  }
});