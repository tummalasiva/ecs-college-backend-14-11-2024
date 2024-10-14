const resourceRequest = require("@services/helper/resourceRequest");

module.exports = class ResourceRequestController {
  async create(req) {
    try {
      const createdResourceRequest = await resourceRequest.create(req);
      return createdResourceRequest;
    } catch (error) {
      return error;
    }
  }

  async list(req) {
    try {
      const allResourceRequests = await resourceRequest.list(req);
      return allResourceRequests;
    } catch (error) {
      return error;
    }
  }

  async update(req) {
    try {
      const updatedResourceRequest = await resourceRequest.update(req);
      return updatedResourceRequest;
    } catch (error) {
      return error;
    }
  }

  async delete(req) {
    try {
      const deletedResourceRequest = await resourceRequest.delete(req);
      return deletedResourceRequest;
    } catch (error) {
      return error;
    }
  }
};
