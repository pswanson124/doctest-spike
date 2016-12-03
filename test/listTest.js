"use strict"

let should = require('should');
let massive = require('massive');
let Promise = require('bluebird');
let ListSvc = require('../svc/listSvc');
let listSvc = new ListSvc();

let connectionString = "postgres://devPostgres:password@localhost/survey";
let db = null;

describe('List', function() {
  before(function(done) {
    massive.connect({connectionString : connectionString}, function(err,mdb){
       db = mdb;
       done();
    });
  });

  describe('Massive list retrieval', function() {
    it('should retrieve the lists table', function (done) {
      db.list.find({}, function(err, results) {
        results.length.should.be.greaterThan(1);
        done();
      });
    });

    it('should be able to promisify', function (done) {
      let find = Promise.promisify(db.list.find, {context:db.list});
      find({}).then( results => {
        results.length.should.be.greaterThan(1);
        done();
      });
    });

  });

  describe('Should be able to call listSvc', function() {
    it('Should be able to retrive "test" list with no arguments', function(done) {
      listSvc.getListData('Paul', 'test',{}, {limit:10}, (err, results) => {
        results.should.have.property('list');
        results.list.length.should.be.eql(10);
        done();
      });
    });
    it('Should be able to retrive "test" with list id value', function(done) {
      listSvc.getListData('Paul', 'test', 2026, null, (err, results) => {
        results.should.have.property('list');
        results.list.length.should.be.eql(1);
        done();
      });
    });
    it('Should be able to retrive "test" get by id value', function(done) {
      listSvc.getListDataById('Paul', 'test', 2026, (err, results) => {
        results.should.have.property('list');
        results.list.length.should.be.eql(1);
        results.should.have.property('def');
        results.def.length.should.be.greaterThan(2);
        done();
      });
    });
    it('Should be able to retrive list of lists', function(done) {
      listSvc.getLists().then(results => {
        results.length.should.be.greaterThan(1);
        done();
      });
    });
    it('Should be able to insert a record into test list', function(done) {
      listSvc.saveListBatch('Paul', 'test', [{id: 2026, state:'test'}, {state:'test insert'}]).then(results => {
        results.length.should.be.eql(2);
        results[1].should.have.property('id');
        results[1].id.should.be.greaterThan(12000);
        done();
      });
    });
    // it('Should be able to retrive list of lists', function(done) {
    //   listSvc.getLists().then(results => {
    //     results.length.should.be.greaterThan(1);
    //     done();
    //   });
    // });

  });


  describe('List Security', function () {
    it('should be able to check positive security on a list.', function(done)  {
      listSvc.checkUserAccess('Paul', 'account')
        .then(results => {
          results.should.greaterThan(0);
          done();
        })
    });
    it('should be able to check negative security on a list.', function(done)  {
      listSvc.checkUserAccess('Paul', 'not-existing-table')
        .then(results => {
          results.should.eql(0);
          done();
        })
    });
  });


  describe('List Security with methods', function () {
    it('should be able to check positive security on a list definition.', function(done)  {
      listSvc.getListDefinition('Paul', 'account')
        .then(results => {
          //console.info(results)
          results.length.should.greaterThan(0);
          done();
        })
    });
  });

});
