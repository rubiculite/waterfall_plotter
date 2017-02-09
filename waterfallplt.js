window.addEventListener('load', function(e){
   plot = new waterfallPlot(d3.select("body"));
}); 

function waterfallPlot(d3_AppendToElement) {

   this.wf = new mkRandomWaterFallData();

   // svg container for waterfall plot
   this.svgContainer = d3_AppendToElement.append("svg").attr("width",575).attr("height",600);

   // This is the main waterfall plot svg container, which can be used to scale the whole thing... 
   this.gWaterfallPlotContainer = this.svgContainer.append("g").attr("class","waterfall-plot");

   // Main waterfall plot area
   this.gMainEdge = 400;
   this.gXBoxEdge = this.gMainEdge/this.wf.xBins;
   this.gYBoxEdge = this.gMainEdge/this.wf.yBins;
   this.gMainPlot = this.gWaterfallPlotContainer.append("g").attr("class","wf-main-plot").attr("transform","translate(25,129)");
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
      element.append("g").attr("class","xy-main-plot").attr("transform","translate(26,-2)")
         .selectAll("rect").data(wf.data).enter().append("rect").attr("width",gXBoxEdge).attr("height",gYBoxEdge)
         .attr("x",function(d){return xScale(d.x);}).attr("y",function(d){return yScale(d.y);})
         .style("fill",function(d){return d3.rgb(d.jy,d.jy,d.jy).toString();});
   })(this.gMainPlot,this.xScale,this.yScale,this.wf,this.gXBoxEdge,this.gYBoxEdge);

   // Top portion of waterfall plot
   this.gTopPlot = this.gWaterfallPlotContainer.append("g").attr("class","wf-top-plot").attr("transform","translate(51,29)");
   this.uScale = d3.scaleLinear().domain([0,1]).range([100,0]);
   this.uAxis  = d3.axisLeft(this.uScale).tickValues([1]);
   this.gTopPlot.append("g").attr("class","top-left-axis").call(this.uAxis);
   this.gTopPlot.append("line").attr("x1",0).attr("y1",1).attr("x2",this.gMainEdge).attr("y2",1)
      .attr("style","stroke:black;stroke-width:1");
   this.gTopPlot.append("line").attr("x1",this.gMainEdge).attr("y1",1).attr("x2",this.gMainEdge).attr("y2",100)
      .attr("style","stroke:black;stroke-width:1");
   this.gTopPlot.append("text").attr("x",0).attr("y",0).attr("transform","translate(-7,50) rotate(-90)").text(this.wf.iLabel);
   (function(element,wf,xScale,uScale){
      var topLineFunc = d3.line().x(function(d,i){return xScale(wf.xValue(i));}).y(function(d,i){return uScale(d);})
         .curve(d3.curveLinear);
      element.append("g").attr("class","xy-top-plot").attr("transform","translate(1,0)")
         .append("path").attr("d",topLineFunc(wf.dataX))
         .attr("stroke","black").attr("stroke-width",1).attr("fill","none");
   })(this.gTopPlot,this.wf,this.xScale,this.uScale);

   // Right portion of waterfall plot
   this.gRightPlot = this.gWaterfallPlotContainer.append("g").attr("class","wf-right-plot")
      .attr("transform","translate("+(this.gMainEdge+51)+",129)");
   this.rScale = d3.scaleLinear().domain([0,1]).range([0,100]);
   this.rAxis  = d3.axisTop(this.rScale).tickValues([1]);
   this.gRightPlot.append("g").attr("class","right-top-axis").call(this.rAxis);
   this.gRightPlot.append("line").attr("x1",101).attr("y1",0).attr("x2",101).attr("y2",this.gMainEdge)
      .attr("style","stroke:black;stroke-width:1");
   this.gRightPlot.append("line").attr("x1",0).attr("y1",this.gMainEdge).attr("x2",101).attr("y2",this.gMainEdge)
      .attr("style","stroke:black;stroke-width:1");
   this.gRightPlot.append("text").attr("x",45).attr("y",-5).text(this.wf.iLabel);
   (function(element,wf,rScale,yScale){
      var rightLineFunc = d3.line().x(function(d,i){return rScale(d);}).y(function(d,i){return yScale(wf.yValue(i));})
         .curve(d3.curveLinear);
      element.append("g").attr("class","xy-right-plot").attr("transform","translate(0,-1)")
         .append("path").attr("d",rightLineFunc(wf.dataY))
         .attr("stroke","black").attr("stroke-width",1).attr("fill","none");
   })(this.gRightPlot,this.wf,this.rScale,this.yScale);

   // Main plot area xhairs
   this.gXHairs = this.gWaterfallPlotContainer.append("g").attr("class","main-xhairs").attr("transform","translate(52,129)");
   (function(element,gMainPlot,xScale,yScale,iScale,iLabel,gMainEdge){
      element.append("rect").attr("class","main-xhairs-region").attr("x",0).attr("y",0).attr("width",gMainEdge).attr("height",gMainEdge+1)
      .attr("fill","none").style("pointer-events","all")
      .on("mouseover",function(){element.selectAll("line, text").style("display",null);})
      .on("mouseout", function(){element.selectAll("line, text").style("display","none");})
      .on("mousemove", function() {
         var coords = d3.mouse(this);
         var xPixels = coords[0];
         var yPixels = coords[1];
         var x = Number(xScale.invert(xPixels)).toFixed(1);
         var y = Number(yScale.invert(yPixels)).toFixed(1);
         element.selectAll(".main-x-xhairs").transition().duration(10).attr("x1",xPixels).attr("x2",xPixels);
         element.selectAll(".main-y-xhairs").transition().duration(10).attr("y1",yPixels).attr("y2",yPixels);
         element.select(".main-x-xhairs-label").transition().duration(10).attr("x",xPixels).text(x>0?x:-x);
         element.select(".main-y-xhairs-label").transition().duration(10)
            .attr("transform","translate(505,"+yPixels+") rotate(90)").text(y>0?y:-y);

         // This is for setting the value of the intensity -- tricky...
         gMainPlot.select("g.xy-main-plot").selectAll("rect")
            .filter(function(d){
               if (xScale(d.x)<=xPixels && xPixels < xScale(d.x)+2 && yScale(d.y)<=yPixels && yPixels < yScale(d.y)+2) {
                  var gXHairsZLabel = element.select(".main-z-xhairs").transition().duration(10);
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
   })(this.gXHairs,this.gMainPlot,this.xScale,this.yScale,this.iScale,this.wf.iLabel,this.gMainEdge); 
   this.gXHairs.append("line").attr("class","main-x-xhairs")
      .attr("x1",this.gMainEdge/2).attr("y1",0).attr("x2",this.gMainEdge/2).attr("y2",this.gMainEdge)
      .attr("stroke","yellow").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("line").attr("class","main-x-xhairs")
      .attr("x1",this.gMainEdge/2).attr("y1",-99).attr("x2",this.gMainEdge/2).attr("y2",0)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("line").attr("class","main-y-xhairs")
      .attr("x1",0).attr("y1",this.gMainEdge/2).attr("x2",this.gMainEdge).attr("y2",this.gMainEdge/2)
      .attr("stroke","yellow").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("line").attr("class","main-y-xhairs")
      .attr("x1",this.gMainEdge).attr("y1",this.gMainEdge/2).attr("x2",this.gMainEdge+100).attr("y2",this.gMainEdge/2)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("text").attr("class","main-x-xhairs-label").attr("x",this.gMainEdge/2).attr("y",-104)
      .style("text-anchor","middle").text(Number(this.xScale.invert(this.gMainEdge/2)).toFixed(1)).style("display","none");
   this.gXHairs.append("text").attr("class","main-y-xhairs-label").attr("x",0).attr("y",0)
      .style("text-anchor","middle").text(Number(this.yScale.invert(this.gMainEdge/2)).toFixed(1))
      .attr("transform","translate("+(this.gMainEdge+105)+","+(this.gMainEdge/2)+") rotate(90)").style("display","none");
   this.gXHairs.append("text").attr("class","main-z-xhairs").attr("x",this.gMainEdge/2).attr("y",this.gMainEdge/2).text("0")
      .style("fill","yellow").style("display","none");

   // Top graph xhairs
   this.gTopXHairs = this.gWaterfallPlotContainer.append("g").attr("class","top-xhairs").attr("transform","translate(52,29)");
   (function(element,xScale,uScale,gMainEdge){
      element.append("rect").attr("class","main-xhairs-region").attr("x",0).attr("y",0).attr("width",gMainEdge).attr("height",100)
         .attr("fill","none").style("pointer-events","all")
         .on("mouseover",function(){element.selectAll("line, text").style("display",null);})
         .on("mouseout", function(){element.selectAll("line, text").style("display","none");})
         .on("mousemove", function() {
            var coords = d3.mouse(this);
            var xPixels = coords[0];
            var yPixels = coords[1];
            var x = Number(xScale.invert(xPixels)).toFixed(1);
            var y = Number(uScale.invert(yPixels)).toFixed(1);
            element.selectAll(".top-x-xhairs").transition().duration(10).attr("x1",xPixels).attr("x2",xPixels);
            element.select(".top-y-xhairs").transition().duration(10).attr("y1",yPixels).attr("y2",yPixels);
            element.select(".top-x-xhairs-label").transition().duration(10).attr("x",xPixels).text(x>0?x:-x);
            element.select(".top-y-xhairs-label").transition().duration(10).attr("y",yPixels).text(y>0?y:-y);
         });
   })(this.gTopXHairs,this.xScale,this.uScale,this.gMainEdge);
   this.gTopXHairs.append("line").attr("class","top-x-xhairs").attr("x1",this.gMainEdge/2).attr("y1",0).attr("x2",this.gMainEdge/2).attr("y2",100)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gTopXHairs.append("line").attr("class","top-x-xhairs")
      .attr("x1",this.gMainEdge/2).attr("y1",100).attr("x2",this.gMainEdge/2).attr("y2",this.gMainEdge+100)
      .attr("stroke","yellow").attr("stroke-width",1).style("display","none");
   this.gTopXHairs.append("line").attr("class","top-y-xhairs").attr("x1",0).attr("y1",50).attr("x2",this.gMainEdge).attr("y2",50)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gTopXHairs.append("text").attr("class","top-x-xhairs-label").attr("x",this.gMainEdge/2).attr("y",-4)
      .style("text-anchor","middle").text(Number(this.xScale.invert(this.gMainEdge/2)).toFixed(1)).style("display","none");
   this.gTopXHairs.append("text").attr("class","top-y-xhairs-label").attr("x",this.gMainEdge+4).attr("y",46)
      .text(Number(this.uScale.invert(50)).toFixed(1)).style("display","none");

   // Right graph xhairs
   this.gRightXHairs = this.gWaterfallPlotContainer.append("g")
      .attr("class","top-xhairs").attr("transform","translate("+(this.gMainEdge+51)+",128)");
   (function(element,rScale,yScale,gMainEdge){
      element.append("rect").attr("class","main-xhairs-region").attr("x",0).attr("y",0).attr("width",100).attr("height",gMainEdge)
      .attr("fill","none").style("pointer-events","all")
      .on("mouseover",function(){element.selectAll("line, text").style("display",null);})
      .on("mouseout", function(){element.selectAll("line, text").style("display","none");})
      .on("mousemove", function() {
         var coords = d3.mouse(this);
         var xPixels = coords[0];
         var yPixels = coords[1];
         var x = Number(rScale.invert(xPixels)).toFixed(1);
         var y = Number(yScale.invert(yPixels)).toFixed(1);
         element.select(".right-x-xhairs").transition().duration(10).attr("x1",xPixels).attr("x2",xPixels);
         element.selectAll(".right-y-xhairs").transition().duration(10).attr("y1",yPixels).attr("y2",yPixels);
         element.select(".right-x-xhairs-label").transition().duration(10).attr("x",xPixels).text(x>0?x:-x);
         element.select(".right-y-xhairs-label").transition().duration(10)
           .attr("transform","translate(104,"+yPixels+") rotate(90)").text(y>0?y:-y);
       });
   })(this.gRightXHairs,this.rScale,this.yScale,this.gMainEdge);
   this.gRightXHairs.append("line").attr("class","right-x-xhairs")
      .attr("x1",50).attr("y1",0).attr("x2",50).attr("y2",this.gMainEdge)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gRightXHairs.append("line").attr("class","right-y-xhairs")
      .attr("x1",0).attr("y1",this.gMainEdge/2).attr("x2",100).attr("y2",this.gMainEdge)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gRightXHairs.append("line").attr("class","right-y-xhairs")
      .attr("x1",-this.gMainEdge).attr("y1",this.gMainEdge/2).attr("x2",0).attr("y2",200)
      .attr("stroke","yellow").attr("stoke-width",1).style("display","none");
   this.gRightXHairs.append("text").attr("class","right-x-xhairs-label").attr("x",54).attr("y",this.gMainEdge+4)
      .style("alignment-baseline","hanging").text(Number(this.rScale.invert(50)).toFixed(1)).style("display","none");
   this.gRightXHairs.append("text").attr("class","right-y-xhairs-label").attr("x",0).attr("y",0)
      .attr("text-anchor","middle").attr("transform","translate(104,"+(this.gMainEdge/2)+") rotate(90)")
      .text(Number(this.yScale.invert(200)).toFixed(1)).style("display","none");
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
   this.xMin = 0;
   this.xMax = 200;
   this.iMin="0";
   this.iMax="1";
   this.xLabel= "ms";
   this.yLabel="MHz";
   this.iLabel="Jy";
   this.yMin = 0;
   this.yMax = 800;
   this.xBins = 200; // max 200 bins
   this.yBins = 200; // max 1024 bins
   this.peakBds = {"min":20,"max":180,"minWidth":5,"maxWidth":20};
   this.peak = Math.random() * (this.peakBds.max - this.peakBds.min) + this.peakBds.min;
   this.peakWidth= Math.random()*(this.peakBds.maxWidth - this.peakBds.minWidth) + this.peakBds.minWidth;
   this.singal = function (x) {
      if (this.peak-this.peakWidth/2 < x && x <= this.peak ) {
        return Number((1-Math.random()/5)*Math.min(255,510*(x-(this.peak-this.peakWidth/2))/this.peakWidth+100*Math.random())).toFixed(2);
      } else if (this.peak < x && x < this.peak+this.peakWidth/2) {
        return Number((1-Math.random()/5)*Math.min(255,-510*(x-this.peak)/this.peakWidth+255+100*Math.random())).toFixed(2);
      }
      return Number(100*Math.random()).toFixed(2);
   };
   this.xValue = function(bin) {return Number((this.xMax-this.xMin)*bin/this.xBins+this.xMin).toFixed(2);};
   this.yValue = function(bin) {return Number((this.yMax-this.yMin)*bin/this.yBins+this.yMin).toFixed(2);};
   this.data = [];
   this.dataX = [];
   this.dataY = [];
   this.maxDataX=0;
   this.maxDataY=0;
   for (this.col=0; this.col<this.xBins;this.col++){this.dataX[this.col]=0;}
   for (this.row=0; this.row<this.yBins;this.row++){this.dataY[this.row]=0;}
   for (this.row=0; this.row < this.yBins; this.row++) {
      for (this.col=0; this.col < this.xBins; this.col++) {
         this.idx = this.row*this.xBins+this.col;
         this.data[this.idx] = {"x": this.xValue(this.col),"y": this.yValue(this.row),"jy": this.singal(this.xValue(this.col))};
         this.dataX[this.col]+=parseFloat(this.data[this.idx].jy);
         this.dataY[this.row]+=parseFloat(this.data[this.idx].jy);
      }
   }
   for (this.col=0; this.col<this.xBins;this.col++){if(this.dataX[this.col]>this.maxDataX){this.maxDataX=this.dataX[this.col];}}
   for (this.row=0; this.row<this.yBins;this.row++){if(this.dataY[this.row]>this.maxDataY){this.maxDataY=this.dataY[this.row];}}
   this.maxDataX*=(1+2*Math.random()/3);
   this.maxDataY*=(1+2*Math.random()/3);
   if (this.maxDataX>0) {for (var col=0; col<this.xBins;col++){this.dataX[col]=Number(this.dataX[col]/this.maxDataX).toFixed(3);}}
   if (this.maxDataY>0) {for (var row=0; row<this.yBins;row++){this.dataY[row]=Number(this.dataY[row]/this.maxDataY).toFixed(3);}}
   this.maxDataX=Number(this.maxDataX).toFixed(2);
   this.maxDataY=Number(this.maxDataY).toFixed(2);
}
