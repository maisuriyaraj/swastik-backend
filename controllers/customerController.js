import jwt from "jsonwebtoken";
import "dotenv/config";
import customerModel from "../models/customersModel.js";
import DocumentModel from "../models/customer_documents.js";
import moment from "moment";
import bcrypt from "bcrypt"
import multer from "multer";
import { getEmailBody, getHashPassword,generateOtp,comparePasswords } from "../utils/helperFunctions.js";
import nodemailer from "nodemailer";




const secreatKey = process.env.SCREATE_KEY;
let otpEmail = {
    otp:""
};
export class CustomerControll {
    constructor() {
    }
    static CustomerRegistration = async (req, res) => {
        const {
            first_name,
            last_name,
            email,
            password,
            pin,
            dob,
            phone,
            address,
            pan_number,
            adhar_number,
            accept_Terms,
            otp
        } = req.body;

        if (req.body) {
            try {
                const registered = await customerModel.findOne({ $or: [{ email: email }, { adhar_number: adhar_number }, { pan_number: pan_number }] });
                console.log(otpEmail?.otp +  " + " +  otp)
                console.log(registered)
                if (registered && registered !== null) {
                    if (registered.adhar_number == adhar_number) {
                        res.status(200).send({ status: false, message: "Your Adhar Number is already registered" });
                    } else if (registered.pan_number == pan_number) {
                        res.status(200).send({ status: false, message: "Your Pan Number is already registered" });
                    }
                    else if (registered.email == email) {
                        res.status(200).send({ status: false, message: "Your Email is already registered" });
                    } else {
                        res.status(200).send({ status: false, message: "User Already Registered, Please Login.." });
                    }
                } else {
                    let hashPass = await getHashPassword(password);
                    let hashPin = await getHashPassword(pin)
                    const collection = new customerModel({
                        first_name: first_name,
                        last_name: last_name,
                        email: email,
                        password: hashPass,
                        pin: hashPin,
                        dob: moment(dob, "YYYY-MM-DD", true).isValid() ? new Date(dob) : null,
                        phone: phone,
                        address: address,
                        pan_number: pan_number,
                        adhar_number: adhar_number,
                        accept_Terms: accept_Terms
                    });
                    if(otp == otpEmail.otp){
                        const result = await collection.save();
                    const token = jwt.sign({ userData: collection }, secreatKey, { expiresIn: "1d" });
                    res.status(201).send({ status: true, message: "Customer Registered Successfully", token: token });
                    }else{
                        res.send({status:false,message:"Invalid otp"})
                    }
                    
                }
            } catch (error) {
                console.log(error)
                res.status(501).send({ status: false, message: "Unable to provide Services", code: 501 })

            }
        } else {
            res.status(200).send({ status: false, message: "Please Provide All the Required Details !", code: 501 })
        }
    }

    static UploadBankingDocuments = async (req, res) => {
        try {
            const { customer_id, document_type } = req.params
            const collection = new DocumentModel({ customer_id: customer_id, document_path: req.file.path, document_type: document_type });
            const result = await collection.save();
            res.status(201).send({ status: true, message: "Documents Uploaded Sucessfully" });
        } catch (error) {
            res.status(501).send({ status: false, message: "Unable to Providde Service" })
        }
    }

    static UpdateDocuments = async (req, res) => {
        try {
            const { customer_id, document_type } = req.params;
            // const collection = DocumentModel.updateOne({customer_id:customer_id})
            res.send({ statuc: true, message: `Your ${document_type} is Updated Successfully` });
        } catch (error) {
            res.status(501).send({ status: false, message: "Unable to Providde Service" })

        }
    }

    static SendVerificationEmail = async (req, res) => {
        try {
            otpEmail.otp = generateOtp();
            const { email } = req.body;
            // Generate SMTP service account from ethereal.email
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    console.error('Failed to create a testing account. ' + err.message);
                    return process.exit(1);
                }

                // Create a SMTP transporter object
                const transporter = nodemailer.createTransport({
                    host: 'smtp.ethereal.email',
                    port: 587,
                    auth: {
                        user: 'darby.ebert98@ethereal.email',
                        pass: 'mgZZtcKb6bBvc8ND87'
                    }
                });

                // Message object
                let message = {
                    from: `Sender Name <swastikfinance@gmail.com>`,
                    to: `Recipient <${email}>`,
                    subject: 'Nodemailer is unicode friendly ✔',
                    // text: 'HELLO I AM RAJ MAISURIYA!',
                    html: getEmailBody( otpEmail.otp)
                };
                transporter.sendMail(message, (err, info) => {
                    if (err) {
                        console.log('Error occurred. ' + err.message);
                        return process.exit(1);
                    }
                    res.send({status:true,message:"Email sent Successfully",url : nodemailer.getTestMessageUrl(info)});
                });
            });
        } catch (error) {
            res.send({status:false,message:"Unable to provide service"})
        }
    }

    static LoginCustomer = async(req,res) => {

        const {email,password} = req.body;
        try {
            if(email && password){
                    const collection = await customerModel.findOne({email:email});
                    if(collection && collection !== null){
                        const isPasswordMatch = await  comparePasswords(password,collection.password);
                        console.log(isPasswordMatch)
                        if(collection.email == email && isPasswordMatch){
                            const token = jwt.sign({ userData: collection }, secreatKey, { expiresIn: "1d" });
                            res.status(201).send({status:true,message:"User Logged In successfully",token:token})
                        }else{
                            res.status(200).send({status:false,message:"Email or password are Incorrect !!"});
                        }
                    }else{
                        res.status(200).send({status:false,message:"User doesn't exists"});
                    }
            }else{
                res.send({status:false,message : `Email and Password is Required !!`})
            }    
        } catch (error) {
            console.log(error)
            res.status(501).send({status:false,message : error})
            
        }
        

    }
}
