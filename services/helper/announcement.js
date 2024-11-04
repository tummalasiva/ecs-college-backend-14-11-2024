const announcementQuery = require("@db/announcement/queries");
const employeeQuery = require("@db/employee/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class AnnouncementService {
  static async create(req) {
    try {
      const {
        title,
        description,
        priority,
        announcementFor,
        degreeCodes,
        semester,
        years,
        faculties,
        departments,
        parents,
      } = req.body;

      let currentEmployee = await employeeQuery.findOne({
        _id: req.employee,
        active: true,
      });
      if (!currentEmployee)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Employee not found!",
          responseCode: "CLIENT_ERROR",
        });

      let bodyData = {
        title,
        description,
        priority,
        departmentOfCreator: currentEmployee.academicInfo.department?._id,
        createdBy: req.employee,
      };

      if (announcementFor === "Students") {
        if (!Array.isArray(degreeCodes) || !degreeCodes.length)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Degree codes should be an array!",
            responseCode: "CLIENT_ERROR",
          });

        if (!semester)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Semester should be provided!",
            responseCode: "CLIENT_ERROR",
          });

        if (!Array.isArray(years) || !years.length)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Years should be an array!",
            responseCode: "CLIENT_ERROR",
          });

        bodyData["degreeCodes"] = degreeCodes;
        bodyData["semester"] = semester;
        bodyData["years"] = years;
      }

      if (announcementFor === "Departments") {
        if (!Array.isArray(departments) || !departments.length)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Departments should be an array!",
            responseCode: "CLIENT_ERROR",
          });

        bodyData["departments"] = departments;
      }

      if (announcementFor === "Faculties") {
        if (!Array.isArray(faculties) || !faculties.length)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Faculties should be an array!",
            responseCode: "CLIENT_ERROR",
          });

        bodyData["faculties"] = faculties;
      }

      if (announcementFor === "Parents") {
        if (!Array.isArray(parents) || !parents.length)
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Parents should be an array!",
            responseCode: "CLIENT_ERROR",
          });

        bodyData["parents"] = parents;
      }

      const newAnnouncement = await announcementQuery.create(bodyData);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Announcement created successfully",
        result: newAnnouncement,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };

      const announcements = await announcementQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: announcements,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const { id } = req.params;

      const announcement = await announcementQuery.findOne(id);
      if (!announcement)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Announcement not found!",
          responseCode: "CLIENT_ERROR",
        });

      await announcementQuery.delete({ _id: id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Announcement deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
