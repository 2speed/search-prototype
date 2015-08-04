'use strict';

describe('Service: chartConfig', function () {

  // load the service's module
  beforeEach(module('searchApp'));

  // instantiate service
  var chartConfig;
  beforeEach(inject(function (_chartConfig_) {
    chartConfig = _chartConfig_;
  }));

  it('should do something', function () {
    expect(!!chartConfig).toBe(true);
  });

});
