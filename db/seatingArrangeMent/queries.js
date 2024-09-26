const SeatingArrangement = require("./model");

module.exports = class SeatingArrangementData {
  static async create(data) {
    try {
      const result = await new SeatingArrangement(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await SeatingArrangement.find(filter)
        .populate("building room examSchedule academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await SeatingArrangement.findOne(filter)
        .populate("building room examSchedule academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await SeatingArrangement.findOneAndUpdate(
        filter,
        updateData,
        { new: true }
      )
        .populate("building room examSchedule academicYear")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await SeatingArrangement.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
