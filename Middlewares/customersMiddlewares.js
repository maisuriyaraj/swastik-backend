import multer from "multer";


export const uploadCUstomersDocument = (req,res,next) => {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            return cb(null, "./customers/documents");
        },
        filename: (req, file, cb) => {
            const  customer_id = req.params.customer_id;
            const document_type = req.params.document_type;
            // const document_type = req.body.document_type;
            const filename =customer_id + '-' +document_type+".jpg"
            return cb(null, filename);
        }
    })
    const uploadDocs = multer({ storage });
    return uploadDocs;
}