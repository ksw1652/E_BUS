/**
 * Created by airnold on 15. 4. 22..
 */

var express = require('express');
var routeRouter = express.Router();
var nimble = require('nimble');
var errorHandling = require('../../utility/errorHandling.js');

var koreaDb = require('../../server_biz/korea_common/korea_db.js');
var koreaCommonBiz = require('../../server_biz/korea_common/common_biz.js');

var nodeCache = require('node-cache');
var myCache = new nodeCache(
    {
        stdTTL : 100,
        checkperiod: 150
    }
);


routeRouter.all('/routeSearch', function (req, res, next) {

    /**
     * 1. database access and get data
     * 2. url format method call param @dataObject
     * 3. url request devide city
     * 4. function( dbDataObject ) -> return url format
     */

     var getdata = req.body.data;
     var routeNm = getdata.routeNm;
     var cityCodeObj = getdata.cityObject;

    var cacheName  = koreaCommonBiz.makeCacheName(cityCodeObj, routeNm);

    myCache.get(cacheName, function(err,value){
       if(!err){
           if(value === undefined){
               koreaDb.routeSearch(cityCodeObj, routeNm, function (routeData) {
                   console.log('Route_Search Response');
                   res.send(routeData);
                   myCache.set(cacheName, routeData, function(err, success){
                       if(!err && success){
                           console.log('cache success ');
                       }else{
                           throw err;
                       }
                   });
               });
           }else{
               res.send(value);
           }
       }else{
           throw err;
       }
    });

});

routeRouter.all('/routeDetail', function (req, res, next) {

    var getdata = req.body.data;
    var cityEnNm = getdata.cityEnNm;
    var rid = getdata.rid;
    var cityCode = getdata.cityCode;

    var cityDir = "../../server_biz/korea_city/" + cityEnNm + ".js";
    var cityObject = require(cityDir);

    var dbObject = undefined;
    var urlRouteObject = undefined;
    var routeObject = {};

    /**
     * nimble 사용하여 series 로 구성 dbObject -> urlrequest method
     */

    nimble.series([
        function(DBCallback){
            koreaDb.dbRouteDetail(cityCode, rid, function (routeDetailData) {
                console.log('Route_Detail DB Nimble');
                dbObject = routeDetailData;
                DBCallback();
            });
        },
        function(urlCallback){
            cityObject.urlRouteRequest(dbObject, function (urlRouteData) {
                console.log('Route_Detail URL Nimble');
                urlRouteObject = urlRouteData;
                urlCallback();
            });
        },
        function(resCallback){

            routeObject.urlRouteObject = urlRouteObject;
            routeObject.dbObject = dbObject;
            console.log('Route_Deatil Response Nimble');
            res.send(routeObject);

            resCallback();
        }
    ]);
});

module.exports = routeRouter;