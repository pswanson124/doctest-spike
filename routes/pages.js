"use strict"
let assert = require('assert');
let PageSvc = require('../svc/pageSvc');
let express = require('express');
let router = express.Router();

var chance = require("chance").Chance();

let pageSvc = new PageSvc();


router.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  // res.header("Access-Control-Allow-Methods", "*");
  // res.headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  //console.info("added COR");
  next();
 });

/* GET users listing. */
router.get('/', function(req, res, next) {
   pageSvc.getPages().then( results => {
      res.json(results);
   })
});




router.get('/:name', function(req, res, next) {
   let name = req.params.name;
   assert(name, "Name was not passed into the router get method.");
   //console.log('get ' + name);
   pageSvc.getPageData(name, function (err, results ) {
      res.json( results );
   });
});


router.post('/:name/save', function(req, res, next) {
   let name = req.params.name;
   let obj = req.body;
   assert(name, "Name was not passed into the router get method.");
   //let obj = { id:1, firstName:'Paul' + Date.now(), lastName:'Swanson' + Date.now()}
   pageSvc.savePage(obj).then(results => {
      res.json(results);
   }).error(err => {
      console.error(err);
      res.json(err);
   });
});

router.get('/:name/testData', function(req, res, next) {
   let name = req.params.name;
   assert(name, "Name was not passed into the router get method.");

   let obj = {
      id : 1,
      name: name,
      sizes : { left:'col-sm-2', middle:'col-sm-7', right:'col-sm-3'},
      left : [ { t: "contentWidget", content : "left widget/menu"}],
      middle : [
         { t : "contentWidget", content : "Welcome Message"},
         { t : "contentWidget", content : "Second Message"}
      ],
      right : [
         {t : "dataList", content: "temporary Message"},
         {t : "dataList", content: "temporary 2nd Message"}
      ]

   }
   console.log("calling save");
   pageSvc.savePage( obj).then(results => {
      res.json(results);
   });

});


module.exports = router;
