import express from "express";
import AdminControler from "../controllers/adminController.js";
import verifyAdminToken from "../Middlewares/adminMiddlewares.js";
import EmployeesControl from "../controllers/employeesController.js";
import {CustomerControll} from "../controllers/customerController.js";
import { handleUploadsFile, updateCustomerDocuments, uploadCUstomersDocument, verifyCustomerToken } from "../Middlewares/customersMiddlewares.js";
import { getAccountList, getBankDepartments } from "../controllers/otherAPis.js";
import multer from "multer";
const router = express.Router();

// Admin Routes
router.post("/add-admin", AdminControler.AddAdmin);
router.post("/admin", AdminControler.LoginAdmin);
router.post("/logout",AdminControler.Logout);
router.post("/add-staff", verifyAdminToken, AdminControler.AddEmployees);
router.post("/getCustomers",verifyAdminToken,AdminControler.getCustomers);
router.post("/getdepts",verifyAdminToken,getBankDepartments);
router.put('/adminLogout',AdminControler.Logout)
router.post('/admin-activities',verifyAdminToken,AdminControler.getAdminActivities)

// Employees Routes
router.post("/staff-login", EmployeesControl.LoginStaff);
router.post("/getEmpList",EmployeesControl.getEmployeesList);

// Customer Routes 
const uploads = handleUploadsFile();
router.post("/registration", CustomerControll.CustomerRegistration);
router.post("/upload/:customer_id",verifyCustomerToken,uploadCUstomersDocument,uploads,CustomerControll.UploadBankingDocuments);
router.put("/update-docs/:customer_id/:document_type",verifyCustomerToken,updateCustomerDocuments,uploads,CustomerControll.UpdateDocuments);
router.post("/forgotPassEmail",CustomerControll.SendVerificationEmail);
router.post("/login-customer",CustomerControll.LoginCustomer);
router.post("/getaccountsList",getAccountList);
router.post("/getCustomer",verifyAdminToken,CustomerControll.GetCustomerDetails);
router.post("/getCustomerDetails",verifyCustomerToken,CustomerControll.GetCustomerDetails);
router.post("/getCustomerDocs",verifyAdminToken,CustomerControll.getCustomerDocs);
router.post("/userOtpVerification",CustomerControll.checkUSerOTP);


export { router };