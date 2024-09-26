const seatingArrangementService = require("@services/helper/seatingArrangement");

module.exports = class SeatingArrangementController {
  async create(req) {
    try {
      const result = await seatingArrangementService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await seatingArrangementService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await seatingArrangementService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await seatingArrangementService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
