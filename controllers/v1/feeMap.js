const feeMapService = require("@services/helper/fee/feeMap");

module.exports = class FeeMapController {
  async create(req) {
    try {
      const result = await feeMapService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await feeMapService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await feeMapService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await feeMapService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const result = await feeMapService.details(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleActiveStatus(req) {
    try {
      const result = await feeMapService.toggleActiveStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
