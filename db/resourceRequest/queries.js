const ResourceRequest = require("./model");

module.exports = class ResourceRequestData {
  static async create(data) {
    try {
      const result = await new ResourceRequest(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await ResourceRequest.findOne(filter)
        .populate("department")
        .populate("requestedBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await ResourceRequest.find(filter)
        .populate("department")
        .populate("requestedBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await ResourceRequest.findOneAndUpdate(filter, data, {
        new: true,
        options,
      })
        .populate("department")
        .populate("requestedBy", "basicInfo academicInfo")
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter = {}) {
    try {
      const result = await ResourceRequest.deleteOne(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
