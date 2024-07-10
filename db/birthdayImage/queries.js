
const birthdayImageModel = require('./model');

module.exports = class SchoolBirthdayImage {

	static async findByIdAndDeleteBirthdayImage(filter, projection = {}) {
		try {
			const birthdayImage = await birthdayImageModel.findByIdAndDelete(filter, projection).lean({
				getters: true,
			})
			return birthdayImage
		} catch (error) {
			return error
		}
	}

    static async create(data){
        try{
            const birthdayImage = await birthdayImageModel(data).save();
            return birthdayImage
        }catch(error){
            return error
        }
    }

	
	static async listBirthdayImage(page, limit, search) {
		try {
			
			let data = await birthdayImageModel.aggregate([
				{
					$match: {
						$or: [{ title: new RegExp(search, 'i') },
                           ],
					},
				},
                {
					$lookup: {
						from: 'fileuploads',
						localField: 'image',
						foreignField: '_id',
						as: 'imageDetails',
					},
				},
				{
					$project: {
						title: 1,
						image: { $arrayElemAt: ['$imageDetails.link', 0] },
					},
				},
                {
					$unset: 'image.data', 
				},
				{
					$sort: { title: 1 },
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