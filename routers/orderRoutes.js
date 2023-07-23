const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const Order = require('../models/orders');
const Item = require('../models/items');

// Get all orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', authMiddleware, async (req, res) => {
  const { items, shippingAddress, totalPrice } = req.body;

  if (!items || !shippingAddress || !totalPrice) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Find all items in the order and check if they are in stock
    const products = await Item.find({ _id: { $in: items.map((item) => item.item) } });
    const outOfStockItems = products.filter((product) => {
      const orderItem = items.find((item) => item.item == product._id.toString());
      return product.countInStock - orderItem.quantity < 0;
    });


    if (outOfStockItems.length) {
      return res.status(400).json({ message: `The following products are out of stock: ${outOfStockItems.map((p) => p.name).join(', ')}` });
    }

    // Create new order
    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      totalPrice,
    });

    // Save the order
    const savedOrder = await order.save();

    // Update the stock of each item in the order
    for (const realItem of items) {
      const item = await Item.findById(realItem.item);
      item.countInStock -= item.quantity;
      await item.save();
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByIdAndUpdate(orderId, { $set: { status: req.body.status } });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({
      message: 'Order updated successfully',
      // updatedOrder:  order
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
