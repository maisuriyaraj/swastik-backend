import adminModel from "../models/adminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import staffModal from "../models/employeesModel.js";
import customerModel from "../models/customersModel.js";
import ActivityModel from "../models/adminActivities.js";
import moment from "moment";

const secreateKey = process.env.SCREATE_KEY;
class AdminControler {
    static AddAdmin = async (req, res) => {
        const { adminEmail, adminPassword } = req.body;
        if (adminEmail && adminPassword) {
            const exists = await adminModel.findOne({ adminEmail: adminEmail });
            if (exists) {
                res.send({ status: false, message: "Admin Already Exists !" });
            } else {
                try {
                    const slat = await bcrypt.genSalt(10);
                    const hashPass = await bcrypt.hash(adminPassword, slat);
                    const collection = new adminModel({ adminEmail: adminEmail, adminPassword: hashPass });
                    const result = await collection.save();
                    res.send({ status: true, message: "Admin Added Successfully", data: result })
                } catch (err) {
                    res.send({ status: false, message: err });
                }
            }
        } else {
            res.send({ status: false, message: "Admin's Email and Password required" });
        }
    }

    static LoginAdmin = async (req, res) => {
        const { adminEmail, adminPassword } = req.body;
        let loginAttemp = 0;
        if (adminEmail && adminPassword) {
            try {

                const admin = await adminModel.findOne({ adminEmail: adminEmail });
                if (admin) {
                    let passMatch = await bcrypt.compare(adminPassword, admin.adminPassword);
                    if (admin.adminEmail == adminEmail && passMatch) {
                        if (loginAttemp === 3) {
                            res.status(200).send({ status: false, message: "Access Denied", code: 200 })
                        } else {
                            let token = jwt.sign({ adminId: admin._id }, secreateKey, { expiresIn: "1d" });
                            this.SetAdminActivities(admin._id,req.url, req.method, req.body, req.params, req.message);
                            res.status(201).send({ status: true, message: "Admin Access Granted", token: token, code: 201 ,admin:admin._id})
                        }
                    } else {
                        loginAttemp++;
                        res.status(200).send({ status: false, message: "Email or Password is wrong !!", code: 501, loginAttemp: loginAttemp })
                    }
                } else {
                    loginAttemp++;
                    res.status(200).send({ status: false, message: "Access Denied", code: 501, loginAttemp: loginAttemp })
                }
            } catch (err) {
                this.SetAdminActivities(admin._id,req.url, req.method, req.body, req.params, err.message);
                res.status(404).send({ status: false, message: err });
            }
        } else {
            loginAttemp++;
            res.status(501).send({ status: false, message: "Admin's Email and Password is required", code: 501, loginAttemp: loginAttemp })
        }
    }

    static Logout = async (req, res) => {
        const {id} = req.body;
        try {
            this.SetAdminActivities(id,req.url, req.method, req.body, req.params, req.message);
            res.send({ status: true, message: "Admin Loggedout successfully !." });
        } catch (error) {
            console.log(error)
        }
    }

    static AddEmployees = async (req, res) => {
        const { first_name,
            last_name,
            user_name,
            password,
            email,
            position,
            gender,
            dob,
            doj,
            salary,
            education,
            department,
            dept_id,
            address } = req.body;
        try {
            if (req.body) {
                const emp = await staffModal.findOne({ email: email });
                if (emp) {
                    res.status(200).send({ status: false, message: "Employee Already Exists" })
                } else {
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(password, salt);
                    const collection = new staffModal({ first_name: first_name, last_name: last_name, user_name: user_name, email: email, position: position, password: hashPassword, department: department, gender: gender, dob: dob, doj: doj, salary: salary, education: education, dept_id: dept_id, address: address });
                    const result = collection.save();
                    res.status(201).send({ status: true, message: "Employee Added Successfully", status: 201 })
                }
            } else {
                res.status(200).send({ status: true, message: "All Fields are Required" })
            }
        } catch (error) {
            res.status(501).send({ status: false, message: "Unable to Provide Service", status: 501 })
        }
    }

    static getCustomers = async (req, res) => {
        try {
            const customers_list = await customerModel.find().select('-password -pin');
            res.status(201).send({ status: true, message: "All Customer's Data Fetch Successfully", data: customers_list });
        } catch (error) {
            res.status(200).send({ status: false, message: "Something went wrong !!", status: 501 });
        }
    }

    static SetAdminActivities = async (id,url, method, body, params, message) => {
        try {
            const result = new ActivityModel({
                admin_id:id,
                api_name: url,
                api_method: method,
                body: body,
                params: params,
                error: message,
                startDate: moment().format("DD/MM/YYYY"),
                startTime: moment().format("hh:mm")
            });
            const collection = await result.save();
        } catch (error) {
            console.log(error)
        }
    }

    static getAdminActivities = async (req,res) =>{
        try {
            const result = await ActivityModel.find({});
            res.send({status:true,message:"Admin Activities Fetch Successfully",data:result});
        } catch (error) {
            res.send({status:false,message:"Unable to provide Service"})
        }
    }
}

export default AdminControler;