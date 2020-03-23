let osmqueryFile = require('./osmFountainQuery.js');
let osmquery = osmqueryFile.osmquery;

let osmImport = require('./osmFountainStandardize.js')
let standardizeOsm = osmImport.standardizeOsm;

var $ = require('jquery');
var axios_1 = require("axios");

let wikiFountainQuery = require('./wikiFountainQuery.js')
let queryWikidata = wikiFountainQuery.queryWikidata;
    
let wikiFountainStandardize = require('./wikiFountainStandardize.js')
let standardizeWikidata = wikiFountainStandardize.standardizeWikidata;


let osmWiki3Conflate = require('./osmWiki3Conflate.js')
conflate = osmWiki3Conflate.conflate;  

conflateRadius =20;

var fs = require('fs');

// function to pause execution after promise error on data fetching from OSM or Wikidata. Probably 429 or 505 
function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
      now = Date.now();
    }
}

//function to pad codes 4 digits to allow -180 to +180
Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
  }

function osmQuery(bbox) {
    boxString = bbox.latMin+','+bbox.lonMin+','+bbox.latMax+','+bbox.lonMax;
    return new Promise(function(resolve, reject) {
 
        osmquery(bbox).then(data => {
            
                 standardizeOsm(data).then(standardizedOsmData =>{  
                   
                    resolve(standardizedOsmData);
                 })
                }).catch(e=>                  
                {
                        reject(" error" + e);
                    })
            })                       
    }

 function wikiQuery(bbox) {
        boxString = bbox.latMin+','+bbox.lonMin+','+bbox.latMax+','+bbox.lonMax;
    return new Promise(function(resolve, reject) {
     
     
     queryWikidata(bbox).then(WikidataJson => {

             standardizedWikiData = standardizeWikidata(WikidataJson);  
             
                        resolve(standardizedWikiData);
                     })
                    }).catch(e=>                  
    {               console.log("within error")
                            console.log(e);
                        })
                       
        }

    var test_box = {
        lonMin: 0,
        latMin: 45,
        lonMax: 5,
        latMax: 50
    };

function osmWikiQuery(bbox) {

boxString = bbox.latMin+','+bbox.lonMin+','+bbox.latMax+','+bbox.lonMax;
filename = '../data/fountainGridTest/fullgrid2_'+bbox.lonMin.pad(4)+'_'+bbox.latMin.pad(4)+'_'+bbox.lonMax.pad(4)+'_'+bbox.latMax.pad(4)+'.json';

return new Promise(function(resolve, reject) {

osmQuery(bbox).then(osmdata => {
    wikiQuery(bbox).then(wikidata => {
       var conflated = conflate(osmdata, wikidata,conflateRadius);
    
        var documents = conflated;
         fs.writeFile(filename, JSON.stringify(documents, null, 2), 'utf8', ()=>{console.log('written')
         resolve(documents)
        });
        }).catch(e=>
            {
                reject(e)
            })
        }).catch(e=>
            {
                reject(e)
            })

        
    })
}

   // osmWikiQuery(test_box)

    module.exports.osmWikiQuery = osmWikiQuery;

