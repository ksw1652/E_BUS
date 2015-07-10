/**
 * Created by airnold on 15. 4. 24..
 */



var request = require('request');
var iconv = require('iconv');
var cheerio = require('cheerio');

var commonBiz = require('../korea_common/common_biz.js');

var daeguObject = {};

var routeurl = "http://m.businfo.go.kr/bp/m/realTime.do";

var stationurl = "http://m.businfo.go.kr/bp/m/realTime.do";

/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};
requestData.route.act = "posInfo";
requestData.route.roId = "";
requestData.route.roNo = "";
requestData.route.moveDir = "1";


requestData.station = {};
requestData.station.act = "arrInfo";
requestData.station.bsId = "";
//bsNm 인코딩 필요함
requestData.station.bsNm = "";


daeguObject.urlRouteRequest = function (dbObject, callback) {

    /**
     * 1. routeUrl 포멧을 db에서 선택한 데이터를 가지고 맞춰준다
     * 2. post or get 방식에 따라 request 까지 해준다.
     */

    requestData.route.act = "posInfo";
    requestData.route.roId = dbObject[0].routeid;
    requestData.route.roNo = dbObject[0].routenm;
    requestData.route.moveDir = "1";

    var url = routeurl + "?act=" + requestData.route.act +
        "&roId=" + requestData.route.roId +
        "&roNo=" + requestData.route.roNo +
        "&moveDir=" + requestData.route.moveDir;

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var up_seq = [];
            var down_seq = [];
            var daegu_bus_location_seq = [];
            var $ = cheerio.load(html);

            //정방역방 없는것 -> 바로 검색 무조건 실행
            var $li = $('.bl li');
            if($li.length === 0) {
                //잘못된 버스 검색
                daegu_bus_location_seq.push(up_seq);
                daegu_bus_location_seq.push(down_seq);
                callback(daegu_bus_location_seq);
            }else{
                console.log($li.length);
                $li.each(function (i) {
                    var seq = undefined;
                    if ($(this).attr('class') === 'bloc_b nsbus' || $(this).attr('class') === 'bloc_b') {
                        var temp = $(this).prev().find('span').text();
                        seq = temp.split('.');
                        /**
                         * .이전걸 짤라서 담기
                         */

                        up_seq.push(seq[0]*1);

                    }
                });
                daegu_bus_location_seq.push(up_seq);

                var flfind = $('.r');

                if (flfind.length !== 0) {

                    requestData.route.moveDir = "0";

                    url = routeurl + "?act=" + requestData.route.act +
                    "&roId=" + requestData.route.roId +
                    "&roNo=" + requestData.route.roNo +
                    "&moveDir=" + requestData.route.moveDir;

                    //정방역방 있는것 -> http://m.businfo.go.kr/bp/m/realTime.do?act=posInfo&roId=3000726000&roNo=726&moveDir=0 로 다시 요청
                    request(url, function (error, response, html) {
                        if (!error && response.statusCode == 200) {
                            var $ = cheerio.load(html);
                            var $li = $('.bl li');
                            if($li.length === 0){

                            }else{
                                $li.each(function (i) {
                                    if ($(this).attr('class') === 'bloc_b nsbus' || $(this).attr('class') === 'bloc_b') {
                                        var temp = $(this).prev().find('span').text();
                                        var seq = temp.split('.');
                                        /**
                                         * .이전걸 짤라서 담기
                                         */
                                        down_seq.push(seq);
                                    }
                                });
                                daegu_bus_location_seq.push(down_seq);
                                callback(daegu_bus_location_seq);
                            }
                        }
                    })

                }else{
                    callback(daegu_bus_location_seq);
                }
            }

        }else{
            throw error;
        }
    });
};
daeguObject.urlStationRequest = function (dbObject, callback) {


    requestData.station.act = "arrInfo";
    requestData.station.bsId = dbObject[0].stopid;
    requestData.station.bsNm = dbObject[0].stopnm;

    var url = stationurl + "?act=" + requestData.station.act +
            "&bsId=" + requestData.station.bsId +
            "&bsNm=";

    console.log(url);

    request.get({
            uri: url,
            encoding: null
        },
        function (error, response, html) {
            if (!error && response.statusCode == 200) {

                var ic = new iconv.Iconv('euc-kr', 'utf-8');
                var buf = ic.convert(html);
                var utf8String = buf.toString('utf-8');

                var $ = cheerio.load(utf8String);

                var $bl = $('.bl');
                var $st = $bl.find('li[class=st]');
                var $nm = $bl.find('li[class=nm]');
                var $gd = $bl.find('li[class=gd]');

                var daegu_arrive_list = [];

                if($gd.length === 1){

                    var temp = {};
                    temp.arrive_time = "도착예정 버스가 없습니다";
                    temp.routenm = "";
                    temp.cur_pos = "";
                    temp.routeid = "";
                    daegu_arrive_list.push(temp);

                    callback(daegu_arrive_list);

                }else{
                    //대구 버스정보 시스템은 '전', '전전' 으로 예상도착시간을 표시함.
                    $st.each(function () {
                        var temp = {};
                        temp.routenm = $(this).find('span[class=marquee]').first().text();
                        temp.arrive_time = $(this).find('span[class=arr_state]').text();
                        temp.cur_pos = $(this).find('span[class=marquee]').last().text();
                        temp.routeid = commonBiz.findRouteid(dbObject, temp.routenm);

                        daegu_arrive_list.push(temp);
                    });

                    $nm.each(function () {
                        var temp = {};
                        temp.routenm = $(this).find('span[class=marquee]').first().text();
                        temp.arrive_time = "약 " + $(this).find('span[class=arr_state]').text() + " 후 도착";
                        temp.cur_pos = $(this).find('span[class=marquee]').last().text();
                        temp.routeid = commonBiz.findRouteid(dbObject, temp.routenm);

                        daegu_arrive_list.push(temp);

                    });

                    callback(daegu_arrive_list);
                }

            }else{
                throw error;
            }
        }
    );

};

module.exports = daeguObject;


