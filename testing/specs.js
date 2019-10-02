describe("Decimal formatter function", () => {
  // Decimals function
  var decimals = (val) => {
    if (typeof val != 'string') {
        throw {
            name: "WrongType",
            message: "Expected input to be a String."
         }
    }
    var diff = val.length-3,
        str = val;
    while (diff>=1) {
      if (str.indexOf('.') == -1) {
        str = str.slice(0,str.length-3)+'.'+str.slice(str.length-3,str.length);
      } else {
        str = str.slice(0,str.indexOf('.')-3)+'.'+str.slice(str.indexOf('.')-3,str.length);
      }
      diff-=3;
    }
    return str;
  }

  // Testing specs
  it('Should throw an error when not providing a Stringified number', () => {
    expect(() => decimals(1000)).toThrow();
  });

  it('Should return the decimal-formatted version of the number', () => {
    expect(decimals('1000')).toEqual('1.000');
    expect(decimals('10')).toEqual('10');
    expect(decimals('1000000')).toEqual('1.000.000');
  });
});


describe("JSON API response middleware", () => {
  // Custom matcher
  beforeEach(() => {
    jasmine.addMatchers({
      arrayLength: (beforeLength) => {
        return {
            compare: function (actual, expected) {
                return {
                    pass: actual[0].length == expected
                };
            }
        };
      }
    });
  });

  // Parsing function
  var parseJSON = async (data) => {
    return new Promise((resolve, reject) => {
      if (Array.isArray(data) == false) {
        reject(new Error('Please, provide this function the parsed JSON input.'));
      } else if (data[0].hasOwnProperty('tablet') == false) {
        reject(new Error('Check that the API is returning the desired data.'));
      } 
  
      // Parsing data to get the computed visits per datapoint
      var datapoints = [],
          totalSmartphone = 0, 
          totalTablet = 0;
  
      data.forEach((val, i) => {
          totalSmartphone += val.smartphone;
          totalTablet += val.tablet;
          datapoints.push({
              date: i,
              value: val.smartphone+val.tablet
          });
      })
  
      // Calculate relative percentages
      const percentageSmartphone = totalSmartphone/(totalSmartphone+totalTablet),
            percentageTablet = totalTablet/(totalSmartphone+totalTablet);
  
      // Returning parsed data
      resolve([datapoints,[{
                  device: 'smartphone',
                  value: percentageSmartphone
              },
              {
                  device: 'tablet',
                  value: percentageTablet
              }]
           ]);
      });
  }

  // Testing specs
  it('Should return a two dimensional array, in which Array[0] has to be of the same length of the original data', async () => {
    var original, parsed;

    // Fetch API and store the parsed response in a variable
    await fetch('https://my-json-server.typicode.com/MayankKesari/marfeel-test/impressions')
        .then(response => response.json())
        .then(body => original = body);
    
    await parseJSON(original).then(result => parsed = result);

    expect(parsed).arrayLength(original.length);
  });

  it('Should throw an error when not providing a valid input', () => {
    parseJSON('foobar').then((res) => {}, (error) => {
      expect(error.message).toEqual('Please, provide this function the parsed JSON input.');
    });
  });

  it('Should throw an error when API response contents are not the expected', () => {
    parseJSON([1,2,3]).then((res) => {}, (error) => {
      expect(error.message).toEqual('Check that the API is returning the desired data.');
    });
  });
});