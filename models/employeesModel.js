import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
    first_name:{type:String,required:true},
    last_name:{type:String,required:true},
    user_name:{type:String,required:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
    position:{type:String,required:true},
    gender:{type:String,enum:['male','female','other'],required:true},
    dob:{type:String,required:true},
    doj:{type:String,required:true},
    salary:{type:Number,required:true},
    education:{type:String,required:true},
    dept_id:{type:String,required:true},
    address:{type:String,required:true}
})

const staffModal = mongoose.model("employees",staffSchema)

export default staffModal;