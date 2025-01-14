const studentQuery = require("@db/student/queries");
const httpStatusCode = require("@generics/http-status");
const internshipQuery = require("@db/internship/queries");
const common = require("@constants/common");
const { notFoundError, uploadFileToS3 } = require("../../helper/helpers");

module.exports = class InternshipHelper {
  static async create(req) {
    try {
      // do a validation check if the student is eligible for internship yet or not
      let data = { ...req.body, appliedBy: req.student._id };
      if (req.files && req.files.document) {
        data["document"] = await uploadFileToS3(req.files.document);
      }

      let newDoc = await internshipQuery.create(data);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Internship details added successfully",
        result: newDoc,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { ...search };

      if (filter.semester) {
        let students = await studentQuery.findAll({
          "academicInfo.semester": filter.semester,
        });
        filter["appliedBy"] = { $in: students.map((s) => s._id) };
        delete filter.semester;
      }

      let internships = await internshipQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Internships listed successfully",
        result: internships,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      let docExists = await internshipQuery.findOne({ _id: req.params.id });
      if (!docExists) return notFoundError("Internship data not found!");

      if (docExists.approved)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Cannot update an approved internship!",
          responseCode: "CLIENT_ERROR",
        });

      let document = docExists.document;
      if (req.files && req.files.document) {
        if (document) await deleteFile(document);
        document = await uploadFileToS3(req.files.document);
      }

      const updatedInternship = await internshipQuery.updateOne(
        { _id: req.params.id },
        { $set: { ...req.body, document } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Internship details updated successfully",
        result: updatedInternship,
      });
    } catch (error) {
      throw error;
    }
  }

  static async approve(req) {
    try {
      let docExists = await internshipQuery.findOne({ _id: req.params.id });
      if (!docExists) return notFoundError("Internship data not found!");

      if (docExists.approved)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Cannot approve an internship that is already approved!",
          responseCode: "CLIENT_ERROR",
        });

      let updatedInternship = await internshipQuery.updateOne(
        { _id: req.params.id },
        { $set: { approved: true } }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Internship approved successfully",
        result: updatedInternship,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      let docExists = await internshipQuery.findOne({ _id: req.params.id });
      if (!docExists) return notFoundError("Internship data not found!");

      if (docExists.approved)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Cannot delete an approved internship!",
          responseCode: "CLIENT_ERROR",
        });

      await internshipQuery.deleteOne({ _id: req.params.id });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Internship deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
};
