// Copyright (c) 2017 Dr. Michelle M. M. Boyce

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
