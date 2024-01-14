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
                    if(employee.email == email && passMatch){
                        let token = jwt.sign({empID:employee._id},secreateKey,{expiresIn:"1d"});
                        res.status(201).send({status:true,message:"Employee logged in successfully.",token:token,code:201});
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
}

export default EmployeesControl;