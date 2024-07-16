const smsService = require("@services/helper/sms");

module.exports = class SmsController {
  async updateSmsbackup(req) {
    try {
      const result = await smsService.updateSmsbackup(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateSmsStatus(req) {
    try {
      const result = await smsService.updateSmsStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async sendStudentCredentials(req) {
    try {
      const result = await smsService.sendStudentCredentials(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getAllSms(req) {
    try {
      const result = await smsService.getAllSms(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async deleteSms(req) {
    try {
      const result = await smsService.deleteSms(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async sendSmsToRole(req) {
    try {
      const result = await smsService.sendSmsToRole(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async sendSmsToSingle(req) {
    try {
      const result = await smsService.sendSmsToSingle(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async sendSmsToStudents(req) {
    try {
      const result = await smsService.sendSmsToStudents(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async sendEmployeesCredentials(req) {
    try {
      const result = await smsService.sendEmployeesCredentials(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async sendBulkSms(req) {
    try {
      const result = await smsService.sendBulkSms(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getSmsSample(req) {
    try {
      const result = await smsService.getSmsSample(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async getBalance(req) {
    try {
      const result = await smsService.getBalance(req);
      return result;
    } catch (error) {
      return error;
    }
  }
  async getDeliveryReport(req) {
    try {
      const result = await smsService.getDeliveryReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async smsReport(req) {
    try {
      const result = await smsService.smsReport(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async reSendFailedSms(req) {
    try {
      const result = await smsService.reSendFailedSms(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async sendOtp(req) {
    try {
      const result = await smsService.sendOtp(req);
      return result;
    } catch (error) {
      return error;
    }
  }

  async updateSeenStatus(req) {
    try {
      const result = await smsService.updateSeenStatus(req);
      return result;
    } catch (error) {
      return error;
    }
  }
};
