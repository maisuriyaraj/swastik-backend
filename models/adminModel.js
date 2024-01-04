import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    adminEmail:{type:String,required:true},
    adminPassword:{type:String,required:true}
});

const adminModel = mongoose.model("admin",adminSchema);

export default adminModel;