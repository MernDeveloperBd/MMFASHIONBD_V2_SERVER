import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import HomeSliderModel from '../models/homeSlider.model.js';


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
// Create home slide
export async function addHomeSlide(request, response) {
    try {
         let slide = new HomeSliderModel({
            name: request.body.name,
            shortDescription: request.body.shortDescription,
            images: imagesArr,
        });
          if (!slide) {
            return response.status(404).json({
                message: "Slider is not created",
                error: true,
                success: false
            })
        };
        slide = await slide.save();
        imagesArr =[]

        return response.status(200).json({
            message: "slide created",
            error: false,
            success: true,
            category: slide
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// get home slide
export async function getHomeSlides(request, response) {
    try {
         const slides = await HomeSliderModel.find();
          if (!slides) {
            return response.status(404).json({
                message: "slides is not found",
                error: true,
                success: false
            })
        };
         return response.status(200).json({
            error: false,
            success: true,
            data: slides
        })
    } catch (error) {
         return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// get single slide
export async function getHomeSlide(request, response) {
    try {
        const slide = await HomeSliderModel.findById(request.params.id);
        if (!slide) {
            response.status(500).json({
                message: "The slide with the given id was not found",
                error: true,
                success: false
            })
        }
        return response.status(200).send({
            error: false,
            success: true,
            slide: slide
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
export async function removeImageFromCloudinary(request, response) {
    const imgUrl = request.query.img;

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
            return response.status(200).json({
                errro:false,
                success: true,
                message:"Image Deleted successfully"
            })
        }
    }
}

// Delete slide
export async function deleteSlide(request, response) {
    try {
        const slide = await HomeSliderModel.findById(request.params.id);
        const images = slide.images;
        let img = ""
        for(img of images){
            const imgUrl = img
            const urlArr =  imgUrl.split('/')
            const image = urlArr[urlArr.length - 1]
            const imageName = image.split(".")[0]
             if (imageName) {
                 cloudinary.uploader.destroy(imageName, (error, result)=>{
                    //console.log('here')
                 });
            }
        } 

        // Delete sub-categories and their children
        const deleteSlide = await HomeSliderModel.findByIdAndDelete( request.params.id );
        if (!deleteSlide) {
            return response.status(404).json({
                message: "Slide not found",
                success: false,
                error: true
            });
        }
         return res.status(200).json({
            message: "slide deleted successfully",
            success: true,
            error: false
        });

    } catch (error) {
        return response.status(500).json({
            message: "Server error while deleting category",
            success: false,
            error: true
        });
    }
}

// update slide
export async function updateSlide(req, res) {
    
    const slide = await HomeSliderModel.findByIdAndUpdate(req.params.id, 
        {
        name: req.body.name,
        shortDescription: req.body.shortDescription,
        images: imagesArr.length > 0 ? imagesArr[0] : req.body.images,
    },
    {new:true}
);
if(!slide){
    return res.status(500).json({
        message:"slide cannot be updated",
        success: false,
        error: true
    })
}
imagesArr = []
res.status(200).json({
    error:false,
    success:true,
    slide: slide,
    message:"Slide update Successfull"
})
}
// Delete Multiple Slide
export async function deleteMulipleSlide(request, response) {
const {ids} = request.body;

if(!ids || !Array.isArray(ids)){
    return response.status(400).json({error:true, success: false, message:"Invalid input"})
}

for(let i = 0; i < ids?.length; i++){
    const slide = await HomeSliderModel.findById(ids[i])

    const images = slide.images;

     let img = ""
        for(img of images){
            const imgUrl = img
            const urlArr =  imgUrl.split('/')
            const image = urlArr[urlArr.length - 1]

            const imageName = image.split(".")[0]

             if (imageName) {
                 cloudinary.uploader.destroy(imageName, (error, result)=>{
                    //console.log('here')
                 });
            }
        }  
}
try {
    await HomeSliderModel.deleteMany({_id: {$in:ids}});
     return res.status(200).json({
            message: "slide deleted successfully",
            success: true,
            error: false
        });
} catch (error) {
     return response.status(500).json({
            message: "Server error while deleting Slide",
            success: false,
            error: true
        });
}
}
