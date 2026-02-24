// models/Crime.js
import mongoose from "mongoose";

const CrimeSchema = new mongoose.Schema({
  crimeType: { type: String, required: true, index: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true, index: "2dsphere" } // [lng, lat]
  },
  address: { type: String },
  date: { type: Date, default: Date.now, index: true },
  description: { type: String },
  status: { type: String, default: "Pending", index: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

export default mongoose.model("Crime", CrimeSchema);
