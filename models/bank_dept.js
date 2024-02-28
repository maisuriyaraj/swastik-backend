import mongoose from "mongoose";

const bankDepts = new mongoose.Schema({
    department_name:{type:String}
})

const AccountSchema = new mongoose.Schema({
    Account_type:{type:String}
})


export const benkDepartmentsModel = mongoose.model("bank_depts",bankDepts);
export const AccountsModel = mongoose.model("accounts",AccountSchema);


