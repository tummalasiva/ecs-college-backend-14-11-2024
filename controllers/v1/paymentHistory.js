const paymentHistoryServiceService = require("@services/helper/paymentHistory");

module.exports = class PaymentHistoryController {
  async downloadPdf(req) {
    try {
      const result = await paymentHistoryServiceService.downloadPdf(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await paymentHistoryServiceService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadDeductionPdf(req) {
    try {
      const result = await paymentHistoryServiceService.downloadDeductionPdf(
        req
      );
      return result;
    } catch (error) {
      return error;
    }
  }
};
