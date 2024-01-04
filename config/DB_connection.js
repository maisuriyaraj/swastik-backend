import mongoose, { mongo } from "mongoose";
import 'dotenv/config'

await mongoose.connect(process.env.MONGO_CONNECTION).then(()=>{
    console.log("MONGO CONNETCED");
}).catch(err=>{
    console.log(err)
})