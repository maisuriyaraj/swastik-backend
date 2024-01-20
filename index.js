import  express  from "express";
//Core Module
import cors from "cors";
// .env Config
import "dotenv/config";
// Database Configuration
import "./config/DB_connection.js";
import {router} from "./routes/routes.js";
const app = express();
const port = process.env.PORT || 5000;
app.use(express.json());
// use Api Cross Platform
app.use(cors());
// Serve static files from the 'customers' directory
app.use('/customers/documents', express.static('customers/documents'));

//Load Routes
app.use("/api",router);

app.listen(port,()=>{
    console.log(`Server Started on ${port}`);
});