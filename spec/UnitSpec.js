describe("EmissionsUtility", function() {
  var emUtil = require('../src/public/javascript/EmissionsUtility.js');
  var y1, y2, y3, years, yearsNonFlat

  beforeEach(function() {
    y1 = {"year": 1, "em": 1}
    y2 = {"year": 2, "em": 2}
    y3 = {"year": 3, "em": 3}
    years = [y1, y2, y3]
    yearsNonFlat = [[y1, y2], [y3]]
  });

  it("should add two years' emissions", function() {
    expect(emUtil.sumEm(years)).toEqual(6);
  });

  it("should add nested arrays of emissions", function() {
    expect(emUtil.sumEm(yearsNonFlat)).toEqual(6)
  });

  it("should divide an array of emissions into bins", function() {
    var expectedResult = [[y1, y2],[y2, y3]]
    var result = emUtil.divideEmissions(years, [1.5])
    expect(result).toEqual(expectedResult)
  });

  it("should translate thresholds", function() {
    expect(emUtil.thresholdsTranslate(1, 3, [4], years)).toEqual([1])
  })

  it("should find index of array given emissions", function() {
    expect(emUtil.find(years, 2.1)).toEqual(2)
    expect(emUtil.find(years, 2)).toEqual(1)
  });

  it("should return -1 if emissions too small for dataset", function() {
    expect(emUtil.find(years, 0.1)).toEqual(-1)
  });

  it("should return size of array if emissions too large", function() {
    expect(emUtil.find(years, 4)).toEqual(3)
  })
});
