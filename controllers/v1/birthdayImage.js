const birthdayImageService = require('@services/helper/birthdayImage');

module.exports = class BirthdayImageController {
    async create(req) {
        const params = req.body;
        try {
            const result = await birthdayImageService.create(params)
            return result
        } catch (error) {
            return error
        }
    }

    async list(req) {
        try {
            const result = await birthdayImageService.list(req);
            return result;
        } catch (error) {
            return error;
        }
    }

    async delete(req){
        const _id = req.params.id
        try {
            const result = await birthdayImageService.delete(_id);
            return result;

        } catch (error) {
            return error;
        }
    }

}
