import mongoose from "mongoose";

const schema = new mongoose.Schema({
    admin_id:{stype:String},
    api_name: { type: String },
    api_method: { type: String },
    body: { type: Object },
    params: { type: Object },
    error: { type: String },
    startDate: { type: String },
    startTime: { type: String }
});

const ActivityModel = mongoose.model("admin_activities", schema);

export default ActivityModel;