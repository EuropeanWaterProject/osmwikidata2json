let osmWikiQueryFile = require('./osmWikiQueryPromiseAll.js');
let osmWikiQuery = osmWikiQueryFile.osmWikiQuery;



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

// dimension of one grid rectangle
var bbox_grid_dimension = {
    lonDim : 5,
    latDim : 5
}

// dimension of total grid to be scanned must be a multiple of bbox_grid_dimension
//longitude is EW, latitude is NS
//cell size 5x5, grid 9x8 and left corner -10,35
var total_grid_size = {
    num_grid_lon : 72,
    num_grid_lat : 35
}

//botton corner of total grid
//bottom left -10 35 by 5x5
var bottom_left = {
    lonMin : -180,
    latMin : -90
}
//first grid rectangle - bottom left
var start_bbox = {
    lonMin: bottom_left.lonMin,
    latMin: bottom_left.latMin,
    lonMax: bottom_left.lonMin + bbox_grid_dimension.lonDim,
    latMax: bottom_left.latMin+ bbox_grid_dimension.latDim
};

// define as an object for indexing
var current_bbox = {};

var restricted_slice = {
    minI: 36,
    maxI: 52
};



//define counter variables 
//problem with 4 6
//stopped at 8 4 
var i =39;
var j = 30;


var restricted = 0;

if (restricted)
{
    i = restricted_slice.minI;
}

//define intial box for first pass . Direct assignment caused problems. need to learn new or instance ... 
current_bbox.lonMin = start_bbox.lonMin + (bbox_grid_dimension.lonDim * i);
current_bbox.latMin = start_bbox.latMin + (bbox_grid_dimension.latDim *j) ;
current_bbox.lonMax= start_bbox.lonMax + (bbox_grid_dimension.lonDim * i);
current_bbox.latMax = start_bbox.latMax + (bbox_grid_dimension.latDim *j);


//main loop function call until grid completed
function generateGrid(){
    console.log("i " + i + " j " + j)
    console.log ('arrived in function'); // for debugging


    //// CODE TO CHANGE
    skip=0;
    skipname='../data/fountainGridTest/skipfiles/skipfile_'+current_bbox.lonMin.pad(4)+'_'+current_bbox.latMin.pad(4)+'_'+current_bbox.lonMax.pad(4)+'_'+current_bbox.latMax.pad(4)+'.json';
   //console.log(skipname) ;
    if(fs.existsSync(skipname)) {
    console.log("skip file " + skipname);
    skip = 1;
    }
  
    if (skip == 0)
    {   console.log(current_bbox);
        osmWikiQuery(current_bbox).then(data => {
            console.log("data")
            console.log(data.features[0]);
            if(!data.features[0])
            {
            skipname='../data/fountainGridTest/skipfiles/skipfile_'+current_bbox.lonMin.pad(4)+'_'+current_bbox.latMin.pad(4)+'_'+current_bbox.lonMax.pad(4)+'_'+current_bbox.latMax.pad(4)+'.json';
            fs.writeFile(skipname, '{"skip" : 1}' , 'utf8', ()=>{console.log('skip written ' + data.features )});
            }
                   if (j == total_grid_size.num_grid_lat)
                   {
                       i++;
                       j=0;
           
                   } else
                   {
                       j++;
                   }  
                   if ((i == total_grid_size.num_grid_lon) || ((restricted)&&(i==restricted_slice.maxI)))
                  {
                      return;
                  }
                  current_bbox.lonMin = start_bbox.lonMin + (bbox_grid_dimension.lonDim * i);
                  current_bbox.latMin = start_bbox.latMin + (bbox_grid_dimension.latDim *j) ;
                  current_bbox.lonMax= start_bbox.lonMax + (bbox_grid_dimension.lonDim * i);
                  current_bbox.latMax = start_bbox.latMax + (bbox_grid_dimension.latDim *j);
                    //call function to generate next grid cell
                  wait(2000);
                  generateGrid();
                   }).catch(function(e) 
                {
                    console.log(e);
                    console.error('uh oh error i ' + i +' j ' +j ); // "oh, no!"
                    wait(10000);
                    console.log('sleep over');
                    //after pausing try creating the grid cell again
                    generateGrid();
               });
               

     } else 
     {
         //here we have to recalculate the data
         if (j == total_grid_size.num_grid_lat)
         {
             i++;
             j=0;
 
         } else
         {
             j++;
         }  
         if (i == total_grid_size.num_grid_lon)
         {
             return;
         }
         current_bbox.lonMin = start_bbox.lonMin + (bbox_grid_dimension.lonDim * i);
         current_bbox.latMin = start_bbox.latMin + (bbox_grid_dimension.latDim *j) ;
         current_bbox.lonMax= start_bbox.lonMax + (bbox_grid_dimension.lonDim * i);
         current_bbox.latMax = start_bbox.latMax + (bbox_grid_dimension.latDim *j);
 
         //call function to generate next grid cell
         wait(100);
         generateGrid();
 
      }
    }

//call function to create the full grid
generateGrid();

exports.generateGrid = generateGrid;
