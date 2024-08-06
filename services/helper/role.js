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
      { module: "Dashboard", permissions: [] },
      { module: "Manage Institute", permissions: [] },
      //
      { module: "Administrator", permissions: [] },
      { module: "Academic Year", permissions: [] },
      { module: "Roles and Permissions", permissions: [] },
      { module: "User Password Reset", permissions: [] },
      //
      { module: "Human Resources", permissions: [] },
      { module: "Designation", permissions: [] },
      { module: "Department", permissions: [] },
      { module: "Employee", permissions: [] },
      { module: "Offer Letter", permissions: [] },
      { module: "Relieving Letter", permissions: [] },
      { module: "Off Boarding", permissions: [] },
      { module: "Experience Letter", permissions: [] },
      { module: "Teacher Activity", permissions: [] },
      //
      { module: "Pre-Admission", permissions: [] },
      { module: "Pre-Admission Enquiry", permissions: [] },
      { module: "Pre-Admission Exam", permissions: [] },
      { module: "Pre-Admission Exam Schedule", permissions: [] },
      { module: "Pre-Admission Result", permissions: [] },
      //
      { module: "Academic", permissions: [] },
      { module: "Class", permissions: [] },
      { module: "Section", permissions: [] },
      { module: "Subject", permissions: [] },
      //
      { module: "Attendance", permissions: [] },
      { module: "Student Attendance", permissions: [] },
      { module: "Employee Attendance", permissions: [] },
      //
      { module: "Class Routine", permissions: [] },
      //
      { module: "Student", permissions: [] },
      { module: "Overview", permissions: [] },
      { module: "Admit Student", permissions: [] },
      { module: "Promotion", permissions: [] },
      { module: "Resuffle", permissions: [] },
      { module: "Bulk Admission", permissions: [] },
      { module: "Credential", permissions: [] },
      { module: "Quick Admit", permissions: [] },
      { module: "ID card", permissions: [] },
      { module: "Student Activity", permissions: [] },
      //
      { module: "Assignment", permissions: [] },
      //
      { module: "Diary", permissions: [] },
      //
      { module: "Communication", permissions: [] },
      { module: "Compose", permissions: [] },
      { module: "Sms Report", permissions: [] },
      { module: "Sms Credentials", permissions: [] },
      //
      { module: "Announcement", permissions: [] },
      { module: "Notice", permissions: [] },
      { module: "News", permissions: [] },
      { module: "Holidays", permissions: [] },
      { module: "Award and Achievement", permissions: [] },
      { module: "Splash News", permissions: [] },
      { module: "Calendar Events", permissions: [] },
      //
      { module: "Gallery", permissions: [] },
      //
      { module: "Sms-Notifications", permissions: [] },
      //
      { module: "Event", permissions: [] },
      //
      { module: "Exam", permissions: [] },
      { module: "Exam Grade", permissions: [] },
      { module: "Exam Term", permissions: [] },
      { module: "Exam Schedule", permissions: [] },
      { module: "Exam Hall Ticket", permissions: [] },
      //
      { module: "Exam Mark", permissions: [] },
      { module: "Exam Attendance", permissions: [] },
      { module: "Manage Mark", permissions: [] },
      { module: "Exam Result", permissions: [] },
      { module: "Marks Card", permissions: [] },
      { module: "Consolidated Marks Sheet", permissions: [] },
      { module: "Subject Wise Report", permissions: [] },
      { module: "Division Wise Report", permissions: [] },
      //
      { module: "LMS", permissions: [] },
      { module: "Storage", permissions: [] },
      { module: "Courses", permissions: [] },
      { module: "Course Content", permissions: [] },
      { module: "Live", permissions: [] },
      //
      { module: "Library", permissions: [] },
      { module: "Books", permissions: [] },
      { module: "Periodical", permissions: [] },
      { module: "Student Library Member", permissions: [] },
      { module: "Employee Library Member", permissions: [] },
      { module: "Issue and Returns", permissions: [] },
      //
      { module: "Leave Management", permissions: [] },
      { module: "Leave Type", permissions: [] },
      { module: "Employee Leave", permissions: [] },
      { module: "Student Leave", permissions: [] },
      { module: "Leave Report", permissions: [] },
      //
      { module: "Inventory", permissions: [] },
      { module: "Item", permissions: [] },
      { module: "Vendor", permissions: [] },
      { module: "In/Out Transaction", permissions: [] },
      { module: "Stock List", permissions: [] },
      { module: "Issue", permissions: [] },
      { module: "Sell", permissions: [] },
      //
      { module: "Certificate", permissions: [] },
      { module: "Study Certificate", permissions: [] },
      { module: "Transfer Certificate", permissions: [] },
      //
      { module: "Fees", permissions: [] },
      { module: "Receipt Book", permissions: [] },
      { module: "Fee Map", permissions: [] },
      { module: "Fee Map Category", permissions: [] },
      { module: "Collect Fees", permissions: [] },
      { module: "Balance Fee", permissions: [] },
      { module: "Fee Overview", permissions: [] },
      { module: "Reconciliation", permissions: [] },
      //
      { module: "Hostel", permissions: [] },
      { module: "Manage Hostel", permissions: [] },
      { module: "Manage Room Type", permissions: [] },
      { module: "Manage Room Bed", permissions: [] },
      { module: "Hostel Member", permissions: [] },
      //
      { module: "Transport", permissions: [] },
      { module: "Vehicle", permissions: [] },
      { module: "Manage Route and Trips", permissions: [] },
      { module: "Routes", permissions: [] },
      { module: "Transport Member", permissions: [] },
      { module: "Vehicle Log", permissions: [] },
      { module: "Vehicle Maintenance", permissions: [] },
      //
      { module: "Payroll", permissions: [] },
      { module: "Salary Grade", permissions: [] },
      { module: "Make Payment", permissions: [] },
      //
      { module: "Reports", permissions: [] },
      { module: "Library Report", permissions: [] },
      { module: "Student Attendance Report", permissions: [] },
      { module: "Student Yearly Attendance", permissions: [] },
      { module: "Employee Attendance Report", permissions: [] },
      { module: "Employee Yearly Attendance", permissions: [] },
      { module: "Student Report", permissions: [] },
      { module: "Student Activity Report", permissions: [] },
      //
      { module: "Vistor", permissions: [] },
      { module: "Visitor Information", permissions: [] },
      { module: "Student Checkout", permissions: [] },
      //
      { module: "Help Desk", permissions: [] },
      //
      { module: "Guardian Feedback", permissions: [] },
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
