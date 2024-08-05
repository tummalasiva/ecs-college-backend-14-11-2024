// Dependencies
const httpStatusCategory = require("@generics/http-status");
const common = require("@constants/common");
const rolesData = require("@db/role/queries");

const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class RoleHelper {
  static async create(data) {
    try {
      const role = await rolesData.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
      });

      if (role) {
        return common.failureResponse({
          message: "Role already exists!",
          statusCode: httpStatusCategory.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      await rolesData.create({
        ...data,
        name: data.name,
      });

      return common.successResponse({
        statusCode: httpStatusCategory.created,
        message: "Role created successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const existingRole = await rolesData.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
        _id: { $ne: new ObjectId(id) },
      });

      if (existingRole) {
        return common.failureResponse({
          message: "Role already exists!",
          statusCode: httpStatusCategory.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      const result = await rolesData.updateOne(
        { _id: id },
        {
          ...data,
          name: data.name,
        },
        {
          new: true,
        }
      );

      return common.successResponse({
        statusCode: httpStatusCategory.accepted,
        message: "Role updated successfully!",
        result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async read(id) {
    try {
      const role = await rolesData.findOne({ _id: id });

      if (!role) {
        return common.failureResponse({
          message: "Role not found!",
          statusCode: httpStatusCategory.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }

      return common.successResponse({
        statusCode: httpStatusCategory.ok,
        message: "Role fetched successfully!",
        result: role,
      });
    } catch (error) {
      throw error;
    }
  }

  static getRoleKeys() {
    const rolesKeys = [
      { module: "Institute Selector", permissions: [] },
      { module: "Dashboard", permissions: [] },
      { module: "Institute", permissions: [] },
      { module: "Academic Year", permissions: [] },
      { module: "Roles and Permissions", permissions: [] },
      { module: "Designation", permissions: [] },
      { module: "Department", permissions: [] },
      { module: "Employee", permissions: [] },
      { module: "Appointment Letter", permissions: [] },
      { module: "Offer Letter", permissions: [] },
      { module: "Relieving Letter", permissions: [] },
      { module: "Off Boarding", permissions: [] },
      { module: "Experience-Letter", permissions: [] },
      { module: "Teacher Activity Feedback", permissions: [] },
      { module: "Teacher Activity", permissions: [] },
      { module: "Pre Addmission Enquiry", permissions: [] },
      { module: "Pre Addmission Exam", permissions: [] },
      { module: "Pre Addmission ExamSchedule", permissions: [] },
      { module: "Result", permissions: [] },
      { module: "Class", permissions: [] },
      { module: "Section", permissions: [] },
      { module: "Subject", permissions: [] },
      { module: "Student Attendance", permissions: [] },
      { module: "Assignment", permissions: [] },
      { module: "Employee Attendance", permissions: [] },
      { module: "Class Routine", permissions: [] },
      { module: "Student", permissions: [] },
      { module: "Student Activity", permissions: [] },
      { module: "Sms", permissions: [] },
      { module: "Notice", permissions: [] },
      { module: "News", permissions: [] },
      { module: "Holiday", permissions: [] },
      { module: "Awards", permissions: [] },
      { module: "Splash News", permissions: [] },
      { module: "Calender Events", permissions: [] },
      { module: "Gallery", permissions: [] },
      { module: "Event", permissions: [] },
      { module: "Exam Grade", permissions: [] },
      { module: "Exam Term", permissions: [] },
      { module: "Exam Schedule", permissions: [] },
      { module: "Hall Ticket", permissions: [] },
      { module: "Exam Attendance", permissions: [] },
      { module: "Manage Mark", permissions: [] },
      { module: "Exam Result", permissions: [] },
      { module: "Marks Card", permissions: [] },
      { module: "Consolidated Marks Sheet", permissions: [] },
      { module: "Subject Wise Report", permissions: [] },
      { module: "Division Wise Report", permissions: [] },
      { module: "Storage", permissions: [] },
      { module: "Courses", permissions: [] },
      { module: "Course Content", permissions: [] },
      { module: "Live", permissions: [] },
      { module: "Books", permissions: [] },
      { module: "Periodical", permissions: [] },
      { module: "Issue and Returns", permissions: [] },
      { module: "Leave Type", permissions: [] },
      { module: "Employee Leave", permissions: [] },
      { module: "Student Leave", permissions: [] },
      { module: "Leave Report", permissions: [] },
      { module: "Item", permissions: [] },
      { module: "Vendor", permissions: [] },
      { module: "Transactions", permissions: [] },
      { module: "Stock List", permissions: [] },
      { module: "Issue", permissions: [] },
      { module: "Sell", permissions: [] },
      { module: "Study Certificates", permissions: [] },
      { module: "Transfer Certificates", permissions: [] },
    ];

    return common.successResponse({
      statusCode: httpStatusCategory.ok,
      message: "",
      result: rolesKeys,
    });
  }

  static async delete(id) {
    try {
      const deletedData = await rolesData.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCategory.ok,
        message: "Role deleted successfully",
        result: deletedData,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    const { search = {} } = req.query;
    try {
      const roles = await rolesData.findAll(search);

      return common.successResponse({
        statusCode: httpStatusCategory.ok,
        result: roles,
      });
    } catch (error) {
      throw error;
    }
  }
};
