import multer from "multer";
import DocumentModel from "../models/customer_documents.js";
import jwt from "jsonwebtoken";
import "dotenv/config";


const screateKey = process.env.SCREATE_KEY;
export const uploadCUstomersDocument = async(req,res,next) => {
    try {

        //check for existing documents 
        const {customer_id,document_type} = req.params;
        const result = await DocumentModel.findOne({customer_id:customer_id,document_type:document_type});
        if(result && result != null){
            res.send({status:false,message:`Your ${document_type} is Already Uploaded`});
           
        }else{
            // IF condition is false then it will allow you to execute next Middleware.
            next();
        }
    } catch (error) {
        
    }
}

export const updateCustomerDocuments = async(req,res,next) =>{
    try {
        //check for existing documents 
        const {customer_id,document_type} = req.params;
        const result = await DocumentModel.findOne({customer_id:customer_id,document_type:document_type});
        if(result && result != null && result.customer_id == customer_id && result.document_type == document_type){
            next();
        }else{
            res.send({status:false,message:"Your Document is Not uploaded yet.Please upload Your Documents First.."})
        }
    } catch (error) {
        
    }
}

export const handleUploadsFile  = (req) =>{
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            return cb(null, "./customers/documents");
        },
        filename: (req, file, cb) => {
            const  customer_id = req.params.customer_id;
            const document_type = req.params.document_type;
            const filename =customer_id + '-' +document_type+".jpg"
            return cb(null, filename);
        }
    })
    const uploadDocs = multer({ storage });
    return uploadDocs
}


export const verifyCustomerToken = (req,res,next) =>{
    let token;
    try {
        const {authorization} = req.headers;
        if(authorization){
            token = req.headers["authorization"];
            if(token && typeof(token) !== undefined){
                const {userData} = jwt.verify(token,screateKey)
                next();
            }else{
                res.send({status:false,message:"Invalid Token"});
            }
        }else{
            res.status(401).send({status:false,message:"please,Provide Auth Token"});
        }
    } catch (error) {
            res.status(501).send({status:false,message:"Invalid Token"});
    }
}