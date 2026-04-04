const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// 📁 عرض الموقع
app.use(express.static(path.join(__dirname)));

// 🔗 اتصال MongoDB (مهم: استبدل الرابط إذا تغيّر)
mongoose.connect("mongodb+srv://ahmedramazan12321_db_user:k9Hn6r2M8J6zgls7@cluster0.qtdzrfm.mongodb.net/myapp?retryWrites=true&w=majority")
.then(() => console.log("MongoDB connected ✅"))
.catch(err => console.log("Mongo error:", err));

// 👤 Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  id: { type: Number, unique: true },
  balance: { type: Number, default: 0 }
});

const User = mongoose.model("User", UserSchema);

// 🔢 توليد ID بدون تكرار
async function generateId() {
  let id;
  let exists;

  do {
    id = Math.floor(100000 + Math.random() * 900000);
    exists = await User.findOne({ id });
  } while (exists);

  return id;
}

// 🟢 register
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ error: "missing data" });
    }

    let exists = await User.findOne({ email });
    if (exists) return res.json({ error: "email exists" });

    const newUser = new User({
      email,
      password,
      id: await generateId(),
      balance: 0
    });

    await newUser.save();

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
});

// 🔵 login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email, password });

    if (!user) {
      return res.json({ error: "wrong" });
    }

    res.json(user);
  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
});

// 👤 get user
app.get("/user/:id", async (req, res) => {
  try {
    let user = await User.findOne({ id: Number(req.params.id) });

    if (!user) return res.json({ error: "not found" });

    res.json(user);
  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
});

// 💰 add balance
app.post("/add-balance", async (req, res) => {
  try {
    const { id, amount } = req.body;

    let user = await User.findOne({ id: Number(id) });

    if (!user) return res.json({ error: "no user" });

    user.balance += Number(amount);
    await user.save();

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
});

// 🏠 الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🚀 تشغيل السيرفر
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
