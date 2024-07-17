const receiptService = require("@services/helper/fee/receipt");

module.exports = class receiptController {
  async getStudentsList(req) {
    try {
      const result = await receiptService.getStudentsList(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getFeeDetails(req) {
    try {
      const result = await receiptService.getFeeDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async collectFees(req) {
    try {
      const result = await receiptService.collectFees(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async previewReceipt(req) {
    try {
      const result = await receiptService.previewReceipt(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getReceiptsPaidWithCheque(req) {
    try {
      const result = await receiptService.getReceiptsPaidWithCheque(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateSingleReceiptReconciliationStatusStatus(req) {
    try {
      const result =
        await receiptService.updateSingleReceiptReconciliationStatusStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateMultipleReceiptReconciliationStatus(req) {
    try {
      const result =
        await receiptService.updateMultipleReceiptReconciliationStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAmountCollectedWithDifferentModes(req) {
    try {
      const result = await receiptService.getAmountCollectedWithDifferentModes(
        req
      );
      return result;
    } catch (error) {
      return error;
    }
  }
  async getBalanceFeeReport(req) {
    try {
      const result = await receiptService.getBalanceFeeReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async downloadBalanceFeeReport(req) {
    try {
      const result = await receiptService.downloadBalanceFeeReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async getAllReceipts(req) {
    try {
      const result = await receiptService.getAllReceipts(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadReceipt(req) {
    try {
      const result = await receiptService.downloadReceipt(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadReceiptStaff(req) {
    try {
      const result = await receiptService.downloadReceiptStaff(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async downloadFeeOverView(req) {
    try {
      const result = await receiptService.downloadFeeOverView(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAllPastDues(req) {
    try {
      const result = await receiptService.getAllPastDues(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getMyReceipts(req) {
    try {
      const result = await receiptService.getMyReceipts(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
