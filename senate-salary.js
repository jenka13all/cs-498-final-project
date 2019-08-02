function senate_salary() {
    //clear
    d3.select("svg").selectAll("*").remove();

    d3.select("#slide_1").attr("class", "page-item");
    d3.select("#slide_2").attr("class", "page-item");
    d3.select("#slide_3").attr("class", "page-item");
    d3.select("#slide_4").attr("class", "page-item");
    d3.select("#slide_5").attr("class", "page-item active");

    var headline = 'COLA: Cost of Living Adjustment on Senate Salaries';
    var text = `Although the “Raise the Wage Act” for a $15 an hour federal minimum wage has passed the House, 
    it has yet to pass the Senate in order to go into effect. The Senate’s own federally-determined salaries are 
    automatically adjusted each year to compensate for the rising cost of living unless the Senate votes 
    against the adjustment for that year.
    <p></p>
    During the 10-year federal minimum wage stagnation between 1997 and 2007, 
    the Senate allowed their own salaries to be increased to the rising costs of living no less than nine times.`;
    var source = "Source: <a target='_blank' class='btn btn-link' href='https://www.senate.gov/artandhistory/history/common/briefing/senate_salaries.htm'>United States Senate: History</a>";

    d3.select('#textpart').html(text);
    d3.select('#headline').html(headline);        
    d3.select('#source').html(source); 

    var parseTime = d3.timeParse("%Y")
        bisectDate = d3.bisector(function(d) { return d.year; }).left
        formatMoney = function(d) { 
            return '$' + d.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'); 
        };

    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    var line = d3.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.wage); });

    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.json("senate-salary-data.json", function(error, data) {
        if (error) throw error;

        data.forEach(function(d) {
            d.year = parseTime(d.year);
            d.wage = +d.wage;
        });

        x.domain(d3.extent(data, function(d) { return d.year; }));
        y.domain(d3.extent(data, function(d) { return d.wage; }));

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(6).tickFormat(function(d) { 
                return formatMoney(d);
            }))
        .append("text")
            .attr("class", "axis-title")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .attr("fill", "#5D6971")
            .text("US Dollars per Year");

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
        focus.attr("transform", "translate(" + x(d.year) + "," + y(d.wage) + ")");
        focus.select("text").text(function() {
            var currYear = d.year.getFullYear();
            if (currYear > 2018) {
                return currYear + ': ?';
            } else {
                return currYear + ': ' + formatMoney(d.wage);
            } 
            });
        focus.select(".x-hover-line").attr("y2", height - y(d.wage));
        focus.select(".y-hover-line").attr("x2", width + width);
        }
    });

       //Annotation
   const annotations = [
    {
      note: {
          label: "Own salary raised 9 times",
          title: "1997-2007",
          wrap: 200
      },
          x: 585,
          y: 150,
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
