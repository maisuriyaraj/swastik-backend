import adminModel from "../models/adminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import staffModal from "../models/employeesModel.js";

const secreateKey = process.env.SCREATE_KEY;
class AdminControler{
    static AddAdmin = async(req,res) =>{
        const { adminEmail,adminPassword } = req.body;
            if(adminEmail && adminPassword){
                const exists = await adminModel.findOne({adminEmail:adminEmail});
                if(exists){
                    res.send({status:false,message:"Admin Already Exists !"});
                }else{
                    try {
                        const slat = await bcrypt.genSalt(10);
                        const hashPass = await bcrypt.hash(adminPassword,slat); 
                        const collection = new adminModel({adminEmail:adminEmail,adminPassword:hashPass});
                        const result = await collection.save();
                        res.send({status:true,message:"Admin Added Successfully",data:result})
                    } catch (err) {
                    res.send({status:false,message:err});
                    }
                }
            }else{
                res.send({status:false,message:"Admin's Email and Password required"});
            }
    }

    static LoginAdmin = async(req,res) =>{
        const {adminEmail,adminPassword} = req.body;
        let loginAttemp = 0;
        if(adminEmail && adminPassword){
            try {
               
                const admin = await adminModel.findOne({adminEmail:adminEmail});
                if(admin){
                    let passMatch = await bcrypt.compare(adminPassword,admin.adminPassword);
                    if(admin.adminEmail == adminEmail && passMatch){
                        if(loginAttemp === 3){
                            res.status(200).send({status:false,message:"Access Denied",code : 200})
                        }else{
                            let token = jwt.sign({adminId:admin._id},secreateKey,{expiresIn:"1d"});
                            res.status(201).send({status:true,message:"Admin Access Granted",token:token,code:201})
                        }
                    }else{
                        loginAttemp++;
                        res.status(200).send({status:false,message:"Email or Password is wrong !!",code:501,loginAttemp:loginAttemp})
                    }
                }else{
                    loginAttemp++;
                    res.status(200).send({status:false,message:"Access Denied",code:501,loginAttemp:loginAttemp})
                }
            }catch (err) {
                res.status(404).send({status:false,message:err});
            }
        }else{
            loginAttemp++;
            res.status(501).send({status:false,message:"Admin's Email and Password is required",code : 501,loginAttemp:loginAttemp})
        }
    }

    static AddEmployees = async (req,res) =>{
        const {first_name,password,last_name,user_name,email,position,department} = req.body;
        try {
            if(req.body){
                const emp = await staffModal.findOne({email:email});
                if(emp){
                    res.send({status:false,message:"Employee Already Exists"})
                }else{
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(password,salt);
                    const collection  = new staffModal({first_name:first_name,last_name:last_name,user_name:user_name,email:email,position:position,password:hashPassword,department:department});
                    const result = collection.save();
                    res.send({status:true,message:"Employee Added Successfully"})
                }
            }else{
                res.send({status:true,message:"All Fields are Required"})
            }
        } catch (error) {
            res.send({status:false,message:"Unable to Provide Service"})
        }
    }
}

export default AdminControler;