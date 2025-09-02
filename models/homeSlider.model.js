import mongoose from "mongoose";

const homeSliderSchema = new mongoose.Schema({
  name: {
        type: String,
        required: true,
        trim: true
    },
    shortDescription: {
        type: String,
        required: true,
        trim: true
    },
      images:[
        {
        type:String,
        required: true,
    }
      ],
      dateCreated:{
        type:Date,
        default: Date.now,
    },
    
},
{
    timestamps:true
})

const HomeSliderModel = mongoose.model("HomeSlider", homeSliderSchema)
export default HomeSliderModel;