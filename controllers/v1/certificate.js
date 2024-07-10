const certificateService = require("@services/helper/certificate");

module.exports = class CertificateController {
  async getStudyCertificate(req) {
    try {
      const result = await certificateService.getStudyCertificate(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getBulkStudyCertificate(req) {
    try {
      const result = await certificateService.getBulkStudyCertificate(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getTransferCertificate(req) {
    try {
      const result = await certificateService.getTransferCertificate(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getBulkTransferCertificate(req) {
    try {
      const result = await certificateService.getBulkTransferCertificate(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
