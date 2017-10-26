describe("Utility Functions", function() {
  var y1, y2, y3, years, yearsNonFlat

  beforeEach(function() {
    y1 = {"year": 1, "em": 1}
    y2 = {"year": 2, "em": 2}
    y3 = {"year": 3, "em": 3}
    years = [y1, y2, y3]
    yearsNonFlat = [[y1, y2], [y3]]
  });

  it("should add two years' emissions", function() {
    expect(sumEm(years)).toEqual(6);
  });

  it("should add nested arrays of emissions", function() {
    expect(sumEm(yearsNonFlat)).toEqual(6)
  });

  it("should divide an array of emissions into bins", function() {
    var expectedResult = [[y1, y2],[y2, y3]]
    var result = divideEmissions(years, [1.5])
    expect(result).toEqual(expectedResult)
  });

  it("should translate thresholds", function() {
    expect(thresholdsTranslate(1, 3, [4], years)).toEqual([1])
  })

  it("should find index of array given emissions", function() {
    expect(find(years, 2.1)).toEqual(2)
    expect(find(years, 2)).toEqual(1)
  });

  it("should return -1 if emissions too small for dataset", function() {
    expect(find(years, 0.1)).toEqual(-1)
  });

  it("should return size of array if emissions too large", function() {
    expect(find(years, 4)).toEqual(3)
  });
});

describe("Interpolation", function() {
  var y1, y2, y3, years, yearsNonFlat

  beforeEach(function() {
    y1 = {"year": 1, "em": 1}
    y2 = {"year": 2, "em": 2}
    y3 = {"year": 3, "em": 3}
    years = [y1, y2, y3]
    yearsNonFlat = [[y1, y2], [y3]]
  });
  
  describe("toPeak", function() {
    var ePrime = 1
    var peakYear = {"year": 7, "em": 3}
    it("should be flat if last year's emissions are the same as peak year", function() {
      var toPeakYears = toPeak(y3, ePrime, peakYear)
      console.log(toPeakYears)
      toPeakYears.forEach(function(y) {
	expect(y.em).toEqual(y3.em)
      });
    });
  });
});
