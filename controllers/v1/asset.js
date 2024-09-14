const assetService = require("@services/helper/asset");

module.exports = class AssetController {
  async create(req) {
    try {
      const result = await assetService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await assetService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await assetService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await assetService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
