const feeMapCategoryService = require("@services/helper/fee/feeMapCategory");

module.exports = class FeeMapCategoryController {
  async create(req) {
    try {
      const result = await feeMapCategoryService.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await feeMapCategoryService.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await feeMapCategoryService.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await feeMapCategoryService.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteMultiple(req) {
    try {
      const result = await feeMapCategoryService.deleteMultiple(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updatePriority(req) {
    try {
      const result = await feeMapCategoryService.updatePriority(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const result = await feeMapCategoryService.details(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleActiveStatus(req) {
    try {
      const result = await feeMapCategoryService.toggleActiveStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
