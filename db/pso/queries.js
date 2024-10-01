const Pso = require("./model");

module.exports = class PsoData {
  static async create(data) {
    try {
      const result = await new Pso(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Pso.find(filter).populate("degreeCode").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Pso.findOne(filter).populate("degreeCode").lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update) {
    try {
      const result = await Pso.findOneAndUpdate(filter, update, { new: true })
        .populate("degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Pso.deleteOne(filter).exec();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
