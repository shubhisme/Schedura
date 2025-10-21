// backend/server.js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";
import dayjs from "dayjs";
import { createClient } from '@supabase/supabase-js'
dotenv.config();



const app = express();
app.use(cors());
app.use(express.json());

// Replace these with your environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // e.g. https://api.example.com/integrations/google/callback

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)


// Step 1 - Generate Google OAuth URL
app.get("/integrations/google/connect", (req, res) => {
  const { userid } = req.query;
  if (!userid) return res.status(400).send("Please provide user id");
  const scopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar",
  ].join(" ");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code&scope=${encodeURIComponent(
    scopes
  )}&access_type=offline&prompt=consent&state=${userid}`;

  res.json({ url: authUrl });
});

// Step 2 - Handle Google redirect
app.get("/integrations/google/callback", async (req, res) => {
  const { code, state } = req.query;
  const userid = state; // state param is user id
  if (!code || !userid) return res.status(400).send("Missing authorization code or user id.");

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });

    const { refresh_token } = tokenRes.data;

    // Save refresh_token securely (DB)
    await supabase.from("user_integrations").upsert([
      {
        user_id: userid,
        provider: "google",
        connected: true,
        refresh_token,
      }
    ], { onConflict: ['user_id', 'provider'] });

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
app.post("/integrations/google/disconnect", async (req, res) => {
  const { userid } = req.query;
  if (!userid) return res.status(400).json({ error: "Missing user id" });
  await supabase.from("user_integrations").update({
    connected: false,
    refresh_token: null
  }).eq("user_id", userid).eq("provider", "google");
  res.json({ success: true });
});

// Step 4 - Check integration status
app.get("/integrations/status", async (req, res) => {
  const { userid } = req.query;
  if (!userid) return res.status(400).json({ error: "Missing user id" });
  const { data, error } = await supabase
    .from("user_integrations")
    .select("connected")
    .eq("user_id", userid)
    .eq("provider", "google")
    .single();
  res.json({
    google: !!data?.connected,
  });
});

// Step 5 - Refresh access token using stored refresh_token
async function getAccessToken(refresh_token) {
  const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token,
    grant_type: "refresh_token",
  });
  return tokenRes.data.access_token;
}

// Step 6 - Create Google Calendar Event
app.post("/calendar/add", async (req, res) => {
  try {
    const { userid, title, description, startTime, endTime } = req.body;
    if (!userid) return res.status(400).json({ error: "Missing user id" });

    // Get user's integration info
    const { data: integration } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", userid)
      .eq("provider", "google")
      .single();

    if (!integration || !integration.connected || !integration.refresh_token) {
      return res.status(400).json({ error: "Google Calendar not connected" });
    }

    // Refresh access token
    const accessToken = await getAccessToken(integration.refresh_token);

    // Create event body
    const event = {
      summary: title,
      description,
      start: {
        dateTime: dayjs(startTime).toISOString(),
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: dayjs(endTime).toISOString(),
        timeZone: "Asia/Kolkata",
      },
    };

    // Send to Google Calendar
    const googleRes = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      event,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, eventId: googleRes.data.id });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create event" });
  }
});

app.listen(5000, () =>
  console.log("✅ Backend running on http://localhost:5000")
);
