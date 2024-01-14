import express from "express";
import AdminControler from "../controllers/adminController.js";
import verifyAdminToken from "../Middlewares/adminMiddlewares.js";
import EmployeesControl from "../controllers/employeesController.js";
import {CustomerControll} from "../controllers/customerController.js";
import { uploadCUstomersDocument } from "../Middlewares/customersMiddlewares.js";
const router = express.Router();

// Admin Routes
router.post("/add-admin", AdminControler.AddAdmin);
router.post("/admin", AdminControler.LoginAdmin);
router.post("/add-staff", verifyAdminToken, AdminControler.AddEmployees);

// Employees Routes
router.post("/staff-login", EmployeesControl.LoginStaff);



// Customer Routes 
const uploads = uploadCUstomersDocument();
router.post("/registration", CustomerControll.CustomerRegistration);
router.post("/upload/:customer_id/:document_type",uploads.single("uploaded_file"),CustomerControll.UploadBankingDocuments);
export { router };