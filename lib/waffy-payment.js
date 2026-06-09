/**
 * Waffy API Payment Service
 * Handles the complete payment flow including contract creation, milestones, and payment URL generation
 */

import waffyAuth from "./waffy-auth.js";
import waffyContract from "./waffy-contract.js";
import User from "../models/User.js";

class WaffyPayment {
  constructor() {
    this.baseUrl = process.env.WAFFY_API_URL;
    this.redirectUrl = process.env.NEXT_PUBLIC_APP_URL;
  }

  /**
   * Ensure user has waffyId, sign up if not
   */
  async ensureUserSignup(userId, userPhone, userName) {
    try {
      const user = await User.findById(userId).select(
        "waffyId clientUserToken"
      );
      if (!user) throw new Error("User not found");

      if (!user.waffyId) {
        // Sign up user to Waffy
        const [firstName, ...lastNameParts] = userName.split(" ");
        const lastName = lastNameParts.join(" ") || "User";

        const signupResult = await waffyAuth.signUpUser({
          clientUserId: userId,
          phoneNumber: `+966${userPhone.slice(1)}`,
          firstName: firstName,
          lastName: lastName,
          password: `temp_${Date.now()}`, // Temporary password
        });

        if (signupResult.data.userId) {
          user.waffyId = signupResult.data.userId;
          user.clientUserToken = signupResult.data.clientUserToken;
          await user.save();
        }
        return signupResult.data.clientUserToken;
      }
      return user.clientUserToken;
    } catch (error) {
      console.error("Error ensuring user signup:", error);
      throw error;
    }
  }

  /**
   * Create a complete payment flow for an order
   */
  async createPayment(paymentData) {
    try {
      // Step 1: Create the main contract
      const title = paymentData.productNameAr;
      // Waffy API has a 2000 character limit for description
      const rawDescription = paymentData.productDescriptionAr || "";
      const description =
        rawDescription.length > 2000
          ? rawDescription.substring(0, 1990) + "..."
          : rawDescription;
      const images = paymentData.productImage ? [paymentData.productImage] : [];

      const contractResult = await waffyContract.createContract({
        title,
        description,
        images,
      });

      if (!contractResult.success)
        throw new Error(`Contract creation failed: ${contractResult.error}`);

      const contractId = contractResult.contractId;

      // Step 2: Create milestone for the payment amount
      const milestonesResult = await waffyContract.createMilestones(
        contractId,
        [
          {
            title: `Payment - ${contractId}`,
            description: paymentData.description || "Order payment",
            amount: paymentData.amount,
            deadline:
              paymentData.deadline ||
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
      );

      if (!milestonesResult.success) {
        throw new Error(`Milestone creation failed: ${milestonesResult.error}`);
      }

      const milestoneId = milestonesResult.milestones[0].id;
      let clientUserToken = paymentData.customerToken;
      // Step 3: Ensure users have waffyId
      if (
        paymentData.customerId &&
        paymentData.customerPhone &&
        paymentData.customerName
      ) {
        clientUserToken = await this.ensureUserSignup(
          paymentData.customerId,
          paymentData.customerPhone,
          paymentData.customerName
        );
      }

      if (
        paymentData.providerId &&
        paymentData.providerPhone &&
        paymentData.providerName
      ) {
        await this.ensureUserSignup(
          paymentData.providerId,
          paymentData.providerPhone,
          paymentData.providerName
        );
      }

      // Step 4: Calculate amounts with broker fee (10%)
      const totalAmount = +paymentData.amount.toFixed(0);
      // console.log("paymentData: ", paymentData);
      const commissionPercent = (paymentData?.commission || 15) / 100;
      const brokerFee = +(
        (totalAmount - paymentData.tax) * commissionPercent +
        paymentData.tax
      ).toFixed(0);
      const providerAmount = +(totalAmount - brokerFee).toFixed(0);

      // Step 5: Add parties to the milestone
      const partiesData = {};
      partiesData[milestoneId] = [
        {
          phoneNumber: `+966${paymentData.customerPhone.slice(1)}`,
          role: "CUSTOMER",
          amount: totalAmount,
        },
        {
          phoneNumber: process.env.WAFFY_PROVIDER_PHONE,
          role: "BROKER",
          amount: brokerFee,
          isSender: true,
          arbitrator: true,
        },
        {
          phoneNumber: `+966${paymentData.providerPhone.slice(1)}`,
          role: "PROVIDER",
          amount: providerAmount,
        },
      ];

      const partiesResult = await waffyContract.addParties(
        contractId,
        partiesData
      );

      if (!partiesResult.success)
        throw new Error(`Adding parties failed: ${partiesResult.error}`);

      // you should wait 0.1 second before generating the payment URL
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Step 6: Generate payment URL using milestone ID
      const paymentUrlResult = await this.generatePaymentUrl(
        milestoneId,
        paymentData.customerLang
      );

      if (!paymentUrlResult.success) {
        throw new Error(
          `Payment URL generation failed: ${paymentUrlResult.error}`
        );
      }
      // Step 7: get the customer token
      const customerToken = await waffyAuth.getCustomerToken({
        clientUserToken,
        phone: paymentData.customerPhone,
      });
      return {
        success: true,
        contractId: contractId,
        milestoneId: milestoneId,
        paymentUrl: paymentUrlResult.paymentUrl,
        customerToken: customerToken,
      };
    } catch (error) {
      console.error("Error creating Waffy payment:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  /**
   * Generate payment URL for a contract
   */
  async generatePaymentUrl(milestoneId, customerLang) {
    try {
      const userToken = await waffyAuth.getUserToken();
      const url = `${
        this.baseUrl
      }/api/external/contracts/startPayment/${milestoneId}/${
        process.env.WAFFY_CLIENT_ID
      }?redirectUrl=${encodeURIComponent(
        `${this.redirectUrl}${
          customerLang === "en" ? "/en" : ""
        }/payment-completed/${milestoneId}`
      )}&paymentType=PURCHASE`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to generate payment URL: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();

      // The response should contain the payment URL
      return {
        success: true,
        paymentUrl: result.data,
        data: result,
      };
    } catch (error) {
      console.error("Error generating Waffy payment URL:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Simplified payment creation for replacing PayTabs
   */
  async createWaffyPayment(paymentData) {
    try {
      const result = await this.createPayment(paymentData);
      if (!result.success) return { success: false, message: result.error };
      return {
        success: true,
        redirectUrl: result.paymentUrl,
        customerToken: result.customerToken,
        contractId: result.contractId,
        milestoneId: result.milestoneId,
      };
    } catch (error) {
      console.error("Error creating PayTabs replacement payment:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Check payment status (placeholder for future implementation)
   */
  async checkPaymentStatus(contractId) {
    try {
      const contractResult = await waffyContract.getContract(contractId);

      if (!contractResult.success) {
        throw new Error(
          `Failed to get contract status: ${contractResult.error}`
        );
      }

      return {
        success: true,
        status: contractResult.data.status,
        data: contractResult.data,
      };
    } catch (error) {
      console.error("Error checking Waffy payment status:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const waffyPayment = new WaffyPayment();

export default waffyPayment;
