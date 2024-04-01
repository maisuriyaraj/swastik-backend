import express from "express";
import AdminControler from "../controllers/adminController.js";
import verifyAdminToken from "../Middlewares/adminMiddlewares.js";
import EmployeesControl from "../controllers/employeesController.js";
import {CustomerControll} from "../controllers/customerController.js";
import { handleUploadsFile, updateCustomerDocuments, uploadCUstomersDocument,uploadLoanDocuments, uploadProfilePicture, verifyCustomerToken } from "../Middlewares/customersMiddlewares.js";
import { getAccountList, getBankDepartments } from "../controllers/otherAPis.js";
import multer from "multer";
import verifyStaffToken from "../Middlewares/employeesMiddlewares.js";
const router = express.Router();

// Admin Routes
router.post("/add-admin", AdminControler.AddAdmin);
router.post("/admin", AdminControler.LoginAdmin);
router.post("/logout",AdminControler.Logout);
router.post("/add-staff", verifyAdminToken, AdminControler.AddEmployees);
router.post("/getCustomers",verifyAdminToken,AdminControler.getCustomers);
router.post("/getdepts",verifyAdminToken,getBankDepartments);
router.put('/adminLogout',AdminControler.Logout)
router.post('/admin-activities',verifyAdminToken,AdminControler.getAdminActivities);

// Employees Routes
router.post("/staff-login", EmployeesControl.LoginStaff);
router.post("/staffloginbyadmin",verifyAdminToken, EmployeesControl.LoginStaffByAdmin);
router.post("/getEmpList",verifyAdminToken,EmployeesControl.getEmployeesList);
router.put("/deposit-cash",verifyStaffToken,CustomerControll.DepositCashAmount);
router.put("/withdraw-cash",verifyStaffToken,CustomerControll.WithdrawCashAmount);
router.post("/getEmployee",verifyStaffToken,EmployeesControl.getmployee);
router.post("/getTransectionsEmployee",verifyStaffToken,CustomerControll.getTrasectionsDetails);
router.post("/getLoanDetailsStaff",verifyStaffToken,CustomerControll.getLoanDetails);
router.post("/getLoanDetails",verifyCustomerToken,CustomerControll.getLoanDetails);

router.post("/getAllLoanDetailsStaff",verifyStaffToken,CustomerControll.getALlLOanDetails);

// Customer Routes 
const uploads = handleUploadsFile();
const uploadProfile = uploadProfilePicture();
const uploadLoanDocs = uploadLoanDocuments();
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
router.post('/add-wallet',verifyCustomerToken,CustomerControll.AddWallet);
router.post('/getWalletDetails',verifyCustomerToken,CustomerControll.getWalletDetails);
router.post("/resetpassword",verifyCustomerToken,CustomerControll.ResetUserPassword);
router.post("/getTransectionsCustomer",verifyCustomerToken,CustomerControll.getTrasectionsDetails);
router.post("/onlineTransfer",verifyCustomerToken,CustomerControll.OnlineTransections);
router.post("/profile/:customer_id",verifyCustomerToken,uploadProfile,CustomerControll.uploadProfile);
router.post("/loanApplication",verifyCustomerToken,CustomerControll.ApplyForLoan);
router.post("/getLoanDetailsAdmin",verifyAdminToken,CustomerControll.getLoanDetails);
router.post("/getAllLoansAdmin",verifyAdminToken,CustomerControll.getALlLOanDetails);
router.post("/changeLoanStatus",verifyAdminToken,CustomerControll.ApproveOrRejectApplication);
router.post("/customer/loan",verifyAdminToken,CustomerControll.getLoanDetailsbyLoanID);
router.post("/senddocumentmanagementemail",verifyAdminToken,CustomerControll.sendDocumentManagemantEmail);
router.post("/uploadloanDocs/:loan_id",verifyCustomerToken,uploadLoanDocs,CustomerControll.uploadLoanDocuments);
router.post("/verifydocuments",verifyAdminToken,uploadLoanDocs,CustomerControll.verifyLoanDocuments);
router.put("/getCustomerProfile",verifyCustomerToken,CustomerControll.getCustomerProfile);
router.post("/uploadDocsEmailNotify",CustomerControll.UploadIdentityDocsEmail);



export { router };