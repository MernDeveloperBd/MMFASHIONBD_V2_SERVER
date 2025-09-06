import mongoose from 'mongoose';
import OrderModel from '../models/order.model.js';
import cartProductModel from '../models/cart.model.js';
import ProductModel from '../models/product.model.js';

import { sendOrderEmails } from '../utils/email.js';

// Generate human-friendly order code: DDMMYYYY-HHmmss
function generateOrderCode(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${dd}${mm}${yyyy}-${hh}${mi}${ss}`;
}
// Compute totals (server authoritative)
function computeTotals(items = [], shippingAddress = {}) {
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
    0
  );

  const discount = subtotal > 3000 ? Math.round(subtotal * 0.1) : 0;

  const insideDhaka = String(shippingAddress?.districtLabel || '')
    .toLowerCase()
    .includes('dhaka');

  const shipping = subtotal > 5000 ? 0 : insideDhaka ? 80 : 140;

  const total = Math.max(0, subtotal - discount + shipping);
  return { subtotal, discount, shipping, total, insideDhaka };
}


export const createOrderController = async (req, res) => {
  const userId = req.userId;
  try {
    const { shippingAddress, payment, customerNote } = req.body;

    if (!shippingAddress || !payment?.method) {
      return res.status(400).json({ message: 'Missing shippingAddress or payment method', error: true, success: false });
    }
    if (payment.method === 'BKASH') {
      if (!payment.bkash?.number || !payment.bkash?.trxId) {
        return res.status(400).json({ message: 'bKash number and transaction ID are required', error: true, success: false });
      }
    }

    const cartItems = await cartProductModel.find({ userId }).lean();
    if (!cartItems.length) {
      return res.status(400).json({ message: 'Your cart is empty', error: true, success: false });
    }

    // Compute totals
    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
    const discount = subtotal > 3000 ? Math.round(subtotal * 0.10) : 0;
    const insideDhaka = (shippingAddress?.districtLabel || '').toLowerCase().includes('dhaka');
    const shipping = subtotal > 5000 ? 0 : (insideDhaka ? 80 : 140);
    const total = Math.max(0, subtotal - discount + shipping);

    const items = cartItems.map(ci => ({
      productId: ci.productId,
      productTitle: ci.productTitle,
      image: ci.image,
      price: ci.price,
      quantity: ci.quantity,
      subTotal: Number(ci.price) * Number(ci.quantity)
    }));

    const BKASH_RECEIVER_NUMBER = process.env.BKASH_RECEIVER_NUMBER || '';

    // Generate human-friendly order code
    const orderCode = generateOrderCode();

    const session = await mongoose.startSession();
    session.startTransaction();

    let orderDoc;
    try {
      // Decrement stock
      for (const ci of cartItems) {
        const updated = await ProductModel.findOneAndUpdate(
          { _id: ci.productId, countInStock: { $gte: ci.quantity } },
          { $inc: { countInStock: -ci.quantity } },
          { new: true, session }
        );
        if (!updated) throw new Error(`Insufficient stock for product: ${ci.productTitle}`);
      }

      // Create order
      const [created] = await OrderModel.create([{
        orderCode,
        userId,
        items,
        shippingAddress,
        payment: {
          method: payment.method,
          bkash: payment.method === 'BKASH' ? payment.bkash : undefined,
          receiverNumber: payment.method === 'BKASH' ? BKASH_RECEIVER_NUMBER : undefined,
          status: payment.method === 'BKASH' ? 'PENDING' : 'COD_PENDING'
        },
        pricing: { subtotal, discount, shipping, total },
        customerNote: (customerNote || '').toString().trim().slice(0, 500),
        status: 'PLACED'
      }], { session });
      orderDoc = created;

      // Clear cart
      await cartProductModel.deleteMany({ userId }).session(session);

      await session.commitTransaction();
      session.endSession();
    } catch (innerErr) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: innerErr.message || 'Failed to place order', error: true, success: false });
    }

    // Send emails (await for reliable dev)
    let emailMeta = null;
    try {
      emailMeta = await sendOrderEmails(orderDoc);
    } catch (mailErr) {
      console.error('Order email failed:', mailErr);
    }

    return res.status(201).json({
      message: 'Order placed successfully',
      error: false,
      success: true,
      data: orderDoc,
      email: emailMeta
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || err, error: true, success: false });
  }
};

export const getMyOrdersController = async (req, res) => {
  const userId = req.userId;
  try {
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ data: orders, error: false, success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message || err, error: true, success: false });
  }
};

export const cancelOrderController = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Order id required', error: true, success: false });
  }

  try {
    const order = await OrderModel.findOne({ _id: id, userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found', error: true, success: false });
    }

    if (order.status === 'DELIVERED') {
      return res.status(400).json({ message: 'Delivered order cannot be cancelled', error: true, success: false });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const it of order.items) {
        await ProductModel.updateOne(
          { _id: it.productId },
          { $inc: { countInStock: Number(it.quantity) } },
          { session }
        );
      }

      await OrderModel.deleteOne({ _id: order._id, userId }, { session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        message: 'Order cancelled and removed',
        error: false,
        success: true
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return res.status(500).json({ message: err.message || err, error: true, success: false });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message || err, error: true, success: false });
  }
};