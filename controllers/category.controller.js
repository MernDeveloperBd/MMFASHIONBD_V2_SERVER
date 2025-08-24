import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import CategoryModel from '../models/category.model.js';




// ✅ Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

//Image upload
var imagesArr = [];
export async function uploadImagesController(request, response) {
    try {
        imagesArr = [];
        const image = request.files;

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
                    fs.unlinkSync(`uploads/${request.files[i].filename}`);
                }
            )
        };

        return response.status(200).json({
            images: imagesArr
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }

}

//create category
export async function createCategory(request, response) {
    try {
        let category = new CategoryModel({
            name: request.body.name,
            images: imagesArr,
            parentId: request.body.parentId,
            parentCatName: request.body.parentCatName,
        });
        if (!category) {
            return response.status(500).json({
                message: "Category not created",
                error: true,
                success: false
            })
        };
        category = await category.save();
        imagesArr =[]

        return response.status(200).json({
            message: "Category created",
            error: false,
            success: true,
            category: category
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get category
export async function getCategoryController(request, response) {
    try {
        const categories = await CategoryModel.find();
        const categoryMap = {};
        categories.forEach((cat) => {
            categoryMap[cat._id] = { ...cat._doc, children: [] }
        })
        const rootCategories = [];
        categories.forEach((cat) => {
            if (cat.parentId) {
                categoryMap[cat.parentId].children.push(categoryMap[cat._id])
            } else {
                rootCategories.push(categoryMap[cat._id])
            }
        });
        return response.status(500).json({
            error: false,
            success: true,
            data: rootCategories
        })


    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// Get Category Count
export async function getCategoryCountController(request, response) {
    try {
        const categorycount = await CategoryModel.countDocuments({ parentId: undefined });
        if (!categorycount) {
            response.status(500).json({ success: false, error: true })
        } else {
            response.send({
                categorycount: categorycount
            })
        }
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
    response.status(200).json({
        error: false,
        message: "Category Deleted",
    })

}

// Get Sub Category Count
export async function getSubCategoryCountController(request, response) {
    try {
        const categories = await CategoryModel.find();
        if (!categories) {
            response.status(500).json({ success: false, error: true })
        } else {
            const subCatList = [];
            for (let cat of categories) {
                if (cat.parentId !== undefined) {
                    subCatList.push(cat)
                }
            }
            response.send({ subCtegorycount: subCatList.length })
        }
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// get single category
export async function getSingleCategoryController(request, response) {
    try {
        const category = await CategoryModel.findById(request.params.id);
        if (!category) {
            response.status(500).json({
                message: "The category with the givenid was not found",
                error: true,
                success: false
            })
        }
        return response.status(200).send({
            error: false,
            success: true,
            category: category
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

// Delete Category
export async function deleteCategoryController(req, res) {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                success: false,
                error: true
            });
        }

        // Delete main category images from Cloudinary
        for (const imgUrl of category.images) {
            const parts = imgUrl.split('/');
            const fileName = parts[parts.length - 1].split('.')[0];
            if (fileName) {
                await cloudinary.uploader.destroy(fileName);
            }
        }

        // Delete sub-categories and their children
        const subCategories = await CategoryModel.find({ parentId: req.params.id });
        for (const subCat of subCategories) {
            const thirdSubCategories = await CategoryModel.find({ parentId: subCat._id });
            for (const thirdSub of thirdSubCategories) {
                await CategoryModel.findByIdAndDelete(thirdSub._id);
            }
            await CategoryModel.findByIdAndDelete(subCat._id);
        }

        // Delete main category
        await CategoryModel.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "Category deleted successfully",
            success: true,
            error: false
        });

    } catch (error) {
        console.error("Delete Category Error:", error);
        return res.status(500).json({
            message: "Server error while deleting category",
            success: false,
            error: true
        });
    }
}

// Update category

export async function updateCategoryController(req, res) {
    console.log(imagesArr);
    
    const category = await CategoryModel.findByIdAndUpdate(req.params.id, 
        {
        name: req.body.name,
        images: imagesArr.length > 0 ? imagesArr[0] : req.body.images,
        parentId: req.body.parentId,
        parentCatName: req.body.parentCatName,
    },
    {new:true}
);
if(!category){
    return res.status(500).json({
        message:"Category cannot be updated",
        success: false,
        error: true
    })
}
imagesArr = []
res.status(200).json({
    error:false,
    success:true,
    category: category
})
}
