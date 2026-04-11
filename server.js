const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Bağlantısı (Kendi URI'ni buraya yazmalısın)
mongoose.connect("mongodb+srv://ahmedramazan12321_db_user:12345678Aa323@cluster0.qtdzrfm.mongodb.net/myapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Bağlantısı Başarılı"))
  .catch(err => console.log("MongoDB Hatası:", err));

// Kullanıcı Şeması
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  id: Number,
  
  balance: { type: Number, default: 0 },         // Çekilebilir toplam bakiye
  depositAmount: { type: Number, default: 0 },   // Sadece %20 hesaplanacak ANA PARA
  
  depositTime: { type: Number, default: 0 },     // 24 Saatlik Geri Sayım Başlangıcı
  lastDailyGiven: { type: Number, default: 0 }   // Son ödeme kontrolü
});

const User = mongoose.model("User", UserSchema);

// REGISTER (Kayıt)
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.json({ error: "email_used" });

  const id = Math.floor(100000 + Math.random() * 900000);
  await User.create({ email, password, id });
  res.json({ success: true, userId: id });
});


// LOGIN (Giriş)
app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email, password: req.body.password });
  if (!user) return res.json({ error: "wrong" });
  res.json({ success: true, userId: user.id });
});

// USER (Kullanıcı Bilgilerini Çekme - Frontend için)
app.get("/user/:id", async (req, res) => {
  const user = await User.findOne({ id: Number(req.params.id) });
  res.json(user);
});

// 💰 ADMIN PARA EKLEME ENDPOINTİ
app.post("/add-balance", async (req, res) => {
  if(req.body.adminKey !== "1234") {
    return res.json({ error: "no_auth" });
  }

  const { id, amount } = req.body;
  const amt = Number(amount);

  let user = await User.findOne({ id: Number(id) });
  if (!user) return res.json({ error: "user_not_found" });

  // 1. Ana Parayı (Deposit) Güncelle
  user.depositAmount = amt;   // 🔥 ANA PARA
user.balance += amt;        // 🔥 BAKİYE
user.depositTime = Date.now(); // 🔥 TIMER BAŞLAT

  await user.save();

  res.json({ success: true, newBalance: user.balance, depositAmount: user.depositAmount });
});

// ⚙️ OTOMATİK 24 SAAT KAZANÇ DÖNGÜSÜ (Her 1 dakikada kontrol eder)
setInterval(async () => {
  try {
    const now = Date.now();
    const ONE_DAY_MS = 86400000; // 24 Saat = 86.400.000 milisaniye

    // Sadece yatırımı olan ve timer'ı başlamış (depositTime > 0) kullanıcıları bul
    const users = await User.find({ depositAmount: { $gt: 0 }, depositTime: { $gt: 0 } });

    for (let user of users) {
      const timePassed = now - user.depositTime;

      // Eğer yatırımın üzerinden tam 24 saat (veya daha fazla) geçmişse
      if (timePassed >= ONE_DAY_MS) {
        // Sadece ana paranın (depositAmount) %20'sini hesapla
        const reward = user.depositAmount * 0.20; 
        
        user.balance += reward; // Bakiyeye ekle
        user.depositTime = now; // Timer'ı ŞU AN itibarıyla sıfırla (SONSUZ DÖNGÜ BAŞLAR)
        user.lastDailyGiven = now;
        
        await user.save();
        console.log(`[BAŞARILI] User ${user.id} hesabına $${reward} eklendi. Timer sıfırlandı.`);
      }
    }
  } catch (err) {
    console.error("Otomatik ödeme sistemi hatası:", err);
  }
}, 60 * 1000); // 1 Dakikada bir kontrol

app.listen(3000, () => console.log("Server 3000 portunda aktif ve Otomatik Ödeme Sistemi çalışıyor."));
