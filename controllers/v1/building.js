const buildingService = require("@services/helper/building");

module.exports = class BuildingController {
  async create(req) {
    try {
      const result = await buildingService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await buildingService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await buildingService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await buildingService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
