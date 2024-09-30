const CieExam = require("./model");

module.exports = class CieExamData {
  static async create(data) {
    try {
      const result = await new CieExam(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await CieExam.find(filter)
        .populate("degreeCode examTitle subject")
        .populate({ path: "questions.co", model: "CourseOutcom" })
        .populate({ path: "questions.co", model: "ProgramOutcome" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await CieExam.findOne(filter)
        .populate("degreeCode examTitle subject")
        .populate({ path: "questions.co", model: "CourseOutcom" })
        .populate({ path: "questions.co", model: "ProgramOutcome" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter = {}, data) {
    try {
      const result = await CieExam.findOneAndUpdate(filter, data, {
        new: true,
      })
        .populate("degreeCode examTitle subject")
        .populate({ path: "questions.co", model: "CourseOutcom" })
        .populate({ path: "questions.co", model: "ProgramOutcome" })
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await CieExam.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
