/**
 * Created by airnold on 15. 4. 24..
 */

// get method // html
//   http://m.ictr.or.kr/localbus/busRoutePath.do
//   route param -> keyword
//   http://m.ictr.or.kr/localbus/busStopArriveInfo.do
//   station param -> keyword

var request = require('request');
var jsdom = require('jsdom');
var iconv = require('iconv');
var cheerio = require('cheerio');

var commonBiz = require('../korea_common/common_biz.js');

var incheonObject = {};

var routeurl = "http://m.ictr.or.kr/localbus/busRoutePath.do";

var stationurl = "http://m.ictr.or.kr/localbus/busStopArriveInfo.do";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.keyword = "" ;

requestData.station = {};
requestData.station.keyword = "";

incheonObject.urlRouteRequest = function(dbObject, callback){

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.keyword = dbObject[0].routeid;

    var url = routeurl + "?keyword=" + requestData.route.keyword;
    var up_seq = [];
    var down_seq = [];


    request(url , function (error, response, html) {

        if (!error && response.statusCode == 200) {
            var incheon_bus_location_seq = [];
            var $ = cheerio.load(html);
            var $a = $('.subMenu2 > li a');

            if($a.length === 0){
                //잘못된 버스번호로 없는 요청
                callback(incheon_bus_location_seq);
            }else{
                $a.each(function (i) {
                    if ($(this).find('span img').attr('src') === '/images/bus_icon.png') {
                        up_seq.push(i*1+1);
                    }
                });

                incheon_bus_location_seq.push(up_seq);

                callback(incheon_bus_location_seq);
            }

        }else{
            throw error;
        }
    });
};

incheonObject.urlStationRequest = function(dbObject, callback){

    requestData.station.keyword = dbObject[0].stopid;

    var url = stationurl+"?keyword=" + requestData.station.keyword;

    request.get({
        url: url,
        encoding: null
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var ic = new iconv.Iconv('euc-kr', 'utf-8');
            var buf = ic.convert(body);
            var utf8String = buf.toString('utf-8');
            jsdom.env({
                html: utf8String,
                scripts: ['http://code.jquery.com/jquery-1.6.min.js'],
                done: function (err, window) {
                    //Use jQuery just as in a regular HTML page
                    var $ = window.jQuery;
                    var $sub_a = $(".subMenu2 li");

                    var incheon_arrive_list = [];

                    $sub_a.each(function () {
                        var temp = {};
                        var str = $(this).text();
                        var res = str.split(" ");

                        temp.routenm= res[0].replace(/\s/gi, '');
                        temp.arrive_time = "약 " + res[2].replace(/\s/gi, '') + res[3].replace(/\s/gi, '') + "후 도착";
                        temp.cur_pos = res[4].replace(/\s/gi, '') + res[5].replace(/\s/gi, '');
                        temp.routeid = commonBiz.findRouteid(dbObject, temp.routenm);

                        incheon_arrive_list.push(temp);

                    });

                    callback(incheon_arrive_list);
                }
            });
        }else{
            throw error;
        }
    });

};







module.exports = incheonObject;


