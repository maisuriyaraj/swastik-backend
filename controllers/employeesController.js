import staffModal from "../models/employeesModel.js";
import  jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";

const secreateKey = process.env.SCREATE_KEY;
class EmployeesControl{
    static  LoginStaff = async(req,res) => {
        const {email,password} = req.body;
        try {
            if(email && password){
                const employee = await staffModal.findOne({email:email});
                if(employee){
                    let passMatch = await bcrypt.compare(password,employee.password);
                    console.log(passMatch)
                    if(employee.email == email && passMatch){
                        let token = jwt.sign({empID:employee._id},secreateKey,{expiresIn:"1d"});
                        res.status(201).send({status:true,message:"Employee logged in successfully.",token:token,emp:employee._id,code:201});
                    }else{
                        res.status(200).send({status:false,message:"Email or password is not Correcct",code:501});
                    }
                }else{
                    res.status(200).send({status:false,message:"You're Unauthorized Person",code : 501});
                }
            }else{
                res.status(200).send({status:false,message:"email and Staff Password is required",code : 501})
            }      
        } catch (error) {
            res.status(404).send({status:false,message:"Unable to provide service"})
        }
    }

    static  LoginStaffByAdmin = async(req,res) => {
        const {email} = req.body;
        try {
            if(email){
                const employee = await staffModal.findOne({email:email});
                if(employee){
                    if(employee.email == email){
                        let token = jwt.sign({empID:employee._id},secreateKey,{expiresIn:"1d"});
                        res.status(201).send({status:true,message:"Employee logged in successfully.",token:token,emp:employee._id,code:201});
                    }else{
                        res.status(200).send({status:false,message:"Email or password is not Correcct",code:501});
                    }
                }else{
                    res.status(200).send({status:false,message:"You're Unauthorized Person",code : 501});
                }
            }else{
                res.status(200).send({status:false,message:"email and Staff Password is required",code : 501})
            }      
        } catch (error) {
            res.status(404).send({status:false,message:"Unable to provide service"})
        }
    }

    static getEmployeesList = async (req,res) =>{
        try {
            const employees = await staffModal.find().populate('dept_id'); // Foreign key FIELD NAME 
            res.send(employees);
        } catch (error) {
            console.log(error);
        }
    }

    static getmployee = async (req,res) =>{
        const {id}  = req.body;
        try {
            if(id){
                let result = await staffModal.findOne({_id:id}).populate("dept_id");
                if(result !== null){
                    res.status(201).send({status:true,message:"Date Fetched Succcessfully !!",code : 201,data:result});
                }else{
                    res.send({status:false,message:"Employee Not Found !!"});
                }
            }else{
                res.send({status:false,message:"Please provide customer id"});
            }
        } catch (error) {
            console.log(error);
            res.status(501).send({status:false,message:"Unable to provide Service !"})
        }
    }
}

export default EmployeesControl;