class Gauge extends HTMLElement {
    get dataType() {
        return this.getAttribute('data');
    }

    // Default constructor
    constructor() {
        super();
    }

    renderShadow () {
        // Create Shadow DOM
        const shadow = this.attachShadow({mode:'open'});

        // Render to Shadow DOM
        shadow.innerHTML = `
        <style>
            .element-wrapper {
                width: 300px; }
                .element-wrapper .gauge-container {
                height: 200px;
                display: flex;
                align-items: center;
                justify-content: center; }
                .element-wrapper .gauge-container .gauge {
                    position: absolute; }
                .element-wrapper .gauge-container .gauge-inner {
                    position: relative;
                    margin-bottom: 3.5rem; }
                    .element-wrapper .gauge-container .gauge-inner .gauge-text {
                    text-align: center; }
                    .element-wrapper .gauge-container .gauge-inner .gauge-text span {
                        display: block; }
                        .element-wrapper .gauge-container .gauge-inner .gauge-text span.measure {
                        color: #A2A2A2;
                        text-transform: uppercase;
                        font-size: 1.1rem; }
                        .element-wrapper .gauge-container .gauge-inner .gauge-text span.value {
                        color: #3F3F3F;
                        font-weight: 600;
                        font-size: 1.4rem; }
            .additional-data {
              display: flex;
              justify-content: space-between;
              align-items: center; }
              .additional-data .data-container span.data-label:first-of-type {
                display: block;
                font-weight: 600;
                margin-bottom: 0.15rem; }
              .additional-data .data-container span.data-percentage {
                color: #3F3F3F;
                margin-right: .35rem; }
              .additional-data .data-container span.data-value {
                color: #A2A2A2; }
              .additional-data .data-container:last-of-type span:first-of-type {
                text-align: right;
              }
            /* Revenue theme */
                :host .revenue .pie-light {
                    fill: #87D536;
                    color: #87D536;
                }
                :host .revenue .pie-dark {
                    fill: #386A0F;
                    color: #386A0F;
                }
                :host .revenue .area-color {
                    fill: #F6FBF3;
                }
                :host .revenue .trendline-stroke {
                    stroke: #D9ECC0;
                }
            /* Impressions theme */
                :host .impressions .pie-light {
                    fill: #6ECADF;
                    color: #6ECADF;
                }
                :host .impressions .pie-dark {
                    fill: #285568;
                    color: #285568;
                }
                :host .impressions .area-color {
                    fill: #F1FAFA;
                }
                :host .impressions .trendline-stroke {
                    stroke: #CAE9F4;
                }
            /* Visits theme */
                :host .visits .pie-light {
                    fill: #F0C700;
                    color: #F0C700;
                }
                :host .visits .pie-dark {
                    fill: #BE591C;
                    color: #BE591C;
                }
                :host .visits .area-color {
                    fill: #FCFAF3;
                }
                :host .visits .trendline-stroke {
                    stroke: #FBE9B9;
                }
        </style>
        <div class="element-wrapper"> 
            <div class="gauge-container"> 
                <div class="gauge"> 
                    <svg id="svg"></svg> 
                </div>
                <div class="gauge-inner"> 
                    <div class="gauge-text">
                        <span class="measure"></span>
                        <span class="value"></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="additional-data"> 
            <div class="data-container"> 
                <span class="data-label"></span>
                <span class="data-percentage"></span>
                <span class="data-value"></span>
            </div>
            <div class="data-container"> 
                <span class="data-label"></span> 
                <span class="data-percentage"></span> 
                <span class="data-value"></span>
            </div>
        </div>`;
    }

    async renderGauge (dataType) {
        var data;
        // Fetch API and store the parsed response in a variable
        await fetch('https://my-json-server.typicode.com/MayankKesari/marfeel-test/'+dataType)
            .then(response => response.json())
            .then(body => data = body);

        // Call our middleware to parse the data from the API
        await this.parseJSON(data).then(result => data = result);
        
        const width = 300,
              height = 200,
              outerRadius = height/2,
              innerRadius = height/2-10;

        // SVG element selector
        const svg = d3.select(this.shadowRoot)
            .select('#svg')
            .attr('width',width)
            .attr('height',height)
            .attr('class',this.dataType);
                
        // Initializing D3 Pie chart
        const pie = d3.pie()
            .value(d => d.value)
            .sort(null)
            .padAngle(0);

        // Initializing D3 Arc
        const arc = d3.arc()
            .outerRadius(outerRadius)
            .innerRadius(innerRadius);
                
        // Color scale (css class for each color)
        const color = d3.scaleQuantize()
            .domain([0,1])
            .range(["pie-light", "pie-dark"]);

        // Circular chart SVG group    
        const g1 = svg.append('g')
            .attr('transform','translate('+width/2+','+height/2+')');
                             
        const path = g1.selectAll('path')
            .data(pie(data[1]))
            .enter()
            .append('path')
            .attr('d',arc)
            .attr('class', (d,i)=> {
                // Scaled color
                var elColor = color(Math.round(d.value));
                // Color smarthpone tablet
                this.shadowRoot.querySelectorAll('.data-label')[i].classList += ' '+elColor;
                // Color del pie
                return elColor;
            });

        // Trendline x axis scale
        const x = d3.scaleTime()
            .rangeRound([0,200])
            .domain([0,data[0].length-1]); // varies depending on total number of datapoints
                
        // Trendline y axis scale
        const y = d3.scaleLinear()
            .rangeRound([40, 0])
            .domain(d3.extent(data[0], d => d.value)); // extent finds the min and max values in the array
       
        // Trendline background area
        const area = d3.area()
            .x((d,i) => x(i))
            .y1(100) // height of area to be filled
            .y0(d => y(d.value));
        
        // Datapoints line
        const line = d3.line()
            .x((d,i) => x(i))
            .y(d => y(d.value));

        const g2 = svg.append('g')
            .attr('transform','translate(62.5,115)')
            .attr('clip-path','circle(86px at 87.5px -15px)');
        
        // Append trendline area to the SVG group
        g2.append('path')
            .datum(data[0])
            .attr('class','area-color')
            .attr('stroke','none')
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", area);
        
        // Append datapoints line on top of the background area
        g2.append('path')
            .datum(data[0])
            .attr('fill','none')
            .attr('class','trendline-stroke')
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);
        
        const totalVisits = (
            data[0].reduce((acc, val) => {
                return acc += val.value;
            },0)
        );

        // Add metrics to the element
        this.shadowRoot.querySelector('.additional-data').classList += ' '+dataType;
        this.shadowRoot.querySelector('.measure').textContent = dataType;
        this.shadowRoot.querySelector('.value').textContent = this.decimals(totalVisits.toString());
        if (dataType == 'revenue') {
        	this.shadowRoot.querySelector('.value').textContent += '€';
        }
        this.shadowRoot.querySelectorAll('.data-label')[0].textContent = 'Tablet';
        this.shadowRoot.querySelectorAll('.data-percentage')[0].textContent = Math.round(data[1][0].value*100)+'%';
        this.shadowRoot.querySelectorAll('.data-value')[0].textContent = this.decimals(Math.round(totalVisits*data[1][0].value).toString());
        this.shadowRoot.querySelectorAll('.data-label')[1].textContent = 'Smartphone';
        this.shadowRoot.querySelectorAll('.data-percentage')[1].textContent = Math.round(data[1][1].value*100)+'%';
        this.shadowRoot.querySelectorAll('.data-value')[1].textContent = this.decimals(Math.round(totalVisits*data[1][1].value).toString());
    }

    async parseJSON (data) {
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

    decimals(val) {
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
      
    // Fires when element is inserted into the DOM 
    connectedCallback () {
        // Render element to page
        this.renderShadow()
        this.renderGauge(this.dataType);
    }
}

window.customElements.define('app-gauge', Gauge);