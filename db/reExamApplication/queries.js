const ReExamApplication = require("./model");

module.exports = class ReExamApplicationData {
  static async create(data) {
    try {
      const result = await new ReExamApplication(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await ReExamApplication.find(filter)
        .populate({
          path: "student",
          select: "basicInfo academicInfo academicYear",
          populate: [
            {
              path: "academicInfo.degreeCode",
            },
            {
              path: "academicInfo.section",
            },
            {
              path: "academicInfo.semester",
            },
            {
              path: "academicYear",
            },
          ],
        })
        .populate("subject")
        .populate({
          path: "reviewedBy",
          select: "academicInfo basicInfo",
          populate: [
            {
              path: "academicInfo.department",
            },
            {
              path: "basicInfo.designation",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await ReExamApplication.findOne(filter)
        .populate({
          path: "student",
          select: "basicInfo academicInfo academicYear",
          populate: [
            {
              path: "academicInfo.degreeCode",
            },
            {
              path: "academicInfo.section",
            },
            {
              path: "academicInfo.semester",
            },
            {
              path: "academicYear",
            },
          ],
        })
        .populate("subject")
        .populate({
          path: "reviewedBy",
          select: "academicInfo basicInfo",
          populate: [
            {
              path: "academicInfo.department",
            },
            {
              path: "basicInfo.designation",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await ReExamApplication.findOneAndUpdate(filter, data, {
        new: true,
        ...options,
      }).lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await ReExamApplication.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
