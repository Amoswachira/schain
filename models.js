const mongoose = require('mongoose');
const connectDB = require('./db');

// Connect to the database
connectDB();

const supplyChainItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String },
  price: { type: Number },
  referenceData: { type: mongoose.Schema.Types.Mixed },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
});

const eventSchema = new mongoose.Schema({
  location: { type: String, required: true },
  custodian: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const SupplyChainItem = mongoose.model('SupplyChainItem', supplyChainItemSchema);
const Event = mongoose.model('Event', eventSchema);

module.exports = { SupplyChainItem, Event };
