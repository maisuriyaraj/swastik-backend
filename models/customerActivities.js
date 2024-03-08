import mongoose from "mongoose";

const schema = new mongoose.Schema({
    customer_id:{type:String},
    api_name: { type: String },
    api_method: { type: String },
    body: { type: Object },
    params: { type: Object },
    error: { type: String },
    startDate: { type: String },
    startTime: { type: String }
});

const CustomerActivityModel = mongoose.model("customer_activities", schema);

export default CustomerActivityModel;

