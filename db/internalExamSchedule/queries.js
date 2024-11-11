const InternalExamSchedule = require("./model");

module.exports = class InternalExamScheduleData {
  static async create(data) {
    try {
      const result = await new InternalExamSchedule(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await InternalExamSchedule.find(filter)
        .populate("slot semester building buildingRoom")
        .populate({
          path: "exam",
          populate: [
            {
              path: "exam.subject",
            },
            {
              path: "exam.section",
            },
            {
              path: "exam.examTitle",
            },
            {
              path: "exam.students",
              select: "basicInfo academicInfo",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await InternalExamSchedule.findOne(filter)
        .populate("slot semester building buildingRoom")
        .populate({
          path: "exam",
          populate: [
            {
              path: "exam.subject",
            },
            {
              path: "exam.section",
            },
            {
              path: "exam.examTitle",
            },
            {
              path: "exam.students",
              select: "basicInfo academicInfo",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await InternalExamSchedule.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await InternalExamSchedule.findOneAndUpdate(filter, data, {
        new: true,
        ...options,
      })
        .populate("slot semester building buildingRoom")
        .populate({
          path: "exam",
          populate: [
            {
              path: "exam.subject",
            },
            {
              path: "exam.section",
            },
            {
              path: "exam.examTitle",
            },
            {
              path: "exam.students",
              select: "basicInfo academicInfo",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
