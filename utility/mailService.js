/**
 * Created by airnold on 15. 1. 14..
 */

var nodemailer = require('nodemailer');
var jasung = require('../personal.js');





var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: jasung.gmail.id,
        pass: jasung.gmail.password
    }
});

exports.sendEmail = function(data){
    var mailOptions = {
        from: jasung.gmail.id ,
        to: jasung.gmail.id ,
        subject: 'BUS server error  ✔',
        text: data
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
};

exports.sendFAQEmail = function(subject, contents){
    var mailOptions = {
        from: jasung.gmail.id,
        to: jasung.gmail.swid,
        subject: subject,
        text: contents
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
};
