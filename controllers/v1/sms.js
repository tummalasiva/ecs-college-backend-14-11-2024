const smsService = require('@services/helper/sms');

module.exports = class SmsController {
    async create(req) {
        const params = req.body;
        try {
            const result = await smsService.create(params)
            return result
        } catch (error) {
            return error
        }
    }

    async list(req) {
        try {
            const result = await smsService.list(req);
            return result;
        } catch (error) {
            return error;
        }
    }

    async update(req) {
        const params = req.body
         const _id = req.params.id
        try {
         
            const result = await smsService.update(_id,params);
            return result;

        } catch (error) {
            return error;
        }
    }

    async delete(req){
        const _id = req.params.id
        try {
            const result = await smsService.delete(_id);
            return result;

        } catch (error) {
            return error;
        }
    }

    async details(req) {
        const _id = req.params.id
        try {
          const result = await smsService.details(_id);
          return result;
        } catch (error) {
          return error;
        }
      }

      async smsReport(req) {
        const _id = req.params.id
        try {
          const result = await smsService.smsReport(_id);
          return result;
        } catch (error) {
          return error;
        }
      }
}
