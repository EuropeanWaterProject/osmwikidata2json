var fs = require('fs');
var $ = require('jquery');
var axios_1 = require("axios");
var md5 = require("md5");
// Function based on https://github.com/simon04/wikimedia-commons-file-path/blob/master/index.js because npm import was not working
// based on https://github.com/derhuerst/commons-photo-url/blob/master/index.js
/**
 *
 * @param mediaName Filename, without "File:" or similar
 * @param width Width of returned image thumbnail, optional
 */
function getUrlFromMediaName(mediaName, width) {
    if (mediaName === undefined) {
        return undefined;
    }
    // file = file.replace(/\s+/g, '_');
    var safe = sanitizeFilename(decodeURIComponent(mediaName));
    var base = 'https://upload.wikimedia.org/wikipedia/commons';
    var hash = md5(decodeURIComponent(mediaName).replace(/\s+/g, '_'));
    var ns = hash[0] + "/" + hash[0] + hash[1];
    if (width) {
        // thumbnail
        var suffix = mediaName.match(/tiff?$/i) ? '.jpg' : mediaName.match(/svg$/i) ? '.png' : '';
        return base + "/thumb/" + ns + "/" + safe + "/" + width + "px-" + safe + suffix;
    }
    else {
        // original
        return base + "/" + ns + "/" + safe;
    }
}
exports.getUrlFromMediaName = getUrlFromMediaName;
/**
 * Function to obtain Wikimedia Commons media file name from URL
 * @param url URL of media file
 */
function getMediaNameFromUrl(url) {
    if (url === undefined) {
        return undefined;
    }
    var safe = url.split('/').pop();
   // var mediaName = 'File:' + encodeURIComponent(unsanitizeFilename(safe));    old line
  //  var mediaName =  encodeURIComponent(unsanitizeFilename(safe));
  var mediaName =  unsanitizeFilename(safe);
    return mediaName;
}
exports.getMediaNameFromUrl = getMediaNameFromUrl;
// from https://github.com/water-fountains/datablue/blob/develop/server/api/services/wikimedia.service.js
function sanitizeFilename(filename) {
    // this doesn't cover all situations, but the following doesn't work either
    // return encodeURI(title.replace(/ /g, '_'));
    return (filename
        .replace(/\s+/g, '_')
        .replace(/,/g, '%2C')
        // .replace(/ü/g, '%C3%BC')
        .replace(/&/g, '%26'));
}
function unsanitizeFilename(mediaName) {
    return mediaName
        .replace(/_/g, ' ')
        .replace(/%2C/g, ',')
        .replace(/%26/g, '&');
}

function getUrlJson(url) {
 //  console.log(url); //for debugging
    return new Promise(function (resolve, reject) {
        // run api query
        axios_1.default.get(url)
            .then(function (res) {
            if (res.status !== 200) {
                var error = new Error("Request to flickr Failed. Status Code: " + res.status + ". Data: " + res + ". Url: " + url);
                return reject(error);
            }
            else {
                resolve(res.data);
            }
        }).catch(function (error) {console.log(error);});
    });
}

//get flickr small url from different url tags. Put blanks in flickrUrl3
flickrUrl1 = "https://farm9.staticflickr.com/8059/8176155093_830e0e02eb_m.jpg";
flickrUrl2 = "https://www.flickr.com/photos/151135260@N07/36780940861";
flickrUrl3 = "https://www.flickr.com/photos/134902422@N04/map?&fLat=41.9559&fLon=19.4337&zl=11&order_by=recent";
flickrUrl4 ="https://www.flickr.com/photos/150827403@N06/albums/72157683048121684",

apikey = "73f8b623552b8e3f548a6fcc1c25763c";
function getFlickrJson (flickr)
{
    newFlickrJson =
    {
        "author" : "",
        "url" : ""
    }
    //case 1 album
    if (flickr.search('albums') != -1)
        {   flickrArray = flickr.split('/');
            var userId = flickrArray[4];
            var albumId = flickrArray[6];
            flickrGetAlbumUrl =  "https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=" + apikey + "&photoset_id="+ albumId + "&user_id="+ userId  + "&format=json&nojsoncallback=1";
            return new Promise(function (resolve, reject) {
            getUrlJson(flickrGetAlbumUrl).then(data =>{
                //console.log(data.photoset.owner);
                newFlickrJson.url = "https://farm"+data.photoset.photo[0].farm+".staticflickr.com/"+data.photoset.photo[0].server+"/"+data.photoset.photo[0].id+"_"+data.photoset.photo[0].secret+"_m.jpg";
                newFlickrJson.author = data.photoset.owner;
                resolve (newFlickrJson);
            }).catch(function (error) {console.log(error);})
            }  
        )} else
        if (flickr.search('farm') != -1)
        {      
            flickrArray = flickr.split('_')[0].split('/');
            var userId = flickrArray[4];
            var photoId = flickrArray[4];
            flickrPhotoInfoUrl =  "https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + apikey + "&photo_id=" + photoId + "&format=json&nojsoncallback=1";
       //     console.log("b flickrArray" + flickrArray);
            return new Promise(function (resolve, reject) {
                getUrlJson(flickrPhotoInfoUrl).then(data =>{
                  //  console.log(data);
                 newFlickrJson.url =  "https://farm"+data.photo.farm+".staticflickr.com/"+data.photo.server+"/"+data.photo.id+"_"+data.photo.secret+"_m.jpg";
                 newFlickrJson.author = data.photo.owner.nsid;
                    resolve (newFlickrJson);
                }).catch(function (error) {console.log(error);})  
        } )}
        
        else if (flickr.search('photos') != -1)
        {      
            flickrArray = flickr.split('/');
            var userId = flickrArray[4];
            var photoId = flickrArray[5];
            if (isNaN(photoId))
            {
                return new Promise(function (resolve, reject) {
                    {
                        //console.log(data.photoset.photo[0]);
                        resolve (newFlickrJson);
                    }
                        })
            }
           flickrPhotoInfoUrl =  "https://www.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=" + apikey + "&photo_id=" + photoId + "&format=json&nojsoncallback=1";
           return new Promise(function (resolve, reject) {
            getUrlJson(flickrPhotoInfoUrl).then(data =>{
             newFlickrJson.url =  "https://farm"+data.photo.farm+".staticflickr.com/"+data.photo.server+"/"+data.photo.id+"_"+data.photo.secret+"_m.jpg";    
             newFlickrJson.author = data.photo.owner.nsid;
             resolve (newFlickrJson);
            }).catch(function (error) {console.log(error);})
            }  
        )}
}
/*getFlickrJson(flickrUrl2).then(data =>{
    console.log(data);
})*/
module.exports.getFlickrJson  = getFlickrJson ;

/* Gets Mapillary string from these formats
var mapillary = '?lat=45.47931166206554&lng=9.196614140516385&z=17&mapStyle=osm&pKey=0PCxcYxzimQDiJDiGoLz-w&focus=photo&x=0.37126199327376985&y=0.4141072702405599&zoom=0.5563798219584567'
var mapillary2 = '5tQSin5Ijh6nJalUAsn O1A';
var mapillary3 = 'https://images.mapillary.com/UQHnaNmdkswZsG2C5F7wxQ/thumb-320.jpg';
var mapillary4 = ' https://www.mapillary.com/map/im/itEg_5CX0e7TCKTdgULiwQ';
var mapillary5 = 'https://www.mapillary.com/app/?lat=51.18659468414749&lng=5.119220598975837&z=17&mapStyle=mapbox_streets&pKey=oB1964s1pZd-hAsk0jTACA&focus=photo';

var mapillary6 = 'https://www.mapillary.com/map/im/4JyenxNKyXpEx6jkorXBxQ/photo';*/
var mapillary7 = 'https://www.mapillary.com/map/im/2k2c8c5-w-nEBsjZdJuJ7w/photo';




function getMapillaryId (mapillary){
    newMapillary = mapillary.replace(" ","_");
    //case 1 & 5 -- get pkey
    if (newMapillary.search('&') != -1)
    {       mapillaryArray = newMapillary.split('&');
            var searchTerm = 'pKey=';
            mapillaryArray.forEach(function(str, idx) {
            if (str.indexOf(searchTerm) !== -1 ){
            newMapillary = mapillaryArray[idx].split('pKey=').pop()
            }
            });    
    } else   // case 4 &6
    if (newMapillary.search('im\/') != -1)
        {
            console.log ("im within Mapillary")
            newMapillary = newMapillary.split('im\/').pop();
            if (newMapillary.search('\/') != -1)
                {
                newMapillary = newMapillary.split('\/')[0];
                }
    } else  if (newMapillary.search('\/') != -1)
    {
        console.log ("slash within Mapillary")
        mapillaryArray = newMapillary.split('\/');
        newMapillary = mapillaryArray[3];
    } 
    return newMapillary;
    }
 /*
    M = getMapillaryId (mapillary7);
    console.log ("Mapillary " + M);*/
   module.exports.getMapillaryId  = getMapillaryId ;
