import mongoose from "mongoose";

const transectionDetailsSchema = new mongoose.Schema({
    date_of_transection:{type:String},
    date_of_time:{type:String},
    deposit_amount:{type:Number,default:0},
    withdraw_amount:{type:Number,default:0},
    current_balance:{type:Number}
});

const customerTransectionsSchema = new mongoose.Schema({
    customer_id:{type:mongoose.Schema.Types.ObjectId,ref:"customers"},
    transections : [transectionDetailsSchema]
});

const TransectionModel = mongoose.model('customer_transection',customerTransectionsSchema);

export default TransectionModel