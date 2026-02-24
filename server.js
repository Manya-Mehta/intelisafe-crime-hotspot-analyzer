//  Setup 
import Crime from "./models/Crime.js"; // or require if using CommonJS

const fetch = require("node-fetch");
const express = require("express");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const multer = require("multer");
const csv = require("csvtojson");
const fs = require("fs");

const app = express();
const PORT = 3000;

//  Middleware 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false }, // secure: true only on HTTPS
  })
);

//  MongoDB Connection 
mongoose
  .connect("mongodb://127.0.0.1:27017/crime_dashboard", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

//  Schemas & Models 
// Reports (user-submitted incidents)
const reportSchema = new mongoose.Schema(
  {
    crimeType: { type: String, required: true },
    incidentDate: { type: Date, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    locationDesc: { type: String, required: true },
    description: { type: String, required: true },
    witnessContact: String,
    reporterContact: String,
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "investigating", "resolved"],
    },
  },
  { timestamps: true }
);
const Report = mongoose.model("Report", reportSchema);

// Crime dataset 
const crimeRecordSchema = new mongoose.Schema({}, { strict: false });
const CrimeRecord = mongoose.model("CrimeRecord", crimeRecordSchema);

// Demo Users 
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123"; 

const POLICE_USER = "police";
const POLICE_PASS = "Police123"; 

//  Routes: Pages 
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "user_dashboard.html"));
});

app.get("/admin_dashboard.html", (req, res) => {
  if (req.session.isAdmin) {
    res.sendFile(path.join(__dirname, "public", "admin_dashboard.html"));
  } else {
    res.redirect("/error.html");
  }
});

app.get("/police_dashboard.html", (req, res) => {
  if (req.session.isPolice) {
    res.sendFile(path.join(__dirname, "public", "police_dashboard.html"));
  } else {
    res.redirect("/error.html");
  }
});

app.get("/error.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "error.html"));
});

// Auth APIs 
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.json({ success: true, role: "admin" });
  }

  res.json({ success: false, message: "Invalid username or password" });
});

app.post("/api/police_login", (req, res) => {
  const { username, password } = req.body;

  if (username === POLICE_USER && password === POLICE_PASS) {
    req.session.isPolice = true;
    return res.json({ success: true, role: "police" });
  }

  res.json({ success: false, message: "Invalid username or password" });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

//  Reports API 
// Submit a new report (with auto geocoding)
app.post("/api/reports", async (req, res) => {
  try {
    let { crimeType, incidentDate, latitude, longitude, locationDesc, description, witnessContact, reporterContact } = req.body;

    // Validate required fields
    if (!crimeType || !incidentDate || !locationDesc || !description) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // Convert latitude/longitude to numbers if provided
    latitude = latitude !== undefined ? parseFloat(latitude) : null;
    longitude = longitude !== undefined ? parseFloat(longitude) : null;

    // Auto-geocode if lat/lng not provided
    if ((!latitude || !longitude) && locationDesc) {
      try {
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationDesc)}`
        );
        const geoData = await geoRes.json();
        if (geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat);
          longitude = parseFloat(geoData[0].lon);
        }
      } catch (geoErr) {
        console.error("Geocoding failed:", geoErr.message);
      }
    }

    // Ensure lat/lng exists to satisfy schema
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required." });
    }

    const report = new Report({
      crimeType,
      incidentDate: new Date(incidentDate),
      latitude,
      longitude,
      locationDesc,
      description,
      witnessContact,
      reporterContact,
      status: "pending",
    });

    await report.save();
    res.json({ success: true, report });
  } catch (err) {
    console.error("Error saving report:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin Dataset Upload 
const upload = multer({ dest: path.join(__dirname, "uploads") });

const coerceNumbers = (row) => {
  const out = { ...row };
  if (out["STATE/UT"]) out.STATE_UT = out["STATE/UT"];

  for (const key of Object.keys(out)) {
    const val = out[key];
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) out[key] = Number(trimmed);
      if (key.toUpperCase() === "YEAR" && /^\d{4}$/.test(trimmed)) {
        out[key] = parseInt(trimmed, 10);
      }
    }
  }
  return out;
};

app.post("/api/admin/upload-dataset", upload.single("dataset"), async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ success: false, message: "Unauthorized (admin only)" });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const filePath = req.file.path;

  try {
    const rows = await csv({ trim: true, ignoreEmpty: true }).fromFile(filePath);

    if (!rows.length) {
      fs.unlink(filePath, () => {});
      return res.json({ success: false, message: "CSV is empty or invalid." });
    }

    const prepared = rows.map(coerceNumbers);

    await CrimeRecord.insertMany(prepared, { ordered: false });

    const count = await CrimeRecord.countDocuments();

    res.json({
      success: true,
      message: `Dataset uploaded successfully. Inserted ${prepared.length} records.`,
      totalRecords: count,
    });
  } catch (error) {
    console.error("Dataset upload error:", error);
    res.status(500).json({ success: false, message: "Failed to process dataset", error: error.message });
  } finally {
    fs.unlink(filePath, () => {});
  }
});

app.get("/api/admin/dataset/stats", async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  try {
    const total = await CrimeRecord.countDocuments();
    const years = await CrimeRecord.aggregate([
      { $group: { _id: null, minYear: { $min: "$YEAR" }, maxYear: { $max: "$YEAR" } } },
    ]);
    const { minYear, maxYear } = years[0] || {};
    res.json({ success: true, total, minYear, maxYear });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/admin/dataset/preview", async (req, res) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  try {
    const docs = await CrimeRecord.find().limit(10);
    res.json({ success: true, data: docs });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// GET all user-submitted crime reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: err.message });
  }
});

// Police Dashboard API: Get all crimes with coordinates
app.get("/api/crimes", async (req, res) => {
  try {
    const reports = await Report.find({ latitude: { $exists: true }, longitude: { $exists: true } }).lean();

    const crimes = reports.map(r => ({
      _id: r._id,
      crimeType: r.crimeType,
      date: r.incidentDate,
      address: r.locationDesc || 'Unknown',
      latitude: r.latitude,
      longitude: r.longitude,
      severity: 1
    }));

    res.json(crimes);
  } catch (err) {
    console.error("Error fetching crimes:", err);
    res.status(500).json({ error: err.message });
  }
});

// Start Server 
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
