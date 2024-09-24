const subjectQuery = require("@db/subject/queries");
const subjectComponentQuery = require("@db/subjectComponent/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class SubjectService {
  static async create(body) {
    try {
      let filter = { name: { $regex: new RegExp(`^${body.name}$`, "i") } };
      if (body.programSpecific) {
        filter = {
          ...filter,
          programSpecific: true,
          degreeCode: body.degreeCode,
        };
      }
      const subjectExist = await subjectQuery.findOne(filter);
      if (subjectExist) {
        return common.failureResponse({
          message: "Subject already exists!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }

      const allSubjectComponents = await subjectComponentQuery.findAll({});

      let givenSubjectComponentData = body.componentsAndCredits;

      let subjectComponentsAndCredits = [];

      for (let comp of allSubjectComponents) {
        let newItem = {
          component: comp._id,
          credits:
            givenSubjectComponentData.find(
              (c) => c.component.toHexString() === comp._id.toHexString()
            )?.credits || 0,
          hours:
            givenSubjectComponentData.find(
              (c) => c.component.toHexString() === comp._id.toHexString()
            )?.hours * comp.hoursMultiplicationFactor || 0,
        };

        subjectComponentsAndCredits.push(newItem);
      }

      let totalCredits = subjectComponentsAndCredits.reduce(
        (t, c) => t + c.credits,
        0
      );
      let totalHours = subjectComponentsAndCredits.reduce(
        (t, c) => t + c.hours,
        0
      );

      body.totalCredits = totalCredits;
      body.totalHours = totalHours;
      body.componentsAndCredits = subjectComponentsAndCredits;

      const newSubject = await subjectQuery.create(body);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Subject with the name ${body.name} has been added successfully!`,
        result: newSubject,
      });
    } catch (error) {
      return error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      let filter = { $or: [{ ...search }, { programSpecific: false }] };

      let subjectList = await subjectQuery.findAll(filter);

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Subjects fetched successfully!",
        result: subjectList,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(id, body, userId) {
    try {
      let filter = {
        name: { $regex: new RegExp(`^${body.name}`, "i") },
        _id: { $ne: id },
        semester: body.semester,
      };

      if (body.programSpecific) {
        filter = {
          ...filter,
          programSpecific: true,
          degreeCode: body.degreeCode,
        };
      }

      let otherSubjectWithGivenName = await subjectQuery.findOne(filter);

      if (otherSubjectWithGivenName)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Subject with the given name already exists",
          responseCode: "CLIENT_ERROR",
        });

      let dataToUpdate = { ...body };
      if (body.programSpecific === false) {
        dataToUpdate.degreeCode = null;
        dataToUpdate.semester = null;
      }

      const allSubjectComponents = await subjectComponentQuery.findAll({});

      let givenSubjectComponentData = dataToUpdate.componentsAndCredits;

      let subjectComponentsAndCredits = [];

      for (let comp of allSubjectComponents) {
        let newItem = {
          component: comp._id,
          credits:
            givenSubjectComponentData.find(
              (c) => c.component.toHexString() === comp._id.toHexString()
            )?.credits || 0,
          hours:
            givenSubjectComponentData.find(
              (c) => c.component.toHexString() === comp._id.toHexString()
            )?.hours * comp.hoursMultiplicationFactor || 0,
        };

        subjectComponentsAndCredits.push(newItem);
      }

      let totalCredits = subjectComponentsAndCredits.reduce(
        (t, c) => t + c.credits,
        0
      );
      let totalHours = subjectComponentsAndCredits.reduce(
        (t, c) => t + c.hours,
        0
      );

      dataToUpdate.totalCredits = totalCredits;
      dataToUpdate.totalHours = totalHours;
      dataToUpdate.componentsAndCredits = subjectComponentsAndCredits;

      let subjects = await subjectQuery.updateOne({ _id: id }, dataToUpdate);
      if (subjects) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Subject updated successfully!",
          result: subjects,
        });
      } else {
        return common.failureResponse({
          message: "Subject not found!",
          statusCode: httpStatusCode.not_found,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      let subjects = await subjectQuery.delete({ _id: id });

      if (subjects) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          message: "Subject deleted successfully!",
          result: subjects,
        });
      } else {
        return common.failureResponse({
          message: "Subject not found",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }

  static async details(id, userId) {
    try {
      let subject = await subjectQuery.findOne({ _id: id });

      if (subject) {
        return common.successResponse({
          statusCode: httpStatusCode.ok,
          result: subject,
        });
      } else {
        return common.failureResponse({
          message: "Subject not found!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });
      }
    } catch (error) {
      throw error;
    }
  }
};
