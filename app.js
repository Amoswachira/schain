const express = require('express');
const { validateSupplyChainItem, validateEvent } = require('./jsonSchema');
const { SupplyChainItem, Event } = require('./models');
const connectDB = require('./db');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Connect to the database
connectDB();


// Swagger options
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Supply Chain API',
        version: '1.0.0',
        description: 'API for tracking and tracing supply chain items',
      },
    },
    apis: ['app.js'],
  };
  
  const swaggerSpec = swaggerJsDoc(swaggerOptions);
  
  // Add Swagger middleware
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Swagger JSON route
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

// Create a new supply chain item
/**
 * @swagger
 * /items:
 *   post:
 *     summary: Create a new supply chain item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplyChainItem'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplyChainItem'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 */
app.post('/items', (req, res) => {
  const newItem = req.body;

  // Validate the request payload using JSON Schema
  const isValid = validateSupplyChainItem(newItem);
  if (!isValid) {
    const errors = validateSupplyChainItem.errors.map((error) => error.message);
    console.log("errror in post item",errors);
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
/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all supply chain items
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SupplyChainItem'
 */
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
/**
 * @swagger
 * /items/{itemId}:
 *   put:
 *     summary: Update supply chain item reference data
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SupplyChainItem'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplyChainItem'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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
/**
 * @swagger
 * /items/{itemId}/events:
 *   post:
 *     summary: Add new events associated with an item
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to add events to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SupplyChainItem'
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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
/**
 * @swagger
 * /items/{itemId}/events:
 *   get:
 *     summary: Query all events of an item
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to query events for
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
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

// Define schemas for validation
/**
 * @swagger
 * components:
 *   schemas:
 *     SupplyChainItem:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *        
 *     Event:
 *       type: object
 *       properties:
 *         itemId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 *        
 *     ValidationError:
 *       type: object
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             type: string
 */

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
