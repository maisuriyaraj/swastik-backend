import mongoose from "mongoose";

const WalletSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    walletBalance: { type: Number, default: 0.00 },
    customer_email: { type: String, required: true },
    last_updated_date:{type:String}
});

const WalletModel = mongoose.model('customer_wallet', WalletSchema);

export default WalletModel;