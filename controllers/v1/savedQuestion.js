const savedQuestionSerice = require("@services/helper/savedQuestion");

module.exports = class SavedQuestionController {
  async create(req) {
    try {
      const result = await savedQuestionSerice.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await savedQuestionSerice.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await savedQuestionSerice.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await savedQuestionSerice.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
