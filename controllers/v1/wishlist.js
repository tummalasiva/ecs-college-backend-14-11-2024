const wishlistHelper = require("@services/helper/wishlist");

module.exports = class WishlistController {
  async create(req) {
    try {
      const result = await wishlistHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const result = await wishlistHelper.list(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async details(req) {
    try {
      const result = await wishlistHelper.details(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await wishlistHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await wishlistHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async toggleEnableRegistration(req) {
    try {
      const result = await wishlistHelper.toggleEnableRegistration(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
