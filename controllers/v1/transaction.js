const transactionService = require("@services/helper/inventory/transaction");

module.exports = class TransactionController {
  async create(req) {
    try {
      const result = await transactionService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await transactionService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getStockList(req) {
    try {
      const result = await transactionService.getStockList(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getTransactionDetails(req) {
    try {
      const result = await transactionService.getTransactionDetails(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async totalInventoryCount(req) {
    try {
      const result = await transactionService.totalInventoryCount(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
