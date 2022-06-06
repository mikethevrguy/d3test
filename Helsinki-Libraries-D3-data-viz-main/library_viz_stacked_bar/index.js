//IMPORTANT! change the js file in the index.html from hardcode_index.js to index.js to use this script.

// set up
 const width = 2000;
 const height = 400;
 const margin = { top: 50, bottom: 100, left: 80, right: 80 }
 
const svg = d3.select('#d3-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// data

const data = d3.csv('My_Library_Data.csv', d3.autoType); //get csv file of data

//const data = d3.json('My_Library_Data.json'); //get json file of data

//run console.log to test that csv or json is working. 
function testData() {
  console.log(data);
}

  const keys = ["Toolo", "Pasila", "Rikhardinkatu"];
  const timeline = Array.from(new Set(data.map(d => d.year_plus_month))).sort(d3.ascending);
 
  // get a map from the year_plus_month to the library_name to the visitor_number
  const monthToTypeToCount = d3.rollup(
    data,
    // g is an array that contains a single element
    // get the count for this element
    g => g[0].visitor_number,
    // group by month first
    d => d.year_plus_month,
    // then group by library
    d => d.library_name
  );
 
  // put the data in the format mentioned above
  const countsByMonth = Array.from(monthToTypeToCount, ([month, counts]) => {
    // counts is a map from library_name to visitor_number
    counts.set("month", month);
    counts.set("total", d3.sum(counts.values()));
    // turn the map into an object
    return Object.fromEntries(counts);
  });
 
  const stackedData = d3.stack()
      .keys(keys)
      // return 0 if a month doesn't have a count for any libraries
      .value((d, key) => d[key] ?? 0)
      (countsByMonth);
 
  // scales
 
  const x = d3.scaleBand()
      .domain(timeline)
      .range([0, width])
      .padding(0.25);
 
  const y = d3.scaleLinear()
      .domain([0, d3.max(countsByMonth, d => d.total)])
      .range([height, 0]);
 
  const color = d3.scaleOrdinal()
      .domain(keys)
      .range(["#c65151","#eebb36","#4f9395"]);
 
  // axes
 
  const xAxis = d3.axisBottom(x)
 
  svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis) //call ticks & tick labels of x Axis here
      .attr('font-size', '15px')
 
  const yAxis = d3.axisLeft(y);
 
  svg.append('g')
      .call(yAxis) //call ticks & labels of y Axis here
      .attr('font-size', '15px')
 
  // draw bars
 
  const groups = svg.append('g')
    .selectAll('g')
    .data(stackedData)
    .join('g')
      .attr('fill', d => color(d.key));
 
  groups.selectAll('rect')
    .data(d => d)
    .join('rect')
      .attr('x', d => x(d.data.month))
      .attr('y', d => y(d[1]))
      .attr('width', x.bandwidth())
      .attr('height', d => y(d[0]) - y(d[1]));
 
  // title of chart
 
  svg.append('g')
      .attr('transform', `translate(${width / 55},${460})`)
      .attr('font-family', 'sans-serif')
    .append('text')
    .attr('font-size', '30px')
      .attr('text-anchor', 'middle')
      .call(
        text => text.append('tspan')
          .attr('fill', color('Toolo'))
          .text('Toolo Library')
      )
      .call(
        text => text.append('tspan')
          .attr('fill', 'black')
          .text(' vs. ')
      )
      .call(
        text => text.append('tspan')
          .attr('fill', color('Pasila'))
          .text('Pasila Library')
      )

      .call(
        text => text.append('tspan')
          .attr('fill', 'black')
          .text(' vs. ')
      )

      .call(
        text => text.append('tspan')
          .attr('fill', color('Rikhardinkatu'))
          .text('Rikhardinkatu Library')
      )

     testData(); //call console.log of csv or json