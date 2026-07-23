import mongoose from "mongoose";

const tripSessionSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    destination:{
        type:String,
        default:null
    },

    source:{
        type:String,
        default:null
    },

    days:{
        type:Number,
        default:null
    },

    travellers:{
        type:Number,
        default:null
    },

    budget:{
        type:Number,
        default:null
    },

    travelStyle:{
        type:String,
        default:null
    },

    hotelPreference:{
        type:String,
        default:null
    },

    interests:{
        type:[String],
        default:[]
    },

    status:{
        type:String,
        enum:["collecting","ready","completed"],
        default:"collecting"
    }
},
{
    timestamps:true

});

export default mongoose.model("TripSession",tripSessionSchema);