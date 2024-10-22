const wishlistDeclarationHelper = require("@services/helper/wishlistDeclaration");

module.exports = class WishlistDeclarationController {
  async create(req) {
    try {
      const result = await wishlistDeclarationHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await wishlistDeclarationHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const result = await wishlistDeclarationHelper.details(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await wishlistDeclarationHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await wishlistDeclarationHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
