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
describe('folders test hooks', () => {
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
  describe('GET by id, GET all', () => {
    //GET all folders
    it('should get all folders', () => {
      return chai.request(app)
        .get('/api/folders')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          return Folder.find()
            .then(data => {
              expect(res.body).to.have.length(data.length);
            });
        });
    });
  });
  //GET by id
  it('should return folder with correct id', () => {
    let data;
    // 1) First, call the database
    return Folder.findOne()
      .then(_data => {
        data = _data;
        // 2) then call the API with the ID
        return chai.request(app).get(`/api/folders/${data.id}`);
      })
      .then((res) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys('name');

        // 3) then compare database results to API response
        expect(res.body.id).to.equal(data.id);
        expect(res.body.name).to.equal(data.name);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
      });
  });
});

//______________POST Tests______________
//______________PUSH Tests______________
//______________DELETE Tests______________