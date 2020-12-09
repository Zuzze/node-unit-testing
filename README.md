# Automated Unit Tests for node.js

This repository includes basic unit testing logic for automated tests for example REST node backend.

## Which test tools are used

- **_Mocha_**: JS test framework used for running tests
- **_Chai_**: used to validate test outcome, test-driven development (TDD) assertion library for NodeJS
- **_Sinon_**: managing side effects & external depencies

## Configuration

- Add tests to `./test` folder
- edit `test` script in `package.json` e.g. `mocha --timeout 5000`
- Run tests `npm run test`

## How to write tests

Syntax in tests define the test structure

- `describe("my group title")`
- `it("my test name")`

```
const expect = require('chai').expect;

describe("auth middleware) {

    it('should be 2', function() {
        const num1 = 1;
        const num2 = 1;
        expect(num1 + num2).to.equal(2);
    })
    // ... other tests
}
```

### Using Sinon to simulate stubs

You can overwrite jwt function to mock the functionality or another (better) option is to use "sinon" to simulate stub functions. You can "restore" function back to normal once you don't need custom functionality anymore.

```
it("should yield a userId after decoding the token", function() {
    const req = {
      get: function(headerName) {
        return "Bearer djfkalsdjfaslfjdlas";
      }
    };

    // mock verify function with sinon
    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: "abc" });

    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId");
    expect(req).to.have.property("userId", "abc");
    expect(jwt.verify.called).to.be.true;

    // restore original function
    jwt.verify.restore();
  });

```

### Testing controllers

- Test if parameters are invalid
- Mock database operations
- Use hooks `before()`, `beforeEach`, `after()`, `afterEach()` to avoid unnecessary code duplication
- **_Hooks_**: prepare tests by initializing mongoose connection before tests are run by using `before()` lifecycle hook so that you have to connect to db only once
- It is a good idea to setup a dedicated database for testing, do NOT use production database for this

```
const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");
const User = require("../models/user");
const AuthController = require("../controllers/auth");

describe("Auth Controller", function() {

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

  ...
```

## Links

[Mocha documentation](https://mochajs.org/)
[Chai documentation](https://www.chaijs.com/api/bdd/)
[Sinon documentation](https://sinonjs.org/releases/v9.2.1/)
