const contactQuery = require("@db/contact/queries");
const httpStatusCode = require("@generics/http-status");
const common = require("@constants/common");

module.exports = class ContactService {
  static async create(req) {
    try {
      const { queryType, contactNumbers, contactEmails, contactPerson } =
        req.body;
      if (!Array.isArray(contactNumbers))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Contact numbers should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(contactEmails)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Contact emails should be an array!",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (!contactNumbers.length && !contactEmails.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "At least one contact number or email should be provided!",
          responseCode: "CLIENT_ERROR",
        });

      let newContact = await contactQuery.create(req.body);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Contact created successfully!",
        result: newContact,
      });
    } catch (error) {
      throw error;
    }
  }

  static async list(req) {
    try {
      const { search = {} } = req.query;
      const contacts = await contactQuery.findAll(search);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        result: contacts,
      });
    } catch (error) {
      throw error;
    }
  }

  static async update(req) {
    try {
      const { queryType, contactNumbers, contactEmails, contactPerson } =
        req.body;
      if (!Array.isArray(contactNumbers))
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Contact numbers should be an array!",
          responseCode: "CLIENT_ERROR",
        });

      if (!Array.isArray(contactEmails)) {
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "Contact emails should be an array!",
          responseCode: "CLIENT_ERROR",
        });
      }

      if (!contactNumbers.length && !contactEmails.length)
        return common.failureResponse({
          statusCode: httpStatusCode.bad_request,
          message: "At least one contact number or email should be provided!",
          responseCode: "CLIENT_ERROR",
        });

      let updatedDoc = await contactQuery.updateOne(
        { _id: req.params.id },
        { $set: req.body }
      );
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Contact updated successfully!",
        result: updatedDoc,
      });
    } catch (error) {
      throw error;
    }
  }

  static async delete(req) {
    try {
      await contactQuery.delete({ _id: req.params.id });
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: "Contact deleted successfully!",
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleEnable(req) {
    try {
      const updatedDoc = await contactQuery.updateOne({ _id: req.params.id }, [
        { $set: { $enabled: { $eq: ["$enabled", false] } } },
      ]);
      return common.successResponse({
        statusCode: httpStatusCode.ok,
        message: `Contact ${
          updatedDoc.enabled ? "enabled" : "disabled"
        } successfully!`,
        result: updatedDoc,
      });
    } catch (error) {
      throw error;
    }
  }
};
