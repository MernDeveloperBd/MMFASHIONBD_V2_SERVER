
import cartProductModal from "../models/cart.model.js";

// Add to cart 
export const addToCartItemController = async (request, response) => {
    try {
        const userId = request.userId;
        const { productTitle, image, rating, price,oldPrice, productSize,productColor,brand, quantity, subTotal, countInStock, productId } = request.body;
        if (!productId) {
            return response.status(402).json({
                message: "Provide productId",
                error: true,
                success: false
            })
        };

            // ✅ quantity check
        if (quantity > countInStock) {
            return response.status(400).json({
                message: `Only ${countInStock} items in stock, you cannot add ${quantity}.`,
                error: true,
                success: false
            });
        }


        const checkItemCart = await cartProductModal.findOne({
            userId: userId,
            productId: productId
        })
        if (checkItemCart) {
            return response.status(400).json({
                message: "Item already in cart"
            })
        }
        const cartItem = new cartProductModal({
            productTitle: productTitle,
            image: image,
            rating: rating,
            price: price,
            oldPrice: oldPrice,
            quantity: quantity,
            brand: brand,
            subTotal: subTotal,
            productSize: productSize,
            productColor: productColor,
            productId: productId,
            countInStock: countInStock,
            userId: userId
        })
        const save = await cartItem.save();

        return response.status(200).json({
            data: save,
            message: "Item added successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// get cart item controller
export const getCartItemController = async (request, response) => {
    try {
        const userId = request.userId;
        const cartItems = await cartProductModal.find({
            userId: userId,
        })

        return response.status(200).json({
            data: cartItems,
            error: false,
            success: true
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// update cart item controller
export const updateCartItemQtyController = async (request, response) => {
    try {
        const userId = request.userId;
        const { _id, qty, subTotal } = request.body;
        if (!_id || !qty) {
            return response.status(400).json({
                message: "Provide _id, qty"
            })
        }
        
        const updatedCartItem = await cartProductModal.updateOne({
            _id: _id,
            userId: userId,
        },
            {
                quantity: qty,
                subTotal: subTotal
            },
            {
                new: true
            }
        )
        return response.json({
            message: "Update cart items",
            error: false,
            success: true,
            data: updatedCartItem
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Delete cart item controller
export const deleteCartItemQtyController = async (request, response) => {
    try {
        const userId = request.userId;
        const { id } = request.params;
        console.log(id);

        if (!id) {
            return response.status(400).json({
                message: "Provide _id",
                error: true,
                success: false
            })
        }
        const deleteCartItem = await cartProductModal.deleteOne({ _id: id, userId: userId })
        if (!deleteCartItem) {
            return response.status(404).json({
                message: "The product in the cart is not found",
                error: true,
                success: false
            })
        }

        return response.status(200).json({
            message: "Item removed",
            error: false,
            success: true,
            data: deleteCartItem
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}