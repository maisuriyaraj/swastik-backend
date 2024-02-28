import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
    first_name:{type:String,require:true},
    last_name:{type:String,require:true},
    email:{type:String,require:true},
    password:{type:String,require:true},
    gender:{type:String,enum:["male","female","other"],default:"male"},
    pin:{type:String,require:true},
    dob:{type:Date,require:true},
    phone:{type:String,require:true},
    address:{type:String,require:true},
    pan_number:{type:String,require:true},
    adhar_number:{type:String,require:true},
    account_type:{type:String,require:true},
    account_number:{type:String,require:true},
    nationality:{type:String,require:true,default:"Indian"},
    marital_status:{type:String},
});

const customerModel = mongoose.model("customers",CustomerSchema);

export default customerModel;