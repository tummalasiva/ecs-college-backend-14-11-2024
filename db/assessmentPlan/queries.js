const AssesmentPlan = require("./model");

module.exports = class AssesmentPlanData {
  static async create(data) {
    try {
      const result = await new AssesmentPlan(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await AssesmentPlan.find(filter)
        .populate("createdBy", "basicInfo academicInfo userType")
        .populate("subject semester section")
        .populate({ path: "plan.examTitle", model: "ExamTitle" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await AssesmentPlan.findOne(filter)
        .populate("createdBy", "basicInfo academicInfo userType")
        .populate("subject semester section")
        .populate({ path: "plan.examTitle", model: "ExamTitle" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, updateData) {
    try {
      const result = await AssesmentPlan.findOneAndUpdate(filter, updateData, {
        new: true,
      })
        .populate("createdBy", "basicInfo academicInfo userType")
        .populate("subject semester section")
        .populate({ path: "plan.examTitle", model: "ExamTitle" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await AssesmentPlan.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
