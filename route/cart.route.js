import { Router } from "express";
import auth from "../middleware/auth.js";
import { addToCartItemController, deleteCartItemQtyController, getCartItemController, updateCartItemQtyController } from "../controllers/cart.controller.js";

const cartRouter = Router();
cartRouter.post('/add', auth, addToCartItemController)
cartRouter.get('/cartItems', auth, getCartItemController)
cartRouter.put('/update_qty', auth, updateCartItemQtyController)
cartRouter.delete('/delete_cart_item', auth, deleteCartItemQtyController)

export default cartRouter;