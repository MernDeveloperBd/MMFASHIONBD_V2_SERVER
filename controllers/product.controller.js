import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ProductModel from '../models/product.model.js';
import ProductSizeModel from '../models/productSize.model.js';
import { request } from 'http';

// ✅ Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
//Image upload
var imagesArr = [];
export async function uploadImagesController(req, res) {
    try {
        imagesArr = [];
        const image = req.files;

        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        for (let i = 0; i < image?.length; i++) {
            const img = await cloudinary.uploader.upload(
                image[i].path,
                options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${req.files[i].filename}`);
                }
            )
        };


        return res.status(200).json({
            images: imagesArr
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

// Create Product 
//previous
/* export async function createProduct(request, response) {
    try {

        let product = new ProductModel({
            title: request.body.name,
            description: request.body.description,
            images: imagesArr,
            brand: request.body.brand,
            shopName: request.body.shopName,
            facebookURL: request.body.facebookURL,
            price: request.body.price,
            oldPrice: request.body.oldPrice,
            resellingPrice: request.body.resellingPrice,
            catName: request.body.catName,
            catId: request.body.catId,
            subCat: request.body.subCat,
            subCatId: request.body.subCatId,
            thirdSubCat: request.body.thirdSubCat,
            thirdSubCatId: request.body.thirdSubCatId,
            category: request.body.category,
            countInStock: request.body.countInStock,
            rating: request.body.rating,
            isFeatured: request.body.isFeatured,
            discount: request.body.discount,
            size: request.body.size,
            productWeight: request.body.productWeight,
            location: request.body.location,
            dateCreated: request.body.dateCreated,
        });
        product = await product.save()
        if (!product) {
            response.status(500).json({
                error: true,
                success: false,
                message: "Product not uploaded"
            })
        }
        imagesArr = []
        response.status(200).json({
            message: "Product Uploaded Successfully",
            error: false,
            success: true,
            product: product
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
} */

export async function createProduct(req, res) {
    try {
        let product = new ProductModel({
            ...req.body,
            isFeatured: req.body.isFeatured === "true" || req.body.isFeatured === true,
            images: imagesArr,
        });

        product = await product.save();

        if (!product) {
            return res.status(500).json({
                error: true,
                success: false,
                message: "Product not uploaded"
            });
        }

        imagesArr = [];
        res.status(200).json({
            message: "Product Uploaded Successfully",
            error: false,
            success: true,
            product
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


// Get all products
export async function getAllProducts(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage);
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return res.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            })
        }
        const products = await ProductModel.find().populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!products) {
            return response.status(500).json({
                error: true,
                success: false
            })
        }
        response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// Get all products by Category id
export async function getAllProductsByCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            })
        }

        const products = await ProductModel.find({
            catId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }
        response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            totalPosts: totalPosts,
            page: page
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// Get all products by category name
export async function getAllProductsByCatName(req, res) {
    try {

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return res.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            })
        }

        const products = await ProductModel.find({
            catName: req.query.catName
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        if (!products) {
            res.status(500).json({
                error: true,
                success: false
            })
        }
        res.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get all products by Sub Category id
export async function getAllProductsBySubCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            })
        }

        const products = await ProductModel.find({
            subCatId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }
        response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// Get all products by sub category name
export async function getAllProductsBySubCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            })
        }

        const products = await ProductModel.find({
            subCat: request.query.subCat
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }
        response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// Get all products by Third level Category id
export async function getAllProductsByThirdLevelCatId(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            })
        }

        const products = await ProductModel.find({
            thirdSubCatId: request.params.id
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }
        response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// Get all products by ThirdLevel category name
export async function getAllProductsByThirdLevelCatName(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            })
        }

        const products = await ProductModel.find({
            thirdSubCat: request.query.thirdSubCat
        }).populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }
        response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// Get all products by Price
export async function getAllProductsByPrice(request, response) {
    let productList = []
    if (request.query.catId !== "" && request.query.catId !== undefined) {
        const productListArr = await ProductModel.find({
            catId: request.query.catId,
        }).populate("category");
        productList = productListArr
    }
    if (request.query.subCatId !== "" && request.query.subCatId !== undefined) {
        const productListArr = await ProductModel.find({
            subCatId: request.query.subCatId,
        }).populate("category");
        productList = productListArr
    }
    if (request.query.thirdSubCatId !== "" && request.query.thirdSubCatId !== undefined) {
        const productListArr = await ProductModel.find({
            thirdSubCatId: request.query.thirdSubCatId,
        }).populate("category");
        productList = productListArr
    }

    const filteredProducts = productList.filter((product) => {
        if (request.query.minPrice && product.price < parseInt(+request.query.minPrice)) {
            return false;
        }
        if (request.query.maxPrice && product.price > parseInt(+request.query.maxPrice)) {
            return false;
        }
        return true;
    });
    return response.status(200).json({
        error: false,
        success: true,
        products: filteredProducts,
        totalPages: 0,
        page: 0
    })

}

// Get all products by Ratings
export async function getAllProductsByRating(request, response) {
    try {

        const page = parseInt(request.query.page) || 1;
        const perPage = parseInt(request.query.perPage) || 10000;
        const totalPosts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);
        if (page > totalPages) {
            return response.status(404).json({
                message: "Page not found",
                success: false,
                error: true
            })
        }
        let products = [];
        if (request.query.catId !== undefined) {
            products = await ProductModel.find({
                rating: request.query.rating,
                catId: request.query.catId,
            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }
        if (request.query.subCatId !== undefined) {
            products = await ProductModel.find({
                rating: request.query.rating,
                subCatId: request.query.subCatId,
            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }
        if (request.query.thirdSubCat !== undefined) {
            products = await ProductModel.find({
                rating: request.query.rating,
                thirdSubCat: request.query.thirdSubCat,
            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }
        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }
        response.status(200).json({
            error: false,
            success: true,
            products: products,
            totalPages: totalPages,
            page: page
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// Get all Products Count
export async function getAllProductsCount(request, response) {
    try {
        const productsCount = await ProductModel.countDocuments();
        if (!productsCount) {
            response.status(500).json({
                error: true,
                success: false
            })
        }
        return response.status(200).json({
            error: false,
            success: true,
            productsCount: productsCount
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// Get all Featured products
export async function getAllFeaturedProducts(request, response) {
    try {

        const products = await ProductModel.find({
            isFeatured: true
        }).populate("category");
        if (!products) {
            response.status(500).json({
                error: true,
                success: false
            })
        }
        response.status(200).json({
            error: false,
            success: true,
            products: products

        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

//  Delete product
export async function deleteProduct(request, response) {
    const product = await ProductModel.findById(request.params.id).populate("category")
    if (!product) {
        return response.status(404).json({
            message: "Product not found",
            success: false,
            error: true
        })
    }
    const images = product.images;
    let img = "";
    for (img of images) {
        const imgUrl = img;
        const urlArr = imgUrl.split('/');
        const image = urlArr[urlArr.length - 1];

        const imageName = image.split(".")[0]
        if (imageName) {
            cloudinary.uploader.destroy(imageName, (error, result) => {

            })
        }
    }
    const deletedProduct = await ProductModel.findByIdAndDelete(request.params.id);
    if (!deletedProduct) {
        response.status(404).json({
            message: "Product not Deleted",
            success: false,
            error: true
        })
    }
    return response.status(200).json({
        message: "Product Deleted",
        success: true,
        error: false
    })

}

// Get all Delete Multiple product
export async function deleteMultipleProduct(request, response) {
    const { ids } = request.body;
    if (!ids || !Array.isArray(ids)) {
        return response.status(400).json({ error: true, success: false, message: 'invalid input' })
    }
    for (let i = 0; i < ids.length; i++) {
        const product = await ProductModel.findById(ids[i])
        const images = product.images;
        let img = "";
        for (img of images) {
            const imgUrl = img;
            const urlArr = imgUrl.split('/');
            const image = urlArr[urlArr.length - 1];

            const imageName = image.split(".")[0]
            if (imageName) {
                cloudinary.uploader.destroy(imageName, (error, result) => {

                })
            }
        }
        try {
            await ProductModel.deleteMany({ _id: { $in: ids } })
            return response.status(200).json({
                message: "Products Deleted successfully done",
                success: true,
                error: false
            })
        } catch (error) {
            response.status(500).json({
                message: "Product not Deleted",
                success: false,
                error: true
            })
        }
    }




}

// Get single product
export async function getSingleProduct(request, response) {
    try {
        const product = await ProductModel.findById(request.params.id).populate("category")
        if (!product) {
            return response.status(404).json({
                message: "This Product is not found",
                success: false,
                error: true
            })
        }
        return response.status(200).json({
            success: true,
            error: false,
            product: product

        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

// remove image
export async function removeImageFromCloudinary(req, res) {
    const imgUrl = req.query.img;

    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    if (imageName) {
        const result = await cloudinary.uploader.destroy(
            imageName,
            (error, result) => {

            }
        );
        if (result) {
            res.status(200).send(result)
        }
    }
}

// Updated Product
// previous
/* export async function updateProduct(request, response ){
    try {
        const product = await ProductModel.findByIdAndUpdate(
            request.params.id,
             {
              title: request.body.title,
            description: request.body.description,
            images: imagesArr,
            brand: request.body.brand,
            shopName: request.body.shopName,
            facebookURL: request.body.facebookURL,
            price: request.body.price,
            oldPrice: request.body.oldPrice,
            resellingPrice: request.body.resellingPrice,
            catName: request.body.catName,
            catId: request.body.catId,
            subCat: request.body.subCat,
            subCatId: request.body.subCatId,
            thirdSubCat: request.body.thirdSubCat,
            thirdSubCatId: request.body.thirdSubCatId,
            category: request.body.category,
            countInStock: request.body.countInStock,
            rating: request.body.rating,
            isFeatured: request.body.isFeatured,
            discount: request.body.discount,
            size: request.body.size,
            productWeight: request.body.productWeight,
            location: request.body.location,
            dateCreated: request.body.dateCreated,
        },{
            new: true
        }
        );
        if(!product){
            return response.status(404).json({
                message: "The product cannot be updated",
                status: false,
            })
        }
        imagesArr = []
        return response.status(200).json({
            message: "The product is updated",
            error: false,
            success: true,
        })
    } catch (error) {
         return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
} */
//new
export async function updateProduct(req, res) {
    try {
        const updateFields = { ...req.body };

        // Ensure images is always an array
        if (!Array.isArray(updateFields.images)) {
            updateFields.images = [];
        }

        const product = await ProductModel.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                message: "The product cannot be updated",
                success: false,
                error: true,
            });
        }

        return res.status(200).json({
            message: "The product is updated",
            success: true,
            error: false,
            product,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

// Product size
export async function createProductSize(request, response) {
    try {
        let productSize = new ProductSizeModel({
            name : request.body.name
        })
         productSize = await productSize.save();

        if (!productSize) {
            return response.status(500).json({
                error: true,
                success: false,
                message: "Product Size not created"
            });
        }
        return response.status(200).json({
            message: "Product Size Created Successfully",
            error: false,
            success: true,
            productSize
        });
    } catch (error) {
         response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
// delete product size
export async function deleteProductSize(request, response){
    const productSize = await ProductSizeModel.findById(request.params.id)
     if (!productSize) {
        return response.status(404).json({
            message: "Product size not found",
            success: false,
            error: true
        })
    }
    const deletedProductSize = await ProductSizeModel.findByIdAndDelete(request.params.id);
    if (!deletedProductSize) {
        response.status(404).json({
            message: "Product size not Deleted",
            success: false,
            error: true
        })
    }
  return response.status(200).json({
        message: "Product size Deleted",
        success: true,
        error: false
    })
}

// update product size
export async function updateProductSize(request, response) {
    try {
        const productSize = await ProductSizeModel.findByIdAndUpdate(
            request.params.id, 
            {
                name: request.body.name
            },
            {
                new: true
            }
        )
        if(!productSize){
            return response.status(404).json({
                message: "Product size can not be Updated",
                success: false,
                error: true
            })
        }
        return response.status(200).json({
                message: "Product size is Updated",
                success: true,
                error: false,
                data: productSize
            })
    } catch (error) {
          response.status(500).json({
                message: "Product size not Updated",
                success: false,
                error: true
            })
    }
    
}

// delete multiple product size
export async function deleteProductMultipleSize(request, response){
    const {ids} = request.body;
    if(!ids || !Array.isArray(ids)){
        return response.status(400).json({ error: true, success: false, message: 'invalid input' })
    }

     try {
            await ProductSizeModel.deleteMany({ _id: { $in: ids } })
            return response.status(200).json({
                message: "Product size Deleted successfully ",
                success: true,
                error: false
            })
        } catch (error) {
            return response.status(500).json({
                message: "Product size not Deleted",
                success: false,
                error: true
            })
        }
}

// get product size
export async function getProductSize(request, response) {
    try {
        const productSize = await ProductSizeModel.find()
          if(!productSize){
            return response.status(500).json({
                message: "Product size can not be Updated",
                success: false,
                error: true
            })
        }
         return response.status(200).json({
                message: "Product size found",
                success: true,
                error: false,
                data: productSize
            })
    } catch (error) {
           return response.status(500).json({
                message: "Product size not founded",
                success: false,
                error: true
            })
    }
}


// get product size by id
export async function getProductSizeById(request, response) {
    try {
        const productSize = await ProductSizeModel.findById(request.params.id)
          if(!productSize){
            return response.status(500).json({
                message: "Product size can not be Updated",
                success: false,
                error: true
            })
        }
         return response.status(200).json({
                message: "Product size found",
                success: true,
                error: false,
                data: productSize
            })
    } catch (error) {
           return response.status(500).json({
                message: "Product size not founded",
                success: false,
                error: true
            })
    }
}



// filter
/* export async function filters(request, response) {
    const{catId,subCatId, thirdSubCatId, rating, color, productSize,minPrice, maxPrice, page, limit } = request.body;
    const filters = {} ;
    if(catId?.length){
        filters.catId = {$in: catId}
    }
    if(subCatId?.length){
        filters.subCatId = {$in: subCatId}
    }
    if(thirdSubCatId?.length){
        filters.thirdSubCatId = {$in: thirdSubCatId}
    }
    if(minPrice || maxPrice){
        filters.price = {$gte: +minPrice || 0, $lte: +maxPrice || Infinity}
    }
    if(rating?.length){
        filters.rating = {$in: rating}
    }

    try {
        const products = await ProductModel.find(filters).populate("category".skip(page - 1) * limit).limit(parseInt(limit));
        const total = await ProductModel.countDocuments(filters);
        return response.status(200).json({
            success: true,
            error: false,
            products: products,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
         return response.status(500).json({
                message: error?.message || error,
                success: false,
                error: true
            })
    }
    
} */

// 
// filter by chatgpt
export async function filters(req, res) {
  try {
    const {
      catId,
      subCatId,
      thirdSubCatId,
      rating,
      color,
      productSize,
      minPrice,
      maxPrice,
      availability,
      sort,
      page = 1,
      limit = 20,
      search,
    } = req.body || {};

    const toArray = (v) =>
      Array.isArray(v)
        ? v.filter((x) => x !== undefined && x !== null && x !== "")
        : v !== undefined && v !== null && v !== ""
        ? [v]
        : [];

    const filters = {};

    const catIds = toArray(catId);
    if (catIds.length) filters.catId = { $in: catIds };

    const subCatIds = toArray(subCatId);
    if (subCatIds.length) filters.subCatId = { $in: subCatIds };

    const thirdIds = toArray(thirdSubCatId);
    if (thirdIds.length) filters.thirdSubCatId = { $in: thirdIds };

    const colors = toArray(color).map((c) => String(c).toLowerCase());
    if (colors.length) filters.color = { $in: colors };

    const sizes = toArray(productSize);
    if (sizes.length) filters.productSize = { $in: sizes };

    const priceRange = {};
    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (!Number.isNaN(min)) priceRange.$gte = min;
    if (!Number.isNaN(max)) priceRange.$lte = max;
    if (priceRange.$gte !== undefined && priceRange.$lte !== undefined && priceRange.$gte > priceRange.$lte) {
      const tmp = priceRange.$gte;
      priceRange.$gte = priceRange.$lte;
      priceRange.$lte = tmp;
    }
    if (Object.keys(priceRange).length) filters.price = priceRange;

    const ratingsArr = toArray(rating)
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n));
    if (ratingsArr.length === 1) {
      filters.rating = { $gte: ratingsArr[0] };
    } else if (ratingsArr.length > 1) {
      filters.rating = { $in: ratingsArr };
    }

    // Availability: boolean or array
    if (Array.isArray(availability)) {
      const avail = availability.map((v) => {
        if (v === true || v === false) return v;
        const s = String(v).toLowerCase();
        if (s === "true") return true;
        if (s === "false") return false;
        return v;
      });
      if (avail.length) filters.availability = { $in: avail };
    } else if (availability !== undefined && availability !== "") {
      const s = String(availability).toLowerCase();
      const val = availability === true || s === "true";
      filters.availability = val;
    }

    if (search && String(search).trim()) {
      filters.name = { $regex: String(search).trim(), $options: "i" };
    }

    // Pagination
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortMap = {
      salesHighToLow: { sales: -1 },
      nameAToZ: { name: 1 },
      nameZToA: { name: -1 },
      priceLowToHigh: { price: 1 },
      priceHighToLow: { price: -1 },
      newest: { createdAt: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    // Query
    const q = ProductModel.find(filters).sort(sortOption).skip(skip).limit(limitNum).lean();
    if (sort === "nameAToZ" || sort === "nameZToA") {
      q.collation({ locale: "en", strength: 2 });
    }

    // Counts pipelines (global counts; চাইলে filters দিয়ে faceted করতে পারেন)
    const buildCountPipeline = (field) => [
      { $match: { [field]: { $exists: true, $ne: null } } },
      {
        $project: {
          vals: {
            $cond: [{ $isArray: `$${field}` }, `$${field}`, [`$${field}`]],
          },
        },
      },
      { $unwind: "$vals" },
      { $group: { _id: "$vals", count: { $sum: 1 } } },
    ];

    const countsPromise = Promise.all([
      ProductModel.aggregate(buildCountPipeline("catId")),
      ProductModel.aggregate(buildCountPipeline("subCatId")),
      ProductModel.aggregate(buildCountPipeline("thirdSubCatId")),
    ]);

    const [products, total, [byCat, bySub, byThird]] = await Promise.all([
      q.exec(),
      ProductModel.countDocuments(filters),
      countsPromise,
    ]);

    const toMap = (arr) =>
      arr.reduce((acc, { _id, count }) => {
        if (_id !== null && _id !== undefined && _id !== "") {
          acc[String(_id)] = count;
        }
        return acc;
      }, {});

    const totalPages = Math.max(Math.ceil(total / limitNum), 1);

    return res.status(200).json({
      success: true,
      error: false,
      products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
      counts: {
        cat: toMap(byCat),
        sub: toMap(bySub),
        third: toMap(byThird),
      },
    });
  } catch (error) {
    console.error("filters error:", error);
    return res.status(500).json({
      success: false,
      error: true,
      message: error?.message || "Internal server error",
    });
  }
}

//count category and subcategory
export async function categoryCounts(req, res) {
  try {
    const buildCountPipeline = (field) => [
      { $match: { [field]: { $exists: true, $ne: null } } },
      {
        $project: {
          vals: {
            $cond: [
              { $isArray: `$${field}` },
              `$${field}`,
              [`$${field}`],
            ],
          },
        },
      },
      { $unwind: "$vals" },
      { $group: { _id: "$vals", count: { $sum: 1 } } },
    ];

    const [byCat, bySub, byThird] = await Promise.all([
      ProductModel.aggregate(buildCountPipeline("catId")),
      ProductModel.aggregate(buildCountPipeline("subCatId")),
      ProductModel.aggregate(buildCountPipeline("thirdSubCatId")),
    ]);

    const toMap = (arr) =>
      arr.reduce((acc, { _id, count }) => {
        if (_id !== null && _id !== undefined && _id !== "") {
          acc[String(_id)] = count;
        }
        return acc;
      }, {});

    return res.status(200).json({
      success: true,
      error: false,
      data: {
        cat: toMap(byCat),
        sub: toMap(bySub),
        third: toMap(byThird),
      },
    });
  } catch (e) {
    console.error("categoryCounts error:", e);
    return res.status(500).json({
      success: false,
      error: true,
      message: e?.message || "Failed to get category counts",
    });
  }
}