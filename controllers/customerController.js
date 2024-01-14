import jwt from "jsonwebtoken";
import "dotenv/config";
import customerModel from "../models/customersModel.js";
import DocumentModel from "../models/customer_documents.js";
import moment from "moment";
import multer from "multer";
import { getHashPassword } from "../utils/helperFunctions.js";

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
            accept_Terms
        } = req.body;

        if (req.body) {
            try {
                const registered = await customerModel.findOne({ $or:[ {email: email}, {adhar_number: adhar_number}, {pan_number: pan_number}] });
                if (registered && registered !== null) {
                    if( registered.adhar_number == adhar_number){
                        res.status(200).send({status:false,message:"Your Adhar Number is already registered"});
                    }else if(registered.pan_number == pan_number){
                        res.status(200).send({status:false,message:"Your Pan Number is already registered"});}

                    else if(registered.email == email){
                        res.status(200).send({status:false,message:"Your Email is already registered"});
                    }else{
                        res.status(200).send({ status: false, message: "User Already Registered, Please Login.." });
                    }
                } else {
                    let hashPass = await  getHashPassword(password);
                    let hashPin = await   getHashPassword(pin)
                    const collection = new customerModel({
                        first_name: first_name,
                        last_name: last_name,
                        email: email,
                        password: hashPass,
                        pin: hashPin,
                        dob: moment(dob,"YYYY-MM-DD",true).isValid() ? new Date(dob) : null,
                        phone: phone,
                        address: address,
                        pan_number: pan_number,
                        adhar_number: adhar_number,
                        accept_Terms: accept_Terms
                    });
                    const result = await collection.save();
                    res.status(201).send({ status: true, message: "Customer Registered Successfully" });
                }
            } catch (error) {
                console.log(error)
                res.status(501).send({ status: false, message: "Unable to provide Services", code: 501 })

            }
        } else {
            res.status(200).send({ status: false, message: "Please Provide All the Required Details !", code: 501 })
        }
    }

    static UploadBankingDocuments = async (req,res) =>{
        try {
            const {customer_id,document_type} = req.params
            const collection = new DocumentModel({customer_id:customer_id,document_path:req.file.path,document_type:document_type});
            const result = await collection.save();
            res.status(201).send({status:true,message:"Documents Uploaded Sucessfully"});
        } catch (error) {
            res.status(501).send({status:false,message:"Unable to Providde Service"})
        }
    }
}
