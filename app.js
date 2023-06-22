const express = require('express');
const { validateSupplyChainItem, validateEvent } = require('./jsonSchema');
const { SupplyChainItem, Event } = require('./models');
const connectDB = require('./db');

const app = express();

// Connect to the database
connectDB();

// Create a new supply chain item
app.post('/items', (req, res) => {
  const newItem = req.body;

  // Validate the request payload using JSON Schema
  const isValid = validateSupplyChainItem(newItem);
  if (!isValid) {
    const errors = validateSupplyChainItem.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  // Save the new item to the database
  SupplyChainItem.create(newItem)
    .then((createdItem) => {
      res.status(201).json(createdItem);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to create the item' });
    });
});


// Get all items
app.get('/items', (req, res) => {
    SupplyChainItem.find()
      .then((items) => {
        res.json(items);
      })
      .catch((error) => {
        res.status(500).json({ error: 'Failed to retrieve items' });
      });
  });

// Update supply chain item reference data
app.put('/items/:itemId', (req, res) => {
  const itemId = req.params.itemId;
  const updatedData = req.body;

  // Validate the request payload using JSON Schema
  const isValid = validateSupplyChainItem(updatedData);
  if (!isValid) {
    const errors = validateSupplyChainItem.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  // Update the item in the database
  SupplyChainItem.findByIdAndUpdate(itemId, updatedData, { new: true })
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(updatedItem);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to update the item' });
    });
});

// Add new events associated with an item
app.post('/items/:itemId/events', (req, res) => {
  const itemId = req.params.itemId;
  const newEvent = req.body;

  // Validate the request payload using JSON Schema
  const isValid = validateEvent(newEvent);
  if (!isValid) {
    const errors = validateEvent.errors.map((error) => error.message);
    return res.status(400).json({ errors });
  }

  // Save the new event to the database
  Event.create(newEvent)
    .then((createdEvent) => {
      // Update the item with the new event
      return SupplyChainItem.findByIdAndUpdate(
        itemId,
        { $push: { events: createdEvent._id } },
        { new: true }
      );
    })
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.status(201).json(updatedItem);
    })
    .catch((error) => {
      res.status(500).json({ error: 'Failed to add the event' });
    });
});

// Query all events of an item
app.get('/items/:itemId/events', (req, res) => {
  const itemId = req.params.itemId;

  // Retrieve the item and populate its events
  SupplyChainItem.findById(itemId)
    .populate('events')
    .exec()
    .then((item) => {
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item.events);
    })
    .catch((error) => {
        console.log('error>>>>',error);
      res.status(500).json({ error: 'Failed to retrieve events' });
    });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
