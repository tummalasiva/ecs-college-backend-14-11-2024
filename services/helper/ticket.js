const httpStatusCode = require("@generics/http-status");
const common = require("../../constants/common");
const ticketQuery = require("@db/ticket/queries");
const schoolQuery = require("@db/school/queries");
const { uploadFileToS3 } = require("../../helper/helpers");
const { default: axios } = require("axios");

module.exports = class TicketService {
  static async create(req) {
    try {
      const { subject, problem } = req.body;
      const schoolId = req.schoolId;

      let schoolWithGivenId = await schoolQuery.findOne({
        _id: schoolId,
      });
      if (!schoolWithGivenId)
        return common.failureResponse({
          statusCode: httpStatusCode.not_found,
          message: "School not found!",
          responseCode: "CLIENT_ERROR",
        });

      // =======here upload those files to aws an get the file links======== //
      let links = [];
      if (req.files && req.files.file) {
        if (Array.isArray(req.files.file)) {
          for (let file of req.files.file) {
            let link = await uploadFileToS3(file);
            if (link) {
              links.push(link);
            }
          }
        } else {
          let link = await uploadFileToS3(req.files.file);
          if (link) {
            links.push(link);
          }
        }
      }

      const ticketFiles = links;

      if (!schoolId || !subject || !problem) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          responseCode: "CLIENT_ERROR",
          message:
            "School ID, Subject, and Problem are mandatory to raise a ticket",
        });
      }

      let payload = {
        schoolId,
        school: schoolWithGivenId,
        files: ticketFiles,
        description: problem,
        subject,
      };

      let { data } = await axios.post(
        `${process.env.BASE_URL}/tickets/create`,
        payload,
        { headers: { Authorization: "" } }
      );

      return common.successResponse({
        result: data.result,
        statusCode: httpStatusCode.ok,
        message: "Ticket created successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      let schoolId = req.schoolId;
      const { data } = await axios.get(
        `${process.env.BASE_URL}/tickets/list/${schoolId}`,
        {
          headers: { Authorization: "" },
        }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Tickets fetched successfully!",
        result: data.result,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {}
};
