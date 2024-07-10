const smsReq = require('../configs/smsApiConfig');

const sendSmsUsingTemplate = (template_id,variables,to) => {
    return new Promise((resolve,reject) => {
        variables.forEach((ele,index) => {
            if(ele.length > 30) reject(`variable indexd at ${index} contains characters more than 30`);
        })
        smsReq.post('/sms/template',{service:'T',template_id,variables,to})
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
}
const checkSmsStatus = (sms_id) => {
    return new Promise((resolve,reject) => {
        smsReq.get('/sms/status?id=' + sms_id)
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
}
const getAllSmsTemplates = () => {
    return new Promise((resolve,reject) => {
        smsReq.get('/sms/templates')
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
}
const sendSmsBatch = (template_id,message,nodes,sender,service,cid,webhook_id) => {
    return new Promise((resolve,reject) => {
        smsReq.post('/sms/send/json',{
            root:{
                "sender":sender,
                "service":service,
                template_id,
                message,
                custom:cid,
                webhook_id
            },
            nodes,
            custom:cid,
            webhook_id
        })  
            .then(res => resolve(res))
            .catch(err => reject(err))
    })
}
const sendSms = (template_id,message,to) => {
    return new Promise((resolve,reject) => {
        smsReq.post('/sms/send',{
            "sender":"EXCLNT",
            "service":"T",
            template_id,
            message,
            to,
        })
        .then(res => resolve(res))
        .catch(err => reject(err))
    })
}

module.exports = {
    sendSmsUsingTemplate,
    checkSmsStatus,
    getAllSmsTemplates,
    sendSmsBatch,
    sendSms
}