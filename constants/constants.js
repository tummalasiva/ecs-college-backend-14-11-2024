const moment = require('moment')

module.exports = {
    encryptionAlgorithm:'aes-192-cbc',
    secretKey:'webspruce',
    smsService:{
        templates:{
            generalTempId:'1107161513392082541',
        },
        automaticSms:{
            empLoginCred:{
                type:'Automatic',
                subject:'LOGIN_CREDENTIAL',
                message:(empName,empUserName,empPassword) => `Dear ${empName},\nWe would like to inform you your Login Credential for School Academic Managment System Username: ${empUserName} Password: ${empPassword} Link: https://ecampusstreet.com/es_jan_23.apk \nRegards EXCELLENT SCHOOL VIJAYAPURA`,
                template:'Dear [user],\nWe would like to inform you your Login Credential for School Academic Managment System Username: [user_name] Password: [password]\nRegards\nExcellent School Vijaypur'
            },
            studAttendanceAlert:{
                type:'Automatic',
                subject:'Attendance alert',
                message:(studentName) => `Dear Parents,\nWe would like to inform you that your ward ${studentName} was absent on Date:${moment(Date.now()).format("YYYY-MM-DD")}\nRegards\nExcellent School Vijaypur`,
                template:`Dear Parents,\nWe would like to inform you that your ward [student name] was absent on Date:$[Date]\nRegards\nExcellent School Vijaypur`
            }
        }
    },
    roleInit:{
        "employee": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "class": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "academicYear": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "department": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "designation": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "event": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "gallery": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "periodRoutine": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "preAdmission": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "role": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "student": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "holiday": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "news": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "notice": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "splashNews": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "employeeAttendanceTest": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "studentAttendance": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "sms": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "smsTemplate": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "examGrade": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "examSchedule": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "examTerm": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "examAttendance": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "examResult": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "studentMark": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "letterPdf": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "section": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "setting": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "subject": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "certificate": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "dashboard": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "assignment": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "auth": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "fileUpload": {
            "accessible": true,
            "view": true,
            "add": true,
            "update": true,
            "delete": true
        },
        "roleName": "init",
    }
}