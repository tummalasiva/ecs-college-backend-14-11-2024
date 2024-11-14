const contactHelper = require("@services/helper/contact");

module.exports = class ContactController {
  async create(req) {
    try {
      const result = await contactHelper.create(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const contacts = await contactHelper.list(req);
      return contacts;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const result = await contactHelper.update(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const result = await contactHelper.delete(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async toggleEnable(req) {
    try {
      const result = await contactHelper.toggleEnable(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
