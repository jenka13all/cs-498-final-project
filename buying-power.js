function buying_power() {
    //clear
    d3.select("svg").selectAll("*").remove();

    d3.select("#slide_1").attr("class", "page-item");
    d3.select("#slide_2").attr("class", "page-item");
    d3.select("#slide_3").attr("class", "page-item active");
    d3.select("#slide_4").attr("class", "page-item");
    d3.select("#slide_5").attr("class", "page-item");

    var headline = 'Falling buying power of federal minimum wage';
    var text = `In fact, the buying power of the federal minimum wage has steadily been decreasing over time since 
    1968 at its highest point. In other words, federal minimum wage has become worth LESS over time.
    <p></p>
    Technically, minimum wage earners in 2019 are now earning about the same as they did in 2007, two years before the
    last time the minimum wage was raised.`;
    var source = "Source: <a target='_blank' class='btn btn-link' href='http://www.in2013dollars.com/us/inflation/2006?amount=5.15'>CPI Inflation Calculator</a>";

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

   // minimum wage
   var min_wage_line = d3.line()
       .x(function(d) { return x(d.year); })
       .y(function(d) { return y(d.wage); });

   // equivalent value in 2019
   var value_2019_line = d3.line()
       .x(function(d) { return x(d.year); })
       .y(function(d) { return y(d.value2019); });

   var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   // Get the data
   d3.csv("wage-buying-power.csv", function(error, data) {
       if (error) throw error;

       // format the data
       data.forEach(function(d) {
           d.year = parseTime(d.year);
           d.wage = +d.wage;
           d.value2019 = +d.value2019;
       });

       // Scale the range of the data
       x.domain(d3.extent(data, function(d) { return d.year; }));
       y.domain([0, d3.max(data, function(d) {
           return Math.max(d.wage, d.value2019); })]);

       // Add the min_wage_line path.
       g.append("path")
           .data([data])
           .attr("class", "line")
           .attr("d", min_wage_line);

       // Add the value_2019_linepath.
       g.append("path")
           .data([data])
           .attr("class", "line")
           .style("stroke", "red")
           .attr("d", value_2019_line);

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
           .text("Value in US Dollars");
    
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
   focus.attr("transform", "translate(" + x(d.year) + "," + y(d.wage) + ")");
   focus.select("text").html(function() {
       var currYear = d.year.getFullYear();
       if (currYear > 2018) {
           return currYear + ': $7.25';
       } else {
           return currYear + ': ' + formatMoney(d.wage) + ' (equiv. to ' + formatMoney(d.value2019) + ')'; 
       } 
       });
   focus.select(".x-hover-line").attr("y2", height - y(d.wage));
   focus.select(".y-hover-line").attr("x2", width + width);
   }

    //Legend
    g.append("circle"
    ).attr("cx",margin.right-120)
    .attr("cy",margin.top-70)
    .attr("r", 6)
    .style("fill", "red");

    g.append("circle")
    .attr("cx",margin.right-120)
    .attr("cy",margin.top-50)
    .attr("r", 6)
    .style("fill", "steelblue");

    g.append("text")
    .attr("x", margin.right-100)
    .attr("y", margin.top-70)
    .text("Equivalent buying power today")
    .attr("class", "legend")
    .attr("alignment-baseline","middle");

    g.append("text")
    .attr("x", margin.right-100)
    .attr("y", margin.top-50)
    .text("Federal minimum wage")
    .attr("class", "legend")
    .attr("alignment-baseline","middle");
   });


   //Annotation
   const annotations = [
      {
        note: {
            label: "$1.60 worth $11.78",
            title: "1968 vs. 2019",
            wrap: 250
        },
            x: 370,
            y: 50,
            dy: 5,
            dx: 20,
      },
      {
        note: {
            label: "$5.85 worth $7.23",
            title: "2007 vs. 2019",
            wrap: 250
        },
            x: 650,
            y: 255,
            dy: 40,
            dx: 10,
      }
    ];

    const makeAnnotations = d3.annotation()
    .annotations(annotations);

    d3.select("svg")
    .append("g")
    .call(makeAnnotations);

};
