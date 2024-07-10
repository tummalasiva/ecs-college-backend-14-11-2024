const Issue = require("./model");

module.exports = class IssueData {
  static async create(data) {
    try {
      const result = await new Issue(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Issue.findOneAndUpdate(filter, data, {
        ...options,
        new: true,
      })
        .populate("school fromSchool toSchool issuedTo issuedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Issue.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter) {
    try {
      const result = await Issue.findOne(filter)
        .populate("school fromSchool toSchool issuedTo issuedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async findAll(filter) {
    try {
      const result = await Issue.find(filter)
        .populate("school fromSchool toSchool issuedTo issuedBy")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }
};
