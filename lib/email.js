import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVER_HOST,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export { sendVerificationEmail } from "./emails/verification";
export { sendResetPasswordEmail } from "./emails/reset-password";
export { sendChatNotificationEmail } from "./emails/chat";
export { sendProductNotificationEmail } from "./emails/product";
export { sendOrderNotificationEmail } from "./emails/order";
export { sendNewOrderToOwnerEmail } from "./emails/OrderToOwner";
export { sendContactReplyEmail } from "./emails/contact";
export { sendMoneyTransferCompletionEmail } from "./emails/money-transfer-completion";
export { sendRequestNotificationEmail } from "./emails/request";
export { sendCashoutRequirementsEmail } from "./emails/cashout-requirements";
export { sendPaymentNotificationEmail } from "./emails/payment-notification";
export { sendAiAssistFeatureEmail } from "./emails/ai-assist-feature";
