import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    first_name:{type:String,require:true},
    last_name:{type:String,require:true},
    email:{type:String,require:true},
    password:{type:String,require:true},
    pin:{type:String,require:true},
    dob:{type:Date,require:true},
    phone:{type:String,require:true},
    address:{type:String,require:true},
    pan_number:{type:String,require:true},
    adhar_number:{type:String,require:true},
    accept_Terms:{type:Boolean,require:true}
});

const customerModel = mongoose.model("customers",CustomerSchema);

export default customerModel;