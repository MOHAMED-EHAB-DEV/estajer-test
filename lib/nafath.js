import { v4 as uuidv4 } from "uuid";

export class NafathService {
  constructor() {
    this.appId = process.env.NAFATH_APP_ID;
    this.appKey = process.env.NAFATH_APP_KEY;
    this.baseUrl = process.env.NAFATH_BASE_URL_PROD;
  }

  getHeaders() {
    return {
      "Content-Type": "application/json",
      "APP-ID": this.appId,
      "APP-KEY": this.appKey,
    };
  }

  // Generate unique request ID
  generateRequestId() {
    return uuidv4();
  }
}
