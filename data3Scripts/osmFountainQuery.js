#!/usr/bin/node

let mediaUrlManip = require('./mediaUrlManip.js');
let getMediaNameFromUrl =mediaUrlManip.getMediaNameFromUrl;
let getUrlFromMediaName =mediaUrlManip.getUrlFromMediaName;
// use query-overpass npm package to access OSM data via overpass API
// choosing best overpass server is very important 
var query_overpass = require('query-overpass'),
    fs = require('fs');

//query in a bbox with querystring = to full request. Inject bbox into query in queryString definition. 
//special notes json output, timeout can be varied
function osmquery(bbox) {
   
boxString = bbox.latMin+','+bbox.lonMin+','+bbox.latMax+','+bbox.lonMax;

//test with 128MB
queryString =`
[out:json][timeout:200][maxsize:134217728];  
(
    // query part for: “amenity=prison”
    node["drinking_water"="yes"]  (` +  boxString +`);
    node["amenity"="drinking_water"] (` +  boxString  +`);
    node["drinking_water:refill"="yes"]  (` +  boxString +`);
    way["drinking_water:refill"="yes"] (` +  boxString  +`);
  );
  // print results
  out body;
  >;
  out skel qt;`
  
  queryString_node =`
  [out:json][timeout:1400];
  (
      // query part for: “amenity=prison”
      way["drinking_water"="yes"]  (` +  boxString +`);
      way["amenity"="drinking_water"] (` +  boxString  +`);
    );
    // print results
    out body;
    >;
    out skel qt;`  
 //console.log(queryString);
  
    return new Promise(function (resolve, reject) {

      temp = 
       
       'https://lz4.overpass-api.de/api/interpreter';
   
      //    ' https://overpass-api.de/api/interpreter';
      // 'https://overpass.kumi.systems/api/interpreter';
     //  'http://overpass.openstreetmap.fr/api/interpreter';
      //  'https://z.overpass-api.de/api/interpreter';
      // 'https://overpass.nchc.org.tw';


       query_overpass(queryString, function (error, data) {
        if (error) {
            reject(error);
            console.log("query overpass error" + error);
        }
        else {
  
            resolve(data);
        }
    }, {
        overpassUrl: temp,
    });



    });
}

exports.osmquery = osmquery;


