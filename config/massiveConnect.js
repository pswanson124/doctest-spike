"use strict"

let massive = require('massive');
let connectionString = "postgres://devPostgres:password@localhost/survey";

let Promise = require('bluebird');

let db = null;

let connect = Promise.promisify( massive.connect );

let con = //massive.connect({connectionString : connectionString}, (err,mdb) => {
   connect({connectionString : connectionString}).then( mdb => {
    db = mdb;
    return db;
});


module.exports  = con;
