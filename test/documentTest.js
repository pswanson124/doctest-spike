"use strict"

let should = require('should');
let massive = require('massive');

let connectionString = "postgres://devPostgres:password@localhost/survey";
let db = null;

describe('Massive', function() {
   before(function(done) {
      massive.connect({connectionString : connectionString}, function(err,mdb){
         db = mdb;
         done();
      });

   });

  describe('data retrieval', function() {
     it('should retrieve the Users table', function (done) {
        let start = Date.now();
        db.Users.find( function( err, users ) {
          should(users.length > 900, "did not retrieve all Users");
          done();
        });

     });
  });

  describe('data join', function(){
    it('should allow for joins', function(done){
       let sql = 'select * from "Users" u inner join user_message um on u.id = um.user_id where user_id = $1';
       db.run(sql, [1], function(err, res) {
          if(err) {
             console.error(err);
          } else {
             //console.log(res);
             should(res.length === 1, "Incorrect number of records retrieved.");
          }
          done();
       });
    });
  });

  describe('document save', function() {
     it('should save the test document in a new table my_documents', function (done) {
        var newDoc = {
          title : "Chicken Ate Nine",
          description: "A book about chickens of Kauai",
          price : 99.00,
          date : Date.now(),
          tags : [
            {name : "Simplicity", slug : "simple"},
            {name : "Fun for All", slug : "fun-for-all"}
          ]
        };

        db.saveDoc("my_documents", newDoc, function(err,res){
          //the table my_documents was created on the fly
          //res is the new document with an ID created for you
          done();
        });
     });
  });

  describe('Should retrieve document', function() {
     it('should get document from table', function(done) {
        db.my_documents.find( function (err, docs) {
           should(docs.length > 0, "Did not retrieve docs");
           //console.info(docs);
           done();
        });
     });
  });

  describe('Should be able to manage the documents for SpinCo', function(  ) {
     it('Should store documents for links', function(done) {
        let newLink = { name: "cit", link:'www.cit.com', type:'http', newfield: 123};
        db.saveDoc('links', newLink, function (err, res) {
           //console.log(res);
           should(res.id, "record does not have id");
           done();
        });
     });
  });
});
