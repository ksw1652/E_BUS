/**
 * Created by airnold on 15. 7. 10..
 */



var send_mail = require('../../utility/mailService.js');
var express = require('express');
var router = express.Router();


router.post('/mailfaq', function(req, res) {

    var getdata = req.body.data;
    var faq_subject = getdata.faq_subject;
    var faq_contents = getdata.faq_contents;

    send_mail.sendFAQEmail(faq_subject, faq_contents);
    res.send('문의메일을 성공적으로 보냈습니다');

});

module.exports = router;