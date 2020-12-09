const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

const authMiddleware = require("../middleware/is-auth");

// describe functions groups tests and can be nested
// describe("my group title")
describe("Auth middleware", function() {
  // Not authorized => throw error
  it("should throw an error if no authorization header is present", function() {
    // mock request when req.get returns null
    const req = {
      get: function(headerName) {
        return null;
      }
    };
    // it is expected to throw error
    // you have to bind the function so that mocha/chai can access the reference
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated."
    );
  });

  // Authorization header is malformatted (Should have format "Bearer my-key-here") => throw error
  it("should throw an error if the authorization header is only one string", function() {
    const req = {
      get: function(headerName) {
        return "xyz";
      }
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  // Check if user ID is found after decoding
  it("should yield a userId after decoding the token", function() {
    const req = {
      get: function(headerName) {
        return "Bearer djfkalsdjfaslfjdlas";
      }
    };
    // you can overwrite jwt function to mock the functionality
    // other (better) option is to use "sinon" to simulate stub functions
    sinon.stub(jwt, "verify");
    jwt.verify.returns({ userId: "abc" });
    authMiddleware(req, {}, () => {});
    expect(req).to.have.property("userId");
    expect(req).to.have.property("userId", "abc");
    expect(jwt.verify.called).to.be.true;
    // rrestore original function
    jwt.verify.restore();
  });

  it("should throw an error if the token cannot be verified", function() {
    const req = {
      get: function(headerName) {
        return "Bearer xyz";
      }
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
});
