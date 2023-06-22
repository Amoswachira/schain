const Ajv = require('ajv');
const addFormats = require('ajv-formats').default;

const ajv = new Ajv();
addFormats(ajv);

// JSON schema for validating supply chain item
const supplyChainItemSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    color: { type: 'string' },
    price: { type: 'number' },
  },
  required: ['name'],
  additionalProperties: false,
};

// JSON schema for validating event
const eventSchema = {
  type: 'object',
  properties: {
    location: { type: 'string' },
    custodian: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
  },
  required: ['location', 'custodian'],
  additionalProperties: false,
};

const validateSupplyChainItem = ajv.compile(supplyChainItemSchema);
const validateEvent = ajv.compile(eventSchema);

module.exports = {
  validateSupplyChainItem,
  validateEvent,
};
