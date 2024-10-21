const Questionnaire = require("./model");

module.exports = class QuestionnaireData {
  static async create(data) {
    try {
      const result = await new Questionnaire(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Questionnaire.find(filter)
        .populate("semester subject section")
        .populate("createdBy", "basicInfo academicInfo userType")
        .populate({ path: "questions.co", model: "CourseOutcome" });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await Questionnaire.findOne(filter)
        .populate("semester subject section")
        .populate("createdBy", "basicInfo academicInfo userType")
        .populate({ path: "questions.co", model: "CourseOutcome" });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, update) {
    try {
      const result = await Questionnaire.findOneAndUpdate(filter, update, {
        new: true,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Questionnaire.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
