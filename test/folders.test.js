'use strict'

//require packages
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');
const Note = require('../models/notes');
const Folder = require('../models/folders');
const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');

//configure expect as your assertion library and load chai-http with chai.use()
const expect = chai.expect;
chai.use(chaiHttp);

//describe() wraps your tests
describe('folders test hooks', () => {
  // configure the Mocha hooks manage the database during the tests
  before(function () {
    this.timeout(8000)
    return mongoose.connect(TEST_MONGODB_URI, {connectTimeoutMS: 5000})
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(  function() {
    this.timeout(8000);
    return Promise.all([
      Folder.insertMany(seedFolders),
      Folder.createIndexes()
    ]);
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  //______________GET Tests______________
  //Serial Request - Call DB then call API then compare:
  describe('GET by id, GET all, respond with 400 for invalid id', () => {
    //GET all folders
    it('should get all folders, sorted by name', () => {
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
        expect(res.body).to.have.keys(['name', 'id', 'createdAt', 'updatedAt']);

        // 3) then compare database results to API response
        expect(res.body.id).to.equal(data.id);
        expect(res.body.name).to.equal(data.name);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
      });
  });
  //respond with 400 for invalid id
  it('should respond with a 400 for an invalid id', function () {
    return chai.request(app)
      .get('/api/folders/NOT-A-VALID-ID')
      .then(res => {
        expect(res).to.have.status(400);
        expect(res.body.message).to.eq('The `id` is not valid');
      });
  });
});
//______________POST Tests______________
describe('POST /api/folders', function() {
  it('should create and return a new folder when provided valid data', function () {
    this.timeout(10000);
    const newItem = {
      'name': 'new folder name'
    };

    let res;
    // 1) First, call the API
    return chai.request(app)
      .post('/api/folders')
      .send(newItem)
      .then(function (_res) {
        console.log(_res);
        res = _res;
        expect(res).to.have.status(201);
        expect(res).to.have.header('location');
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys('id','name', 'createdAt', 'updatedAt');
        console.log(res.body.id);
        // 2) then call the database
        return Folder.findOne({name: "new folder name"});
      })
      // 3) then compare the API response to the database results
      .then(data => {
        expect(res.body.id).to.equal(data.id);
        expect(res.body.name).to.equal(data.name);
        expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
        expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
      })
      .catch(error =>{
        console.log(error);
      })
  });
});
//______________PUT Tests______________
describe('PUT /api/folders/:id', () => {
  it('should update folder you send over, and return with new data', function () {
    const updatedFolder = {
      name: "This is an updated folder name",
    };

    return Folder
      .findOne()
      .then(data => {
        updatedFolder.id = data.id;

        return chai.request(app)
        .put(`/api/notes/${data.id}`)
        .send(updatedFolder);
      })
      .then((res) =>{
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
        return Folder.findbyId(updatedFolder.id);
      })
      .then(data => {
        expect(updatedFolder.id).to.equal(data.id);
        expect(updatedFolder.name).to.equal(data.name);
      });   
  });
});

//______________DELETE Tests______________
describe('DELETE api/folders/"id', () => {
  
  it('should delete a folder by id', () => {
    let data;
    return Folder
      .findOne()
      .then(_data => {
        data = _data;
        return chai.request(app).delete(`/api/folders/${data.id}`);
      })
      .then(res => {
        expect(res).to.have.status(204);
        return Folder.findById(data.id);
      })
      .then(_data => {
        expect(_data).to.be.null;
      });
  });
});
