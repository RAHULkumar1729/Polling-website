const mongoose = require("mongoose")
const pollSchema = new mongoose.Schema({
    question:{
        type:String,
        required :true
    },
    type:{     // single-choice, rating, yes/no
        type:String,
        required:true
    },
    options:[
    {
        optionText: {type:String, required:true},
        votes:{type:Number,default:0}  //for vote tracking

    }

    ],
    responses:[
        {
            voterId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
            responseText:{type:String},  //user submitted text response
            createdAt:{type:Date,default:Date.now}
         }
    ],
    creator:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    voters:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}], //to prevent multiple votes
    createdAt:{type:Date, default:Date.now},
    closed:{type:Boolean,default:false}
})

const Poll = mongoose.model("Poll",pollSchema)
module.exports= Poll;