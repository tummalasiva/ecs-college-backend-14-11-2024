const classQuery = require("@db/class/queries");
const studentQuery = require("@db/student/queries");
const meetingQuery = require("@db/meeting/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const moment = require("moment");

const getDateWithTime = (dateTimeString = "27/09/2024 14:30") => {
  const dateTimeComponents = dateTimeString.split(" ");

  // Extract date components
  const dateComponents = dateTimeComponents[0].split("/");
  const yearExtracted = parseInt(dateComponents[2], 10);
  const monthExtracted = parseInt(dateComponents[1], 10) - 1; // Months are zero-based
  const dayExtracted = parseInt(dateComponents[0], 10);

  // Extract time components
  const timeComponents = dateTimeComponents[1].split(":");
  const hoursExtracted = parseInt(timeComponents[0], 10);
  const minutesExtracted = parseInt(timeComponents[1], 10);

  // Create a new Date object using the extracted components
  return new Date(
    yearExtracted,
    monthExtracted,
    dayExtracted,
    hoursExtracted,
    minutesExtracted
  );
};

function randomID(len) {
  let result = "";
  if (result) return result;
  var chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

module.exports = class CourseContentService {
  static async create(req) {
    try {
      const {
        expiryDate,
        expiryTime,
        startTime,
        startDate,
        classId,
        participantType,
        meetingType,
        userTypes,
        studentParticipants,
        employeeParticipants,
      } = req.body;

      console.log(req.body, "======");

      if (!Array.isArray(userTypes))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please select valid user types",
          responseCode: "CLIENT_ERROR",
        });

      if (participantType === "Class Students" && !Array.isArray(classId))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide valid classes!",
          responseCode: "CLIENT_ERROR",
        });

      if (
        !expiryDate ||
        !expiryTime ||
        !startTime ||
        !startDate ||
        !participantType ||
        !meetingType
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "PLEASE_PROVIDE_REQUIRED_FIELDS",
          responseCode: "CLIENT_ERROR",
        });
      }
      let expiryDateTimeString = `${moment(expiryDate).format(
        "DD/MM/YYYY"
      )} ${expiryTime}`;
      let scheduledDateTimeString = `${moment(startDate).format(
        "DD/MM/YYYY"
      )} ${startTime}`;

      let expiry = getDateWithTime(expiryDateTimeString);
      let schedule = getDateWithTime(scheduledDateTimeString);
      if (expiry < schedule) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Expiry time cannot be less than start time of the meeting!",
          responseCode: "CLIENT_ERROR",
        });
      }
      if (participantType === "Class Students") {
        let classWithTheGivenId = await classQuery.findAll({
          _id: { $in: classId },
        });
        if (classWithTheGivenId.length !== classId.length) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "One or more of the selected classes was not found!",
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      if (participantType === "Selected") {
        if (
          userTypes.includes("employee") &&
          !Array.isArray(employeeParticipants)
        )
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please select valid list of employees!",
            responseCode: "CLIENT_ERROR",
          });

        if (
          userTypes.includes("student") &&
          !Array.isArray(studentParticipants)
        )
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please select valid list of students!",
            responseCode: "CLIENT_ERROR",
          });
      }
      const roomId = randomID(6);
      let bodyData = {
        userTypes: userTypes || [],
        roomId,
        expiryDate,
        expiryTime,
        startDate,
        startTime,
        classId: participantType == "Class Students" ? classId : null,
        meetingType,
        participantType,
        employeeParticipants: employeeParticipants || [],
        studentParticipants: studentParticipants || [],
        createdBy: req.employee._id,
      };
      const createData = meetingQuery.create({
        ...bodyData,
        school: req.schoolId,
      });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Meeting Created Successfully!",
        responseCode: "SUCCESS",
        result: createData,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const findMeeting = await meetingQuery.findOne({ _id: req.params.id });
      if (!findMeeting) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Meeting not found!",
          responseCode: "CLIENT_ERROR",
        });
      }
      const {
        expiryDate,
        expiryTime,
        startTime,
        startDate,
        classId,
        participantType,
        meetingType,
        employeeParticipants,
        studentParticipants,
        userTypes,
      } = req.body;

      if (!Array.isArray(userTypes))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please select valid user types",
          responseCode: "CLIENT_ERROR",
        });

      if (participantType === "Class Students" && !Array.isArray(classId))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Please provide valid classes!",
          responseCode: "CLIENT_ERROR",
        });

      if (
        !expiryDate ||
        !expiryTime ||
        !startTime ||
        !startDate ||
        !participantType ||
        !meetingType
      ) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "PLEASE_PROVIDE_REQUIRED_FIELDS",
          responseCode: "CLIENT_ERROR",
        });
      }
      let expiryDateTimeString = `${moment(expiryDate).format(
        "DD/MM/YYYY"
      )} ${expiryTime}`;
      let scheduledDateTimeString = `${moment(startDate).format(
        "DD/MM/YYYY"
      )} ${startTime}`;

      let expiry = getDateWithTime(expiryDateTimeString);
      let schedule = getDateWithTime(scheduledDateTimeString);
      if (expiry < schedule) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Expiry time cannot be less than start time of the meeting!",
          responseCode: "CLIENT_ERROR",
        });
      }
      if (participantType === "Class Students") {
        let classWithTheGivenId = await classQuery.findOne({
          _id: { $in: classId },
        });

        if (classWithTheGivenId.length !== classId.length) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "One or more of the selected classes was not found!",
            responseCode: "CLIENT_ERROR",
          });
        }
      }

      if (participantType === "Selected") {
        if (
          userTypes.includes("employee") &&
          !Array.isArray(employeeParticipants)
        )
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please select valid list of employees!",
            responseCode: "CLIENT_ERROR",
          });
        if (
          userTypes.includes("student") &&
          !Array.isArray(studentParticipants)
        )
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Please select valid list of students!",
            responseCode: "CLIENT_ERROR",
          });
      }

      let bodyData = {
        expiryDate,
        expiryTime,
        startDate,
        startTime,
        classId,
        meetingType,
        participantType,
        employeeParticipants: employeeParticipants || [],
        studentParticipants: studentParticipants || [],
        userTypes,
      };
      const updatedMeeting = await meetingQuery.updateOne(
        { _id: req.params.id },
        { $set: bodyData },
        { new: true, runValidators: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Meeting Updated Successfully",
        responseCode: "SUCCESS",
        result: updatedMeeting,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      let links = await meetingQuery.findAll({
        school: req.schoolId,
      });

      if (
        ["SUPER ADMIN", "ADMIN"].includes(req.employee.role.name.toUpperCase())
      ) {
        return common.successResponse({
          result: links,
          statusCode: httpStatusCode.ok,
        });
      }

      links = await meetingQuery.findAll({
        school: req.schoolId,
        $or: [
          { createdBy: req.employee._id },
          { participants: { $in: [req.employee._id] } },
        ],
      });

      return common.successResponse({
        result: links,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async listStudent(req) {
    try {
      let student = await studentQuery.findOne({ _id: req.student._id });

      let links = await meetingQuery.findAll({
        school: req.schoolId,
        $or: [
          { classId: { $in: [student.academicInfo.class] } },
          { studentParticipants: { $in: [student._id] } },
        ],
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: links,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      const updatedMeeting = await meetingQuery.delete({ _id: req.params.id });
      return common.successResponse({
        message: "Meeting link removed successfully!",
        statusCode: httpStatusCode.ok,
        result: updatedMeeting,
      });
    } catch (error) {
      throw error;
    }
  }

  static async join(req) {
    try {
      let { roomID } = req.query;
      let meetingWithThegivenId = await meetingQuery.findOne({
        roomId: roomID,
      });
      if (!meetingWithThegivenId) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Meeting not found!",
          responseCode: "CLIENT_ERROR",
        });
      }
      return common.successResponse({
        result: meetingWithThegivenId,
        statusCode: httpStatusCode.ok,
      });
    } catch (error) {
      throw error;
    }
  }

  static async joinStudent(req) {
    try {
      const student = await studentQuery.findOne({ _id: req.student._id });
      let { roomID } = req.query;
      let meetingWithThegivenId = await meetingQuery
        .findOne({
          roomId: roomID,
        })
        .lean();
      if (!meetingWithThegivenId) {
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Meeting not found!",
          responseCode: "CLIENT_ERROR",
        });
      }
      let expiryDateTimeString = `${moment(
        meetingWithThegivenId.expiryDate
      ).format("DD/MM/YYYY")} ${meetingWithThegivenId.expiryTime}`;
      let scheduledDateTimeString = `${moment(
        meetingWithThegivenId.startDate
      ).format("DD/MM/YYYY")} ${meetingWithThegivenId.startTime}`;

      let expiry = getDateWithTime(expiryDateTimeString);
      let schedule = getDateWithTime(scheduledDateTimeString);

      if (meetingWithThegivenId.participantType === "Class Students") {
        if (!meetingWithThegivenId.classId.includes(student.academicInfo.class))
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Invalid request!",
            responseCode: "CLIENT_ERROR",
          });
      } else if (
        meetingWithThegivenId.participantType === "Single" ||
        meetingWithThegivenId.participantType === "Selected"
      ) {
        if (
          !meetingWithThegivenId.studentParticipants.filter(
            (p) => p.toHexString() == req.student._id.toHexString()
          ).length
        ) {
          return common.failureResponse({
            statusCode: httpStatusCode.bad_request,
            message: "Invalid request!",
            responseCode: "CLIENT_ERROR",
          });
        }
      }
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: meetingWithThegivenId,
      });
    } catch (error) {
      throw error;
    }
  }
};
