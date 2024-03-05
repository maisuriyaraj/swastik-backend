import mongoose from "mongoose";

const docs = new mongoose.Schema({
    doc_path:{type:String},
    doc_type:{type:String},
})
const DocumentsSchema = new mongoose.Schema({
    customer_id:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'customers'},
    document:[docs]
})


const DocumentModel = mongoose.model("customer_documents",DocumentsSchema);

export default DocumentModel;