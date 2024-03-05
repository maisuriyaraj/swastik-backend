import jwt from "jsonwebtoken";
import "dotenv/config";
import customerModel from "../models/customersModel.js";
import DocumentModel from "../models/customer_documents.js";
import moment from "moment";
import bcrypt from "bcrypt"
import multer from "multer";
import { getEmailBody, getHashPassword, generateOtp, comparePasswords, getEmailBodyForUploadDocs } from "../utils/helperFunctions.js";
import nodemailer from "nodemailer";




const secreatKey = process.env.SCREATE_KEY;
let otpEmail = {
    otp: ""
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
            marital_status,
            nationality,
            account_type,
            gender
        } = req.body;

        const min = 10000000000000;
        const max = 99999999999999;
        let account_number = Math.floor(Math.random() * (max - min + 1)) + min;

        if (req.body) {
            try {
                let emailURL = ""
                const registered = await customerModel.findOne({ $or: [{ email: email }, { adhar_number: adhar_number }, { pan_number: pan_number }] });
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
                        marital_status: marital_status,
                        nationality: nationality,
                        account_type: account_type,
                        account_number: account_number,
                        gender: gender
                    });

                    const result = await collection.save();
                    const token = jwt.sign({ userData: collection }, secreatKey, { expiresIn: "1d" });
                    // nodemailer.createTestAccount((err, account) => {
                    //     if (err) {
                    //         console.error('Failed to create a testing account. ' + err.message);
                    //         return process.exit(1);
                    //     }

                    //     // Create a SMTP transporter object
                    //     const transporter = nodemailer.createTransport({
                    //         host: 'smtp.gmail.com',
                    //         port: 587,
                    //         secure:false,
                    //         auth: {
                    //             user: 'rajmaisuria111@gmail.com',
                    //             pass: 'pmks qvya coug ekih'
                    //         }
                    //     });

                    //     // Message object
                    //     let message = {
                    //         from: `Sender Name <swastikfinance@gmail.com>`,
                    //         to: `Recipient <${email}>`,
                    //         subject: 'Nodemailer is unicode friendly ✔',
                    //         // text: 'HELLO I AM RAJ MAISURIYA!',
                    //         html: getEmailBodyForUploadDocs(result._id, email, token)
                    //     };
                    //     transporter.sendMail(message, (err, info) => {
                    //         if (err) {
                    //             console.log('Error occurred. ' + err.message);
                    //             return process.exit(1);
                    //         }
                    //         emailURL = nodemailer.getTestMessageUrl(info);
                    //         // linkUrl = nodemailer.getTestMessageUrl(info);
                    //         console.log({ url: nodemailer.getTestMessageUrl(info) });
                    //         res.send({ status: true, message: "Email sent Successfully", url: nodemailer.getTestMessageUrl(info) });
                    //     });
                    // });
                    res.status(201).send({ status: true, message: "Customer Registered Successfully", token: token, code: 201, url: `/upload-docs/${result._id}/${token}` });
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
            const { customer_id } = req.params;
            const { documents, doc_type } = req.body;
            const collection = new DocumentModel({ customer_id: customer_id, document: [{ doc_path: req.files.file1[0].path, doc_type: "adharcard" }, { doc_path: req.files.file2[0].path, doc_type: "Pancard" }] });
            const result = await collection.save();
            res.status(201).send({ status: true, message: "Documents Uploaded Sucessfully" });
        } catch (error) {
            console.log(error)
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
            const user = await customerModel.findOne({ email: email }).select({ email: 1 });
            if (user !== null) {
                // Generate SMTP service account from ethereal.email
                nodemailer.createTestAccount((err, account) => {
                    if (err) {
                        console.error('Failed to create a testing account. ' + err.message);
                        return process.exit(1);
                    }

                    // Create a SMTP transporter object
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        auth: {
                            user: 'rajmaisuria111@gmail.com',
                            pass: 'pmks qvya coug ekih'
                        }
                    });

                    // Message object
                    let message = {
                        from: `Sender Name <swastikfinance@gmail.com>`,
                        to: `Recipient <${email}>`,
                        subject: 'Nodemailer is unicode friendly ✔',
                        // text: 'HELLO I AM RAJ MAISURIYA!',
                        html: getEmailBody(otpEmail.otp)
                    };
                    transporter.sendMail(message, (err, info) => {
                        if (err) {
                            console.log('Error occurred. ' + err.message);
                            return process.exit(1);
                        }
                        res.status(201).send({ status: true, message: "Email sent Successfully", code :201,otp:otpEmail.otp });
                    });
                });
                res.status(201).send({ status: true, message: "Email sent Successfully", code :201,otp:otpEmail.otp });
            }else{
                res.send({ status: false, message: "User Email not registered", status:501 })
            }
        } catch (error) {
            res.send({ status: false, message: "Unable to provide service" })
        }
    }

    static checkUSerOTP = async (req,res) =>{
        const {otp,email} = req.body;
        try {
            if(otp){
                const user = await customerModel.findOne({ email: email });
                if(otp == otpEmail.otp){
                    const token = jwt.sign({ userData: user }, secreatKey, { expiresIn: "1d" });
                    res.status(201).send({ status: true, message: "User Logged In successfully", token: token, code: 201, user: user._id })
                }else{
                    res.send({status:false,message : "Please,Enter Valid OTP."});
                }
            }
        } catch (error) {
            res.send({ status: false, message: "Unable to provide service" })
        }
    }

    static LoginCustomer = async (req, res) => {

        const { email, password } = req.body;
        try {
            if (email && password) {
                const collection = await customerModel.findOne({ email: email });
                if (collection && collection !== null) {
                    const isPasswordMatch = await comparePasswords(password, collection.password);
                    const isPinMatch = await comparePasswords(password, collection.pin);
                    if (collection.email == email && isPasswordMatch || isPinMatch) {
                        const token = jwt.sign({ userData: collection }, secreatKey, { expiresIn: "1d" });
                        res.status(201).send({ status: true, message: "User Logged In successfully", token: token, code: 201, user: collection._id })
                    } else {
                        res.status(200).send({ status: false, message: "Email or password are Incorrect !!", code: 501 });
                    }
                } else {
                    res.status(200).send({ status: false, message: "User doesn't exists" });
                }
            } else {
                res.send({ status: false, message: `Email and Password is Required !!` })
            }
        } catch (error) {
            console.log(error)
            res.status(501).send({ status: false, message: error })

        }


    }

    static GetCustomerDetails = async (req, res) => {
        const { id } = req.body;
        try {
            if (id) {
                const customer = await customerModel.findOne({ _id: id }).select('-password -pin');
                if (customer != null && customer != {}) {
                    res.status(201).send({ status: true, message: "Customer's Data Fetch successfully !", code: 201, data: customer });
                } else {
                    res.status(200).send({ status: false, message: "Customer Not Found", code: 200 });
                }
            } else {
                res.send({ status: false, message: "Please,Provide customer'id", code: 501 });
            }
        } catch (error) {

        }
    }

    static getCustomerDocs = async (req, res) => {
        const { id } = req.body;
        try {
            if (id) {
                const customer = await DocumentModel.findOne({ customer_id: id }).populate('customer_id');
                if (customer != null && customer != {}) {
                    res.status(201).send({ status: true, message: "Customer's Documents Fetch successfully !", code: 201, data: customer });
                } else {
                    console.log(customer)
                    res.status(200).send({ status: false, message: "Customer Not Found", code: 200 });
                }
            } else {
                res.send({ status: false, message: "Please,Provide customer'id", code: 501 });
            }
        } catch (error) {

        }
    }
}
