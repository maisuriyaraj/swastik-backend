import  express  from "express";
import AdminControler from "../controllers/adminController.js";
import verifyAdminToken from "../Middlewares/adminMiddlewares.js";
import EmployeesControl from "../controllers/employeesController.js";
const router = express.Router();

// Admin Routes
router.post("/add-admin",AdminControler.AddAdmin);
router.post("/admin",AdminControler.LoginAdmin);
router.post("/add-staff",verifyAdminToken,AdminControler.AddEmployees);

// Employees Routes
router.post("/staff-login",EmployeesControl.LoginStaff);

export { router};