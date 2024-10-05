const coPsoMappingService = require("@services/helper/coPsoMapping");

module.exports = class CoPsoMappingController {
  async create(req) {
    try {
      const result = await coPsoMappingService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await coPsoMappingService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await coPsoMappingService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await coPsoMappingService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
