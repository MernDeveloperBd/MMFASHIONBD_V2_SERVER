import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productTitle: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subTotal: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  items: { type: [OrderItemSchema], required: true },

  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    address: String,
    apartment: String,
    postcode: String,
    divisionKey: String,
    divisionLabel: String,
    districtKey: String,
    districtLabel: String,
    upazila: String
  },

  payment: {
    method: { type: String, enum: ['COD', 'BKASH'], required: true },
    bkash: {
      number: String,
      trxId: String
    },
    receiverNumber: String, // <-- bKash receiver (snapshot)
    status: { type: String, enum: ['PENDING', 'PAID', 'COD_PENDING', 'FAILED'], default: 'PENDING' }
  },

  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },

  customerNote: { type: String, maxlength: 500 },

  status: { type: String, enum: ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: 'PLACED' }
}, { timestamps: true });

const OrderModel = mongoose.model('Order', OrderSchema);
export default OrderModel;