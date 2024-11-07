const CodeOfConduct = require("./model");

module.exports = class CodeOfConductData {
  static async create(data) {
    try {
      const result = await new CodeOfConduct(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await CodeOfConduct.find(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await CodeOfConduct.findOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await CodeOfConduct.findOneAndUpdate(filter, data, {
        new: true,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await CodeOfConduct.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
