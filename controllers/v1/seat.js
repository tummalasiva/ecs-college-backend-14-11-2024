const seatHelper = require("@services/helper/seat");

module.exports = class SeatController {
  async create(req) {
    try {
      const result = await seatHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await seatHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await seatHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await seatHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteAll(req) {
    try {
      const result = await seatHelper.deleteAll(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
