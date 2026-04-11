const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path"); // 🔥 EKLENDİ: Dosya yollarını yönetmek için

const app = express();
app.use(express.json());
app.use(cors());

// 🔥 EKLENDİ: Tüm statik dosyaları (HTML, CSS, JS, resimler) dışa açar
app.use(express.static(__dirname));

/* 🔥 ANA SAYFA (Artık siteye girildiğinde index.html açılacak) */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* 🔥 MONGODB */
mongoose.connect("mongodb+srv://ahmedramazan12321_db_user:12345678Aa323@cluster0.qtdzrfm.mongodb.net/myapp")
.then(() => console.log("MongoDB Bağlantısı Başarılı"))
.catch(err => console.log("MongoDB Hatası:", err));

/* 🔥 MODEL */
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

/* 🔥 REGISTER */
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.json({ error: "email_used" });

  const id = Math.floor(100000 + Math.random() * 900000);

  await User.create({ email, password, id });

  res.json({ success: true, userId: id });
});

/* 🔥 LOGIN */
app.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password
  });

  if (!user) return res.json({ error: "wrong" });

  res.json({ success: true, userId: user.id });
});

/* 🔥 USER */
app.get("/user/:id", async (req, res) => {
  const user = await User.findOne({ id: Number(req.params.id) });
  res.json(user);
});

/* 🔥 ADMIN PARA EKLE */
app.post("/add-balance", async (req, res) => {
  if (req.body.adminKey !== "1234") {
    return res.json({ error: "no_auth" });
  }

  const { id, amount } = req.body;
  const amt = Number(amount);

  let user = await User.findOne({ id: Number(id) });
  if (!user) return res.json({ error: "user_not_found" });

  /* 🔥 ANA PARA SABİT */
  user.depositAmount = amt;

  /* 🔥 BAKİYE */
  user.balance += amt;

  /* 🔥 TIMER BAŞLAT */
  user.depositTime = Date.now();

  await user.save();

  res.json({
    success: true,
    balance: user.balance,
    depositAmount: user.depositAmount
  });
});

/* 🔥 OTOMATİK KAZANÇ SİSTEMİ */
setInterval(async () => {
  try {
    const now = Date.now();
    const ONE_DAY = 86400000;

    const users = await User.find({
      depositAmount: { $gt: 0 },
      depositTime: { $gt: 0 }
    });

    for (let user of users) {
      const diff = now - user.depositTime;

      if (diff >= ONE_DAY) {
        const reward = user.depositAmount * 0.20;

        user.balance += reward;

        /* 🔥 TIMER RESET */
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

/* 🔥 SERVER */
app.listen(3000, () => {
  console.log("🚀 Server çalışıyor (3000)");
});
