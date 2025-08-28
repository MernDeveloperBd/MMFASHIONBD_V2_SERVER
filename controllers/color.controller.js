import ProductColorModel from "../models/productColor.model.js";


// Product Color
export async function createProductColor(request, response) {
    try {
        let productColor = new ProductColorModel({
            name : request.body.name
        })
         productColor = await productColor.save();

        if (!productColor) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product Color not created"
            });
        }
        return response.status(200).json({
            message: "Product Color Created Successfully",
            error: false,
            success: true,
            productColor
        });
    } catch (error) {
         response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
// delete product Color
export async function deleteProductColor(request, response){
    const productColor = await ProductColorModel.findById(request.params.id)
     if (!productColor) {
        return response.status(404).json({
            message: "Product Color not found",
            success: false,
            error: true
        })
    }
    const deletedProductColor = await ProductColorModel.findByIdAndDelete(request.params.id);
    if (!deletedProductColor) {
        response.status(404).json({
            message: "Product Color not Deleted",
            success: false,
            error: true
        })
    }
  return response.status(200).json({
        message: "Product Color Deleted",
        success: true,
        error: false
    })
}

// update product size
export async function updateProductColor(request, response) {
    try {
        const productColor = await ProductColorModel.findByIdAndUpdate(
            request.params.id, 
            {
                name: request.body.name
            },
            {
                new: true
            }
        )
        if(!productColor){
            return response.status(404).json({
                message: "Product Color can not be Updated",
                success: false,
                error: true
            })
        }
        return response.status(200).json({
                message: "Product Color is Updated",
                success: true,
                error: false,
                data: productColor
            })
    } catch (error) {
          response.status(500).json({
                message: "Product Color not Updated",
                success: false,
                error: true
            })
    }
    
}

// delete multiple product size
export async function deleteProductMultipleColor(request, response){
    const {ids} = request.body;
    if(!ids || !Array.isArray(ids)){
        return response.status(400).json({ error: true, success: false, message: 'invalid input' })
    }

     try {
            await ProductColorModel.deleteMany({ _id: { $in: ids } })
            return response.status(200).json({
                message: "Product color Deleted successfully ",
                success: true,
                error: false
            })
        } catch (error) {
            return response.status(500).json({
                message: "Product color not Deleted",
                success: false,
                error: true
            })
        }
}

// get product size
export async function getProductColor(request, response) {
    try {
        const productColor = await ProductColorModel.find()
          if(!productColor){
            return response.status(500).json({
                message: "Product Color can not be Updated",
                success: false,
                error: true
            })
        }
         return response.status(200).json({
                message: "Product Color found",
                success: true,
                error: false,
                data: productColor
            })
    } catch (error) {
           return response.status(500).json({
                message: "Product Color not founded",
                success: false,
                error: true
            })
    }
}


// get product size by id
export async function getProductColorById(request, response) {
    try {
        const productColor = await ProductColorModel.findById(request.params.id)
          if(!productColor){
            return response.status(500).json({
                message: "Product color can not be Updated",
                success: false,
                error: true
            })
        }
         return response.status(200).json({
                message: "Product color found",
                success: true,
                error: false,
                data: productColor
            })
    } catch (error) {
           return response.status(500).json({
                message: "Product color not founded",
                success: false,
                error: true
            })
    }
}