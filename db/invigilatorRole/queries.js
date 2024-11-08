const InvigilatorRole = require("./model");

module.exports = class InvigilatorRoleData {
  static async create(data) {
    try {
      const result = await new InvigilatorRole(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await InvigilatorRole.find(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await InvigilatorRole.findOne(filter).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update) {
    try {
      const result = await InvigilatorRole.findOneAndUpdate(filter, update, {
        new: true,
      }).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await InvigilatorRole.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
