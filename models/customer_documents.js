import mongoose from "mongoose";

const DocumentsSchema = new mongoose.Schema({
    customer_id:{type:String},
    document_path:{type:String},
    document_type:{type:String}
})


const DocumentModel = mongoose.model("customer_documents",DocumentsSchema);

export default DocumentModel;