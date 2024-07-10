const Enquiry = require("./model");

module.exports = class EnquiryData {
  static async create(data) {
    try {
      const result = await new Enquiry(data).save();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filter = {}) {
    try {
      const result = await Enquiry.find(filter)
        .populate(
          "school examSchedule studentDetails.academicDetails.class studentDetails.academicDetails.academicYear"
        )
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async findOne(filter = {}) {
    try {
      const result = await Enquiry.findOne(filter)
        .populate(
          "school examSchedule studentDetails.academicDetails.class studentDetails.academicDetails.academicYear"
        )
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateOne(filter, data, options = {}) {
    try {
      const result = await Enquiry.findOneAndUpdate(filter, data, options)
        .populate(
          "school examSchedule studentDetails.academicDetails.class studentDetails.academicDetails.academicYear"
        )
        .lean();
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async updateMany(filter, data) {
    try {
      const result = await Enquiry.updateMany(filter, data);

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async delete(filter) {
    try {
      const result = await Enquiry.findOneAndDelete(filter);
      return result;
    } catch (error) {
      throw error;
    }
  }
};
