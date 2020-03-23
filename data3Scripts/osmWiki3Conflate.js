"use strict";

var haversine = require("haversine");
var fs = require('fs');

var conflateRadius = 20;

/**
 * Conflate two GeoJson objects, copying Wikidata information into matching OpenStreetMap objects.
 * Unmatched Wikidata objects are left out because the default wikidata query is broader than just drinking water fountains.
 * @param osmGeoJson GeoJson from OpenStreetMap, standardized.
 * @param wikidataGeoJson GeoJson from Wikidata, standardized.
 * @param options Provider Options (only the `conflateRadius` option is used)
 */
function conflate(osmGeoJson, wikidataGeoJson, options) {
    if (options === void 0) { options = defaults_1.defaultOptions; }
    // matching and property merging
    matchByQID(wikidataGeoJson, osmGeoJson);
    matchByLocation(wikidataGeoJson, osmGeoJson, options.conflateRadius);
    return osmGeoJson;
}
exports.conflate = conflate;
function matchByQID(wikidataGeoJson, osmGeoJson) {
    // loop through wikidata and find matches for each
    wikidataGeoJson.features.forEach(function (fwiki) {
        osmGeoJson.features.forEach(function (fOsm, i) {
            if (fOsm.properties && fwiki.properties && fOsm.properties.id_wikidata === fwiki.properties.id_wikidata) {
                // copy data over, only if not undefined
                fOsm.properties.image = fwiki.properties.image || fOsm.properties.image;
                fOsm.properties.name =  fOsm.properties.name || fwiki.properties.name ;
                fOsm.properties.refill= fOsm.properties.refill;
                // document merging
                fOsm.properties.mergedOn = 'id_wikidata';
                fwiki.properties.mergedOn = 'id_wikidata';
                // if OSM lists the fountain as drinking water but not wikidata, make a comment
                if (fwiki.properties.ispotable === 'false') {
                    fOsm.properties.comments = " Add instance of 'drinking fountain' to wikidata item " + fOsm.properties.id_wikidata + " .";
                }
            }
        });
    });
}
function matchByLocation(wikidataGeoJson, osmGeoJson, conflateRadius) {
    if (conflateRadius === void 0) { conflateRadius = 20; }
    // loop through wikidata and find matches for each
    wikidataGeoJson.features.forEach(function (fwiki) {
        // only consider wikidata fountains that have not been matched
        if (fwiki.properties && fwiki.properties.mergedOn !== 'id_wikidata') {
            var distances = osmGeoJson.features.map(function (fosm) {
                // don't consider osm fountain if already matched
                if (!fosm.properties || (fosm.properties && fosm.properties.mergedOn)) {
                    return 100;
                    // otherwise compute distance
                }
                else {
                    return haversine(fosm.geometry.coordinates, fwiki.geometry.coordinates, {
                        unit: 'meter',
                        format: '[lon,lat]',
                    });
                }
            });
            // copy over data from nearest if nearer than set distance
            var index = indexOfSmallest(distances);
            if (index >= 0) {
                var distance = distances[index];
                var fOsm = osmGeoJson.features[index];
                // copy data over, only if not null and if distance lower than set value
                if (fOsm.properties && fwiki.properties && distance <= conflateRadius) {
                    fOsm.properties.image = fwiki.properties.image || fOsm.properties.image;
                    fOsm.properties.name = fOsm.properties.name || fwiki.properties.name ;
                    fOsm.properties.id_wikidata = fwiki.properties.id_wikidata;
                    fOsm.properties.refill= fOsm.properties.refill;
                    // document merging
                    fOsm.properties.mergedOn = "coordinates: " + distance.toFixed(2) + " m";
                    fwiki.properties.mergedOn = "coordinates: " + distance.toFixed(2) + " m";
                    // if OSM lists the fountain as drinking water but not wikidata, make a comment
                    if (fwiki.properties.ispotable === 'false') {
                        fOsm.properties.comments = " Add instance of \"drinking fountain\" to wikidata item " + fOsm.properties.id_wikidata + " .";
                    }
                    // if no match is found
                }
                else if (distance > conflateRadius && fwiki.properties && fwiki.properties.ispotable === 'true') {
                    // delete unused properties
                    delete fwiki.properties.ispotable;
                    fwiki.properties.mergedOn = 'none';
                    // copy whole fountain over
                    osmGeoJson.features.push(JSON.parse(JSON.stringify(fwiki)));
                }
            }
            else if (fwiki.properties && fwiki.properties.ispotable === 'true') {
                // if no osm fountains exist
                // delete unused properties
                delete fwiki.properties.ispotable;
                fwiki.properties.mergedOn = 'none';
                // copy whole fountain over
                osmGeoJson.features.push(JSON.parse(JSON.stringify(fwiki)));
            }
        }
    });
}
function indexOfSmallest(a) {
    if (a.length === 0) {
        return -1;
    }
    var lowest = 0;
    for (var i = 1; i < a.length; i++) {
        if (a[i] < a[lowest]) {
            lowest = i;
        }
    }
    return lowest;
}

