
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require("firebase-admin");

// ---- Initialize Firebase ----
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Prod: parse from environment variable
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local: load from file
  serviceAccount = require("../serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const db = admin.firestore();

// ---- Setup Express ----
const app = express();
const rateLimit = require("express-rate-limit");
const { body, query, validationResult } = require("express-validator");

// Rate limiter: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use(limiter);

app.use(cors());
app.use(bodyParser.json());

// ---- Test Route ----
app.get("/", (req, res) => {
  res.send("Amala Atlas Backend is running");
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
app.post(
  "/spot",
  [
    body("name").isString().isLength({ min: 2 }).withMessage("Name required"),
    body("address").isString().notEmpty().withMessage("Address required"),
    body("location").optional().custom(loc => {
      if (typeof loc !== "object" || loc === null) throw new Error("Invalid location");
      if (
        typeof loc.latitude !== "number" ||
        typeof loc.longitude !== "number" ||
        loc.latitude < -90 || loc.latitude > 90 ||
        loc.longitude < -180 || loc.longitude > 180
      ) {
        throw new Error("Invalid latitude/longitude");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, address, location, images, discovery_source } = req.body;

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
  }
);

const haversine = require("haversine-distance");

function getBoundingBox(lat, lng, radiusKm) {
  const earthRadiusKm = 6371;
  const latDelta = radiusKm / earthRadiusKm * (180 / Math.PI);
  const lngDelta =
    radiusKm / earthRadiusKm * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

app.get("/spots/near", async (req, res) => {
  try {
    let { lat, lng, radius, limit, page, onlyStatus } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng are required" });
    }

    // Defaults
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    radius = parseFloat(radius) || 5;   // km
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "lat and lng must be numbers" });
    }
    if (radius > 50) {
      return res.status(400).json({ error: "Radius too large (max 50 km)" });
    }

    // Step 1: bounding box
    const box = getBoundingBox(lat, lng, radius);

    // Step 2: Firestore query
    let query = db.collection("amala_spots")
      .where("location.latitude", ">=", box.minLat)
      .where("location.latitude", "<=", box.maxLat)
      .where("location.longitude", ">=", box.minLng)
      .where("location.longitude", "<=", box.maxLng);

    // Apply status filter only if `onlyStatus` param is provided
   
    if (onlyStatus && ["verified", "proposed"].includes(onlyStatus)) {
    query = query.where("status", "==", onlyStatus);
    }

    const snapshot = await query.get();

    let spots = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      let spotLat, spotLng;

      if (data.location) {
        if (data.location.latitude && data.location.longitude) {
          spotLat = data.location.latitude;
          spotLng = data.location.longitude;
        } else if (data.location._latitude && data.location._longitude) {
          spotLat = data.location._latitude;
          spotLng = data.location._longitude;
        }
      }

      if (spotLat && spotLng) {
        const userLoc = { lat, lon: lng };
        const spotLoc = { lat: spotLat, lon: spotLng };

        const distanceMeters = haversine(userLoc, spotLoc);
        const distanceKm = distanceMeters / 1000;

        spots.push({
          id: doc.id,
          ...data,
          distanceKm: parseFloat(distanceKm.toFixed(2)),
          status: data.status || "proposed"
        });
      }
    });

    // Step 3: sort + radius filter
    spots.sort((a, b) => a.distanceKm - b.distanceKm);
    let nearbySpots = spots.filter(s => s.distanceKm <= radius);

    // Step 4: safeguard fallback
    let response = { spots: [], note: null, fallback: false, page, total: 0 };

    if (nearbySpots.length === 0) {
      response.spots = spots;
      response.note = `No spots found within ${radius} km. Showing nearest spots instead.`;
      response.fallback = true;
    } else {
      response.spots = nearbySpots;
    }

    // Step 5: pagination
    response.total = response.spots.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    response.spots = response.spots.slice(start, end);

    res.json(response);

  } catch (err) {
    console.error("Error fetching nearby spots:", err);
    res.status(500).json({ error: "Failed to fetch nearby spots" });
  }
});

// ---- Verify a spot ----
app.post("/spot/:id/verify", async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection("amala_spots").doc(id);
    await ref.update({ status: "verified" });
    res.json({ message: "Spot verified successfully", id });
  } catch (err) {
    console.error("Error verifying spot:", err);
    res.status(500).json({ error: "Failed to verify spot" });
  }
});

// ---- Reject a spot ----
app.post("/spot/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection("amala_spots").doc(id);
    await ref.update({ status: "rejected" });
    res.json({ message: "Spot rejected successfully", id });
  } catch (err) {
    console.error("Error rejecting spot:", err);
    res.status(500).json({ error: "Failed to reject spot" });
  }
});

// ---- Get single spot ----
app.get("/spot/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("amala_spots").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Spot not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Error fetching spot:", err);
    res.status(500).json({ error: "Failed to fetch spot" });
  }
});

// ---- 404 fallback ----
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


// ---- Start Server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
