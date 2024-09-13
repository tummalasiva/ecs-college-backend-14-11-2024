const ProgramOutcome = require("./model");

module.exports = class ProgramOutcomeData {
  static async create(data) {
    try {
      const result = await new ProgramOutcome(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const results = await ProgramOutcome.find(filter)
        .populate("degreeCode")
        .lean();
      return results;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await ProgramOutcome.findOne(filter)
        .populate("degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await ProgramOutcome.findOneAndUpdate(filter, updateData, {
        new: true,
      })
        .populate("degreeCode")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await ProgramOutcome.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
