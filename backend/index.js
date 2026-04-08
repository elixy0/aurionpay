import "dotenv/config";
import express from "express";
import cors    from "cors";
import { createRelayerRouter } from "./relayer/router.js";
import { createAIRouter }      from "./ai/router.js";
import { createHSPRouter }     from "./hsp/router.js";

const app = express();

const allowedOrigins = [
  "https://aurionpay-hash.vercel.app",
  "https://aurionpay.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith(".vercel.app")) return callback(null, true);
    console.warn("CORS blocked origin:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  methods:          ["GET", "POST", "OPTIONS"],
  allowedHeaders:   ["Content-Type", "Authorization"],
  credentials:      true,
  optionsSuccessStatus: 200,
}));

app.options("*", cors());

app.use(express.json());

app.get("/health", (_, res) => res.json({
  status:  "ok",
  service: "AurionPay Backend",
  network: "HashKey Chain Testnet (Chain ID 133)",
}));

app.use("/relayer", createRelayerRouter());
app.use("/ai",      createAIRouter());
app.use("/hsp",     createHSPRouter());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AurionPay backend running on port ${PORT}`);
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_URL) {
    setInterval(() => {
      fetch(`${RENDER_URL}/health`).catch(() => {});
    }, 10 * 60 * 1000);
    console.log(`Keep-alive: ${RENDER_URL}/health`);
  }
});