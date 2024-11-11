const InternalExam = require("./model");

module.exports = class InternalExamData {
  static async create(data) {
    try {
      const result = await new InternalExam(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await InternalExam.find(filter)
        .populate("examTitle subject")
        .populate({ path: "questions.cos", model: "CourseOutcom" })
        .populate({ path: "createdBy", select: "academicInfo basicInfo" })
        .populate({ path: "students", select: "academicInfo basicInfo" })
        .populate({
          path: "semester",
          populate: [
            {
              path: "academicYear",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(id) {
    try {
      const result = await InternalExam.findOne(id)
        .populate("examTitle subject")
        .populate({ path: "questions.cos", model: "CourseOutcom" })
        .populate({ path: "createdBy", select: "academicInfo basicInfo" })
        .populate({ path: "students", select: "academicInfo basicInfo" })
        .populate({
          path: "semester",
          populate: [
            {
              path: "academicYear",
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
      const result = await InternalExam.findOneAndUpdate(filter, data, {
        new: true,
        ...options,
      })
        .populate("examTitle subject")
        .populate({ path: "questions.cos", model: "CourseOutcom" })
        .populate({ path: "createdBy", select: "academicInfo basicInfo" })
        .populate({ path: "students", select: "academicInfo basicInfo" })
        .populate({
          path: "semester",
          populate: [
            {
              path: "academicYear",
            },
          ],
        })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await InternalExam.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
