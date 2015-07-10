/**
 * Created by airnold on 15. 4. 27..
 */

// get html
// route -> http://mbus.miryang.go.kr/mobile/busLocation.jsp
// param -> routeId
// station -> http://mbus.miryang.go.kr/mobile/busArrStation.jsp
// param -> stationId

var request = require('request');
var jsdom = require('jsdom');


var commonBiz = require('../korea_common/common_biz.js');


var miryangObject = {};

var routeurl = "";

var stationurl = "";



/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};



requestData.station = {};


miryangObject.urlRouteRequest = function (dbObject, callback) {
    var up_seq = [];
    var miryang_bus_location_seq = [];

    miryang_bus_location_seq.push(up_seq);

    callback(miryang_bus_location_seq);




};
miryangObject.urlStationRequest = function (dbObject, callback) {

    var miryang_list = [];

    callback(miryang_list);

};


module.exports = miryangObject;


