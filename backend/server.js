
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

// ---- Initialize Firebase ----
const serviceAccount = require("../serviceAccountKey.json"); // local only, not in GitHub

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ---- Setup Express ----
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---- Test Route ----
app.get("/", (req, res) => {
  res.send("Amala Atlas Backend is running ✅");
});

// ---- GET all spots ----
app.get("/spots", async (req, res) => {
  try {
    const snapshot = await db.collection("amala_spots").get();
    const spots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(spots);
  } catch (err) {
    console.error("Error fetching spots:", err);
    res.status(500).json({ error: "Failed to fetch spots" });
  }
});

// ---- POST new spot ----
app.post("/spot", async (req, res) => {
  try {
    const { name, address, location, images, discovery_source } = req.body;

    if (!name || !address) {
      return res.status(400).json({ error: "Name and address are required" });
    }

    const newSpot = {
      name,
      address,
      location: location || null,
      status: "proposed",
      crowdsourced_score: 0,
      images: images || [],
      discovery_source: discovery_source || "manual",
      created_at: new Date(),
    };

    const docRef = await db.collection("amala_spots").add(newSpot);
    res.status(201).json({ id: docRef.id, ...newSpot });
  } catch (err) {
    console.error("Error adding spot:", err);
    res.status(500).json({ error: "Failed to add spot" });
  }
});

// ---- Start Server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
