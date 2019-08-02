function fight_for_fifteen() {
    //clear
    d3.select("svg").selectAll("*").remove();

    d3.select("#slide_1").attr("class", "page-item");
    d3.select("#slide_2").attr("class", "page-item active");
    d3.select("#slide_3").attr("class", "page-item");
    d3.select("#slide_4").attr("class", "page-item");
    d3.select("#slide_5").attr("class", "page-item");

    var headline = 'Value of $15 since inception of "Fight for 15" movement';
    var text = `\Fight for 15\" is a movement begun by restaurant workers in 2012, whose stated goal is a federal 
    minimum value of $15 per hour. Now that the bill implementing this change has finally passed the House, however, 
    the buying power of that $15 per hour has decreased from what it was worth in 2012 when the movement was 
    started, due to inflation and the rising cost of living.` 
    var source = "Source: <a target='_blank' class='btn btn-link' href='http://www.in2013dollars.com/us/inflation/2006?amount=5.15'>CPI Inflation Calculator</a>";

    d3.select('#textpart').html(text);
    d3.select('#headline').html(headline);        
    d3.select('#source').html(source);
    
    var parseTime = d3.timeParse("%Y")
        bisectDate = d3.bisector(function(d) { return d.year; }).left;
        formatMoney = function(d) { 
            return '$' + d.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'); 
        };

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    
    var line = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.value); });
    
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
    d3.json("fight-for-15-data.json", function(error, data) {
        if (error) throw error;
        
        data.forEach(function(d) {
          d.year = parseTime(d.year);
          d.value = +d.value;
        });
    
        x.domain(d3.extent(data, function(d) { return d.year; }));
        y.domain(d3.extent(data, function(d) { return d.value; }));
    
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
    
        g.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    
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
          focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
          focus.select("text").text(function() {
              var currYear = d.year.getFullYear();
              return currYear + ': ' + formatMoney(d.value); 
            });
          focus.select(".x-hover-line").attr("y2", height - y(d.value));
          focus.select(".y-hover-line").attr("x2", width + width);
        }
    });

   //Annotation
   const annotations = [
    {
      note: {
          label: "10.3% loss in value",
          title: "2012-2019",
          wrap: 150
      },
          x: 320,
          y: 170,
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