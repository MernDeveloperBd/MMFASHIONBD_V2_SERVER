import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import ProductModel from '../models/product.model.js';

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
export async function createProduct(req, res) {
    try {

        let product = new ProductModel({
            name: req.body.name,
            description: req.body.description,
            images: imagesArr,
            brand: req.body.brand,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            catName: req.body.catName,
            catId: req.body.catId,
            subCat: req.body.subCat,
            subCatId: req.body.subCatId,
            thirdSubCat: req.body.thirdSubCat,
            thirdSubCatId: req.body.thirdSubCatId,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            discount: req.body.discount,
            productRam: req.body.productRam,
            size: req.body.size,
            productWeight: req.body.productWeight,
            location: req.body.location,
            dateCreated: req.body.dateCreated,
        });
        product = await product.save()
        if (!product) {
            res.status(500).json({
                error: true,
                success: false,
                message: "Product no created"
            })
        }
        imagesArr = []
        res.status(200).json({
            message: "Product created Successfully",
            error: false,
            success: true,
            product: product
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get all products
export async function getAllProducts(req, res) {
    try {

        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage);
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
// Get all products by Category id
export async function getAllProductsByCatId(req, res) {
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
            catId: req.params.id
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
export async function getAllProductsBySubCatId(req, res) {
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
            subCatId: req.params.id
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
// Get all products by sub category name
export async function getAllProductsBySubCatName(req, res) {
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
            subCat: req.query.subCat
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
// Get all products by Third level Category id
export async function getAllProductsByThirdLevelCatId(req, res) {
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
            thirdSubCatId: req.params.id
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
// Get all products by ThirdLevel category name
export async function getAllProductsByThirdLevelCatName(req, res) {
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
            thirdSubCat: req.query.thirdSubCat
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
// Get all products by Price
export async function getAllProductsByPrice(req, res) {
    let productList = []
    if (req.query.catId !== "" && req.query.catId !== undefined) {
        const productListArr = await ProductModel.find({
            catId: req.query.catId,
        }).populate("category");
        productList = productListArr
    }
    if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
        const productListArr = await ProductModel.find({
            subCatId: req.query.subCatId,
        }).populate("category");
        productList = productListArr
    }
    if (req.query.thirdSubCatId !== "" && req.query.thirdSubCatId !== undefined) {
        const productListArr = await ProductModel.find({
            thirdSubCatId: req.query.thirdSubCatId,
        }).populate("category");
        productList = productListArr
    }

    const filteredProducts = productList.filter((product) => {
        if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
            return false;
        }
        if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
            return false;
        }
        return true;
    });
    return res.status(200).json({
        error: false,
        success: true,
        products: filteredProducts,
        totalPages: 0,
        page: 0
    })

}

// Get all products by Ratings
export async function getAllProductsByRating(req, res) {
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
        console.log("raing", req.query.catId);
        let products = [];
        if (req.query.catId !== undefined) {
            products = await ProductModel.find({
                rating: req.query.rating,
                catId: req.query.catId,
            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }
        if (req.query.subCatId !== undefined) {
            products = await ProductModel.find({
                rating: req.query.rating,
                subCatId: req.query.subCatId,
            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }
        if (req.query.thirdSubCat !== undefined) {
            products = await ProductModel.find({
                rating: req.query.rating,
                thirdSubCat: req.query.thirdSubCat,
            }).populate("category")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }
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
// Get all Products Count
export async function getAllProductsCount(req, res) {
    try {
        const productsCount = await ProductModel.countDocuments();
        if (!productsCount) {
            res.status(500).json({
                error: true,
                success: false
            })
        }
        return res.status(200).json({
            error: false,
            success: true,
            productsCount: productsCount
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// Get all Featured products
export async function getAllFeaturedProducts(req, res) {
    try {

        const products = await ProductModel.find({
            isFeatured: true
        }).populate("category");
        if (!products) {
            res.status(500).json({
                error: true,
                success: false
            })
        }
        res.status(200).json({
            error: false,
            success: true,
            products: products

        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get all Delete product
export async function deleteProduct(req, res) {
    const product = await ProductModel.findById(req.params.id).populate("category")
    if (!product) {
        return res.status(404).json({
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
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
        res.status(404).json({
            message: "Product not Deleted",
            success: false,
            error: true
        })
    }
    return res.status(200).json({
        message: "Product Deleted",
        success: true,
        error: false
    })

}

// Get single product
export async function getSingleProduct(req, res) {
    try {
        const product = await ProductModel.findById(req.params.id).populate("category")
        if (!product) {
            return res.status(404).json({
                message: "The Product is not found",
                success: false,
                error: true
            })
        }
         return res.status(200).json({
        success: true,
        error: false,
        product: product        

    })

    } catch (error) {
        return res.status(500).json({
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
export async function updateProduct(req, res) {
    try {
        const product = await ProductModel.findByIdAndUpdate(
            req.params.id,
             {
            name: req.body.name,
            description: req.body.description,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            oldPrice: req.body.oldPrice,
            catName: req.body.catName,
            catId: req.body.catId,
            subCat: req.body.subCat,
            subCatId: req.body.subCatId,
            thirdSubCat: req.body.thirdSubCat,
            thirdSubCatId: req.body.thirdSubCatId,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            isFeatured: req.body.isFeatured,
            discount: req.body.discount,
            productRam: req.body.productRam,
            size: req.body.size,
            productWeight: req.body.productWeight,
            location: req.body.location,
        },{
            new: true
        }
        );
        if(!product){
            return res.status(404).json({
                message: "The product cannot be updated",
                status: false,
            })
        }
        imagesArr = []
        return res.status(200).json({
            message: "The product is updated",
            error: false,
            success: true,
        })
    } catch (error) {
         return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
