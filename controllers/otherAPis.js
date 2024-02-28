import { AccountsModel, benkDepartmentsModel } from "../models/bank_dept.js";

export const  getBankDepartments = async (req,res) => {
    try {
        const depts = await benkDepartmentsModel.find({});
        res.status(201).send({ status: true, message: "All Departments'list Fetch Successfully", data: depts });
    } catch (error) {
        res.send({ status: false, message: "unable to provide Service" })
    }
}

export const getAccountList = async (req,res) =>{
    try {
        const result = await AccountsModel.find({});
        res.status(201).send({ status: true, message: "All Account's list Fetch Successfully", data: result });
    } catch (error) {
        res.send({ status: false, message: "unable to provide Service" })
        
    }
}