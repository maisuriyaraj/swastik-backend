import jwt from "jsonwebtoken";
import "dotenv/config"
// import adminModel from "../models/adminModel";


const secreateKey = process.env.SCREATE_KEY
const verifyStaffToken = async(req,res,next) =>{
    let token;
   try {
    const {authorization} = req.headers;
    if(authorization){
        token = req.headers["authorization"];
        if(token && typeof(token) !== undefined){
            jwt.verify(token,secreateKey);
            next();
        }else{
            res.send({status:false,message:"Invalid Token"})
        }
    }else{
        res.send({status:false,message:"Provide Authorization token"});
    }
   } catch (error) {
        res.send({status:false,message:"Invaid TOken",err:error})
   }
}


export default verifyStaffToken;