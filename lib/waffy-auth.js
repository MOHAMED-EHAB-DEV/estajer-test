/**
 * Waffy API Authentication Service
 * Handles OAuth token generation for Waffy API integration
 */

class WaffyAuth {
  constructor() {
    this.baseUrl = process.env.WAFFY_AUTH_URL;
    this.clientId = process.env.WAFFY_CLIENT_ID;
    this.clientSecret = process.env.WAFFY_CLIENT_SECRET;
    this.adminUser = process.env.WAFFY_USERNAME;
    this.adminPassword = process.env.WAFFY_PASSWORD;

    // Token cache
    this.appToken = null;
    this.userToken = null;
    this.appTokenExpiry = null;
    this.userTokenExpiry = null;
  }

  /**
   * Helper to parse error responses from Waffy API
   * If the response is JSON, it returns the stringified JSON
   * Otherwise returns a formatted error string
   */
  async errorResponse(response, context) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      const message = `${errorJson.error.subErrors[0]?.field || ""} ${
        errorJson.error.subErrors[0]?.rejectedValue || ""
      } ${errorJson.error.subErrors[0]?.message || ""}`;
      return message.trim() || errorText;
    } catch (e) {
      return `${context}: ${response.status} ${errorText}`;
    }
  }

  /**

   * Get application token using client credentials flow
   */
  async getAppToken() {
    // Return cached token if still valid
    if (
      this.appToken &&
      this.appTokenExpiry &&
      new Date() < this.appTokenExpiry
    ) {
      return this.appToken;
    }

    try {
      const basicAuth =
        "Basic " + btoa(`${this.clientId}:${this.clientSecret}`);

      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
      });

      if (!response.ok) {
        const errorMessage = await this.errorResponse(
          response,
          "Failed to get app token",
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Cache the token with expiry (subtract 5 minutes for safety)
      this.appToken = data.access_token;
      this.appTokenExpiry = new Date(
        Date.now() + (data.expires_in - 300) * 1000,
      );

      return this.appToken;
    } catch (error) {
      console.error("Error getting Waffy app token:", error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Get user token using password flow (for admin operations)
   */
  async getUserToken() {
    // Return cached token if still valid
    if (
      this.userToken &&
      this.userTokenExpiry &&
      new Date() < this.userTokenExpiry
    ) {
      return this.userToken;
    }

    try {
      const basicAuth =
        "Basic " + btoa(`${this.clientId}:${this.clientSecret}`);

      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          username: this.adminUser,
          password: this.adminPassword,
          grant_type: "password",
        }),
      });

      if (!response.ok) {
        const errorMessage = await this.errorResponse(
          response,
          "Failed to get user token",
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Cache the token with expiry (subtract 5 minutes for safety)
      this.userToken = data.access_token;
      this.userTokenExpiry = new Date(
        Date.now() + (data.expires_in - 300) * 1000,
      );

      return this.userToken;
    } catch (error) {
      console.error("Error getting Waffy user token:", error);
      throw new Error(`User authentication failed: ${error.message}`);
    }
  }
  /**
   * Get Customer token using password flow (for customer operations)
   */
  async getCustomerToken({ clientUserToken, phone }) {
    try {
      const basicAuth =
        "Basic " + btoa(`${this.clientId}:${this.clientSecret}`);

      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: "POST",
        headers: {
          Authorization: basicAuth,
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          username: `+966${phone.slice(1)}`,
          password: clientUserToken,
          grant_type: "password",
        }),
      });

      if (!response.ok) {
        const errorMessage = await this.errorResponse(
          response,
          "Failed to get customer token",
        );
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Error getting Waffy user token:", error);
      throw new Error(`User authentication failed: ${error.message}`);
    }
  }
  /**
   * Sign up a new user in Waffy system
   */
  async signUpUser(userData) {
    try {
      const appToken = await this.getAppToken();

      const response = await fetch(`${this.baseUrl}/v2/api/users/sign-up`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${appToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientUserId: userData.clientUserId,
          phoneNumber: userData.phoneNumber,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
        }),
      });
      // i want to throw error with the userData and the error message
      if (!response.ok) {
        throw new Error(
          userData.phoneNumber + " " + (await response.json()).error.message,
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error signing up user:", error);
      throw new Error(`User signup failed: ${error.message}`);
    }
  }
  async addUserAddress({ userId, userData }) {
    try {
      const userToken = await this.getUserToken();

      const response = await fetch(
        `${this.baseUrl}/api/profiles/${userId}/addresses`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        },
      );

      if (!response.ok) {
        const errorMessage = await this.errorResponse(
          response,
          "Failed to add user address",
        );
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding user address:", error);
      throw new Error(`User address failed: ${error.message}`);
    }
  }
  async addUserIban({ userId, userData }) {
    try {
      const userToken = await this.getUserToken();

      const response = await fetch(
        `${this.baseUrl}/api/users/${userId}/banks?userId`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        },
      );

      if (!response.ok) {
        const errorMessage = await this.errorResponse(
          response,
          "Failed to add user IBAN",
        );
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding user IBAN:", error);
      throw new Error(`User IBAN failed: ${error.message}`);
    }
  }

  /**
   * Clear cached tokens (useful for testing or forced refresh)
   */
  clearTokens() {
    this.appToken = null;
    this.userToken = null;
    this.appTokenExpiry = null;
    this.userTokenExpiry = null;
  }
}

// Create singleton instance
const waffyAuth = new WaffyAuth();

export default waffyAuth;
