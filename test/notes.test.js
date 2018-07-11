'use strict'

//require packages
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/notes');
const seedNotes = require('../db/seed/notes');

//configure expect as your assertion library and load chai-http with chai.use()
const expect = chai.expect;
chai.use(chaiHttp);

//describe() wraps your tests
describe('noteful test hooks', ()=>{
  // configure the Mocha hooks manage the database during the tests
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return Note.insertMany(seedNotes);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });
  //______________GET Tests______________
  //Serial Request - Call DB then call API then compare:
  describe('GET by id, GET all', ()=>{
  //GET by id
    it('should return correct note', ()=>{
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  })
  //GET all notes
  it('should get all notes', ()=>{
    return chai.request(app)
      .get('/api/notes')
      .then( res => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        return Note.find()
          .then(data => {
            expect(res.body).to.have.length(data.length);
          });  
      });
  //_________________POST Tests_________________
  //Serial Request - Call API then call DB then compare
  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...'
      };

      let res;
      // 1) First, call the API
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          // 2) then call the database
          return Note.findById(res.body.id);
        })
        // 3) then compare the API response to the database results
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });
  //___________________PUT Tests_____________________
  describe('PUT endpoint', function () {
    // strategy:
    //  1. Get an existing note from db
    //  2. Make a PUT request to update that note
    //  3. Prove note returned by request contains data we sent
    //  4. Prove note in db is correctly updated
    it('should update fields you send over', function () {
      const updateData = {
        title: "a great new note",
        content: "about how wonderful today is!"
      };

      return Note
        .findOne()
        .then(function (note) {
          updateData.id = note.id;

          return chai.request(app)
            .put(`/notes/${note.id}`)
            .send(updateData);
        })
        .then(function (res) {
          expect(res).to.have.status(204);

          return Note.findById(updateData.id);
        })
        .then(function(note) {
          expect(note.title).to.equal(updateData.title);
          expect(note.content).to.equal(updateData.content);
        });
    });
  })
  //__________________DELETE Tests___________________
  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a note
    //  2. make a DELETE request for that note's
    //  3. assert that response has right status code
    //  4. prove that the note with the id doesn't exist in db anymore
    it('delete a restaurant by id', function() {
      
      let note;

      return Note
      .findOne()
      .then(function(_note) {  // ASK JUANCARLOS -- why do we pass this in with an underscore??
        note = _note;
        return chai.request(app).delete(`/notes/${note.id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
        return Note.findById(note.id);
      })
      .then(function(_note) {
        expect(_note).to.be.null;
      })
    });
  });
});