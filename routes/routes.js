import express from "express";
import AdminControler from "../controllers/adminController.js";
import verifyAdminToken from "../Middlewares/adminMiddlewares.js";
import EmployeesControl from "../controllers/employeesController.js";
import {CustomerControll} from "../controllers/customerController.js";
import { handleUploadsFile, updateCustomerDocuments, uploadCUstomersDocument, verifyCustomerToken } from "../Middlewares/customersMiddlewares.js";
const router = express.Router();

// Admin Routes
router.post("/add-admin", AdminControler.AddAdmin);
router.post("/admin", AdminControler.LoginAdmin);
router.post("/add-staff", verifyAdminToken, AdminControler.AddEmployees);
router.get("/getCustomers",verifyAdminToken,AdminControler.getCustomers);

// Employees Routes
router.post("/staff-login", EmployeesControl.LoginStaff);
router.get("/home",(req,res)=>{res.send("HELLO ")});


// Customer Routes 
const uploads = handleUploadsFile();
router.post("/registration", CustomerControll.CustomerRegistration);
router.post("/upload/:customer_id/:document_type",uploadCUstomersDocument,uploads.single("uploaded_file"),CustomerControll.UploadBankingDocuments);
router.put("/update-docs/:customer_id/:document_type",verifyCustomerToken,updateCustomerDocuments,uploads.single("update_file"),CustomerControll.UpdateDocuments);
router.post("/email-verify",CustomerControll.SendVerificationEmail);
router.post("/login-customer",CustomerControll.LoginCustomer);

export { router };