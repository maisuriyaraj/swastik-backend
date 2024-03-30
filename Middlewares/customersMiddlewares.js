import multer from "multer";
import DocumentModel from "../models/customer_documents.js";
import jwt from "jsonwebtoken";
import "dotenv/config";


const screateKey = process.env.SCREATE_KEY;
export const uploadCUstomersDocument = async(req,res,next) => {
    try {

        //check for existing documents 
        const {customer_id} = req.params;
        const result = await DocumentModel.findOne({customer_id:customer_id});
        if(result && result != null){
            res.send({status:false,message:`Your Documents is Already Uploaded`});
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
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            const  customer_id = req.params.customer_id;
            const filename =customer_id + `-swastik-${uniqueSuffix}`+".pdf"
            return cb(null, filename);
        }
    })
    const uploadDocs = multer({ storage }).fields([
        { name: 'file1', maxCount: 1 },
        { name: 'file2', maxCount: 1 }
    ]);
    return uploadDocs;
}

export const uploadProfilePicture  = (req) =>{
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            return cb(null, "./customers/profile_images");
        },
        filename: (req, file, cb) => {
            const  customer_id = req.params.customer_id;
            const filename =customer_id + `-swastik`+".jpg"
            return cb(null, filename);
        }
    })
    const uploadAvatar = multer({storage}).single('customer_profile');
    return uploadAvatar;
}

export const uploadLoanDocuments  = (req) =>{
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            return cb(null, "./customers/loan_documents");
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            const  loan_id = req.params.loan_id;
            const filename =loan_id + uniqueSuffix +`-swastik`+".pdf"
            return cb(null, filename);
        }
    })
    const uploadDocs = multer({ storage }).fields([
        { name: 'file1', maxCount: 1 },
        { name: 'file2', maxCount: 1 },
        { name: 'file3', maxCount: 1 },
        { name: 'file4', maxCount: 1 },
        { name: 'file5', maxCount: 1 }
    ]);
    return uploadDocs;
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