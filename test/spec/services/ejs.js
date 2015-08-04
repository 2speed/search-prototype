'use strict';

describe('Service: ejs', function () {

  // load the service's module
  beforeEach(module('searchApp'));

  // instantiate service
  var ejs;
  beforeEach(inject(function (_ejs_) {
    ejs = _ejs_;
  }));

  it('should do something', function () {
    expect(!!ejs).toBe(true);
  });

});
