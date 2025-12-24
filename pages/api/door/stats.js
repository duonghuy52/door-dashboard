import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
if (!mongoose.connection.readyState)
  await mongoose.connect(MONGO_URI);

const Log = mongoose.models.Log;

export default async function handler(req, res) {
  const date = req.query.date;
  const start = new Date(date);
  start.setHours(0,0,0,0);
  const end = new Date(start);
  end.setHours(23,59,59,999);

  const logs = await Log.find({ timestamp: { $gte: start, $lte: end } });

  res.json({
    opens: logs.filter(l => l.state === "OPEN").length,
    closes: logs.filter(l => l.state === "CLOSE").length
  });
}
