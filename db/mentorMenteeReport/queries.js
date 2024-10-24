const MentorMenteeReport = require(".model");

module.exports = class MentorMenteeReportData {
  static async create(data) {
    try {
      const result = await new MentorMenteeReport(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await MentorMenteeReport.find(filter)
        .populate("menteeId", "academicInfo basicInfo")
        .populate("semester")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await MentorMenteeReport.findOne(filter)
        .populate("menteeId", "academicInfo basicInfo")
        .populate("semester")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data) {
    try {
      const result = await MentorMenteeReport.findOneAndUpdate(filter, data, {
        new: true,
      })
        .populate("menteeId", "academicInfo basicInfo")
        .populate("semester")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await MentorMenteeReport.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
