/**
 * Created by airnold on 15. 5. 28..
 */

var koreaCommonBiz = {};

koreaCommonBiz.findRouteid = function(dbObject, routenm){
    var temprouteid = "";
    for(var i in dbObject){
        if(dbObject[i].routenm === routenm){
            temprouteid = dbObject[i].routeid;
            break;
        }
    }

    return temprouteid;

};

koreaCommonBiz.splitSomething = function(beforeStr, division){
    var afterString = beforeStr.split(division);

    var finalString = removeSpace(afterString[0]);

    return finalString;
};

function removeSpace(str){

    return str.replace(/(^\s*)|(\s*$)/, '');

}

koreaCommonBiz.changeTomin = function(time){

    var min = parseInt( (time % 3600) / 60 );
    var sec = time % 60;
    var mintime = min+"분" + sec+ "초";
    return mintime;
};

koreaCommonBiz.removeChar = function(beforeStr){

    var afterString = beforeStr.replace(/[^0-9]/gi, "");

    var finalString = removeSpace(afterString);

    return finalString;
};

koreaCommonBiz.makeCacheName = function(cityCodeObj, id){
    var tempCacheName = "";

    for(var i in cityCodeObj){
        tempCacheName += cityCodeObj[i].cityCode;
    }
    tempCacheName += id;

    return tempCacheName;
};

module.exports = koreaCommonBiz;