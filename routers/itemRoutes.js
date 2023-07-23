
const express = require('express');
const router = express.Router();
const Item = require('../models/items');

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single item
router.get('/:id', getItem, (req, res) => {
  res.json(res.item);
});

// Create item
router.post('/',
  async (req, res) => {
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      owner: req.user.id
    });
    try {
      const newItem = await item.save();
      res.status(201).json(newItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Update item
router.put('/:id', getItem, async (req, res) => {
  if (req.body.name != null) {
    res.item.name = req.body.name;
  }
  if (req.body.description != null) {
    res.item.description = req.body.description;
  }
  if (req.body.price != null) {
    res.item.price = req.body.price;
  }
  try {
    const updatedItem = await res.item.save();
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete item
router.delete('/:id', getItem, async (req, res) => {
  try {
    await res.item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search items
router.post('/search', async (req, res) => {
  try {
    const regex = new RegExp(req.body.search, 'i');
    const items = await Item.find({
      $or: [{ name: regex }, { description: regex }],
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getItem(req, res, next) {
  let item;
  try {
    item = await Item.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: 'Item not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.item = item;
  next();
}

module.exports = router;
