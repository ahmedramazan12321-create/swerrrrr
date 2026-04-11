const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

/* 🔥 TÜM STATİK DOSYALARI DIŞA AÇ (Sitenin tasarımı için gerekli) */
app.use(express.static(__dirname));

/* 🔥 ANA SAYFA (Siteye girildiğinde direkt index.html açılacak) */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* 🔥 MONGODB BAĞLANTISI */
mongoose.connect("mongodb+srv://ahmedramazan12321_db_user:12345678Aa323@cluster0.qtdzrfm.mongodb.net/myapp")
.then(() => console.log("MongoDB Bağlantısı Başarılı"))
.catch(err => console.log("MongoDB Hatası:", err));

/* 🔥 KULLANICI MODELİ */
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  id: Number,
  balance: { type: Number, default: 0 },
  depositAmount: { type: Number, default: 0 },
  depositTime: { type: Number, default: 0 },
  lastDailyGiven: { type: Number, default: 0 }
});

const User = mongoose.model("User", UserSchema);

/* 🔥 REGISTER (KAYIT) */
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.json({ error: "email_used" });

  const id = Math.floor(100000 + Math.random() * 900000);

  await User.create({ email, password, id });

  res.json({ success: true, userId: id });
});

/* 🔥 LOGIN (GİRİŞ) */
app.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password
  });

  if (!user) return res.json({ error: "wrong" });

  res.json({ success: true, userId: user.id });
});

/* 🔥 USER (KULLANICI BİLGİLERİNİ GETİR) */
app.get("/user/:id", async (req, res) => {
  const user = await User.findOne({ id: Number(req.params.id) });
  res.json(user);
});

/* 🔥 ADMIN PARA EKLE VEYA SİL */
app.post("/add-balance", async (req, res) => {
  
  // 🔥 ŞİFRE BURADA BELİRLENDİ: Artık şifre "kbs"
  if (req.body.adminKey !== "kbs") {
    return res.json({ error: "no_auth" });
  }

  const { id, amount } = req.body;
  const amt = Number(amount);

  let user = await User.findOne({ id: Number(id) });
  if (!user) return res.json({ error: "user_not_found" });

  /* 🔥 ANA PARA SABİT */
  user.depositAmount = amt;

  /* 🔥 BAKİYE EKLENİYOR/SİLİNİYOR */
  user.balance += amt;

  /* 🔥 TIMER BAŞLAT (Eğer para ekleniyorsa) */
  if(amt > 0) {
    user.depositTime = Date.now();
  }

  await user.save();

  res.json({
    success: true,
    balance: user.balance,
    depositAmount: user.depositAmount
  });
});

/* 🔥 ADMIN TIMER RESET (Admin paneli için eksik olan kod eklendi) */
app.post("/reset-timer", async (req, res) => {
  if (req.body.adminKey !== "kbs") {
    return res.json({ error: "no_auth" });
  }

  const { id } = req.body;

  let user = await User.findOne({ id: Number(id) });
  if (!user) return res.json({ error: "user_not_found" });

  user.depositTime = 0; // Süreyi sıfırla
  await user.save();

  res.json({ success: true });
});


/* 🔥 OTOMATİK KAZANÇ SİSTEMİ (Her 1 dakikada bir kontrol eder) */
setInterval(async () => {
  try {
    const now = Date.now();
    const ONE_DAY = 86400000; // 24 Saat (Milisaniye)

    const users = await User.find({
      depositAmount: { $gt: 0 },
      depositTime: { $gt: 0 }
    });

    for (let user of users) {
      const diff = now - user.depositTime;

      // Eğer yatırımın üzerinden 24 saat geçmişse
      if (diff >= ONE_DAY) {
        const reward = user.depositAmount * 0.20; // %20 kazanç

        user.balance += reward;

        /* 🔥 TIMER RESET (Bir sonraki 24 saat için baştan başlar) */
        user.depositTime = Date.now();
        user.lastDailyGiven = now;

        await user.save();

        console.log(`💰 ${user.id} kullanıcısına ${reward}$ eklendi`);
      }
    }
  } catch (err) {
    console.log("Timer hatası:", err);
  }
}, 60000);

/* 🔥 SERVER ÇALIŞTIRMA */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server çalışıyor (${PORT})`);
});
