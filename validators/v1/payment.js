/**
 * name : validators/v1/accounts.js
 * author : Aman Gupta
 * Date : 20-Oct-2021
 * Description : Validations of accounts controller
 */

 module.exports = {
	order: (req) => {
		
        req.checkBody('receipt').trim().notEmpty().withMessage('receipt field is empty')
		req.checkBody('orderId').trim().notEmpty().withMessage('orderId field is empty')
       

		req.checkBody('amount').notEmpty().withMessage('amount is invalid').isNumeric().withMessage('amount is invalid')
	},

}
