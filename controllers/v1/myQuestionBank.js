const myQuestionBankHelper = require("@services/helper/myQuestionBank");

module.exports = class MyQuestionBankController {
  async create(req) {
    try {
      const createdQuestionBank = await myQuestionBankHelper.create(req);
      return createdQuestionBank;
    } catch (error) {
      return error;
    }
  }

  async createAuto(req) {
    try {
      const createdQuestionBank = await myQuestionBankHelper.createAuto(req);
      return createdQuestionBank;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const questionBanks = await myQuestionBankHelper.list(req);
      return questionBanks;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedQuestionBank = await myQuestionBankHelper.update(req);
      return updatedQuestionBank;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const deletedQuestionBank = await myQuestionBankHelper.delete(req);
      return deletedQuestionBank;
    } catch (error) {
      return error;
    }
  }
};
