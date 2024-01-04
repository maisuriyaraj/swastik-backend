import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    first_name:{type:String,required:true},
    last_name:{type:String,required:true},
    user_name:{type:String,required:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
    position:{type:String,required:true},
    department:{type:String,required:true}
})

const staffModal = mongoose.model("employees",staffSchema)

export default staffModal;