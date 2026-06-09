/**
 * Waffy API Contract Service
 * Handles contract creation and management for payment processing
 */

import waffyAuth from "./waffy-auth.js";

class WaffyContract {
  constructor() {
    this.baseUrl = process.env.WAFFY_API_URL;
    this.adminId = process.env.WAFFY_ADMIN_ID;
  }

  /**
   * Create a complex contract for payment processing
   */
  async createContract(contractData) {
    try {
      const userToken = await waffyAuth.getUserToken();
      const response = await fetch(`${this.baseUrl}/api/external/contracts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          type: "COMPLEX_CONTRACT",
          senderRole: "PROVIDER",
          itemDetail: {
            title: contractData.title,
            description: contractData.description,
            images: contractData.images || [],
          },
          returnPolicy: "NO_RETURN",
          returnFeePayee: "PROVIDER",
          waffyTermsAccepted: true,
          category: "Services",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create contract: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      return {
        success: true,
        contractId: result.data.id,
        data: result.data,
      };
    } catch (error) {
      console.error("Error creating Waffy contract:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create milestones for a contract
   */
  async createMilestones(contractId, milestonesData) {
    try {
      const userToken = await waffyAuth.getUserToken();

      const response = await fetch(
        `${this.baseUrl}/api/external/contracts/${contractId}/milestones`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({
            milestones: milestonesData.map((milestone) => ({
              type: "MILESTONE_CONTRACT",
              senderRole: "PROVIDER",
              itemDetail: {
                title: milestone.title,
                description: milestone.description || "",
              },
              itemPrice: milestone.amount,
              currency: "SAR",
              returnPolicy: "NO_RETURN",
              returnFeePayee: "PROVIDER",
              deadLine:
                milestone.deadline ||
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              waffyTermsAccepted: true,
              addOnFees: milestone.addOnFees || [],
            })),
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create milestones: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      return {
        success: true,
        milestones: result.data.milestones,
        data: result.data,
      };
    } catch (error) {
      console.error("Error creating Waffy milestones:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Add parties to contract milestones
   */
  async addParties(contractId, partiesData) {
    try {
      const userToken = await waffyAuth.getUserToken();

      const response = await fetch(
        `${this.baseUrl}/api/external/contracts/${contractId}/parties`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({ mileStonesParties: partiesData }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to add parties: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error adding parties to Waffy contract:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get contract details
   */
  async getContract(contractId) {
    try {
      const userToken = await waffyAuth.getUserToken();

      const response = await fetch(
        `${this.baseUrl}/api/contracts/${contractId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get contract: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error getting Waffy contract:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get contract milestones
   */
  async getContractMilestones(contractId) {
    try {
      const userToken = await waffyAuth.getUserToken();

      const response = await fetch(
        `${this.baseUrl}/api/contracts?parentId=${contractId}&sort=createdAt,ASC`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get contract milestones: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error("Error getting Waffy contract milestones:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Accept a contract
   */
  async handelContract({ milestoneId, action = "ACCEPT_CONTRACT" }) {
    try {
      const userToken = await waffyAuth.getUserToken();

      const response = await fetch(
        `${this.baseUrl}/contract-actions/external`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({
            contractId: milestoneId,
            userId: this.adminId,
            actorRole: "BROKER",
            contractAction: action,
            contractType: "MILESTONE_CONTRACT",
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to accept contract: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("result: ", result);
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error accepting Waffy contract:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  async settleContract({
    milestoneId,
    providerId,
    receiverId,
    receiverAmount,
    adminAmount,
    customerAmount = 0,
    customerId = null,
  }) {
    try {
      const userToken = await waffyAuth.getUserToken();

      const response = await fetch(
        `${this.baseUrl}/contract-actions/external`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({
            contractId: milestoneId,
            userId: this.adminId,
            actorRole: "CLIENT_ADMIN",
            // admin id
            senderId: this.adminId,
            // provider id
            receiverId: providerId,
            contractType: "MILESTONE_CONTRACT",
            contractAction: "SETTLE_CONTRACT",
            cashOutAmountList: [
              ...(receiverAmount > 0
                ? [{ id: receiverId, amountDue: receiverAmount }]
                : []),
              ...(adminAmount > 0
                ? [{ id: this.adminId, amountDue: adminAmount }]
                : []),
              ...(customerAmount > 0 && customerId
                ? [{ id: customerId, amountDue: customerAmount }]
                : []),
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to accept contract: ${response.status} ${errorText}`,
        );
      }

      const result = await response.json();
      console.log("result: ", result);
      return { success: true, data: result.data };
    } catch (error) {
      console.error("Error accepting Waffy contract:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const waffyContract = new WaffyContract();

export default waffyContract;
