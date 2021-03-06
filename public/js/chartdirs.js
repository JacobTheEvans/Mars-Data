var app = angular.module("chartdirs",[]);

app.directive("chart",function($window) {
  return {
    restrict: "EA",
    template: "<svg id='chart-save' height='600px'></svg>",
    link: function(scope, elem, attrs) {
      var dataToPlot = scope[attrs.chartData];

      var xLabel = attrs.xlabel;
      var yLabel = attrs.ylabel;
      var color = attrs.color;

      var pathClass = "path";
      var d3 = $window.d3;
      var rawSvg = elem.find("svg")[0];
      var svg = d3.select(rawSvg);

      var chartData = {
        width: 1000,
        height: $(".mdl-layout__content").height() - 40
      };

      $("#chart-save").height($(".mdl-layout__content").height());

    var margin = {top: 40, right: 20, bottom: 40, left: 70},
    width = parseInt(rawSvg.parentElement.clientWidth, 10),
    width = width - margin.left - margin.right;

    var height = chartData.height - margin.top - margin.bottom;

    var chart = svg.append("g")
        .classed("display", true)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dateParser = d3.time.format("%Y/%m/%d").parse;

    var x = d3.time.scale()
        .domain(d3.extent(dataToPlot, function(d) {
          var date = dateParser(d.date);
          return date;
        }))
        .range([0,width])

    var y = d3.scale.linear()
        .domain([d3.min(dataToPlot, function(d) {
          return d.value;
        }), d3.max(dataToPlot, function(d) {
          return d.value;
        })])
        .range([height,0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(6);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .x(function(d) {
          var date = dateParser(d.date);
          return x(date);
        })
        .y(function(d) {
          return y(d.value);
        })
        .interpolate("cardinal");

    var area = d3.svg.area()
        .x(function(d) {
          var date = dateParser(d.date);
          return x(date);
        })
        .y0(height)
        .y1(function(d) {
          return y(d.value);
        })
        .interpolate("cardinal");

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var plot = function(params) {
        //axes
        this.append("g")
            .classed("x axis",true)
            .attr("transform","translate(0,"+ height +")")
            .call(params.axis.x);
        this.append("g")
            .classed("y axis", true)
            .attr("transform", "translate(0,0)")
            .call(params.axis.y);
        //enter()
        var colorChange = this.selectAll(".area")
            .data([params.data])
            .enter()
              .append("path")
              .classed("area",true);
        if(color == "Hot") {
          colorChange.classed("hot",true);
        } else if(color == "Cold") {
          colorChange.classed("cold",true);
        } else if(color == "Pressure") {
          colorChange.classed("pressure",true);
        }

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        this.selectAll(".point")
            .data(params.data)
            .enter()
              .append("circle")
              .classed("point", true)
              .attr("r", 5)
              .append("title").text(function(d) {
                return d.date.replace(/\-/,"/");
              });
        this.select(".y.axis")
            .append("text")
          	.attr("x",0)
          	.attr("y",0)
          	.style("text-anchor","middle")
          	.attr("transform","translate(" + (-margin.left + 15 )+","+ height / 2 +") rotate(-90)")
          	.text(yLabel);

        //update
        this.selectAll(".area")
            .attr("d", function(d) {
              return area(d);
            })
        this.selectAll(".point")
            .attr("cx", function(d) {
              var date = dateParser(d.date);
              return x(date);
            })
            .attr("cy", function(d) {
              return y(d.value);
            })
            .on("click", function() {
              window.location.replace("/#/date/" + d3.select(this)[0][0].innerHTML.replace(/<\/?[^>]+(>|$)/g, "").replace(/\//g, "-"));
            })
            .on("mouseover", function(d) {
                  div.transition()
                      .duration(200)
                      .style("opacity", .9);
                  div.html("Date:<br>" + d.date.replace(/\//g, "-") + "<br/>")
                      .style("left", (d3.event.pageX) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
                  })
              .on("mouseout", function(d) {
                  div.transition()
                      .duration(500)
                      .style("opacity", 0);
              });
        //exit()
        this.selectAll(".area")
            .data([params.data])
            .exit()
            .remove();
        this.selectAll(".point")
            .data(params.data)
            .exit()
            .remove();
    };

    plot.call(chart,  {
      data: dataToPlot,
      axis: {
        x: xAxis,
        y: yAxis
      }
    });

    scope.resize = function(width) {
        color = attrs.color;
        rawSvg.style.width = width;
        width = width - margin.left - margin.right - 20;

        dateParser = d3.time.format("%Y/%m/%d").parse;

        x = d3.time.scale()
            .domain(d3.extent(dataToPlot, function(d) {
              var date = dateParser(d.date);
              return date;
            }))
            .range([0,width])

        y = d3.scale.linear()
            .domain([d3.min(dataToPlot, function(d) {
              return d.value;
            }), d3.max(dataToPlot, function(d) {
              return d.value;
            })])
            .range([height,0]);

        xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(6);

        yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        area = d3.svg.area()
            .x(function(d) {
              var date = dateParser(d.date);
              return x(date);
            })
            .y0(height)
            .y1(function(d) {
              return y(d.value);
            })
            .interpolate("cardinal");

        d3.selectAll(".area").remove();
        d3.selectAll("path").remove();
        d3.selectAll(".point").remove();
        d3.selectAll(".tick").remove();
        d3.selectAll(".x.axis").remove();
        d3.selectAll(".y.axis").remove();
        d3.selectAll(".display").remove();
        d3.selectAll(".tooltip").remove();
        d3.selectAll(".chart").remove();
        d3.selectAll(".gridline").remove();

        area = d3.svg.area()
            .x(function(d) {
              var date = dateParser(d.date);
              return x(date);
            })
            .y0(height)
            .y1(function(d) {
              return y(d.value);
            });

        div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        chart = svg.append("g")
            .classed("display", true)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        plot.call(chart,  {
          data: dataToPlot,
          axis: {
            x: xAxis,
            y: yAxis
          }
        });

        d3.select(".x.axis text").remove();
        d3.select(".x.axis")
        .append("text")
        .attr("x", 0)
        .attr("y",0)
        .style("text-anchor","middle")
        .attr("transform","translate("+ (width / 2 )+", " + (margin.bottom - 5) +")")
        .text(xLabel);
      }

      angular.element($window).bind('resize', function() {
        var rawSvg = elem.find("svg")[0];
        var svg = d3.select(rawSvg);
        var width = rawSvg.parentElement.clientWidth
        scope.resize(width);
        scope.$apply();
      });

      var width = rawSvg.parentElement.clientWidth - 20;
      scope.resize(width);

      attrs.$observe("xlabel", function(change) {
        var rawSvg = elem.find("svg")[0];
        var svg = d3.select(rawSvg);
        var width = rawSvg.parentElement.clientWidth - 20;
        xLabel = change;
        scope.resize(width);
      });

      attrs.$observe("ylabel", function(change) {
        var rawSvg = elem.find("svg")[0];
        var svg = d3.select(rawSvg);
        var width = rawSvg.parentElement.clientWidth - 20;
        yLabel = change;
        scope.resize(width);
      });

      attrs.$observe("type", function(change) {
        var rawSvg = elem.find("svg")[0];
        var svg = d3.select(rawSvg);
        var width = rawSvg.parentElement.clientWidth - 20;
        type = change;
        scope.resize(width);
      });

      scope.$watch(attrs.chartData, function(newValue, oldValue) {
        if (newValue) {
          dataToPlot = newValue;
          var rawSvg = elem.find("svg")[0];
          var svg = d3.select(rawSvg);
          var width = rawSvg.parentElement.clientWidth - 20;
          scope.resize(width);
        }
      }, true);

    }
  }
});

app.directive("chartpie",function($window) {
  return {
    restrict: "EA",
    template: "<svg id='chart-save' height='600px' width='600px'></svg>",
    link: function(scope, elem, attrs) {
      var data = scope[attrs.chartData];

      var pathClass = "path";
      var d3 = $window.d3;
      var rawSvg = elem.find("svg")[0];
      var svg = d3.select(rawSvg);

      var chartData = {
        width: 1000,
        height: $(".cont").height() - 40
      };

      $("#chart-save").height($(".cont").height());
      var w = $(".cont").width();
      var h = $(".cont").height() - 40;
      var r;
      var color = ["#f97120","#9fabb7","#ffac33","#7f1a05"];

      var plot = function() {
        var currentIndex = 0;
        var width = $(".cont").width();
        var height =  $(".cont").height() - 40;
        w = Math.min(width, height);
        h = Math.min(width, height);
        r = Math.min(width, height) /2;
        var colorCounter = 0;
        var vis = svg
        .data([data])
        .attr("width",w)
        .attr("height",h)
        .append("g")
        .attr("transform","translate(" + width/2 + "," + height/2 + ")");

        var pie = d3.layout.pie()
        .value(function(d) {
          return d.value;
        });

        var translates = [];

        var arc = d3.svg.arc().outerRadius(r);

        var arcs = vis.selectAll("g.slice")
        .data(pie)
        .enter()
        .append("g")
        .attr("class","slice");

        arcs.append("path")
        .attr("fill", function(d,i) {
          if(colorCounter >= color.length) {
            var temp = colorCounter;
            colorCounter = 0;
            return color[temp];
          } else {
            var temp = colorCounter;
            colorCounter++;
            return color[temp];
          }
        })
        .attr("d",function(d) {
          return arc(d);
        });
        var text = arcs.append("text")
        .attr("transform", function(d) {
          d.innerRadius = 0;
          d.outerRadius = r;
          translates.push(arc.centroid(d));
          return "translate(" + (arc.centroid(d)[0] - 10).toString() +"," + (arc.centroid(d)[1] - 35).toString() + ")";})
          .attr("text-anchor","middle")
          .text(function(d,i) {
            currentIndex = i;
            return data[i].label;
          })
          .classed("pie-text",true);

          var text = arcs.append("text")
          .attr("transform", function(d) {
            d.innerRadius = 0;
            d.outerRadius = r;
            return "translate(" + (arc.centroid(d)[0] - 10).toString() +"," + (arc.centroid(d)[1] - 10).toString() + ")";})
            .attr("text-anchor","middle")
            .text(function(d,i) {
              currentIndex = i;
              return data[i].sub;
            })
            .classed("pie-text",true);

            for(var i = 0; i < translates.length; i++) {
              arcs.append("foreignObject")
              .attr("transform","translate(" + (translates[i][0] -15).toString() +"," + (translates[i][1] + 7).toString() + ")")
              .append("xhtml")
              .style("font-size","30px")
              .html("<i class='color-white " + data[i].icon + "'></i>");
            }

      }
      plot();

      var resize = function() {
        width = $(".cont").width();
        rawSvg.style.width = width;
        d3.selectAll("#chart-save").selectAll("*").remove();
        plot();
      };
      resize();

      angular.element($window).bind('resize', function() {
        resize();
        scope.$apply();
      });

      scope.$watch(attrs.chartData, function(newValue, oldValue) {
        if (newValue) {
          dataToPlot = newValue;
          resize();
        }
      }, true);
    }
  }
});
