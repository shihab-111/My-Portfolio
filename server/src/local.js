import "dotenv/config";
import app from "./app.js";
import connectDB from "./db.js";

const PORT = process.env.PORT || 4000;

// Local development only. On Vercel, api/index.js is the entry point and
// nothing listens on a port.
const missing = ["MONGODB_URI", "JWT_SECRET"].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(", ")}. Copy .env.example to .env.`);
  process.exit(1);
}

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });
