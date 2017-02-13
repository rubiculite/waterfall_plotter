// Copyright (c) 2017 Dr. Michelle M. M. Boyce
window.addEventListener('load', function(e){
   data = [];
   num=25;
   for (i=0;i<num;i++) {
      data[i] = new mkRandomWaterFallData();
   }
   plot = new waterfallPlot(d3.select("body"),data[0]);
   index=0;
   d3.select("#event").text(index+1);
}); 

function toggleXHairs(){
   d3.select("#tgXHairs").attr("value","X-Hairs "+((plot.toggleXHairs()) ? "Off" : "On "));
}

function toggleRfiMask() {
   d3.select("#rfiMask").attr("value","RFI Mask "+((plot.toggleRfiMask())? "Off" : "On "));
}

function update() {
   index = ++index % num;
   plot.update(data[index]);
   d3.select("#tgXHairs").attr("value","X-Hairs "+((plot.isXHairsOn()) ? "Off" : "On "));
   d3.select("#rfiMask").attr("value","RFI Mask "+((plot.isRfiMaskOn())? "Off" : "On "));
   d3.select("#event").text(index+1);
}


function waterfallPlot(d3_AppendToElement,data) {

   this.wf = data;

   // geometric parameters (pixels)
   this.gMainEdge = 400; // Main plot area is square 
   this.gMiniEdge = this.gMainEdge/4; // Small-edge length of side plots
   this.gXBoxEdge = this.gMainEdge/this.wf.xBins; // Width of main plot area boxel
   this.gYBoxEdge = this.gMainEdge/this.wf.yBins; // Height of main area boxel 

   // svg container for waterfall plot
   this.svgContainer = d3_AppendToElement.append("svg").attr("width",this.gMainEdge+this.gMiniEdge+75).attr("height",this.gMainEdge+this.gMiniEdge+75);

   // This is the main waterfall plot svg container, which can be used to scale the whole thing... 
   this.gWaterfallPlotContainer = this.svgContainer.append("g").attr("class","waterfall-plot");

   // Main waterfall plot area
   this.gMainPlot = this.gWaterfallPlotContainer.append("g").attr("class","wf-main-plot").attr("transform","translate(25,"+(this.gMiniEdge+29)+")");
   this.xScale = d3.scaleLinear().domain([this.wf.xMin,this.wf.xMax]).range([0,this.gMainEdge]);
   this.yScale = d3.scaleLinear().domain([this.wf.yMin,this.wf.yMax]).range([this.gMainEdge,0]);
   this.xAxis  = d3.axisBottom(this.xScale);
   this.yAxis  = d3.axisLeft(this.yScale);
   this.iScale = d3.scaleLinear().domain([0,255]).range([0,1]);
   this.gMainPlot.append("g").attr("class","x-axis").attr("transform","translate(25,"+this.gMainEdge+")").call(this.xAxis);
   this.gMainPlot.append("g").attr("class","y-axis").attr("transform","translate(25,0)").call(this.yAxis);
   this.gMainPlot.append("line").attr("x1",25).attr("y1",0).attr("x2",this.gMainEdge+26).attr("y2",0)
      .attr("style","stroke:black;stroke-width:1");
   this.gMainPlot.append("line").attr("x1",this.gMainEdge+26).attr("y1",0).attr("x2",this.gMainEdge+26).attr("y2",this.gMainEdge)
      .attr("style","stroke:black;stroke-width:1");
   this.gMainPlot.append("text").attr("x",this.gMainEdge+7).attr("y",this.gMainEdge+30).text(this.wf.xLabel);
   this.gMainPlot.append("text").attr("x",0).attr("y",0).attr("transform","translate(-7,35) rotate(-90)").text(this.wf.yLabel);
   (function(element,xScale,yScale,wf,gXBoxEdge,gYBoxEdge){
      element.append("g").attr("class","xy-main-plot").attr("transform","translate(26,"+(-gYBoxEdge)+")")
         .selectAll("rect").data(wf.data).enter().append("rect").attr("width",gXBoxEdge).attr("height",gYBoxEdge)
         .attr("x",function(d){return xScale(d.x);}).attr("y",function(d){return yScale(d.y);})
         .style("fill",function(d){return (d.mask && wf.rfiMaskOn) ? "red" : d3.rgb(d.jy,d.jy,d.jy).toString();});
   })(this.gMainPlot,this.xScale,this.yScale,this.wf,this.gXBoxEdge,this.gYBoxEdge);

   // Top portion of waterfall plot
   this.gTopPlot = this.gWaterfallPlotContainer.append("g").attr("class","wf-top-plot").attr("transform","translate(51,29)");
   this.uScale = d3.scaleLinear().domain([0,1]).range([this.gMiniEdge,0]);
   this.uAxis  = d3.axisLeft(this.uScale).tickValues([1]);
   this.gTopPlot.append("g").attr("class","top-left-axis").call(this.uAxis);
   this.gTopPlot.append("line").attr("x1",0).attr("y1",1).attr("x2",this.gMainEdge).attr("y2",1)
      .attr("style","stroke:black;stroke-width:1");
   this.gTopPlot.append("line").attr("x1",this.gMainEdge).attr("y1",1).attr("x2",this.gMainEdge).attr("y2",this.gMiniEdge)
      .attr("style","stroke:black;stroke-width:1");
   this.gTopPlot.append("text").attr("x",0).attr("y",0).attr("transform","translate(-7,"+((this.gMiniEdge+5)/2)+") rotate(-90)").text(this.wf.iLabel);
   (function(element,wf,xScale,uScale,gXBoxEdge){
      var topLineFunc = d3.line().x(function(d,i){return xScale(wf.xValue(i))+gXBoxEdge/2;}).y(function(d,i){return uScale(d);})
         .curve(d3.curveLinear);
      element.append("g").attr("class","xy-top-plot").attr("transform","translate(1,0)")
         .append("path").attr("d",topLineFunc(wf.dataX))
         .attr("stroke","black").attr("stroke-width",1).attr("fill","none");
   })(this.gTopPlot,this.wf,this.xScale,this.uScale,this.gXBoxEdge);

   // Right portion of waterfall plot
   this.gRightPlot = this.gWaterfallPlotContainer.append("g").attr("class","wf-right-plot")
      .attr("transform","translate("+(this.gMainEdge+51)+","+(this.gMiniEdge+29)+")");
   this.rScale = d3.scaleLinear().domain([0,1]).range([0,this.gMiniEdge]);
   this.rAxis  = d3.axisTop(this.rScale).tickValues([1]);
   this.gRightPlot.append("g").attr("class","right-top-axis").call(this.rAxis);
   this.gRightPlot.append("line").attr("x1",this.gMiniEdge+1).attr("y1",0).attr("x2",this.gMiniEdge+1).attr("y2",this.gMainEdge)
      .attr("style","stroke:black;stroke-width:1");
   this.gRightPlot.append("line").attr("x1",0).attr("y1",this.gMainEdge).attr("x2",this.gMiniEdge+1).attr("y2",this.gMainEdge)
      .attr("style","stroke:black;stroke-width:1");
   this.gRightPlot.append("text").attr("x",(this.gMiniEdge-5)/2).attr("y",-5).text(this.wf.iLabel);
   (function(element,wf,rScale,yScale,gYBoxEdge){
      var rightLineFunc = d3.line().x(function(d,i){return rScale(d);}).y(function(d,i){return yScale(wf.yValue(i))-gYBoxEdge/2;})
         .curve(d3.curveLinear);
      element.append("g").attr("class","xy-right-plot").attr("transform","translate(0,-1)")
         .append("path").attr("d",rightLineFunc(wf.dataY))
         .attr("stroke","black").attr("stroke-width",1).attr("fill","none");
   })(this.gRightPlot,this.wf,this.rScale,this.yScale,this.gYBoxEdge);

   // Main plot area xhairs
   this.gXHairs = this.gWaterfallPlotContainer.append("g").attr("class","main-xhairs").attr("transform","translate(52,"+(this.gMiniEdge+29)+")");
   (function(element,gMainPlot,xScale,yScale,iScale,iLabel,gMainEdge,gMiniEdge,gXBoxEdge,gYBoxEdge){
      element.append("rect").attr("class","main-xhairs-region xhairs").attr("x",0).attr("y",0).attr("width",gMainEdge).attr("height",gMainEdge+1)
      .attr("fill","none").style("pointer-events","all")
      .on("mouseover",function(){element.selectAll("line, text").style("display",null);})
      .on("mouseout", function(){element.selectAll("line, text").style("display","none");})
      .on("mousemove", function() {
         var coords = d3.mouse(this);
         var xPixels = coords[0];
         var yPixels = coords[1];
         var x = Number(xScale.invert(xPixels)).toFixed(1);
         var y = Number(yScale.invert(yPixels)).toFixed(1);

         // Update x-hairs and annotation.
         gMainPlot.select("g.xy-main-plot").selectAll("rect")
            .filter(function(d){
               if (xScale(d.x)<=xPixels && xPixels <= xScale(d.x)+gXBoxEdge && yScale(d.y)-gYBoxEdge<=yPixels && yPixels <= yScale(d.y)) {

                  // OK, we found the rectangle under the mouse arrow, now we can get intensity value to
                  // annotate our x-hairs. That said, we must make sure the annotation remains in the
                  // main plot area...
                  //
                  var gXHairsZLabel = element.select(".main-z-xhairs");
                  if (xPixels <= gMainEdge/2 && yPixels >= gMainEdge/2) {
                     gXHairsZLabel.text(Number(iScale(d.jy)).toFixed(2)+" "+iLabel).attr("x",xPixels+10).attr("y",yPixels-10)
                        .attr("text-anchor",null).attr("alignment-baseline",null);
                  } else if (xPixels <= gMainEdge/2 && yPixels < gMainEdge/2) {
                     gXHairsZLabel.text(Number(iScale(d.jy)).toFixed(2)+" "+iLabel).attr("x",xPixels+10).attr("y",yPixels+10)
                        .attr("text-anchor",null).attr("alignment-baseline","hanging");
                  } else if (xPixels > gMainEdge/2 && yPixels < gMainEdge/2) {
                     gXHairsZLabel.text(Number(iScale(d.jy)).toFixed(2)+" "+iLabel).attr("x",xPixels-10).attr("y",yPixels+10)
                        .attr("text-anchor","end").attr("alignment-baseline","hanging");
                  } else {
                     gXHairsZLabel.text(Number(iScale(d.jy)).toFixed(2)+" "+iLabel).attr("x",xPixels-10).attr("y",yPixels-10)
                        .attr("text-anchor","end").attr("alignment-baseline",null);
                  }

                 // NB: The follow updates must be done within this if-block; otherwise, the intensiy
                 // annotation (above) will lag.

                 // OK, let's update the rest of the annotation now...
                 element.select(".main-x-xhairs-label").attr("x",xPixels).text(x>0?x:-x);
                 element.select(".main-y-xhairs-label")
                    .attr("transform","translate("+(gMainEdge+gMiniEdge+5)+","+yPixels+") rotate(90)").text(y>0?y:-y);

                 // Finally, we update the x-hairs...
                 element.selectAll(".main-x-xhairs").attr("x1",xPixels).attr("x2",xPixels);
                 element.selectAll(".main-y-xhairs").attr("y1",yPixels).attr("y2",yPixels);

                  return true;
               }
               return false;
            });
      });
      //// Need to find v4 implementaion, e.g., d3.rebind is gone (cf., https://github.com/d3/d3/blob/master/CHANGES.md#internals)
      //.call(d3.keybinding()
      //  .on('←', moveMainXHairs(d3.mouse(this)[0]-2,0))
      //  .on('↑', moveMainXHairs(0,d3.mouse(this)[1]-2))
      //  .on('→', moveMainXHairs(d3.mouse(this)[0]+2,0))
      //  .on('↓', moveMainXHairs(0,d3.mouse(this)[1]+2))
      //);
   })(this.gXHairs,this.gMainPlot,this.xScale,this.yScale,this.iScale,this.wf.iLabel,this.gMainEdge,this.gMiniEdge,this.gXBoxEdge,this.gYBoxEdge); 
   this.gXHairs.append("line").attr("class","main-x-xhairs")
      .attr("x1",this.gMainEdge/2).attr("y1",0).attr("x2",this.gMainEdge/2).attr("y2",this.gMainEdge)
      .attr("stroke","yellow").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("line").attr("class","main-x-xhairs")
      .attr("x1",this.gMainEdge/2).attr("y1",-(this.gMiniEdge-1)).attr("x2",this.gMainEdge/2).attr("y2",0)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("line").attr("class","main-y-xhairs")
      .attr("x1",0).attr("y1",this.gMainEdge/2).attr("x2",this.gMainEdge).attr("y2",this.gMainEdge/2)
      .attr("stroke","yellow").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("line").attr("class","main-y-xhairs")
      .attr("x1",this.gMainEdge).attr("y1",this.gMainEdge/2).attr("x2",this.gMainEdge+this.gMiniEdge).attr("y2",this.gMainEdge/2)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("text").attr("class","main-x-xhairs-label").attr("x",this.gMainEdge/2).attr("y",-(this.gMiniEdge+4))
      .style("text-anchor","middle").text(Number(this.xScale.invert(this.gMainEdge/2)).toFixed(1)).style("display","none");
   this.gXHairs.append("text").attr("class","main-y-xhairs-label").attr("x",0).attr("y",0)
      .style("text-anchor","middle").text(Number(this.yScale.invert(this.gMainEdge/2)).toFixed(1))
      .attr("transform","translate("+(this.gMainEdge+this.gMiniEdge+5)+","+(this.gMainEdge/2)+") rotate(90)").style("display","none");
   this.gXHairs.append("text").attr("class","main-z-xhairs").attr("x",this.gMainEdge/2).attr("y",this.gMainEdge/2).text("0")
      .style("fill","yellow").style("display","none");

   // Top graph xhairs
   this.gTopXHairs = this.gWaterfallPlotContainer.append("g").attr("class","top-xhairs").attr("transform","translate(52,29)");
   (function(element,xScale,uScale,gMainEdge,gMiniEdge){
      element.append("rect").attr("class","main-xhairs-region xhairs").attr("x",0).attr("y",0).attr("width",gMainEdge).attr("height",gMiniEdge)
         .attr("fill","none").style("pointer-events","all")
         .on("mouseover",function(){element.selectAll("line, text").style("display",null);})
         .on("mouseout", function(){element.selectAll("line, text").style("display","none");})
         .on("mousemove", function() {
            var coords = d3.mouse(this);
            var xPixels = coords[0];
            var yPixels = coords[1];
            var x = Number(xScale.invert(xPixels)).toFixed(1);
            var y = Number(uScale.invert(yPixels)).toFixed(1);
            element.selectAll(".top-x-xhairs").attr("x1",xPixels).attr("x2",xPixels);
            element.select(".top-y-xhairs").attr("y1",yPixels).attr("y2",yPixels);
            element.select(".top-x-xhairs-label").attr("x",xPixels).text(x>0?x:-x);
            element.select(".top-y-xhairs-label").attr("y",yPixels).text(y>0?y:-y);
         });
   })(this.gTopXHairs,this.xScale,this.uScale,this.gMainEdge,this.gMiniEdge);
   this.gTopXHairs.append("line").attr("class","top-x-xhairs").attr("x1",this.gMainEdge/2).attr("y1",0).attr("x2",this.gMainEdge/2).attr("y2",this.gMiniEdge)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gTopXHairs.append("line").attr("class","top-x-xhairs")
      .attr("x1",this.gMainEdge/2).attr("y1",100).attr("x2",this.gMainEdge/2).attr("y2",this.gMainEdge+this.gMiniEdge)
      .attr("stroke","yellow").attr("stroke-width",1).style("display","none");
   this.gTopXHairs.append("line").attr("class","top-y-xhairs").attr("x1",0).attr("y1",this.gMiniEdge/2).attr("x2",this.gMainEdge).attr("y2",this.gMiniEdge/2)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gTopXHairs.append("text").attr("class","top-x-xhairs-label").attr("x",this.gMainEdge/2).attr("y",-4)
      .style("text-anchor","middle").text(Number(this.xScale.invert(this.gMainEdge/2)).toFixed(1)).style("display","none");
   this.gTopXHairs.append("text").attr("class","top-y-xhairs-label").attr("x",this.gMainEdge+4).attr("y",this.gMiniEdge-4)
      .text(Number(this.uScale.invert(50)).toFixed(1)).style("display","none");

   // Right graph xhairs
   this.gRightXHairs = this.gWaterfallPlotContainer.append("g")
      .attr("class","top-xhairs").attr("transform","translate("+(this.gMainEdge+51)+","+(this.gMiniEdge+28)+")");
   (function(element,rScale,yScale,gMainEdge,gMiniEdge){
      element.append("rect").attr("class","main-xhairs-region xhairs").attr("x",0).attr("y",0).attr("width",gMiniEdge).attr("height",gMainEdge)
      .attr("fill","none").style("pointer-events","all")
      .on("mouseover",function(){element.selectAll("line, text").style("display",null);})
      .on("mouseout", function(){element.selectAll("line, text").style("display","none");})
      .on("mousemove", function() {
         var coords = d3.mouse(this);
         var xPixels = coords[0];
         var yPixels = coords[1];
         var x = Number(rScale.invert(xPixels)).toFixed(1);
         var y = Number(yScale.invert(yPixels)).toFixed(1);
         element.select(".right-x-xhairs").attr("x1",xPixels).attr("x2",xPixels);
         element.selectAll(".right-y-xhairs").attr("y1",yPixels).attr("y2",yPixels);
         element.select(".right-x-xhairs-label").attr("x",xPixels).text(x>0?x:-x);
         element.select(".right-y-xhairs-label")
           .attr("transform","translate("+(gMiniEdge+4)+","+yPixels+") rotate(90)").text(y>0?y:-y);
       });
   })(this.gRightXHairs,this.rScale,this.yScale,this.gMainEdge,this.gMiniEdge);
   this.gRightXHairs.append("line").attr("class","right-x-xhairs")
      .attr("x1",this.gMiniEdge/2).attr("y1",0).attr("x2",this.gMiniEdge/2).attr("y2",this.gMainEdge)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gRightXHairs.append("line").attr("class","right-y-xhairs")
      .attr("x1",0).attr("y1",this.gMainEdge/2).attr("x2",this.gMiniEdge).attr("y2",this.gMainEdge)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gRightXHairs.append("line").attr("class","right-y-xhairs")
      .attr("x1",-this.gMainEdge).attr("y1",this.gMainEdge/2).attr("x2",0).attr("y2",this.gMainEdge/2)
      .attr("stroke","yellow").attr("stoke-width",1).style("display","none");
   this.gRightXHairs.append("text").attr("class","right-x-xhairs-label").attr("x",54).attr("y",this.gMainEdge+4)
      .style("alignment-baseline","hanging").text(Number(this.rScale.invert(this.gMiniEdge/2)).toFixed(1)).style("display","none");
   this.gRightXHairs.append("text").attr("class","right-y-xhairs-label").attr("x",0).attr("y",0)
      .attr("text-anchor","middle").attr("transform","translate("+(this.gMiniEdge+4)+","+(this.gMainEdge/2)+") rotate(90)")
      .text(Number(this.yScale.invert(200)).toFixed(1)).style("display","none");

   // Function to toggle x-hairs on/off.
   this.toggleXHairs = function(){
      if (this.gWaterfallPlotContainer.selectAll(".xhairs").style("pointer-events")=='all') {
         this.gWaterfallPlotContainer.selectAll(".xhairs").style("pointer-events",null);
         return false;
      } else {
         this.gWaterfallPlotContainer.selectAll(".xhairs").style("pointer-events","all");
         return true;
      }
   };

   // Function to get x-hairs on/off state.
   this.isXHairsOn = function() {
      if (this.gWaterfallPlotContainer.selectAll(".xhairs").style("pointer-events")=='all') {
         return true;
      }
      return false;
   };

   // Function to update waterfall plot data areas (i.e., it assumes no scale changes).
   this.update = function (wf) {
      // Update main plot area
      this.gMainPlot.selectAll("rect").data(wf.data).style("fill",function(d){return (d.mask && wf.rfiMaskOn) ? "red" : d3.rgb(d.jy,d.jy,d.jy).toString();});

      // Update top plot area
      var topLineFunc = (function (xScale,uScale,gXBoxEdge) {
         return d3.line().x(function(d,i){return xScale(wf.xValue(i))+gXBoxEdge/2;}).y(function(d,i){return uScale(d);})
         .curve(d3.curveLinear)})(this.xScale,this.uScale,this.gXBoxEdge);
      var topPath = this.gTopPlot.select(".xy-top-plot");
      topPath.select("path").remove();
      topPath.append("path").attr("d",topLineFunc(wf.dataX)).attr("stroke","black").attr("stroke-width",1).attr("fill","none");

      // Update right plot area
      var rightLineFunc = (function(yScale,rScale,gYBoxEdge) {
         return d3.line().x(function(d,i){return rScale(d);}).y(function(d,i){return yScale(wf.yValue(i))-gYBoxEdge/2;})
         .curve(d3.curveLinear);
      })(this.yScale,this.rScale,this.gYBoxEdge);
      var rightPath = this.gRightPlot.select(".xy-right-plot");
      rightPath.select("path").remove();
      rightPath.append("path").attr("d",rightLineFunc(wf.dataY)).attr("stroke","black").attr("stroke-width",1).attr("fill","none");

      this.wf = wf;
   }

   // Function to toogle rfi mask on/off.
   this.toggleRfiMask = function() {
      if (this.wf.rfiMaskOn != true) { 
         this.gMainPlot.selectAll("rect").data(this.wf.data).style("fill",function(d){return (d.mask) ? "red" : d3.rgb(d.jy,d.jy,d.jy).toString();});
         this.wf.rfiMaskOn = true;
      } else {
         this.gMainPlot.selectAll("rect").data(this.wf.data).style("fill",function(d){return d3.rgb(d.jy,d.jy,d.jy).toString();});
         this.wf.rfiMaskOn = false;
      }
      return this.wf.rfiMaskOn;
   }

   // Function to get rif mask on/off state.
   this.isRfiMaskOn = function() {
      return this.wf.rfiMaskOn;
   }
};


//d3.keybinding = function(){
//   // Notes: http://bl.ocks.org/tmcw/4444952
//   var _keys = {
//      keys: {
//         // Left Arrow Key, or ←
//         '←': 37, left: 37, 'arrow-left': 37,
//         // Up Arrow Key, or ↑
//         '↑': 38, up: 38, 'arrow-up': 38,
//         // Right Arrow Key, or →
//         '→': 39, right: 39, 'arrow-right': 39,
//         // Up Arrow Key, or ↓
//         '↓': 40, down: 40, 'arrow-down': 40,
//      }
//   };
//
//  var event = d3.dispatch.apply(d3,d3.keys(_keys.keys));
//  function keys(selection){};
//
//  function d3_rebind(target,source,method){
//     // replaces d3.rebind
//     return function() {
//       var value = method.apply(source,arguments);
//       return value === source ? target : value;
//     };
//  }
//
//  return d3_rebind(keys,event,'on');
//};


function mkRandomWaterFallData () {

   // main parameters
   this.xMin = 0;
   this.xMax = 200;
   this.iMin="0";
   this.iMax="1";
   this.xLabel= "ms";
   this.yLabel="MHz";
   this.iLabel="Jy";
   this.yMin = 0;
   this.yMax = 800;
   this.xBins = 175; // max 256 bins
   this.yBins = 175; // max 1024 bins

   // data
   this.data = [];
   this.dataX = [];
   this.dataY = [];

   // helper functions
   this.xValue = function(bin) {return Number((this.xMax-this.xMin)*bin/this.xBins+this.xMin).toFixed(2);};
   this.yValue = function(bin) {return Number((this.yMax-this.yMin)*bin/this.yBins+this.yMin).toFixed(2);};

   // --------------------------------------------------------------
   // emulation

   // This routines emulates how the data would come after it has been upacked.
   this.iMap = (function (xBins,xMin,xMax,yBins,yMin,yMax) {
      var data = [];
      var xValue = function(bin) {return Number((xMax-xMin)*bin/xBins+xMin).toFixed(2);};
      var yValue = function(bin) {return Number((yMax-yMin)*bin/yBins+yMin).toFixed(2);};

      // Signal peak and noise generator
      var peakBds = {"min":20,"max":180,"minWidth":5,"maxWidth":20}; // peak parameterss
      var peak = Math.random() * (peakBds.max - peakBds.min) + peakBds.min; // random peak height
      var peakWidth= Math.random()*(peakBds.maxWidth - peakBds.minWidth) + peakBds.minWidth; // random peak width
      var singal = function (x) { // peak/noise signal func.
         if (peak-peakWidth/2 < x && x <= peak ) {      // lhs of peak
           return Number((1-Math.random()/5)*Math.min(255,510*(x-(peak-peakWidth/2))/peakWidth+100*Math.random())).toFixed(2);
         } else if (peak < x && x < peak+peakWidth/2) { // rhs of peak
           return Number((1-Math.random()/5)*Math.min(255,-510*(x-peak)/peakWidth+255+100*Math.random())).toFixed(2);
         }
         return Number(100*Math.random()).toFixed(2);  // random noise
      };

      // rfi mask
      var bandPars = {"spread":0.375, "minLines": 2, "maxLines": 15, "dither":0.75};
      var lines = Math.round(Math.random()*(bandPars.maxLines - bandPars.minLines) + bandPars.minLines);
      var thresh = Math.round(Math.random()*(1-bandPars.spread)*yBins);
      var stripes = (function(){
         var stripes=[]; 
         for (var i=0;i<lines;i++) {stripes[i]=Math.round(Math.random()*bandPars.spread*yBins+thresh);}
         return stripes
      })();
      var rfiMask = function(col) {
         for (var i=0;i<lines;i++) {
            if (col == stripes[i]) {
               return (Math.random() < bandPars.dither) ? 1 : 0;
            }
         }
         return 0;
      }

      for (var row=0; row < yBins; row++) {
         for (var col=0; col < xBins; col++) {
            data[row*xBins+col] = {"x": xValue(col),"y": yValue(row),"jy": singal(xValue(col)), "mask": rfiMask(row)};
         }
      }
      return {"xBins":xBins, "xMin":xMin, "xMax":xMax, "yBins":yBins, "yMin":yMin, "yMax":yMax, "data":data};
   })(this.xBins,this.xMin,this.xMax,this.yBins,this.yMin,this.yMax);
// TA-DO: Compatification Code: i.e., map 1024x256 -> 175x175
//     (256,this.xMin,this.xMax,1024,this.yMin,this.yMax);
//
//   this.compactify = function (iMap,tgXBins,tgYBins) {
//      if (iMap.xBins <= tgXBins || iMap.yBins <= tgYBins) {return iMap;}
//      var tgCol = function (col) {return Math.floor((tgXBins-1)*col/(iMap.xBins-1));}
//      var tgRow = function (row) {return Math.floor((tgYBins-1)*col/(iMap.yBins-1));}
//      var xValue = function(bin) {return Number((iMap.xMax-iMap.xMin)*bin/tgXBins+iMap.xMin).toFixed(2);};
//      var yValue = function(bin) {return Number((iMap.yMax-iMap.yMin)*bin/tgYBins+iMap.yMin).toFixed(2);};
//      var tgData = [];
//      var cnt = [];
//      for (var row=0; row < tgYBins; row++) {
//         for (var col=0; col < tgXBins; col++) {
//            tgData[row*tgXBins+col] = {"x": xValue(col),"y": yValue(row),"jy": 0};
//            cnt[row*tgXBins+col]=0;
//         }
//      }
//      for (var row=0; row < iMap.yBins; row++) {
//         for (var col=0; col < iMap.xBins; col++) {
//            tgData[tgRow(row)*tgXBins+tgCol(col)].jy += iMap[row*iMap.xBins+col];
//            cnt[tgRow(row)*tgXBins+tgCol(col)]+=1;
//         }
//      }
//      for (var row=0; row < tgYBins; row++) {
//         for (var col=0; col < tgXBins; col++) {
//            tgData[row*tgXBins+col].jy /= (cnt[row*tgXBins+col]>0) ? cnt[row*tgXBins+col] : 1;
//         }
//      }
//      return tgData; 
//   }
//
//   this.data=this.compactify(this.iMap.data,this.xBins,this.yBins);

   // --------------------------------------------------------------
   // Display data...

   // Main plot area
   this.data=this.iMap.data;
   this.rfiMaskOn = false;

   // Top plot area
   this.dataX = (function (xBins,yBins,data) {
      var maxDataX=0;
      var dataX=[];
      for (var col=0; col<xBins;col++){dataX[col]=0;}
      for (row=0; row < yBins; row++) {
         for (col=0; col < xBins; col++) {
            dataX[col]+=parseFloat(data[row*xBins+col].jy);
         }
      }
      for (col=0; col<xBins;col++){if(dataX[col]>maxDataX){maxDataX=dataX[col];}}
      maxDataX*=(1+2*Math.random()/3);
      if (maxDataX>0) {for (col=0; col<xBins;col++){dataX[col]=Number(dataX[col]/maxDataX).toFixed(3);}}
      return dataX;
   })(this.xBins,this.yBins,this.data);

   // Right plot area
   this.dataY = (function (xBins,yBins,data) {
      var maxDataY=0;
      var dataY=[];
      for (var row=0; row<yBins;row++){dataY[row]=0;}
      for (row=0; row < yBins; row++) {
         for (col=0; col < xBins; col++) {
            dataY[row]+=parseFloat(data[row*xBins+col].jy);
         }
      }
      for (row=0; row<yBins;row++){if(dataY[row]>maxDataY){maxDataY=dataY[row];}}
      maxDataY*=(1+2*Math.random()/3);
      if (maxDataY>0) {for (row=0; row<yBins;row++){dataY[row]=Number(dataY[row]/maxDataY).toFixed(3);}}
      return dataY;
   })(this.xBins,this.yBins,this.data);
}
