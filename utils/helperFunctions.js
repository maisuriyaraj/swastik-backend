import bcrypt, { genSalt, hash } from "bcrypt";
import moment from "moment";
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
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Swastik Finance</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for choosing Swastik Finance. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>RJIndustries.Inc</p>
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

export const getEmailBodyForResetPAss = (id, email, token) => {
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
    <h1>Reset Your Password for Swastik Finance</h1>
    <p>Dear ${email},</p>
    <p>We hope this email finds you well.</p>
    <p>Your Reset Password Link..</p>
    <p><a href="http://localhost:3000/resetPass/${id}/${token}">Reset Password</a></p>
    <p>If you encounter any issues or have any questions, please don't hesitate to contact our support team at <a href="mailto:[Support Email]">swastikfinance.com</a> or call us at 97971857455.</p>
    <p>Thank you for your prompt attention to this matter.</p>
    <p>Best regards,<br> Swastik Finance Team</p>
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

export const sendEmails = (email, perameters, body) => {
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
      res.send({ status: true, message: "Email sent Successfully", url: nodemailer.getTestMessageUrl(info) });
    });
  });
}


export const WalletEmailBody = (customer, balance) => {
  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Swastik Finance</title>
  </head>
  <body bgcolor="#0f3462" style="margin-top:20px;margin-bottom:20px">
    <!-- Main table -->
    <table border="0" align="center" cellspacing="0" cellpadding="0" bgcolor="white" width="650">
      <tr>
        <td>
          <!-- Child table -->
          <table border="0" cellspacing="0" cellpadding="0" style="color:#0f3462; font-family: sans-serif;">
            <tr>
              <td>
                <h2 style="text-align:center; margin: 0px; padding-bottom: 25px; margin-top: 25px;">
                  <i>Swastik</i><span style="color:lightcoral">Finance</span></h2>
              </td>
            </tr>
            <tr>
              <td style="text-align: center;">
                <h1 style="margin: 0px;padding-bottom: 25px; text-transform: uppercase;">Swastik Wallet</h1>
                <h2 style="margin: 0px;padding-bottom: 25px;font-size:22px;"> Your Wallet Amount has been Updated.. </h2>
                <p style=" margin: 0px 40px;padding-bottom: 25px;line-height: 2; font-size: 15px;">
  Dear ${customer},
                  <br />
  
  I hope this email finds you well.
                  <br />
  
  I'm pleased to inform you that your wallet balance has been successfully updated. Amount Rs.${balance}.
                  <br />
  
  Your continued support means the world to us, and we strive to provide you with the best service possible. Should you have any questions or require further assistance regarding your wallet balance or any other matter, please don't hesitate to reach out to us.
  
                  <br />
  Thank you once again for choosing Swastik Finance. We truly appreciate your business.
  <br />
  Best regards,
                  
  From Swastik Finance 
                </p>
              </td>
            </tr>
          </table>
          <!-- /Child table -->
        </td>
      </tr>
    </table>
    <!-- / Main table -->
  </body>
  
  </html>`
}

export const getDepositEmailBody = (name, deposit_amt, current_balance) => {
  return `

  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Deposit Amount has been credited!</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333333;">Deposit Amount Successfully Credited to Your Account!</h2>
        <p>Dear ${name},</p>
        <p>We are thrilled to inform you that your recent deposit has been successfully credited to your account! This ensures that your financial transactions with us continue to run smoothly, providing you with the convenience and security you deserve.</p>
        <h3 style="color: #333333;">Deposit Details:</h3>
        <ul>
            <li><strong>Deposit Amount:</strong> Rs.${deposit_amt}</li>
            <li><strong>Date of Deposit:</strong>${moment().format("DD-MM-YYYY")}</li>
            <li><strong>Current balance :</strong>${current_balance}</li>
        </ul>
        <p>We understand the importance of timely and accurate transactions, and we are committed to providing you with the best service possible. Should you have any questions or concerns regarding your deposit or any other banking matter, please do not hesitate to contact us. Our dedicated team is here to assist you every step of the way.</p>
        <p>Thank you for choosing Swastik Finance. We value your trust and look forward to serving you in the future.</p>
        <br>
        <p>Best regards,</p>
        <p>Swastik Finance</p>
    </div>
</body>
</html>

  `
}

export const getWithdrawEmailBody = (name, withdraw_amt, current_balance) => {
  return `

  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Withdraw Amount has been credited!</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333333;">Withdraw Amount Successfully Credited to Your Account!</h2>
        <p>Dear ${name},</p>
        <p>We are thrilled to inform you that your recent withdraw has been successfully credited to your account! This ensures that your financial transactions with us continue to run smoothly, providing you with the convenience and security you deserve.</p>
        <h3 style="color: #333333;">Withdraw Details:</h3>
        <ul>
            <li><strong>Withdraw Amount :</strong> Rs.${withdraw_amt}</li>
            <li><strong>Date of Withdraw :</strong>${moment().format("DD-MM-YYYY")}</li>
            <li><strong>Current balance :</strong>${current_balance}</li>
        </ul>
        <p>We understand the importance of timely and accurate transactions, and we are committed to providing you with the best service possible. Should you have any questions or concerns regarding your deposit or any other banking matter, please do not hesitate to contact us. Our dedicated team is here to assist you every step of the way.</p>
        <p>Thank you for choosing Swastik Finance. We value your trust and look forward to serving you in the future.</p>
        <br>
        <p>Best regards,</p>
        <p>Swastik Finance</p>
    </div>
</body>
</html>

  `
}


export const sendWelcomeEmail = (customerName) => {
  return `
    
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Account Created</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #666;
            }
            .button {
                display: inline-block;
                background-color: #007bff;
                color: #fff;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 5px;
            }
            .button:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to Our Website! ${customerName}</h1>
            <p>Your account has been successfully created.</p>
            <p>You can now start using our services.</p>
            <p>Your Account will be Activate in 24 hours.</p>
            <p>If you have any questions or need assistance, feel free to contact us.</p>
            <p>Thank you!</p>
            <a href="https://yourwebsite.com" class="button">Visit Our Website</a>
        </div>
    </body>
    </html>
    
    `
}


export const sendDocumentManagemantEmailTemplate = () => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Loan Application Review</title>
      <style>
        /* CSS styles for email */
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #333;
        }
        p {
          color: #555;
        }
        .cta-button {
          display: inline-block;
          background-color: #007bff;
          color: #fff;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 4px;
        }
        .cta-button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Loan Application Review</h1>
        <p>Your loan application has been reviewed by our admin. You are required to upload the necessary documents through our portal to proceed with your application.</p>
        <p>Please ensure you provide all required documents for a speedy process.</p>
        <p><strong>Note:</strong> Failure to upload the required documents may result in delays in processing your loan application.</p>
        <a href="https://yourportal.com/upload-documents" class="cta-button">Upload Documents</a>
        <p>If you have any questions or concerns, feel free to contact us at support@yourcompany.com.</p>
      </div>
    </body>
    </html>
    
    
    `
}

export const sendApprovalEmail = (fullname) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loan Approval Notification</title>
  <style>
      /* Reset styles */
      body, h1, p {
          margin: 0;
          padding: 0;
      }
  
      body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          background-color: #f5f5f5;
      }
  
      .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
  
      h1 {
          font-size: 24px;
          color: #333333;
          margin-bottom: 20px;
      }
  
      p {
          font-size: 16px;
          color: #666666;
          margin-bottom: 20px;
      }
  
      .button {
          display: inline-block;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          font-size: 16px;
      }
  
      .button:hover {
          background-color: #0056b3;
      }
  
      @media screen and (max-width: 600px) {
          .container {
              width: 100%;
              border-radius: 0;
          }
      }
  </style>
  </head>
  <body>
      <div class="container">
          <h1>${fullname} ,Your has Loan Approved</h1>
          <p>Congratulations! Your loan application has been approved.</p>
          <p>You can now access the funds you need. Please review the terms and conditions provided with your loan agreement.</p>
          <p>Your Requested loan Amount will be deposit in 24 hours.</p>
          <p>If you have any questions or need further assistance, feel free to contact our customer support team.</p>
          <a href="#" class="button">Visit our Website</a>
      </div>
  </body>
  </html>
  
  
  `
}