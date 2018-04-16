// Waterfall Plotter Widget.
//
// Author: Dr. Michelle M. M. Boyce
// Email: dr_smike@yahoo.ca
// Stardate: -305869.6369228817
//

function waterfallPlot(d3_AppendToElement,data, size) {

   this.wf = data;

   var color_map = (function(iMin,iMax) {
      return function(v) {
         var viridis = [
            '#440154','#440255','#440357','#450558','#45065a','#45085b','#46095c','#460b5e','#460c5f','#460e61','#470f62','#471163',
            '#471265','#471466','#471567','#471669','#47186a','#48196b','#481a6c','#481c6e','#481d6f','#481e70','#482071','#482172',
            '#482273','#482374','#472575','#472676','#472777','#472878','#472a79','#472b7a','#472c7b','#462d7c','#462f7c','#46307d',
            '#46317e','#45327f','#45347f','#453580','#453681','#443781','#443982','#433a83','#433b83','#433c84','#423d84','#423e85',
            '#424085','#414186','#414286','#404387','#404487','#3f4587','#3f4788','#3e4888','#3e4989','#3d4a89','#3d4b89','#3d4c89',
            '#3c4d8a','#3c4e8a','#3b508a','#3b518a','#3a528b','#3a538b','#39548b','#39558b','#38568b','#38578c','#37588c','#37598c',
            '#365a8c','#365b8c','#355c8c','#355d8c','#345e8d','#345f8d','#33608d','#33618d','#32628d','#32638d','#31648d','#31658d',
            '#31668d','#30678d','#30688d','#2f698d','#2f6a8d','#2e6b8e','#2e6c8e','#2e6d8e','#2d6e8e','#2d6f8e','#2c708e','#2c718e',
            '#2c728e','#2b738e','#2b748e','#2a758e','#2a768e','#2a778e','#29788e','#29798e','#287a8e','#287a8e','#287b8e','#277c8e',
            '#277d8e','#277e8e','#267f8e','#26808e','#26818e','#25828e','#25838d','#24848d','#24858d','#24868d','#23878d','#23888d',
            '#23898d','#22898d','#228a8d','#228b8d','#218c8d','#218d8c','#218e8c','#208f8c','#20908c','#20918c','#1f928c','#1f938b',
            '#1f948b','#1f958b','#1f968b','#1e978a','#1e988a','#1e998a','#1e998a','#1e9a89','#1e9b89','#1e9c89','#1e9d88','#1e9e88',
            '#1e9f88','#1ea087','#1fa187','#1fa286','#1fa386','#20a485','#20a585','#21a685','#21a784','#22a784','#23a883','#23a982',
            '#24aa82','#25ab81','#26ac81','#27ad80','#28ae7f','#29af7f','#2ab07e','#2bb17d','#2cb17d','#2eb27c','#2fb37b','#30b47a',
            '#32b57a','#33b679','#35b778','#36b877','#38b976','#39b976','#3bba75','#3dbb74','#3ebc73','#40bd72','#42be71','#44be70',
            '#45bf6f','#47c06e','#49c16d','#4bc26c','#4dc26b','#4fc369','#51c468','#53c567','#55c666','#57c665','#59c764','#5bc862',
            '#5ec961','#60c960','#62ca5f','#64cb5d','#67cc5c','#69cc5b','#6bcd59','#6dce58','#70ce56','#72cf55','#74d054','#77d052',
            '#79d151','#7cd24f','#7ed24e','#81d34c','#83d34b','#86d449','#88d547','#8bd546','#8dd644','#90d643','#92d741','#95d73f',
            '#97d83e','#9ad83c','#9dd93a','#9fd938','#a2da37','#a5da35','#a7db33','#aadb32','#addc30','#afdc2e','#b2dd2c','#b5dd2b',
            '#b7dd29','#bade27','#bdde26','#bfdf24','#c2df22','#c5df21','#c7e01f','#cae01e','#cde01d','#cfe11c','#d2e11b','#d4e11a',
            '#d7e219','#dae218','#dce218','#dfe318','#e1e318','#e4e318','#e7e419','#e9e419','#ece41a','#eee51b','#f1e51c','#f3e51e',
            '#f6e61f','#f8e621','#fae622','#fde724'
         ];
         var len = viridis.length;
         var v_map = (v - iMin)/(iMax-iMin)*(len-1);
         return viridis[Math.round(v_map) % len];
      }
   })(this.wf.iMin,this.wf.iMax);

   // geometric parameters (pixels)
   //console.log(isNaN(size));
   if (isNaN(size)) {
      this.gMainEdge = 400; // Main plot area is square 
   } else {
      this.gMainEdge = size;
   }
   this.gMiniEdge = this.gMainEdge/4; // Small-edge length of side plots
   this.gXBoxEdge = this.gMainEdge/this.wf.xBins; // Width of main plot area boxel
   this.gYBoxEdge = this.gMainEdge/this.wf.yBins; // Height of main area boxel 

   // svg container for waterfall plot
   this.svgContainer = d3_AppendToElement.append("svg")
      .attr("width",this.gMainEdge+this.gMiniEdge+75).attr("height",this.gMainEdge+this.gMiniEdge+75);

   // This is the main waterfall plot svg container, which can be used to scale the whole thing... 
   this.gWaterfallPlotContainer = this.svgContainer.append("g").attr("class","waterfall-plot");

   // Main waterfall plot area
   this.gMainPlot = this.gWaterfallPlotContainer.append("g").attr("class","wf-main-plot")
      .attr("transform","translate(25,"+(this.gMiniEdge+29)+")");
   this.xScale = d3.scaleLinear().domain([this.wf.xMin,this.wf.xMax]).range([0,this.gMainEdge]);
   this.yScale = d3.scaleLinear().domain([this.wf.yMin,this.wf.yMax]).range([this.gMainEdge,0]);
   this.xAxis  = d3.axisBottom(this.xScale).ticks(5);
   this.yAxis  = d3.axisLeft(this.yScale);
   //this.iScale = d3.scaleLinear().domain([0,255]).range([0,1]);
   this.iScale = function(x){return x}; 
   this.gMainPlot.append("g").attr("class","x-axis").attr("transform","translate(25,"+this.gMainEdge+")").call(this.xAxis);
   this.gMainPlot.append("g").attr("class","y-axis").attr("transform","translate(25,0)").call(this.yAxis);
   this.gMainPlot.append("line").attr("x1",25).attr("y1",0).attr("x2",this.gMainEdge+26).attr("y2",0)
      .attr("style","stroke:black;stroke-width:1");
   this.gMainPlot.append("line").attr("x1",this.gMainEdge+26).attr("y1",0).attr("x2",this.gMainEdge+26).attr("y2",this.gMainEdge)
      .attr("style","stroke:black;stroke-width:1");
   //this.gMainPlot.append("text").attr("x",this.gMainEdge+7).attr("y",this.gMainEdge+30).text(this.wf.xLabel);
   this.gMainPlot.append("text").attr("x",this.gMainEdge-5*this.wf.xLabel.length).attr("y",this.gMainEdge+32).text(this.wf.xLabel);
   this.gMainPlot.append("text").attr("x",0).attr("y",0).attr("transform","translate(-7,35) rotate(-90)").text(this.wf.yLabel);
   (function(element,xScale,yScale,wf,gXBoxEdge,gYBoxEdge){
      element.append("g").attr("class","xy-main-plot").attr("transform","translate(26,"+(-gYBoxEdge)+")")
         .selectAll("rect").data(wf.data).enter().append("rect").attr("width",gXBoxEdge).attr("height",gYBoxEdge)
         .attr("x",function(d){return xScale(d.x);}).attr("y",function(d){return yScale(d.y);})
         //.style("fill",function(d){return (d.mask && wf.rfiMaskOn) ? "red" : d3.rgb(d.jy,d.jy,d.jy).toString();});
         .style("fill",function(d){return (d.mask && wf.rfiMaskOn) ? "red" : color_map(d.jy);});
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
   this.gTopPlot.append("text").attr("x",0).attr("y",0)
      .attr("transform","translate(-7,"+((this.gMiniEdge+5)/2)+") rotate(-90)").text(this.wf.iLabel);
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

   // This is tempory fix for chrome, i.e., the (x,y) values on mousemove bounce around when 
   // the mouse is not moving. The appears to have happened with a recenct upgrade. It's not
   // 100% perfect, but good enough for now...
   var kludge = function(num) { 
      return Number(num/10).toFixed(0)*10; 
   }

   // Main plot area xhairs
   this.gXHairs = this.gWaterfallPlotContainer.append("g").attr("class","main-xhairs")
      .attr("transform","translate(52,"+(this.gMiniEdge+29)+")");
   (function(element,gMainPlot,xScale,yScale,iScale,iLabel,gMainEdge,gMiniEdge,gXBoxEdge,gYBoxEdge){
      element.append("rect").attr("class","main-xhairs-region xhairs")
         .attr("x",0).attr("y",0).attr("width",gMainEdge).attr("height",gMainEdge+1)
      .attr("fill","none").style("pointer-events","all")
      .on("mouseover",function(){element.selectAll("line, text").style("display",null);})
      .on("mouseout", function(){element.selectAll("line, text").style("display","none");})
      .on("mousemove", function() {
         var coords = d3.mouse(this);
         var xPixels = coords[0];
         var yPixels = coords[1];
         var x = Number(xScale.invert(xPixels)).toFixed(2);
         var y = Number(yScale.invert(yPixels)).toFixed(0);

         // Update x-hairs and annotation.
         gMainPlot.select("g.xy-main-plot").selectAll("rect")
            .filter(function(d){
               if (xScale(d.x)<=xPixels && xPixels <= xScale(d.x)+gXBoxEdge && yScale(d.y)-gYBoxEdge<=yPixels && yPixels <= yScale(d.y)) {
                  xPixels = kludge(xPixels);
                  yPixels = kludge(yPixels);
                  //curXPos = Number(element.select(".main-x-xhairs").attr("x1"));
                  //var curYPos = Number(element.select(".main-y-xhairs").attr("y1"));
                  //var delta = Math.sqrt(Math.pow(xPixels-curXPos,2)+Math.pow(yPixels-curYPos,2));
                  //console.log("curXPos="+curXPos+", curYPos="+curYPos+", xPixels="+xPixels+", yPixels="+yPixels+", delta="+delta);
                  //if (Math.abs(xPixels-curXPos) < 10 && Math.abs(yPixels-curYPos) < 10) {
                  //   return true;
                  //}

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
      .attr("stroke","#f4d03f").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("line").attr("class","main-x-xhairs")
      .attr("x1",this.gMainEdge/2).attr("y1",-(this.gMiniEdge-1)).attr("x2",this.gMainEdge/2).attr("y2",0)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("line").attr("class","main-y-xhairs")
      .attr("x1",0).attr("y1",this.gMainEdge/2).attr("x2",this.gMainEdge).attr("y2",this.gMainEdge/2)
      .attr("stroke","#f4d03f").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("line").attr("class","main-y-xhairs")
      .attr("x1",this.gMainEdge).attr("y1",this.gMainEdge/2).attr("x2",this.gMainEdge+this.gMiniEdge).attr("y2",this.gMainEdge/2)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gXHairs.append("text").attr("class","main-x-xhairs-label").attr("x",this.gMainEdge/2).attr("y",-(this.gMiniEdge+4))
      .style("text-anchor","middle").text(Number(this.xScale.invert(this.gMainEdge/2)).toFixed(1)).style("display","none");
   this.gXHairs.append("text").attr("class","main-y-xhairs-label").attr("x",0).attr("y",0)
      .style("text-anchor","middle").text(Number(this.yScale.invert(this.gMainEdge/2)).toFixed(1))
      .attr("transform","translate("+(this.gMainEdge+this.gMiniEdge+5)+","+(this.gMainEdge/2)+") rotate(90)").style("display","none");
   this.gXHairs.append("text").attr("class","main-z-xhairs").attr("x",this.gMainEdge/2).attr("y",this.gMainEdge/2).text("0")
      .style("fill","#f4d03f").style("display","none");

   // Top graph xhairs
   this.gTopXHairs = this.gWaterfallPlotContainer.append("g").attr("class","top-xhairs").attr("transform","translate(52,29)");
   (function(element,xScale,uScale,gMainEdge,gMiniEdge){
      element.append("rect").attr("class","main-xhairs-region xhairs")
         .attr("x",0).attr("y",0).attr("width",gMainEdge).attr("height",gMiniEdge)
         .attr("fill","none").style("pointer-events","all")
         .on("mouseover",function(){element.selectAll("line, text").style("display",null);})
         .on("mouseout", function(){element.selectAll("line, text").style("display","none");})
         .on("mousemove", function() {
            var coords = d3.mouse(this);
            var xPixels = coords[0];
            var yPixels = coords[1];
            var x = Number(xScale.invert(xPixels)).toFixed(2);
            var y = Number(uScale.invert(yPixels)).toFixed(1);
            xPixels = kludge(xPixels);
            yPixels = kludge(yPixels);
            element.selectAll(".top-x-xhairs").attr("x1",xPixels).attr("x2",xPixels);
            element.select(".top-y-xhairs").attr("y1",yPixels).attr("y2",yPixels);
            element.select(".top-x-xhairs-label").attr("x",xPixels).text(x>0?x:-x);
            element.select(".top-y-xhairs-label").attr("y",yPixels).text(y>0?y:-y);
         });
   })(this.gTopXHairs,this.xScale,this.uScale,this.gMainEdge,this.gMiniEdge);
   this.gTopXHairs.append("line").attr("class","top-x-xhairs")
      .attr("x1",this.gMainEdge/2).attr("y1",0).attr("x2",this.gMainEdge/2).attr("y2",this.gMiniEdge)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gTopXHairs.append("line").attr("class","top-x-xhairs")
      .attr("x1",this.gMainEdge/2).attr("y1",100).attr("x2",this.gMainEdge/2).attr("y2",this.gMainEdge+this.gMiniEdge)
      .attr("stroke","#f4d03f").attr("stroke-width",1).style("display","none");
   this.gTopXHairs.append("line").attr("class","top-y-xhairs")
      .attr("x1",0).attr("y1",this.gMiniEdge/2).attr("x2",this.gMainEdge).attr("y2",this.gMiniEdge/2)
      .attr("stroke","black").attr("stroke-width",1).style("display","none");
   this.gTopXHairs.append("text").attr("class","top-x-xhairs-label").attr("x",this.gMainEdge/2).attr("y",-4)
      .style("text-anchor","middle").text(Number(this.xScale.invert(this.gMainEdge/2)).toFixed(1)).style("display","none");
   this.gTopXHairs.append("text").attr("class","top-y-xhairs-label").attr("x",this.gMainEdge+4).attr("y",this.gMiniEdge-4)
      .text(Number(this.uScale.invert(50)).toFixed(1)).style("display","none");

   // Right graph xhairs
   this.gRightXHairs = this.gWaterfallPlotContainer.append("g")
      .attr("class","top-xhairs").attr("transform","translate("+(this.gMainEdge+51)+","+(this.gMiniEdge+28)+")");
   (function(element,rScale,yScale,gMainEdge,gMiniEdge){
      element.append("rect").attr("class","main-xhairs-region xhairs")
         .attr("x",0).attr("y",0).attr("width",gMiniEdge).attr("height",gMainEdge)
         .attr("fill","none").style("pointer-events","all")
         .on("mouseover",function(){element.selectAll("line, text").style("display",null);})
         .on("mouseout", function(){element.selectAll("line, text").style("display","none");})
         .on("mousemove", function() {
            var coords = d3.mouse(this);
            var xPixels = coords[0];
            var yPixels = coords[1];
            var x = Number(rScale.invert(xPixels)).toFixed(1);
            var y = Number(yScale.invert(yPixels)).toFixed(0);
            xPixels = kludge(xPixels);
            yPixels = kludge(yPixels);
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
      .attr("stroke","#f4d03f").attr("stoke-width",1).style("display","none");
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
      this.gMainPlot.selectAll("rect").data(wf.data)
         .style("fill",function(d){return (d.mask && wf.rfiMaskOn) ? "red" : color_map(d.jy);});

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
         this.gMainPlot.selectAll("rect").data(this.wf.data)
         .style("fill",function(d){return (d.mask) ? "red" : color_map(d.jy);});
         this.wf.rfiMaskOn = true;
      } else {
         this.gMainPlot.selectAll("rect").data(this.wf.data).style("fill",function(d){return color_map(d.jy);});
         this.wf.rfiMaskOn = false;
      }
      return this.wf.rfiMaskOn;
   }

   // Function to get rif mask on/off state.
   this.isRfiMaskOn = function() {
      return this.wf.rfiMaskOn;
   }
};

