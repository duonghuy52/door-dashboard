import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

/* ================== CONNECT MONGODB ================== */
if (!mongoose.connection.readyState) {
  await mongoose.connect(MONGO_URI);
}

/* ================== SCHEMA ================== */
const LogSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: ["OPEN", "CLOSE"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

/* ================== MODEL ================== */
const Log = mongoose.models.Log || mongoose.model("Log", LogSchema);

/* ================== API HANDLER ================== */
export default async function handler(req, res) {

  // ===== POST: LƯU TRẠNG THÁI CỬA =====
  if (req.method === "POST") {
    try {
      const { state } = req.body;

      if (!["OPEN", "CLOSE"].includes(state)) {
        return res.status(400).json({ error: "Invalid state" });
      }

      await Log.create({ state });

      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ===== GET: LẤY TRẠNG THÁI MỚI NHẤT =====
  if (req.method === "GET") {
    try {
      const last = await Log.findOne().sort({ timestamp: -1 });

      return res.json({
        state: last ? last.state : "UNKNOWN",
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ===== METHOD KHÁC =====
  res.status(405).json({ error: "Method Not Allowed" });
}
