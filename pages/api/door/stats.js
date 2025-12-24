import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!mongoose.connection.readyState) {
  await mongoose.connect(MONGO_URI);
}

const LogSchema = new mongoose.Schema({
  state: { type: String, enum: ["OPEN", "CLOSE"], required: true },
  timestamp: { type: Date, default: Date.now },
});

const Log = mongoose.models.Log || mongoose.model("Log", LogSchema);

export default async function handler(req, res) {
  const date = req.query.date;
  if (!date) return res.json({ success: false });

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  const logs = await Log.find({
    timestamp: { $gte: start, $lte: end }
  });

  res.json({
    success: true,
    stats: {
      opens: logs.filter(l => l.state === "OPEN").length,
      closes: logs.filter(l => l.state === "CLOSE").length
    }
  });
}
