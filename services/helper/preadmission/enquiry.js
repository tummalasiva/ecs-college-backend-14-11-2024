const enquiryQuery = require("@db/preadmission/enquiry/queries");
const studentQuery = require("@db/student/queries");
const examScheduleQuery = require("@db/preadmission/examSchedule/queries");
const sectionQuery = require("@db/section/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");
const { getDateRange } = require("../../../helper/helpers");

module.exports = class EnquiryService {
  static async create(body) {
    try {
      const { studentDetails } = body;

      let enquiryCreatedForThisStudent = await enquiryQuery.findOne({
        "studentDetails.studentName": studentDetails.basicDetails.name,
        contactNumber: studentDetails.contactDetails.guardianContactNumber,
        school: body.school,
      });
      if (enquiryCreatedForThisStudent)
        return common.failureResponse({
          message: "Enquiry for this student has already been created!",
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
        });

      let newEnquiry = await enquiryQuery.create({
        ...body,
        contactNumber: studentDetails.contactDetails.guardianContactNumber,
        studentName: studentDetails.basicDetails.name,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Enquiry created successfully!",
        result: newEnquiry,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;

      console.log(req.query, "query");

      if (search.fromDate && search.toDate) {
        const { startOfDay, endOfDay } = getDateRange(
          search.fromDate,
          search.toDate
        );
        search["createdAt"] = {
          $gte: startOfDay,
          $lt: endOfDay,
        };
      }

      if (req.schoolId) {
        search["school"] = req.schoolId;
      }

      delete search.fromDate;
      delete search.toDate;

      const allEnquiries = await enquiryQuery.findAll({
        ...search,
        school: req.schoolId,
      });

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: allEnquiries,
      });
    } catch (error) {
      throw error;
    }
  }

  // todo
  static async updateStatus(req) {
    try {
      const enquiryId = req.params.id;
      const { status } = req.body;

      let enquiryToUpdate = await enquiryQuery.findOne({ _id: enquiryId });

      if (!enquiryToUpdate)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Enquiry not found!",
          responseCode: "CLIENT_ERROR",
        });

      console.log(enquiryToUpdate, "enquiry to update");

      let admittedStudentId = null;

      if (status === "Admitted") {
        let newStudent = {};
        newStudent["school"] = enquiryToUpdate.school?._id;
        newStudent["basicInfo"] = {
          name: enquiryToUpdate.studentDetails.basicDetails.name,
          admissionDate: new Date(Date.now()),
          dob: enquiryToUpdate.studentDetails.basicDetails.dob,
          gender: enquiryToUpdate.studentDetails.basicDetails.gender,
          bloodGroup: enquiryToUpdate.studentDetails.basicDetails.bloodGroup,
          birthPlace: enquiryToUpdate.studentDetails.basicDetails.birthPlace,
          aadharNo: enquiryToUpdate.studentDetails.basicDetails.aadharNumber,
          caste: enquiryToUpdate.studentDetails.basicDetails.caste,
          cicn: enquiryToUpdate.studentDetails.basicDetails
            .casteIncomeCertificateNumber,
          motherTongue:
            enquiryToUpdate.studentDetails.basicDetails.motherTongue,
        };
        let contactDetails = enquiryToUpdate.studentDetails.contactDetails;
        newStudent["contactInfo"] = {
          guardianName: contactDetails.guardianName,
          guardianPhone: contactDetails.guardianContactNumber,
          guardianPhone2: contactDetails.alternateNumber,
          guardianRelation: contactDetails.relationWithGuardian,
          nationId: contactDetails.nationalId,
          presentAddress: contactDetails.presentAddress,
          permanentAddress: contactDetails.permanentAddress,
        };

        let previousSchoolDetails =
          enquiryToUpdate.studentDetails.previousSchoolDetails;
        newStudent["prevSchInfo"] = {
          prevSchool: previousSchoolDetails.schoolName,
          tcNo: previousSchoolDetails.tcNumber,
        };
        let fatherDetails = enquiryToUpdate.studentDetails.fatherDetails;
        newStudent["fatherInfo"] = {
          name: fatherDetails.name,
          contactNumber: fatherDetails.contactNumber,
          profession: fatherDetails.profession,
          designation: fatherDetails.designation,
        };

        let motherDetails = enquiryToUpdate.studentDetails.motherDetails;
        newStudent["motherInfo"] = {
          name: motherDetails.name,
          contactNumber: motherDetails.contactNumber,
          profession: motherDetails.profession,
          designation: motherDetails.designation,
        };
        let academicDetails = enquiryToUpdate.studentDetails.academicDetails;
        let allStudentsInClass = await studentQuery.findAll({
          "academicInfo.class": academicDetails.class,
          school: enquiryToUpdate.school._id,
        });
        let sectionsOfGivenClass = await sectionQuery.findOne({
          class: academicDetails.class,
        });
        if (!sectionsOfGivenClass.length) {
          throw new Error(
            "There are no section in the given class you want to admit the student!"
          );
        }
        newStudent["academicInfo"] = {
          class: academicDetails.class,
          section: sectionsOfGivenClass[0]._id,
          admissionNo:
            allStudentsInClass.length +
            1 +
            parseInt(Date.now().toString().substring(0, 4)),
        };

        newStudent["academicYear"] =
          enquiryToUpdate.studentDetails.academicDetails.academicYear;
        newStudent["username"] = `${
          process.env.USERNAME_SUCCESSOR
        }_${randomNumberRange(10000000, 99999999)}`;
        newStudent["password"] =
          enquiryToUpdate.studentDetails.contactDetails.contactNumber;
        newStudent["active"] = true;

        let otherDetails = enquiryToUpdate.studentDetails.otherDetails;
        newStudent["otherInfo"] = {
          email: otherDetails.email,
          healthCondition: otherDetails.healthCondition,
          hostelMember: otherDetails.hostelRequired,
          transportMember: otherDetails.transportRequired,
        };

        let admittedStudent = await new Student(newStudent).save();
        admittedStudentId = admittedStudent._id;
      }

      let updatedEnquiry = await enquiryQuery.updateOne(
        { _id: enquiryId },
        { $set: { status: status, admittedStudentId: admittedStudentId } },
        { new: true }
      );

      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message:
          updatedEnquiry.status === "Admitted"
            ? "Student admitted successfully!"
            : "Enquiry updated successfully!",
        result: updatedEnquiry,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      await enquiryQuery.delete({ _id: id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Enquiry deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async validateEnquiryId(req) {
    try {
      const enquiryId = req.params.id;
      const { examScheduleId } = req.query;
      let docExists = await enquiryQuery.findOne({
        enquiryId,
        examSchedule: examScheduleId,
      });
      if (!docExists)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Please enter a valid admit card id!",
          responseCode: "CLIENT_ERROR",
        });

      if (docExists.examConducted)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message:
            "Sorry, you have already submitted the exam. You cannot access the exam link again.!",
          responseCode: "CLIENT_ERROR",
        });

      return common.successResponse({ statusCode: httpStatusCode.ok });
    } catch (error) {
      throw error;
    }
  }

  static async addExamSchedule(req) {
    try {
      const enquiryId = req.params.id;
      const examScheduleId = req.body.examScheduleId;

      let examScheduleWithTheGivenId = await examScheduleQuery.findOne({
        _id: examScheduleId,
      });
      if (!examScheduleWithTheGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "No exam schedule was found with the given id!",
          responseCode: "CLIENT_ERROR",
        });

      let updatedEnquiry = await enquiryQuery.updateOne(
        { _id: enquiryId },
        {
          $set: {
            examSchedule: examScheduleWithTheGivenId._id,
            examScheduled: true,
          },
        },
        { new: true }
      );

      if (!updatedEnquiry)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "Enquiry with the given id was not found!",
          responseCode: "CLIENT_ERROR",
        });
    } catch (error) {
      throw error;
    }
  }
};
