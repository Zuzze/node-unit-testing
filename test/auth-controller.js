const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");

const User = require("../models/user");
const AuthController = require("../controllers/auth");

describe("Auth Controller", function() {
  // prepare tests by initializing mongoose connection before tests are run
  // and simulating logged in user
  // It is a good idea to setup a dedicated database for testing, do NOT use production database for this
  before(function(done) {
    mongoose
      .connect(process.env.MONGODB_TEST_URI)
      .then(result => {
        const user = new User({
          email: "test@test.com",
          password: "tester",
          name: "Test",
          posts: [],
          _id: "5c0f66b979af55031b34728a"
        });
        return user.save();
      })
      .then(() => {
        done();
      });
  });

  beforeEach(function() {});

  afterEach(function() {});

  // note that database operation is asynchronous
  // to tell this to mocha, add "done" as a parameter
  // call done() inside block where async code is finished
  it("should throw an error with code 500 if accessing the database fails", function(done) {
    // simulate findOne mongoose method using Sinon
    sinon.stub(User, "findOne");
    User.findOne.throws();

    // mock req object
    const req = {
      body: {
        email: "test@test.com",
        password: "tester"
      }
    };

    // use actual controller to test it agains mock data and sinon

    AuthController.login(req, {}, () => {}).then(result => {
      expect(result).to.be.an("error");
      expect(result).to.have.property("statusCode", 500);
      done();
    });

    User.findOne.restore();
  });

  it("should send a response with a valid user status for an existing user", function(done) {
    const req = { userId: "5c0f66b979af55031b34728a" };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.userStatus = data.status;
      }
    };
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal("I am new!");
      done();
    });
  });

  after(function(done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
