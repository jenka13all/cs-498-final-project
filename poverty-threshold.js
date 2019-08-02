function poverty_threshold() {
//clear
    d3.select("svg").selectAll("*").remove();

    d3.select("#slide_1").attr("class", "page-item");
    d3.select("#slide_2").attr("class", "page-item");
    d3.select("#slide_3").attr("class", "page-item");
    d3.select("#slide_4").attr("class", "page-item active");
    d3.select("#slide_5").attr("class", "page-item");

    var headline = 'Federal Minimum Wage and the Poverty Threshold';
    var text = `A full-time yearly salary on federal minimum wage puts workers just at or slightly above the weighted poverty threshold 
    for a household of one person. As family size increases, the distance between earned wages and what
    is needed to meet the poverty threshold increases, putting a burden especially on single parents. 
    <p></p>
    With every year that passes after a federal minimum wage hike, 
    the sinking value of that wage inevitably keeps the most vulnerable working Americans in poverty.`;
    var source = `Source: <a target='_blank' class='btn btn-link' href='https://www.census.gov/data/tables/time-series/demo/income-poverty/historical-poverty-people.html'>United States Census Bureau</a> (Table 1)
    <br>
    for 2018: <a target='_blank' class='btn btn-link' href='https://aspe.hhs.gov/2018-poverty-guidelines'>U.S. Department of Health & Human Services</a>
    <br>
    for 2019: <a target='_blank' class='btn btn-link' href='https://aspe.hhs.gov/2019-poverty-guidelines'>U.S. Department of Health & Human Services</a>`;

    d3.select('#textpart').html(text);
    d3.select('#headline').html(headline);        
    d3.select('#source').html(source);  

    var parseTime = d3.timeParse("%Y"),
        bisectDate = d3.bisector(function(d) { return d.year; }).left,
        formatMoney = function(d) { 
            return '$' + d.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'); 
        };

   // set the ranges
   var x = d3.scaleTime().range([0, width]);
   var y = d3.scaleLinear().range([height, 0]);

   // poverty threshold 1 person any age
   var pt_1_all_ages = d3.line()
       .x(function(d) { return x(d.year); })
       .y(function(d) { return y(d.all_ages); });

    // yearly minimum wage
    var yearly_min_wage = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.yearly_min_wage); });
    
    // poverty threshold family of 2
   var pt_2 = d3.line()
   .x(function(d) { return x(d.year); })
   .y(function(d) { return y(d.people_2); });

    // poverty threshold family of 3
    var pt_3 = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.people_3); });   

   var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   // Get the data
   d3.csv("weighted-poverty-threshold.csv", function(error, data) {
       if (error) throw error;

       // format the data
       data.forEach(function(d) {
           d.year = parseTime(d.year);
           d.all_ages = +d.all_ages;
           d.people_2 = +d.people_2;
           d.people_3 = +d.people_3;
           d.yearly_min_wage = +d.yearly_min_wage;
       });

       // Scale the range of the data
       x.domain(d3.extent(data, function(d) { return d.year; }));
       y.domain([0, d3.max(data, function(d) {
           return Math.max(d.people_2, d.all_ages); })]);
                  
        // Add the pt_1_all_ages path.
        g.append("path")
            .data([data])
            .attr("class", "line")
            .style("stroke", "red")
            .attr("d", pt_1_all_ages);

       // Add the pt_2 path.
       g.append("path")
           .data([data])
           .attr("class", "line")
           .style("stroke", "green")
           .attr("d", pt_2);

       // Add the pt_3 path.
       g.append("path")
           .data([data])
           .attr("class", "line")
           .style("stroke", "purple")
           .attr("d", pt_3);

        // Add the yearly_min_wage path
        g.append("path")
        .data([data])
        .attr("class", "line")
        .style("stroke", "steelblue")
        .style("stroke-width", 5)
        .attr("d", yearly_min_wage);          

       // Add the X Axis
       g.append("g")
       .attr("class", "axis axis--x")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x));

       g.append("g")
           .attr("class", "axis axis--y")
           .call(d3.axisLeft(y).ticks(6).tickFormat(function(d) { return formatMoney(d); }))
       .append("text")
           .attr("class", "axis-title")
           .attr("transform", "rotate(-90)")
           .attr("y", 6)
           .attr("dy", ".71em")
           .style("text-anchor", "end")
           .attr("fill", "#5D6971")
           .text("US Dollars per Year");

     
   //Tooltip
    var focus = g.append("g")
       .attr("class", "focus")
       .style("display", "none");

   focus.append("line")
       .attr("class", "x-hover-line hover-line")
       .attr("y1", 0)
       .attr("y2", height);

   focus.append("line")
       .attr("class", "y-hover-line hover-line")
       .attr("x1", width)
       .attr("x2", width);

   focus.append("circle")
       .attr("r", 7.5);

   focus.append("text")
       .attr("x", 15)
       .attr("dy", ".31em");

   svg.append("rect")
       .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
       .attr("class", "overlay")
       .attr("width", width)
       .attr("height", height)
       .on("mouseover", function() { focus.style("display", null); })
       .on("mouseout", function() { focus.style("display", "none"); })
       .on("mousemove", mousemove);

   function mousemove() {
   var x0 = x.invert(d3.mouse(this)[0]),
       i = bisectDate(data, x0, 1),
       d0 = data[i - 1],
       d1 = data[i],
       d = x0 - d0.year > d1.year - x0 ? d1 : d0;
   focus.attr("transform", "translate(" + x(d.year) + "," + y(d.yearly_min_wage) + ")");
   focus.select("text").html(function() {
        return d.year.getFullYear() + ': ' + 
            formatMoney(d.yearly_min_wage) + '\n(PT: ' +
            formatMoney(d.all_ages) + ')'; 
    });
   focus.select(".x-hover-line").attr("y2", height - y(d.yearly_min_wage));
   focus.select(".y-hover-line").attr("x2", width + width);
   }          

    //Legend symboles
    g.append("circle"
    ).attr("cx",margin.right-120)
    .attr("cy",margin.top-70)
    .attr("r", 6)
    .style("fill", "purple");

    g.append("circle")
    .attr("cx",margin.right-120)
    .attr("cy",margin.top-50)
    .attr("r", 6)
    .style("fill", "green");

    g.append("circle"
    ).attr("cx",margin.right-120)
    .attr("cy",margin.top-30)
    .attr("r", 6)
    .style("fill", "red");

    g.append("circle"
    ).attr("cx",margin.right-120)
    .attr("cy",margin.top-10)
    .attr("r", 6)
    .style("fill", "steelblue");   

    //Legend text
    g.append("text")
    .attr("x", margin.right-100)
    .attr("y", margin.top-70)
    .text("Poverty threshold for family of three")
    .attr("class", "legend")
    .attr("alignment-baseline","middle");

    g.append("text")
    .attr("x", margin.right-100)
    .attr("y", margin.top-50)
    .text("Poverty threshold for family of two")
    .attr("class", "legend")
    .attr("alignment-baseline","middle");

    g.append("text")
    .attr("x", margin.right-100)
    .attr("y", margin.top-30)
    .text("Poverty threshold for one person, any age")
    .attr("class", "legend")
    .attr("alignment-baseline","middle");

    g.append("text")
    .attr("x", margin.right-100)
    .attr("y", margin.top-10)
    .text("Salary for full-time working on minimum wage")
    .attr("class", "legend")
    .attr("alignment-baseline","middle");   
});

   //Annotation
   const annotations = [
    {
      note: {
          label: "Min. wage just at the poverty threshold",
          title: "2006",
          wrap: 150
      },
          x: 615,
          y: 210,
          dy: 40,
          dx: 10
    }
  ];

  const makeAnnotations = d3.annotation()
  .annotations(annotations);

  d3.select("svg")
  .append("g")
  .call(makeAnnotations);
};