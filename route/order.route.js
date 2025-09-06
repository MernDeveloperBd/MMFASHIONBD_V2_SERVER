import { Router } from 'express';
import auth from '../middleware/auth.js';
import { cancelOrderController, createOrderController, getMyOrdersController } from '../controllers/order.controller.js';

const orderRouter = Router();

orderRouter.post('/', auth, createOrderController);  // place order
orderRouter.get('/my', auth, getMyOrdersController); // my orders
orderRouter.delete('/:id', auth, cancelOrderController);

export default orderRouter;