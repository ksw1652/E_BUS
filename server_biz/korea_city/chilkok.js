/**
 * Created by airnold on 15. 4. 27..
 */

var request = require('request');

var commonBiz = require('../korea_common/common_biz.js');


var chilkokObject = {};

var routeurl = "";

var stationurl = "";



/**
 *
 * request data format
 */

var requestData = {};
requestData.route = {};



requestData.station = {};


chilkokObject.urlRouteRequest = function (dbObject, callback) {
    var up_seq = [];
    var chilkok_bus_location_seq = [];

    chilkok_bus_location_seq.push(up_seq);

    callback(chilkok_bus_location_seq);




};
chilkokObject.urlStationRequest = function (dbObject, callback) {

    var chilkok_list = [];

    callback(chilkok_list);

};


module.exports = chilkokObject;


