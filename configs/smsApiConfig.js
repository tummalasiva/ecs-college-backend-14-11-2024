const axios = require('axios').default;

const smsInstance = axios.create({
    baseURL:'https://portal.mobtexting.com/api/v2',
    headers:{
        "Authorization":` Bearer 8d878d0e819408034ad20f4c6cbdeff3`
    }
})

module.exports = smsInstance;
