"use strict"

var express = require('express');
var router = express.Router();


let massive = require('massive');

let connectionString = "postgres://devPostgres:password@localhost/survey";
let db = null;

massive.connect({connectionString : connectionString}, (err,mdb) => {
    db = mdb;
});

/* GET users listing. */
router.get('/', function(req, res, next) {
   let page = req.query.page || 0,
       pagesize = req.query.pagesize || 20;
   //setTimeout(function() { console.log(Date.now() + "timeout");},0);
   let options = {offset:page * pagesize, limit : pagesize}
   db.Users.find( {}, options, (err, users) => {
      if(err)  {
         res.send(err);
      } else {
         res.json (users);
      }
   });
});


router.get('/links', function(req, res, next) {
   //setTimeout(function() { console.log(Date.now() + "timeout");},0);
   db.links.find( (err, users) => {
      res.json (users);
   });
});



module.exports = router;
