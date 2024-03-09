import jwt from "jsonwebtoken";
import "dotenv/config";
import customerModel from "../models/customersModel.js";
import DocumentModel from "../models/customer_documents.js";
import moment from "moment";
import bcrypt, { compare } from "bcrypt"
import multer from "multer";
import { getEmailBody, getHashPassword, generateOtp, comparePasswords, getEmailBodyForUploadDocs, WalletEmailBody, getDepositEmailBody } from "../utils/helperFunctions.js";
import nodemailer from "nodemailer";
import WalletModel from "../models/customerWallet.js";
import CustomerActivityModel from "../models/customerActivities.js";
import TransectionModel from "../models/customerTransectionHistory.js";




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
                    //         res.send({ status: true, message: "Email sent Successfully", url: nodemailer.getTestMessageUrl(info) });
                    //     });
                    // });
                    this.SetCustomerActivities(result._id,req.url, req.method, req.body, req.params, req.message);
                    res.status(201).send({ status: true, message: "Customer Registered Successfully", token: token, code: 201, url: `/upload-docs/${result._id}/${token}`,user:result._id });
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
            const collection = new DocumentModel({ customer_id: customer_id, document: [{ doc_path: req.files.file1[0].path, doc_type: "adharcard",uploadedDate:moment().format("DD/MM/YYYY") }, { doc_path: req.files.file2[0].path, doc_type: "Pancard",uploadedDate:moment().format("DD/MM/YYYY") }] });
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
                        res.status(201).send({ status: true, message: "Email sent Successfully", code: 201, otp: otpEmail.otp });
                    });
                });
                this.SetCustomerActivities(user._id,req.url, req.method, req.body, req.params, req.message);
                res.status(201).send({ status: true, message: "Email sent Successfully", code: 201, otp: otpEmail.otp });
            } else {
                res.send({ status: false, message: "User Email not registered", status: 501 })
            }
        } catch (error) {
            res.send({ status: false, message: "Unable to provide service" })
        }
    }

    static checkUSerOTP = async (req, res) => {
        const { otp, email } = req.body;
        try {
            if (otp) {
                const user = await customerModel.findOne({ email: email });
                if (otp == otpEmail.otp) {
                    const token = jwt.sign({ userData: user }, secreatKey, { expiresIn: "1d" });
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
                            html: getEmailBodyForUploadDocs(user._id,email,token)
                        };
                        transporter.sendMail(message, (err, info) => {
                            if (err) {
                                console.log('Error occurred. ' + err.message);
                                return process.exit(1);
                            }
                            res.status(201).send({ status: true, message: "Email sent Successfully", code: 201 });
                        });
                    });
                    res.status(201).send({ status: true, message: "Email sent Successfully", code: 201})
                } else {
                    res.send({ status: false, message: "Please,Enter Valid OTP." });
                }
            }
        } catch (error) {
            res.send({ status: false, message: "Unable to provide service" })
        }
    }

    static ResetUserPassword = async(req,res) => {
        const {password,customer_id} = req.body;
        try {
            if(password && customer_id){
                let collection = await customerModel.findOne({_id:customer_id});
                if(collection !== null){
                    let hashPass = await getHashPassword(password); 
                    let result = await customerModel.updateOne({_id:customer_id},{$set : {password:hashPass}});
                    res.send({status:true,message:"Password updated successfully !",code : 201})
                }else{
                    res.send({status:false,message:"Customer Not Found !!",code : 501})
                }
            }else{
                res.send({status:false,message:"All Fields are Required !",code : 200})
            }
        } catch (error) {
            console.log(error)
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
                        this.SetCustomerActivities(collection._id,req.url, req.method, req.body, req.params, req.message);
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
                    res.status(200).send({ status: false, message: "Customer Not Found", code: 200 });
                }
            } else {
                res.send({ status: false, message: "Please,Provide customer'id", code: 501 });
            }
        } catch (error) {

        }
    }

    static DepositCashAmount = async (req,res) =>{
        const {customer_id,deposit_amount,account_number,emp_id} = req.body;
        try {
            if(customer_id && deposit_amount && account_number && emp_id){
                const customer = await customerModel.findOne({_id:customer_id});
                if(customer !== null ){
                    if(customer.account_number === account_number){
                        const result = await customerModel.updateOne({_id:customer_id},{$set:{current_balance:customer.current_balance + deposit_amount}});
                        this.StoreDepositTransectionHistory({customer_id,deposit_amount,current_balance : customer.current_balance + deposit_amount});
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
                                to: `Recipient <${customer.email}>`,
                                subject: 'Your Deposit Amount has been Credited !!',
                                // text: 'HELLO I AM RAJ MAISURIYA!',
                                html: getDepositEmailBody(customer.first_name,deposit_amount,customer.current_balance + deposit_amount)
                            };
                            transporter.sendMail(message, (err, info) => {
                                if (err) {
                                    console.log('Error occurred. ' + err.message);
                                    return process.exit(1);
                                }
                            });
                        });
                        res.send({status:true,message:`Your Rs.${deposit_amount} has been Credited !! `,code : 201});
                    }else{
                        res.send({status:false,message:"Account Number is not correct !!",code : 200});
                    }
                }else{
                    res.status(501).send({status:false,message:"Customer Not Found",code : 200})
                }
            }else{
                res.status(501).send({status:false,message:"All Fields are Required !!",code : 200});
            }
        } catch (error) {
            console.log(error)
            res.status(501).send({status:false,message:error})
        }
    }

    static WithdrawCashAmount = async (req,res) =>{
        const {customer_id,withdraw_amount,account_number,emp_id} = req.body;
        try {
            if(customer_id && withdraw_amount && account_number && emp_id){
                const customer = await customerModel.findOne({_id:customer_id});
                if(customer !== null ){
                    if(customer.account_number === account_number){
                       if(customer.current_balance <= 500  || customer.current_balance <= withdraw_amount){
                            res.send({status:false,message:"Your Bank Balance is not sufficient !!",code:200});
                       }else{
                        const result = await customerModel.updateOne({_id:customer_id},{$set:{current_balance:customer.current_balance - withdraw_amount}});
                        this.StoreWithdrawTransectionHistory({customer_id,withdraw_amount,current_balance : customer.current_balance - withdraw_amount});
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
                                to: `Recipient <${customer.email}>`,
                                subject: 'Your Deposit Amount has been Credited !!',
                                // text: 'HELLO I AM RAJ MAISURIYA!',
                                html: getDepositEmailBody(customer.first_name,withdraw_amount,customer.current_balance - withdraw_amount)
                            };
                            transporter.sendMail(message, (err, info) => {
                                if (err) {
                                    console.log('Error occurred. ' + err.message);
                                    return process.exit(1);
                                }
                            });
                        });
                        res.send({status:true,message:`Your Rs.${withdraw_amount} has been Debited !! `,code : 201});
                       }
                    }else{
                        res.send({status:false,message:"Account Number is not correct !!",code : 200});
                    }
                }else{
                    res.status(501).send({status:false,message:"Customer Not Found",code : 200})
                }
            }else{
                res.status(501).send({status:false,message:"All Fields are Required !!",code : 200});
            }
        } catch (error) {
            console.log(error)
            res.status(501).send({status:false,message:error})
        }
    }

    static StoreDepositTransectionHistory = async ({customer_id,deposit_amount,current_balance}) =>{
        try {
            const transections = await TransectionModel.findOne({customer_id:customer_id});
            if(transections == null){
                const collection = new TransectionModel({customer_id:customer_id,transections:[{date_of_transection:moment().format("DD-MM-YYYY"),date_of_time:moment().format("hh:mm"),deposit_amount:deposit_amount,current_balance:current_balance}]});
                const result = await collection.save();
            }else{
                let AllTransections = transections.transections || [];
                let newTransection = {
                    date_of_transection:moment().format("DD-MM-YYYY"),
                    date_of_time:moment().format("hh:mm"),
                    deposit_amount:deposit_amount,
                    current_balance:current_balance
                }
                AllTransections.push(newTransection);
                console.log(AllTransections)
                const collection = await  TransectionModel.updateOne({customer_id:customer_id},{$set:{transections:AllTransections}});
                console.log(collection)
            }
        } catch (error) {
            console.log(error)
        }
    }

    static StoreWithdrawTransectionHistory = async ({customer_id,withdraw_amount,current_balance}) =>{
        try {
            const transections = await TransectionModel.findOne({customer_id:customer_id});
            if(transections == null){
                const collection = new TransectionModel({customer_id:customer_id,transections:[{date_of_transection:moment().format("DD-MM-YYYY"),date_of_time:moment().format("hh:mm"),deposit_amount:deposit_amount,current_balance:current_balance}]});
                const result = await collection.save();
            }else{
                let AllTransections = transections.transections || [];
                let newTransection = {
                    date_of_transection:moment().format("DD-MM-YYYY"),
                    date_of_time:moment().format("hh:mm"),
                    withdraw_amount:withdraw_amount,
                    current_balance:current_balance
                }
                AllTransections.push(newTransection);
                console.log(AllTransections)
                const collection = await  TransectionModel.updateOne({customer_id:customer_id},{$set:{transections:AllTransections}});
                console.log(collection)
            }
        } catch (error) {
            console.log(error)
        }
    }

    static AddWallet = async (req, res) => {
        const { id, email, walletBalance,mpin } = req.body;
        try {
            if (id && email && walletBalance) {
                const customer = await customerModel.findOne({ email: email });
                if (customer != null) {
                    const comparePIN = await comparePasswords(mpin,customer.pin);
                    if(comparePIN === true){
                        if (customer.current_balance >= walletBalance) {
                            let customerWallet = await WalletModel.findOne({customer_email : email});
                            console.log(customerWallet)
                            const customer2 = await customerModel.updateOne({_id:id},{$set:{current_balance:customer.current_balance - walletBalance}});
                            if(customerWallet !== null){ 
                                let wallet2 = await WalletModel.updateOne({customer_email:email},{$set:{walletBalance : customerWallet.walletBalance + Number(walletBalance) }});
                            }else{
                                let wallet = new WalletModel({ customer: id, customer_email: email, walletBalance: Number(walletBalance),last_updated_date:moment().format('DD/MM/YYYY') });
                                let result = await wallet.save();
                            }
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
                                    html: WalletEmailBody(customer.first_name + " " + customer.last_name,walletBalance)
                                };
                                transporter.sendMail(message, (err, info) => {
                                    if (err) {
                                        console.log('Error occurred. ' + err.message);
                                        return process.exit(1);
                                    }
                                    emailURL = nodemailer.getTestMessageUrl(info);
                                    // linkUrl = nodemailer.getTestMessageUrl(info);
                                    res.send({ status: true, message: "Email sent Successfully", url: nodemailer.getTestMessageUrl(info) });
                                });
                            });
                            res.status(201).send({status:true,message:"You Wallet Has been Updated !!",code : 201});
                        } else {
                            res.send({ status: false, code: 200, message: "your Bank Balance is not sufficiant !!" });
                        }
                    }else{
                        res.send({status:false,message:"MPIN is Not Correct !!"})
                    }
                    
                } else {
                    res.status(501).send({ status: false, message: "Customer doen't Exists", code: 200 })
                }
            } else {
                res.status(501).send({ status: false, message: "Please,Provide Customer's Crediantials ...", code: 200 })
            }
        } catch (error) {
            console.log(error)
        }
    }



    static SetCustomerActivities = async (id,url, method, body, params, message) => {
        try {
            const result = new CustomerActivityModel({
                customer_id:id,
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
}
