import jwt from "jsonwebtoken";
import "dotenv/config";
import customerModel from "../models/customersModel.js";
import DocumentModel from "../models/customer_documents.js";
import moment from "moment";
import bcrypt, { compare } from "bcrypt";
import multer from "multer";
import { getEmailBody, getHashPassword, sendWelcomeEmail, generateOtp, comparePasswords, getEmailBodyForResetPAss, WalletEmailBody, getDepositEmailBody, getWithdrawEmailBody, sendDocumentManagemantEmailTemplate, sendApprovalEmail, sendUploadIndentityDocuments } from "../utils/helperFunctions.js";
import nodemailer from "nodemailer";
import WalletModel from "../models/customerWallet.js";
import CustomerActivityModel from "../models/customerActivities.js";
import TransectionModel from "../models/customerTransectionHistory.js";
import mongoose from "mongoose";
import LoanApplication from "../models/loanApplicationModel.js";
import cron from "node-cron";

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
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });

                        // Message object
                        let message = {
                            from: `SWastik Finance <swastikfinance@gmail.com>`,
                            to: `Recipient <${email}>`,
                            subject: 'Nodemailer is unicode friendly ✔',
                            html: sendWelcomeEmail(first_name + " " + last_name)
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
                    this.SetCustomerActivities(result._id, req.url, req.method, req.body, req.params, req.message);
                    res.status(201).send({ status: true, message: "Customer Registered Successfully", token: token, code: 201, url: `/upload-docs/${result._id}`, user: result._id });
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
            const collection = new DocumentModel({ customer_id: customer_id, document: [{ doc_path: req.files.file1[0].path, doc_type: "adharcard", uploadedDate: moment().format("DD/MM/YYYY") }, { doc_path: req.files.file2[0].path, doc_type: "Pancard", uploadedDate: moment().format("DD/MM/YYYY") }] });
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

    static uploadProfile = async (req, res) => {
        try {
            const { customer_id } = req.params;
            console.log(req.file)
            const collection = await customerModel.updateOne({ _id: customer_id }, { $set: { customer_profile: req.file.path } });
            res.status(201).send({ status: true, message: "Your Profile Picture Updated successfully !" });
        } catch (error) {
            res.status(501).send({ status: false, message: "Unable To Provide Service !!" });
            console.log(error)
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
                        },
                        tls: {
                            rejectUnauthorized: false
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
                this.SetCustomerActivities(user._id, req.url, req.method, req.body, req.params, req.message);
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
                            },
                            tls: {
                                rejectUnauthorized: false
                            }
                        });

                        // Message object
                        let message = {
                            from: `Sender Name <swastikfinance@gmail.com>`,
                            to: `Recipient <${email}>`,
                            subject: 'Nodemailer is unicode friendly ✔',
                            // text: 'HELLO I AM RAJ MAISURIYA!',
                            html: getEmailBodyForResetPAss(user._id, email, token)
                        };
                        transporter.sendMail(message, (err, info) => {
                            if (err) {
                                console.log('Error occurred. ' + err.message);
                                return process.exit(1);
                            }
                            res.status(201).send({ status: true, message: "Email sent Successfully", code: 201 });
                        });
                    });
                    res.status(201).send({ status: true, message: "Email sent Successfully", code: 201 })
                } else {
                    res.send({ status: false, message: "Please,Enter Valid OTP." });
                }
            }
        } catch (error) {
            res.send({ status: false, message: "Unable to provide service" })
        }
    }

    static ResetUserPassword = async (req, res) => {
        const { password, customer_id } = req.body;
        try {
            if (password && customer_id) {
                let collection = await customerModel.findOne({ _id: customer_id });
                if (collection !== null) {
                    let hashPass = await getHashPassword(password);
                    let result = await customerModel.updateOne({ _id: customer_id }, { $set: { password: hashPass } });
                    res.send({ status: true, message: "Password updated successfully !", code: 201 })
                } else {
                    res.send({ status: false, message: "Customer Not Found !!", code: 501 })
                }
            } else {
                res.send({ status: false, message: "All Fields are Required !", code: 200 })
            }
        } catch (error) {
            console.log(error);
            res.status(501).send({ status: false, message: "Unable to provide Service !", code: 501 })
        }
    }

    static getTrasectionsDetails = async (req, res) => {
        const { customer_id } = req.body;
        try {
            let transections = await TransectionModel.findOne({ customer_id: customer_id });
            if (transections !== null) {
                res.status(201).send({ status: true, message: "Date Fetched Successfully", data: transections });
            } else {
                res.status(201).send({ status: true, message: "No Transection Available !", data: [] });
            }
        } catch (error) {
            console.log(error);
            res.status(501).send({ status: false, message: "Unable to provide Service !", code: 501 })
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
                        this.SetCustomerActivities(collection._id, req.url, req.method, req.body, req.params, req.message);
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

    static DepositCashAmount = async (req, res) => {
        const { customer_id, deposit_amount, account_number, emp_id } = req.body;
        try {
            if (customer_id && deposit_amount && account_number && emp_id) {
                const customer = await customerModel.findOne({ _id: customer_id });
                if (customer !== null) {
                    if (customer.account_number === account_number) {
                        const result = await customerModel.updateOne({ _id: customer_id }, { $set: { current_balance: customer.current_balance + deposit_amount } });
                        this.StoreDepositTransectionHistory({ customer_id, deposit_amount, current_balance: customer.current_balance + deposit_amount });
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
                                },
                                tls: {
                                    rejectUnauthorized: false
                                }
                            });

                            // Message object
                            let message = {
                                from: `Sender Name <swastikfinance@gmail.com>`,
                                to: `Recipient <${customer.email}>`,
                                subject: 'Your Deposit Amount has been Credited !!',
                                // text: 'HELLO I AM RAJ MAISURIYA!',
                                html: getDepositEmailBody(customer.first_name, deposit_amount, customer.current_balance + deposit_amount)
                            };
                            transporter.sendMail(message, (err, info) => {
                                if (err) {
                                    console.log('Error occurred. ' + err.message);
                                    return process.exit(1);
                                }
                            });
                        });
                        res.send({ status: true, message: `Your Rs.${deposit_amount} has been Credited !! `, code: 201 });
                    } else {
                        res.send({ status: false, message: "Account Number is not correct !!", code: 200 });
                    }
                } else {
                    res.status(501).send({ status: false, message: "Customer Not Found", code: 200 })
                }
            } else {
                res.status(501).send({ status: false, message: "All Fields are Required !!", code: 200 });
            }
        } catch (error) {
            console.log(error)
            res.status(501).send({ status: false, message: error })
        }
    }

    static WithdrawCashAmount = async (req, res) => {
        const { customer_id, withdraw_amount, account_number, emp_id } = req.body;
        try {
            if (customer_id && withdraw_amount && account_number && emp_id) {
                const customer = await customerModel.findOne({ _id: customer_id });
                if (customer !== null) {
                    if (customer.account_number === account_number) {
                        if (customer.current_balance <= 500 || customer.current_balance <= withdraw_amount) {
                            res.send({ status: false, message: "Your Bank Balance is not sufficient !!", code: 200 });
                        } else {
                            const result = await customerModel.updateOne({ _id: customer_id }, { $set: { current_balance: customer.current_balance - withdraw_amount } });
                            this.StoreWithdrawTransectionHistory({ customer_id, withdraw_amount, current_balance: customer.current_balance - withdraw_amount });
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
                                    },
                                    tls: {
                                        rejectUnauthorized: false
                                    }
                                });

                                // Message object
                                let message = {
                                    from: `Sender Name <swastikfinance@gmail.com>`,
                                    to: `Recipient <${customer.email}>`,
                                    subject: `Rs.${withdraw_amount} has been dabited from your account .`,
                                    // text: 'HELLO I AM RAJ MAISURIYA!',
                                    html: getWithdrawEmailBody(customer.first_name, withdraw_amount, customer.current_balance - withdraw_amount)
                                };
                                transporter.sendMail(message, (err, info) => {
                                    if (err) {
                                        console.log('Error occurred. ' + err.message);
                                        return process.exit(1);
                                    }
                                });
                            });
                            res.send({ status: true, message: `Your Rs.${withdraw_amount} has been Debited !! `, code: 201 });
                        }
                    } else {
                        res.send({ status: false, message: "Account Number is not correct !!", code: 200 });
                    }
                } else {
                    res.status(501).send({ status: false, message: "Customer Not Found", code: 200 })
                }
            } else {
                res.status(501).send({ status: false, message: "All Fields are Required !!", code: 200 });
            }
        } catch (error) {
            console.log(error)
            res.status(501).send({ status: false, message: error })
        }
    }

    static OnlineTransections = async (req, res) => {
        const { payer_id, payer_mpin, payee_id, message, amount } = req.body
        try {
            if (payer_id && payer_mpin && payee_id && message && amount) {
                if (amount < 10000) {
                    const payer = await customerModel.findOne({ _id: payer_id });
                    const payment_receiver = await customerModel.findOne({ _id: payee_id });
                    const isAuthenticated = await comparePasswords(payer_mpin, payer.pin)
                    if (isAuthenticated) {
                        if (amount < payer.current_balance) {
                            const payerUpdated = await customerModel.updateOne({ _id: payer_id }, { $inc: { current_balance: -amount } });
                            this.StoreWithdrawTransectionHistory({ customer_id: payer_id, withdraw_amount: amount, current_balance: payer.current_balance - amount, message: message });
                            const payee = await customerModel.updateOne({ _id: payee_id }, { $inc: { current_balance: amount } })
                            this.StoreDepositTransectionHistory({ customer_id: payee_id, deposit_amount: amount, current_balance: Number(payment_receiver.current_balance) + Number(amount) });
                            res.status(201).send({ status: true, message: "Your Transection is Successfull !", code: 201 });
                        } else {
                            res.send({ status: false, message: "Your Bank Balance is not Sufficient !" })
                        }
                    } else {
                        res.status(200).send({ status: false, message: "Mpin is Not Correct", code: 501 });
                    }
                } else {
                    res.send({ status: false, message: "You can't Pay more than Rs.10,000" });
                }
            } else {
                res.status(501).send({ status: false, message: "All Fields Are Required !!" });
            }
        } catch (error) {
            console.log(error)
            res.status(501).send({ status: false, message: error })
        }
    }

    static StoreDepositTransectionHistory = async ({ customer_id, deposit_amount, current_balance }) => {
        try {
            const transections = await TransectionModel.findOne({ customer_id: customer_id });
            if (transections == null) {
                const collection = new TransectionModel({ customer_id: customer_id, transections: [{ date_of_transection: moment().format("DD-MM-YYYY"), date_of_time: moment().format("hh:mm"), deposit_amount: deposit_amount, message: "Deposite From Bank", current_balance: current_balance }] });
                const result = await collection.save();
            } else {
                let AllTransections = transections.transections || [];
                let newTransection = {
                    date_of_transection: moment().format("DD-MM-YYYY"),
                    date_of_time: moment().format("hh:mm"),
                    deposit_amount: deposit_amount,
                    current_balance: current_balance,
                    message: "Deposite From Bank"
                }
                AllTransections.push(newTransection);
                const collection = await TransectionModel.updateOne({ customer_id: customer_id }, { $set: { transections: AllTransections } });
            }
        } catch (error) {
            console.log(error)
        }
    }

    static StoreWithdrawTransectionHistory = async ({ customer_id, withdraw_amount, current_balance, message }) => {
        try {
            const transections = await TransectionModel.findOne({ customer_id: customer_id });
            if (transections == null) {
                const collection = new TransectionModel({ customer_id: customer_id, transections: [{ date_of_transection: moment().format("DD-MM-YYYY"), date_of_time: moment().format("hh:mm"), withdraw_amount: withdraw_amount, message: "Withdraw From Bank", current_balance: current_balance }] });
                const result = await collection.save();
            } else {
                let AllTransections = transections.transections || [];
                let newTransection = {
                    date_of_transection: moment().format("DD-MM-YYYY"),
                    date_of_time: moment().format("hh:mm"),
                    withdraw_amount: withdraw_amount,
                    current_balance: current_balance,
                    message: message || 'Withdrawal'
                }
                AllTransections.push(newTransection);
                const collection = await TransectionModel.updateOne({ customer_id: customer_id }, { $set: { transections: AllTransections } });
                console.log(collection)
            }
        } catch (error) {
            console.log(error)
        }
    }

    static AddWallet = async (req, res) => {
        const { id, email, walletBalance, mpin } = req.body;
        try {
            if (id && email && walletBalance) {
                const customer = await customerModel.findOne({ email: email });
                if (customer != null) {
                    const comparePIN = await comparePasswords(mpin, customer.pin);
                    if (comparePIN === true) {
                        if (customer.current_balance >= walletBalance) {
                            let customerWallet = await WalletModel.findOne({ customer_email: email });
                            const customer2 = await customerModel.updateOne({ _id: id }, { $set: { current_balance: customer.current_balance - walletBalance } });
                            if (customerWallet !== null) {
                                let wallet2 = await WalletModel.updateOne({ customer_email: email }, { $set: { walletBalance: customerWallet.walletBalance + Number(walletBalance) } });
                            } else {
                                let wallet = new WalletModel({ customer: id, customer_email: email, walletBalance: Number(walletBalance), last_updated_date: moment().format('DD/MM/YYYY') });
                                let result = await wallet.save();
                            }
                            this.StoreWithdrawTransectionHistory({ customer_id: id, withdraw_amount: walletBalance, current_balance: customer.current_balance - walletBalance, message: "For Swastik Wallet" });
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
                                    },
                                    tls: {
                                        rejectUnauthorized: false
                                    }
                                });

                                // Message object
                                let message = {
                                    from: `Sender Name <swastikfinance@gmail.com>`,
                                    to: `Recipient <${email}>`,
                                    subject: 'Nodemailer is unicode friendly ✔',
                                    // text: 'HELLO I AM RAJ MAISURIYA!',
                                    html: WalletEmailBody(customer.first_name + " " + customer.last_name, walletBalance)
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
                            res.status(201).send({ status: true, message: "You Wallet Has been Updated !!", code: 201 });
                        } else {
                            res.send({ status: false, code: 200, message: "your Bank Balance is not sufficiant !!" });
                        }
                    } else {
                        res.send({ status: false, message: "MPIN is Not Correct !!" })
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

    static getWalletDetails = async (req, res) => {
        const { customer_id } = req.body;
        try {
            if (customer_id) {
                let result = await WalletModel.findOne({ customer: customer_id });
                if (result) {
                    res.status(201).send({ status: true, message: "Date Fetched Successfully", data: result });
                } else {
                    res.send({ status: false, message: "No Wallet Found,please Create an Wallet" })
                }
            } else {
                res.send({ status: false, message: "PLease Provide Customer ID", code: 200 });
            }
        } catch (error) {
            console.log(error);
            res.status(501).send({ status: false, message: "Unable to provide Service" })
        }
    }



    static SetCustomerActivities = async (id, url, method, body, params, message) => {
        try {
            const result = new CustomerActivityModel({
                customer_id: id,
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

    static ApplyForLoan = async (req, res) => {
        try {
            const { customer_id, pan_number, account_number } = req.body;
            if (req.body) {
                const collection = new LoanApplication(req.body);
                const result = await collection.save();
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
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });

                    // Message object
                    let message = {
                        from: `Swastik Finance <swastikfinance@gmail.com>`,
                        to: `Recipient <${req.body.personalInformation.email}>`,
                        subject: 'Loan Application has Submitted !!',
                        // text: 'HELLO I AM RAJ MAISURIYA!',
                        html: `
                            Mr.${req.body.personalInformation.fullName} , Your Loan Application Has Submitted Succcessfully !!..
                            We Will Inform You to What is Next Step After Your Loan Application Approve by Our Branch Manager !..

                            Thank you for Choosing Our Swastik Finance Bank !!
                        
                        `
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
                res.send({ status: true, message: "Your Loan Application has Submitted !!" })
            } else {
                res.status(501).send({ status: false, message: "Please Provide All the Details !!" })
            }
        } catch (error) {
            console.log(error);
        }
    }

    static ApproveOrRejectApplication = async (req, res) => {
        try {
            const { loan_id, account_number, email, status } = req.body;
            if (loan_id, account_number) {
                const application = await LoanApplication.findOne({ '_id': loan_id });
                if (application !== null) {
                    const result = await LoanApplication.updateOne({ "_id": loan_id }, { $set: { "loanDetails.loan_status": status } });
                    if (result) {
                        if (status == "Approved") {
                            this.DepositRequestLoanAmount({ customer_id: application.personalInformation.customer_id, deposit_amount: application.loanDetails.loanAmountRequested, account_number: application.personalInformation.Account_no });
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
                                    },
                                    tls: {
                                        rejectUnauthorized: false
                                    }
                                });

                                // Message object
                                let message = {
                                    from: `Swastik Finance <swastikfinance@gmail.com>`,
                                    to: `Recipient <${email}>`,
                                    subject: 'Your Loan is Approved',
                                    html: sendApprovalEmail(application.personalInformation.fullName)
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
                        } else {
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
                                    },
                                    tls: {
                                        rejectUnauthorized: false
                                    }
                                });

                                // Message object
                                let message = {
                                    from: `Swastik Finance <swastikfinance@gmail.com>`,
                                    to: `Recipient <${email}>`,
                                    subject: 'Your Application Information',
                                    html: `Your Loan Application has been ${status}. Thank you !`
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
                        }
                        res.send({ status: true, message: "Loan Status Updated Successfully !!" });
                    }
                } else {
                    res.send({ status: false, message: "Loan Application not Found !!" })
                }
            } else {
                res.send({ status: false, message: "Please Provide Loan id" });
            }
        } catch (error) {
            console.log(error);
        }
    }

    static getLoanDetails = async (req, res) => {
        try {
            const { customer_id } = req.body;
            const result = await LoanApplication.find({ 'personalInformation.customer_id': customer_id });
            if (result != []) {
                res.send({ status: true, message: "Data Fetched Successfully !!", data: result });
            } else {
                res.send({ status: false, message: "Loan Details NOt Found !!" });
            }
        } catch (error) {

        }
    }

    static getALlLOanDetails = async (req, res) => {
        try {
            const result = await LoanApplication.find({});
            if (result != []) {
                res.send({ status: true, message: "Data Fetched Successfully !!", data: result });
            } else {
                res.send({ status: false, message: "Loan Details NOt Found !!" });
            }
        } catch (error) {

        }
    }

    static getLoanDetailsbyLoanID = async (req, res) => {
        try {
            const { loan_id } = req.body;
            const result = await LoanApplication.findOne({ _id: loan_id });
            if (result != null) {
                res.send({ status: true, message: "Data Fetched Successfully !!", data: result });
            } else {
                res.send({ status: false, message: "Loan Details NOt Found !!" });
            }
        } catch (error) {

        }
    }

    static sendDocumentManagemantEmail = async (req, res) => {
        try {

            const { email } = req.body;
            if (email) {
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
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });

                    // Message object
                    let message = {
                        from: `Swastik Finance <swastikfinance@gmail.com>`,
                        to: `Recipient <${email}>`,
                        subject: 'Your Application Information',
                        html: sendDocumentManagemantEmailTemplate()
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
                res.send({ status: true, message: "Email Sent Successfully !!" });
            } else {
                res.send({ status: false, message: "Please Provide recipient Email" });
            }
        } catch (error) {
            res.send({ status: false, message: "Unable to Provide Service" });
            console.log(error);
        }
    }

    static uploadLoanDocuments = async (req, res) => {
        try {
            const { loan_id } = req.params;
            const { customer_id } = req.params;
            const collection = await LoanApplication.updateOne({ _id: loan_id }, {
                $set: {
                    documents: [
                        { doc_path: req.files.file1[0].path, doc_type: "Adhar Card", uploadedDate: moment().format("DD/MM/YYYY"), uploadStatus: true },
                        { doc_path: req.files.file2[0].path, doc_type: "Electricity Bill", uploadedDate: moment().format("DD/MM/YYYY"), uploadStatus: true },
                        { doc_path: req.files.file3[0].path, doc_type: "Bank statements", uploadedDate: moment().format("DD/MM/YYYY"), uploadStatus: true },
                        { doc_path: req.files.file4[0].path, doc_type: "Property tax receipt", uploadedDate: moment().format("DD/MM/YYYY"), uploadStatus: true },
                        { doc_path: req.files.file5[0].path, doc_type: "Loan Application Form", uploadedDate: moment().format("DD/MM/YYYY"), uploadStatus: true }
                    ]
                }
            });
            res.status(201).send({ status: true, message: "Documents Uploaded Sucessfully" })
        } catch (error) {
            console.log(error)
            res.status(501).send({ status: false, message: "Unable to Providde Service" })
        }
    }

    static verifyLoanDocuments = async (req, res) => {
        try {
            const { doc_id, loan_id, status } = req.body;
            const loanApplication = await LoanApplication.findOne({ _id: loan_id });
            if (loanApplication) {
                const result = await LoanApplication.findByIdAndUpdate(
                    loan_id,
                    { $set: { "documents.$[doc].verified": status ? true : false } },
                    { arrayFilters: [{ "doc._id": doc_id }], new: true }
                );
                if (result) {
                    res.send({ status: true, message: "Document Status Updated Successfully" });
                } else {
                    res.send({ status: false, message: "Something went Wrong!!" });
                }
            }
        } catch (error) {
            console.log(error);
            res.send({ status: true, message: "Unable to provide service !" });
        }
    }

    static DepositRequestLoanAmount = async (data) => {
        const { customer_id, deposit_amount, account_number } = data;
        try {
            if (customer_id && deposit_amount && account_number) {
                const customer = await customerModel.findOne({ _id: customer_id });
                if (customer !== null) {
                    if (customer.account_number === account_number) {
                        const result = await customerModel.updateOne({ _id: customer_id }, { $set: { current_balance: customer.current_balance + deposit_amount } });
                        this.StoreDepositTransectionHistory({ customer_id, deposit_amount, current_balance: customer.current_balance + deposit_amount });
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
                                },
                                tls: {
                                    rejectUnauthorized: false
                                }
                            });

                            // Message object
                            let message = {
                                from: `Sender Name <swastikfinance@gmail.com>`,
                                to: `Recipient <${customer.email}>`,
                                subject: 'Your Deposit Amount has been Credited !!',
                                // text: 'HELLO I AM RAJ MAISURIYA!',
                                html: getDepositEmailBody(customer.first_name, deposit_amount, customer.current_balance + deposit_amount)
                            };
                            transporter.sendMail(message, (err, info) => {
                                if (err) {
                                    console.log('Error occurred. ' + err.message);
                                    return process.exit(1);
                                }
                            });
                        });
                        // res.send({ status: true, message: `Your Rs.${deposit_amount} has been Credited !! `, code: 201 });
                    } else {
                        // res.send({ status: false, message: "Account Number is not correct !!", code: 200 });
                    }
                } else {
                    // res.status(501).send({ status: false, message: "Customer Not Found", code: 200 })
                }
            } else {
                // res.status(501).send({ status: false, message: "All Fields are Required !!", code: 200 });
            }
        } catch (error) {
            console.log(error)
            // res.status(501).send({ status: false, message: error })
        }
    }

    static getCustomerProfile = async (req, res) => {
        try {
            const { customer_id } = req.body;
            if (customer_id) {
                const result = await customerModel.findOne({ _id: customer_id }, { customer_profile: 1 });
                if (result) {
                    res.send({ status: true, data: result });
                } else {
                    res.send({ status: false, message: "No data Found" });
                }
            }
        } catch (error) {

        }
    }

    static WithDrawLoanEMI = async (req, res) => {
        const { customer_id, withdraw_amount, account_number, emp_id } = req.body;
        try {
            if (customer_id && withdraw_amount && account_number && emp_id) {
                const customer = await customerModel.findOne({ _id: customer_id });
                if (customer !== null) {
                    if (customer.account_number === account_number) {
                        if (customer.current_balance <= 500 || customer.current_balance <= withdraw_amount) {
                            res.send({ status: false, message: "Your Bank Balance is not sufficient !!", code: 200 });
                        } else {
                            const result = await customerModel.updateOne({ _id: customer_id }, { $set: { current_balance: customer.current_balance - withdraw_amount } });
                            this.StoreWithdrawTransectionHistory({ customer_id, withdraw_amount, current_balance: customer.current_balance - withdraw_amount });
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
                                    },
                                    tls: {
                                        rejectUnauthorized: false
                                    }
                                });

                                // Message object
                                let message = {
                                    from: `Sender Name <swastikfinance@gmail.com>`,
                                    to: `Recipient <${customer.email}>`,
                                    subject: `Rs.${withdraw_amount} has been dabited from your account .`,
                                    // text: 'HELLO I AM RAJ MAISURIYA!',
                                    html: getWithdrawEmailBody(customer.first_name, withdraw_amount, customer.current_balance - withdraw_amount)
                                };
                                transporter.sendMail(message, (err, info) => {
                                    if (err) {
                                        console.log('Error occurred. ' + err.message);
                                        return process.exit(1);
                                    }
                                });
                            });
                            res.send({ status: true, message: `Your Rs.${withdraw_amount} has been Debited !! `, code: 201 });
                        }
                    } else {
                        res.send({ status: false, message: "Account Number is not correct !!", code: 200 });
                    }
                } else {
                    res.status(501).send({ status: false, message: "Customer Not Found", code: 200 })
                }
            } else {
                res.status(501).send({ status: false, message: "All Fields are Required !!", code: 200 });
            }
        } catch (error) {
            console.log(error)
            res.status(501).send({ status: false, message: error })
        }
    }

    static UploadIdentityDocsEmail = async (req,res) =>{
        try {
            const {email} = req.body;
            if(email)   {
                const customer_id = await customerModel.findOne({email:email},{_id:1,first_name:1,last_name:1});
                console.log(customer_id);
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
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });

                    // Message object
                    let message = {
                        from: `SWastik Finance <swastikfinance@gmail.com>`,
                        to: `Recipient <${email}>`,
                        subject: 'Please upload your Documents',
                        html: sendUploadIndentityDocuments(customer_id.first_name + " " + customer_id.last_name,customer_id._id)
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
                res.send({status:true,message:"Email Sent Successfully !"})
            }else{
                res.send({status:false,message : "Please Provide user Email"})
            }
        } catch (error) {
            console.log(error)
            res.send({status:false,message:"Unable to provide service"});
        }
    }
}