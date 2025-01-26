// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Define the Beneficiary model
const beneficiarySchema = new mongoose.Schema({
  cnic: String,
  name: String,
  phone: String,
  address: String,
  purpose: String,
  status: { type: String, default: "Pending" },
});
const Beneficiary = mongoose.model("Beneficiary", beneficiarySchema);

// Routes

// Save a new beneficiary
app.post("/register", async (req, res) => {
  const { cnic, name, phone, address, purpose } = req.body;
  
  const newBeneficiary = new Beneficiary({
    cnic,
    name,
    phone,
    address,
    purpose,
  });

  try {
    const savedBeneficiary = await newBeneficiary.save();
    res.status(201).json(savedBeneficiary);
  } catch (error) {
    res.status(500).json({ message: "Error saving beneficiary data", error });
  }
});

// Get all beneficiaries
app.get("/beneficiaries", async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find();
    res.status(200).json(beneficiaries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching beneficiaries", error });
  }
});

// Search beneficiaries
app.get("/search", async (req, res) => {
  const { query } = req.query;
  
  try {
    const beneficiaries = await Beneficiary.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { cnic: { $regex: query, $options: "i" } },
        { phone: { $regex: query, $options: "i" } }
      ]
    });
    res.status(200).json(beneficiaries);
  } catch (error) {
    res.status(500).json({ message: "Error searching beneficiaries", error });
  }
});

// Update beneficiary status
app.put("/beneficiary/:id", async (req, res) => {
  const { status } = req.body;
  try {
    const updatedBeneficiary = await Beneficiary.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json(updatedBeneficiary);
  } catch (error) {
    res.status(500).json({ message: "Error updating beneficiary status", error });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
