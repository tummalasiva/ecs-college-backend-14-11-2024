const CoursePlan = require("./model");

module.exports = class CoursePlanData {
  static async create(data) {
    try {
      const result = await new CoursePlan(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await CoursePlan.find(filter)
        .populate("subject section semester buildingRoom building")
        .populate("facultyAssigned", "academicInfo basicInfo")
        .populate({ path: "slots", model: "Slot" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await CoursePlan.findOne(filter)
        .populate("subject section semester buildingRoom building")
        .populate("facultyAssigned", "academicInfo basicInfo")
        .populate({ path: "slots", model: "Slot" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update, options = {}) {
    try {
      const result = await CoursePlan.findOneAndUpdate(filter, update, {
        new: true,
        ...options,
      })
        .populate("subject section semester buildingRoom building")
        .populate("facultyAssigned", "academicInfo basicInfo")
        .populate({ path: "slots", model: "Slot" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await CoursePlan.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
