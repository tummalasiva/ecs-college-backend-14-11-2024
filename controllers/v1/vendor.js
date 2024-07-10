const vendorService = require("@services/helper/inventory/vendor");

module.exports = class VendorController {
  async create(req) {
    try {
      const result = await vendorService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await vendorService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await vendorService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
