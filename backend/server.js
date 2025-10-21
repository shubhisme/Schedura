// backend/server.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Replace these with your environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // e.g. https://api.example.com/integrations/google/callback

// Mock DB
let userIntegration = {
  google: {
    connected: false,
    refresh_token: null,
  },
};

// Step 1 - Generate Google OAuth URL
app.get("/integrations/google/connect", (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar",
  ].join(" ");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=${encodeURIComponent(
    scopes
  )}&access_type=offline&prompt=consent`;

  res.json({ url: authUrl });
});

// Step 2 - Handle Google redirect
app.get("/integrations/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing authorization code.");

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { refresh_token, access_token } = tokenRes.data;

    // Save refresh_token securely (DB)
    userIntegration.google = {
      connected: true,
      refresh_token,
    };

    // Redirect user to success page
    return res.send(
      "<h2>✅ Google Calendar connected successfully! You can close this window now.</h2>"
    );
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Failed to exchange token.");
  }
});

// Step 3 - Disconnect Google
app.post("/integrations/google/disconnect", (req, res) => {
  userIntegration.google = { connected: false, refresh_token: null };
  res.json({ success: true });
});

// Step 4 - Check integration status
app.get("/integrations/status", (req, res) => {
  res.json({
    google: userIntegration.google.connected,
  });
});

app.listen(5000, () =>
  console.log("✅ Backend running on http://localhost:5000")
);
