const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// HTML/CSS/JS dosyalarını sunmak için
app.use(express.static(path.join(__dirname)));

// MongoDB Bağlantısı (Kendi adresini buraya yazabilirsin)
mongoose.connect("mongodb+srv://ahmedramazan12321_db_user:12345678Aa323@cluster0.qtdzrfm.mongodb.net/myapp?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Bağlantısı Başarılı ✅"))
.catch(err => console.log("Mongo Hatası:", err));

// --- KULLANICI MODELİ ---
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  id: { type: Number, unique: true },
  balance: { type: Number, default: 0 },

  days: { type: Number, default: 0 },
  invited: { type: Boolean, default: false },

  // 🔥 هذا الجديد تضيفه هنا
  lastClaim: { type: Number, default: 0 }
});

const User = mongoose.model("User", UserSchema);

// --- YARDIMCI FONKSİYON: 6 Haneli ID ---
async function generateId() {
  let id;
  let exists;
  do {
    id = Math.floor(100000 + Math.random() * 900000);
    exists = await User.findOne({ id });
  } while (exists);
  return id;
}

// --- API ENDPOINTLERİ ---

// 1. Kayıt Ol
// --- API ENDPOINTLERİ ---

// 1. Kayıt Ol
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const id = await generateId();
    const newUser = new User({ email, password, id });
    await newUser.save();
    res.json({ success: true, userId: id });
  } catch (err) {
    res.json({ error: "E-posta zaten kayıtlı! ❌" });
  }
});

// 2. Giriş Yap
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) {
    res.json({ success: true, userId: user.id });
  } else {
    res.json({ error: "E-posta veya şifre hatalı! ❌" });
  }
});

// 3. Kullanıcı Bilgilerini Çek
app.get("/user/:id", async (req, res) => {
  try {

    const id = Number(req.params.id);

    if(isNaN(id)){
      return res.json({ error: "invalid id" });
    }

    let user = await User.findOne({ id });

    if (!user) return res.json({ error: "not found" });

    res.json(user);

  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
});


// 🔥🔥🔥 هذا الجديد (حطه تحتهم مباشرة)
app.post("/claim", async (req, res) => {
  try {
    const { userId } = req.body;

    if(!userId){
      return res.json({ error: "no id" });
    }

    const user = await User.findOne({ id: Number(userId) });

    if (!user) {
      return res.json({ error: "user not found" });
    }

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // 🔥 حماية من الغش
    if (now - (user.lastClaim || 0) < DAY) {
      return res.json({ error: "wait" });
    }

    // ✅ زيادة اليوم
    user.days = (user.days || 0) + 1;

    // 💰 زيادة الرصيد
    user.balance = (user.balance || 0) + 10;

    // 🕒 حفظ الوقت
    user.lastClaim = now;

    await user.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
});


// 4. ADMIN: Bakiyeyi Ekle ve Sayacı Başlat
// Admin panelinden birine para gönderdiğinde bu çalışır.
app.post("/add-balance", async (req, res) => {
  try {
    const { id, amount } = req.body;
    let user = await User.findOne({ id: Number(id) });

    if (!user) return res.json({ error: "Kullanıcı bulunamadı" });

    // Eğer bu İLK para yatırma ise, bunu ana para (initialDeposit) olarak kaydet
    if (user.initialDeposit === 0 && amount > 0) {
      user.initialDeposit = Number(amount);
    }

    user.balance += Number(amount);

    // 🔥 SAYACI BAŞLAT: Şu anki zaman + 24 Saat (milisaniye cinsinden)
    user.timerEnd = Date.now() + (24 * 60 * 60 * 1000);

    await user.save();
    res.json({ success: true, balance: user.balance, timerEnd: user.timerEnd });
  } catch (err) {
    res.json({ error: "İşlem başarısız" });
  }
});

// 5. CLAIM: Ödül Al Butonu
app.post("/claim", async (req, res) => {
  try {
    const { id } = req.body;
    let user = await User.findOne({ id: Number(id) });

    if (!user) return res.json({ error: "Kullanıcı yok" });

    // Süre dolmuş mu kontrolü
    if (Date.now() < user.timerEnd) {
      return res.json({ error: "Henüz 24 saat dolmadı!" });
    }

    // 🔥 ANA PARA ÜZERİNDEN %20 KAR (Senin istediğin 120 -> 140 mantığı)
    let profit = user.initialDeposit * 0.20;
    user.balance += profit;

    // Ödül alındıktan sonra sayacı bir 24 saat daha ileriye kur
    user.timerEnd = Date.now() + (24 * 60 * 60 * 1000);

    await user.save();
    res.json({ success: true, newBalance: user.balance, timerEnd: user.timerEnd });
  } catch (err) {
    res.json({ error: "Hata oluştu" });
  }
});
app.get("/ping", (req, res) => {
  res.send("OK");
});
// 🔥 RESET TIMER
app.post("/reset-timer", async (req, res) => {
  try {
    const { id } = req.body;

    let user = await User.findOne({ id: Number(id) });

    if (!user) return res.json({ error: "Kullanıcı yok" });

    user.timerEnd = 0;

    await user.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif.`));
