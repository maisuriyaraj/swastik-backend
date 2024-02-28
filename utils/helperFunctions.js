import bcrypt, { genSalt, hash } from "bcrypt";
import otpGenerator from "otp-generator";

export const getHashPassword = async (password) => {

  let salt = await genSalt(10);
  let hashPassword = await hash(password, salt);

  return hashPassword;

}


export const comparePasswords = async (pass1, pass2) => {
  let isMatch = await bcrypt.compare(pass1, pass2);
  return isMatch;
}

export const getEmailBody = (otp) => {
  if (otp) {
    const emailBody = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Brand</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Your Brand Inc</p>
      <p>1600 Amphitheatre Parkway</p>
      <p>California</p>
    </div>
  </div>
</div>
    `

    return emailBody;
  } else {
    return 0;
  }
}

export const getEmailBodyForUploadDocs = (id,email,token) => {
  if (id && email) {
    const emailBody = `
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upload Documents</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f7f7f7;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #333;
    }
    p {
      color: #666;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Upload Documents for [Your Company Name]</h1>
    <p>Dear [User],</p>
    <p>We hope this email finds you well.</p>
    <p>As part of our ongoing process, we require you to upload some documents. Your cooperation in this matter is greatly appreciated.</p>
    <p>Please click on the following link to upload the necessary documents:</p>
    <p><a href="http://localhost:3000/upload-docs/${id}/${token}">Upload Documents</a></p>
    <p>If you encounter any issues or have any questions, please don't hesitate to contact our support team at <a href="mailto:[Support Email]">[Support Email]</a> or call us at [Support Phone Number].</p>
    <p>Thank you for your prompt attention to this matter.</p>
    <p>Best regards,<br>[Your Company Name] Team</p>
  </div>
</body>
</html>

    `

    return emailBody;
  } else {
    return 0;
  }
}

export const generateOtp = () => {

  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

export const sendEmails = (email,perameters,body) =>{ 
  nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }

    // Create a SMTP transporter object
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'darby.ebert98@ethereal.email',
            pass: 'mgZZtcKb6bBvc8ND87'
        }
    });

    // Message object
    let message = {
        from: `Sender Name <swastikfinance@gmail.com>`,
        to: `Recipient <${email}>`,
        subject: 'Nodemailer is unicode friendly ✔',
        // text: 'HELLO I AM RAJ MAISURIYA!',
        html: getEmailBodyForUploadDocs(result._id, email, token)
    };
    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }
        emailURL = nodemailer.getTestMessageUrl(info);
        // linkUrl = nodemailer.getTestMessageUrl(info);
        console.log({ url: nodemailer.getTestMessageUrl(info) });
        res.send({ status: true, message: "Email sent Successfully", url: nodemailer.getTestMessageUrl(info) });
    });
});
}