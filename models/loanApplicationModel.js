import moment from 'moment';
import mongoose from 'mongoose';
const loanApplicationSchema = new mongoose.Schema({
    personalInformation: {
        fullName: {
            type: String,
            required: true
        },
        panCardNumber: {
            type: String,
            required: true
        },
        customer_id: { type: String, required: true },
        Account_no: { type: String },

        address: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },

        ApplicationDate: String
    },
    employmentInformation: {
        employmentStatus: {
            type: String,
            enum: ['full-time', 'part-time', 'self-employed','business'],
            required: true
        },
        jobTitle: String,
        grossMonthlyIncome: {
            type: Number,
            required: true
        }
    },
    financialInformation: {
        TotalAnnuaIncome: {
            type: Number,
            required: true
        },
        otherSourcesOfIncome: [String],
        monthlyHousingExpenses: {
            type: Number,
            required: true
        },
        assets: [String],
    },
    loanDetails: {
        loanType: {
            type: String,
            required: true
        },
        loanAmountRequested: {
            type: Number,
            required: true
        },
        purposeOfLoan: String,
        loan_status: { type: String, default: "Pending", enum: ['Pending', 'Approved', 'Rejected'] }
    },
    coApplicantInformation: {
        fullName: String,
        relationshipToPrimaryApplicant: String,
    },
    consentAndAuthorization: {
        creditReportAuthorization: {
            type: Boolean,
            default: true,
        },
        informationVerificationConsent: {
            type: Boolean,
            default: true,
        },
        termsAndConditionsAgreement: {
            type: Boolean,
            default: true,
        }
    },
    declarationAndSignatures: {
        certification: {
            type: Boolean,
        },
        applicantSignature: {
            type: String,
        },
        coApplicantSignature: String,
        date: {
            type: Date,
            default: Date.now
        }
    }
});

const LoanApplication = mongoose.model('LoanApplication', loanApplicationSchema);

export default LoanApplication;