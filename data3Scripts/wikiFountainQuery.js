"use strict";
var fs = require('fs');
var $ = require('jquery');
var axios_1 = require("axios");

let wikiFountainStandardize = require('./wikiFountainStandardize.js')
let standardizeWikidata = wikiFountainStandardize.standardizeWikidata;
let createFeature = wikiFountainStandardize.createFeature;


// Make sure you initialize wbk with a sparqlEndpoint
const wdk = require('wikibase-sdk')({
    instance: 'https://www.wikidata.org',
    sparqlEndpoint: 'https://query.wikidata.org/sparql'
  })


/**
 * Function to query Wikidata with a bounding box and return results as json.
 * Multiple objects are returned if a wikidata has multiple  images or locations. These duplicates can be removed with standardization.
 * @param bbox Bounding box
 * @param options Query options
 */

var baselBoundingBox = {
    latMax: 47.7,
    latMin: 47.5,
    lonMax: 7.7,
    lonMin: 7.5,
};

var tempBox = {
  latMax: -90,
  latMin: -85,
  lonMax:-175,
  lonMin: -180,
};

  function queryWikidata(bbox) {
  console.log("arrived in queryWikidata function ")
  console.log(bbox);

  var sparqlQuery = `
  SELECT DISTINCT ?place ?placeLabel ?image ?location ?ispotable
  WHERE
  {
    {
      ?place wdt:P31/wdt:P279* wd:Q483453.
      MINUS { ?place wdt:P576 [] }
      MINUS { ?place wdt:P582 [] }
    }
    UNION
    {
      ?place wdt:P31/wdt:P279* wd:Q43483.
      MINUS { ?place wdt:P576 [] }
      MINUS { ?place wdt:P582 [] }
    }
    BIND (EXISTS { ?place wdt:P31/wdt:P279* wd:Q1630622 } as ?ispotable) # boolean indicator of potability
    OPTIONAL { ?place wdt:P18 ?image. }
    SERVICE wikibase:box
    {
      ?place wdt:P625 ?location.
      bd:serviceParam wikibase:cornerWest "Point(` + bbox.lonMin + " " + bbox.latMin +`)"^^geo:wktLiteral.
      bd:serviceParam wikibase:cornerEast "Point(` + bbox.lonMax + " " + bbox.latMax +`)"^^geo:wktLiteral.
    } 
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en,de,fr,it,es". }
  }  `
  



    return new Promise(function (resolve, reject) {
        // create query string for overpass

        // create url from query string
        var url = wdk.sparqlQuery(sparqlQuery);
      //  console.log(url);
        // run api query
        axios_1.default.get(url)
            .then(function (res) {
            if (res.status !== 200) {
                var error = new Error("Request to Wikidata Failed. Status Code: " + res.status + ". Data: " + res + ". Url: " + url);
                return reject(error);
            }
            else {
                // If the data was returned from wikidata, then proceed by turning it into a geoJSON
                resolve(res.data);
            }
        })
            .catch(function (error) {
            console.log(error);
        });
    });
}


module.exports.queryWikidata = queryWikidata;

/*
var standardizedWikidata;
queryWikidata(tempBox).then(WikidataJson => {
    standardizedWikidata = standardizeWikidata(WikidataJson);
    console.log(JSON.stringify(standardizedWikidata,null,2));

    // write data to file
    fs.writeFile('../data/wikiFountainData/temp.json', JSON.stringify(standardizedWikidata, null, 2), 'utf8', ()=>{console.log('written')});

    
   }).catch(error => {
       console.log(error);
   });

*/