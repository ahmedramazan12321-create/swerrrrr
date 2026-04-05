const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname)));

mongoose.connect("mongodb+srv://ahmedramazan12321_db_user:12345678Aa323@cluster0.qtdzrfm.mongodb.net/myapp?retryWrites=true&w=majority")
.then(() => console.log("MongoDB connected ✅"))
.catch(err => console.log("Mongo error:", err));

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  id: { type: Number, unique: true },
  balance: { type: Number, default: 0 },

  initialDeposit: { type: Number, default: 0 },
  timerEnd: { type: Number, default: 0 }
});

const User = mongoose.model("User", UserSchema);

// ID
async function generateId() {
  let id;
  let exists;

  do {
    id = Math.floor(100000 + Math.random() * 900000);
    exists = await User.findOne({ id });
  } while (exists);

  return id;
}

// REGISTER
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
      balance: 0,
      initialDeposit: 0,
      timerEnd: 0
    });

    await newUser.save();

    res.json({ success: true, id: newUser.id });

  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
});

// LOGIN
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

// GET USER
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

// 🔥 ADD BALANCE
app.post("/add-balance", async (req, res) => {
  try {
    const { id, amount } = req.body;

    let user = await User.findOne({ id: Number(id) });

    if (!user) return res.json({ error: "no user" });

    // أول إيداع
    if (user.initialDeposit === 0 && amount > 0) {
      user.initialDeposit = Number(amount);
    }

    user.balance += Number(amount);

    // تشغيل التايمر إذا متوقف
    if (!user.timerEnd || user.timerEnd < Date.now()) {
      user.timerEnd = Date.now() + 24 * 60 * 60 * 1000;
    }

    await user.save();

    res.json({
      success: true,
      balance: user.balance,
      timerEnd: user.timerEnd
    });

  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
});

// 🔥 CLAIM (خارج add-balance)
app.post("/claim", async (req, res) => {
  try {
    const { id } = req.body;

    let user = await User.findOne({ id: Number(id) });

    if (!user) return res.json({ error: "no user" });

    if (!user.timerEnd || Date.now() < user.timerEnd) {
      return res.json({ error: "timer not finished" });
    }

    let profit = user.initialDeposit * 0.2;

    user.balance += profit;

    user.timerEnd = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    res.json({
      success: true,
      balance: user.balance,
      timerEnd: user.timerEnd
    });

  } catch (err) {
    console.log(err);
    res.json({ error: "server error" });
  }
});

// HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// START
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
