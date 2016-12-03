"use strict"
let massiveConnect = require('../config/massiveConnect');
let Promise = require('bluebird');

let db = null;
let findFile = null;

massiveConnect.then( mdb => {
   db = mdb;
   findFile = Promise.promisify( db.file.find, {context:db.file});
});

class FileSvc  {

   getById(id) {
      // db.file.find(id, function(err, res) {
      //    console.log(res);
      // });
      return findFile(id).then(file => {
         console.log(file);
         return file
      });
   }

   saveFile(file) {
      db['file'].save(file);
      //fileSave(file);
   }
}

module.exports = FileSvc
