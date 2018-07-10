'use strict';

// Clear the console before each run
// process.stdout.write("\x1Bc\n");
const mongoose = require('mongoose');
const { PORT, MONGODB_URI } = require('./config');


const chai = require('chai');
const chaiHttp = require('chai-http');

const app = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality Check', () => {

  it('true should be true', () => {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', () => {
    expect(2 + 2).to.equal(4);
  });

});

describe('Environment', () => {

  it('NODE_ENV should be "test"', () => {
    expect(process.env.NODE_ENV).to.equal('test');
  });

});

describe('Basic Express setup', () => {

  describe('Express static', () => {

    it('GET request "/" should return the index page', () => {
      return chai.request(app)
        .get('/')
        .then(function (res) {
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });

  });

  describe('404 handler', () => {

    it('should respond with 404 when given a bad path', () => {
      return chai.request(app)
        .get('/bad/path')
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });
});

mongoose.connect(MONGODB_URI)
.then(instance => {
  const conn = instance.connections[0];
  console.info(`Connected to: mongodb://${conn.host}:${conn.port}/${conn.name}`);
})
.catch(err => {
  console.error(`ERROR: ${err.message}`);
  console.error('\n === Did you remember to start `mongod`? === \n');
  console.error(err);
});

app.listen(PORT, function () {
console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
console.error(err);
});