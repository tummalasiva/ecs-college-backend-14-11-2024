const Feedback = require("./model");

module.exports = class FeedbackData {
  static async create(data) {
    try {
      const result = await new Feedback(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter) {
    try {
      const feedbacks = await Feedback.find(filter)
        .populate("questionnaire")
        .populate({ path: "submittedResponse.co", model: "CourseOutcome" })
        .lean();
      return feedbacks;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const feedback = await Feedback.findOne(filter)
        .populate("questionnaire")
        .populate({ path: "submittedResponse.co", model: "CourseOutcome" })
        .lean();
      return feedback;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const feedback = await Feedback.findOneAndUpdate(filter, data, {
        new: true,
        options,
      })
        .populate("questionnaire")
        .populate({ path: "submittedResponse.co", model: "CourseOutcome" })
        .lean();
      return feedback;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const feedback = await Feedback.findOneAndDelete(filter);
      return feedback;
    } catch (error) {
      throw error;
    }
  }
};
