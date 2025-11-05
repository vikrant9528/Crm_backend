const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
    lead:{type:mongoose.Schema.Types.ObjectId,ref:'Lead',required:true},
    user:{type:mongoose.Schema.Types.ObjectId , ref:'User' , required:true},
    action:{type:String,required:true},
    from:{type:String},
    to:{type:String},
    name:{type:String},
    createdAt:{type:Date,default:Date.now()}
})

module.exports = mongoose.model('TimeLineUpdate', timelineSchema);