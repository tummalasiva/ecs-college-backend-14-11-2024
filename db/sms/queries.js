const smsModel = require('./model');

module.exports = class SchoolSms {
    static async findOne(filter, projection = {}) {
		try {
			const smsData = await smsModel.findOne(filter, projection).lean({
				getters: true,
			})
			return smsData
		} catch (error) {
			return error
		}
	}

    static async findByIdSms(filter, projection = {}) {
        try {
          const smsData = await smsModel.findById(filter, projection).lean({
            getters: true,
          });
          return smsData;
        } catch (error) {
          return error;
        }
      }

    static async findAllSms(filter, projection = {}) {
		try {
			const smsData = await smsModel.find(filter, projection).lean({
				getters: true,
			})
			return smsData
		} catch (error) {
			return error
		}
	}

    static async findByIdAndDeleteSms(filter, projection = {}) {
		try {
			const sms = await smsModel.findByIdAndDelete(filter, projection).lean({
				getters: true,
			})
			return sms
		} catch (error) {
			return error
		}
	}

    static async findByIdAndUpdateSms(filter, update={} , options = {}) {
		try {
			const sms = await smsModel.findByIdAndUpdate(filter, update, options).lean({
				getters: true,
			})
			return sms
		} catch (error) {
			return error
		}
	}

    static async create(data){
        try{
            const newsms = await smsModel(data).save();
            return newsms
        }catch(error){
            return error
        }
    }

    static async updateOneSms(filter, update, options = {}) {
		try {
			const res = await smsModel.updateOne(filter, update, options)
			if ((res.n === 1 && res.nModified === 1) || (res.matchedCount === 1 && res.modifiedCount === 1)) {
				return true
			} else {
				return false
			}
		} catch (error) {
			return error
		}
	}

	
	static async listSms(page, limit, search) {
		try {
			
			let data = await smsModel.aggregate([
				{
					$match: {
            
						$or: [{ smsType: new RegExp(search, 'i') },
                            {smsSubject: new RegExp(search, 'i') },
                            {message: new RegExp(search, 'i') },

                        ],
					},
				},
                
				{
					$project: {
						smsType: 1,
						smsSubject:1,
                        message:1,
                        sentTime:1,
                        messageStatus:1
                        
					},
				},
                
				{
					$sort: {smsType:1 },
				},
				{
					$facet: {
						totalCount: [{ $count: 'count' }],
						data: [{ $skip: limit * (page - 1) }, { $limit: limit }],
					},
				},
				{
					$project: {
						data: 1,
						count: {
							$arrayElemAt: ['$totalCount.count', 0],
						},
					},
				},
			]).collation({ locale: 'en', caseLevel: false })

			return data;
		} catch (error) {
			return error
		}
	}

}

