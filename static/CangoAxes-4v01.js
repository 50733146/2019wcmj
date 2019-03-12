/*===================================================================
  Filename: CangoAxes-4v01.js
  Rev 4
  By: Dr A.R.Collins

  Description: Adds Axes drawing methods to Cango core
  Also adds: drawArrow and drawArrowArc
             drawHTMLText
             drawVectorText
  Also adds the global utility functions:
  sprintf, toEngFixed, toEngPrec

  License: Released into the public domain
  link to latest version at
  <http://www/arc.id.au/CanvasGraphics.html>
  Report bugs to tony at arc.id.au

  Date    Description                                            |By
  -------------------------------------------------------------------
  30Apr14 First beta                                              ARC
  11May14 Released as CangoAxes-1v00                              ARC
  08Feb15 Update to use Cango Ver 6                               ARC
  12Mar17 Update to use Cango Ver 9                               ARC
  28Mar17 Released as CangoAxes-2v00                              ARC
  08Jul17 Added drawVectorText as Cango method                    ARC
  10Jul17 Released as CangoAxes-3v00                              ARC
  12Jul17 Flip the Vector text if yDown is true                   ARC
  15Jul17 bugfix: vectorText lineCap must be "round"              ARC
  17Jun17 Update to use Cango Ver 11                              ARC
  30Oct17 bugfix: toEngPrec                                       ARC
 ====================================================================*/

var sprintf, toEngFixed, toEngPrec;

Cango = (function(CangoCore)
{
  "use strict";

  toEngFixed = function(val, decPlaces)      // rounds to X dec places and no stripping of 0s
  {
    var unit = "pnum kMG",
        man, pwr,
        expt = 0,
        str = "";

    if ((decPlaces === undefined)||(decPlaces<0)||(decPlaces>10))
    {
      decPlaces = 2;
    }
    man = 0.0;
    if (Math.abs(val)>1.0E-12)
    {
      pwr = Math.log(Math.abs(val))/(3.0*Math.LN10);
      expt = Math.floor(pwr);
      man = val/Math.pow(1000.0, expt);
      expt *= 3;
    }
    // now force round to decPlaces
    str = man.toFixed(decPlaces);
    // now add the symbol for the exponent
    return str+unit.charAt(expt/3+4);
  };

  toEngPrec = function(val, sigFigs, showPlus)      // rounds to X significant figures, maintains returned string length
  {
    var unit = "pnum kMG",
        man, pwr, delta,
        expt = 0,
        str = "";

    if ((sigFigs === undefined)||(sigFigs<3)||(sigFigs>10))
    {
      sigFigs = 3;
    }
    man = 0.0;
    delta = 1+Math.pow(10, -sigFigs);
    if (Math.abs(val)>1.0E-12)
    {
      pwr = Math.log(Math.abs(delta*val))/(3.0*Math.LN10);
      expt = Math.floor(pwr);
      man = val/Math.pow(1000.0, expt);
      expt *= 3;
    }
    // now force round to sigFigs
    str = man.toPrecision(sigFigs);
    if (man >= 0)  // add a space for the "-" sign so string length is constant regardless of the number
    {
      str = (showPlus)? "+"+str:  " "+str;
    }
    if (str.indexOf(".") === -1)   // no decimal just 3 digits, add a leading space to maintain string length
    {
      return " "+str+unit.charAt(expt/3+4); // adding the symbol for the exponent
    }
    else
    {
      return str+unit.charAt(expt/3+4);
    }
  };

  function isArray(obj)
  {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  function isNumber(o)
  {
    return !isNaN(o) && o !== null && o !== "" && o !== false;
  }

  function engNotation(val, tenthsOK)        // rounds to 2 dec places and strips trailing 0s
  {
    var unit = "pnum kMG",
        man = 0.0,
        pwr,
        expt = 0,
        str = "";

    if (Math.abs(val)>1.0E-12)
    {
      if (tenthsOK)
      {
        pwr = Math.log(Math.abs(10*val))/(3.0*Math.LN10); // calc exp on 10 x val allows .9 not 900m
      }
      else
      {
        pwr = Math.log(Math.abs(val))/(3.0*Math.LN10);
      }
      expt = Math.floor(pwr);
      man = val/Math.pow(1000.0, expt);
      expt *= 3;
    }
    // now force round to decPlaces
    str = man.toFixed(2);
    // now strip trailing 0s
    while (str.charAt(str.length-1) === '0')
    {
      str = str.substring(0,str.length-1);
    }
    if (str.charAt(str.length-1) === '.')
    {
      str = str.substring(0,str.length-1);
    }
    // now add the symbol for the exponent
    if (expt)
    {
      return str+unit.charAt(expt/3+4);
    }

    return str;                   // dont add unnecessary space
  }

  function AxisTicsAuto(mn, mx, majorStep)
  {
    /* Calculate the tic mark spacing for graph plotting
     * Given the minimum and maximum values of the axis
     * returns the first tic value and the tic spacing.
     * The algorithm gives tic spacing of 1, 2, 5, 10, 20 etc
     * and a number of ticks from ~5 to ~11
     */
    var mj = majorStep || 0,
        dx,		// tolerance for avoiding maths noise
        pwr, spanman, stepman,
        stepVal,
        spanexp, stepexp;

    this.tic1 = 0;
    this.ticStep = 0;
    this.lblStep = 0;

    if (mn>=mx)
    {
      console.error("Axes Ticks: Max must be greater than Min");
      return;
    }

    pwr = Math.log(mx-mn)/Math.LN10;
    if (pwr<0.0)
    {
      spanexp = Math.floor(pwr) - 1;
    }
    else
    {
      spanexp = Math.floor(pwr);
    }
    spanman = (mx-mn)/Math.pow(10.0, spanexp);
    if(spanman>=5.5)
    {
      spanexp += 1;
      spanman /= 10.0;
    }
    stepman = 0.5;
    if(spanman<2.2)
    {
      stepman = 0.2;
    }
    if(spanman<1.1)
    {
      stepman = 0.1;
    }
    stepexp = 3*Math.floor(spanexp/3);
    if((spanexp < 0)&&(spanexp%3 !== 0))
    {
      stepexp -= 3;
    }
    stepVal = stepman*Math.pow(10.0, (spanexp-stepexp));
    this.ticStep = stepVal*Math.pow(10.0, stepexp);

    if(mn>=0.0)
    {
      this.tic1 = (Math.floor((mn/this.ticStep)-0.01)+1)*this.ticStep;   // avoid math noise
    }
    else
    {
      this.tic1 = -Math.floor((-mn/this.ticStep)+0.01)*this.ticStep;   // avoid math noise
    }

    // Calc the step size between major/labeled tics, it must be a multiple of ticStep
    stepman *= 10;  // now 1, 2 or 5
    if (mj === "auto")
    {
      this.lblStep = (stepman === 0.2)? this.ticStep*5: this.ticStep*2;
    }
		else if (mj>0)
		{
			this.lblStep = this.ticStep*Math.round(mj/this.ticStep);
		}
		dx = 0.01*this.ticStep;
    this.lbl1 = this.lblStep*Math.ceil((mn-dx)/this.lblStep);

  /*  var str = "";
      str += "ymin="+mn+"  ymax="+mx+"\n";
      str += "tic1= "+this.tic1+ "\n";
      str += "ticStep= "+this.ticStep+ "\n";
      alert(str);
  */
  }

  function AxisTicsManual(xmin, xmax,	xMn, xMj)
	{
		var dx;		// tolerance for avoiding maths noise

    this.tic1 = 0;
    this.ticStep = 0;
    this.lbl1 = 0;
    this.lblStep = 0;
    this.ticScl = 0;     // reserved for future use

		if ((xmin===undefined)||(xmax===undefined)||(xMn===undefined)||(xMn<=0))
    {
			return;
    }

		dx = 0.01*xMn;
		this.tic1 = xMn*Math.ceil((xmin-dx)/xMn);
    this.ticStep = xMn;

		if ((xMj!==undefined)&&(xMj>0))
		{
			this.lblStep = this.ticStep*Math.round(xMj/xMn);
			dx = 0.01*xMn;
			this.lbl1 = this.lblStep*Math.ceil((xmin-dx)/this.lblStep);
		}
    // OPTION:
    // to make all labels have same scale factor, calc lastTic and corresponding tag "m kMG" etc
    // calc engnotation for xTic1 exp=xTicScl, tag=xTicTag
    // plot x = xtic1 + n*xTicStep
    // label x/xTicScl+xTicTag
	}

  function setPropertyValue(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined))  // null is OK, forces default
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "xorigin":
        this.xOrg = value;
        break;
      case "yorigin":
        this.yOrg = value;
        break;
      case "xmin":
        this.xMin = value;
        break;
      case "xmax":                 // for backward compatability
        this.xMax = value;
        break;
      case "ymin":
        this.yMin = value;
        break;
      case "ymax":
        this.yMax = value;
        break;
      case "xunits":
        if (typeof value === "string")
        {
          this.xUnits = value;
        }
        break;
      case "yunits":
        if (typeof value === "string")
        {
          this.yUnits = value;
        }
        break;
      case "xlabel":
        if (typeof value === "string")
        {
          this.xLabel = value;
        }
        break;
      case "ylabel":
        if (typeof value === "string")
        {
          this.yLabel = value;
        }
        break;
      case "xtickinterval":
        this.xMinTic = value;
        break;
      case "ytickinterval":
        this.yMinTic = value;
        break;
      case "xlabelinterval":
        this.xMajTic = value;
        break;
      case "ylabelinterval":                 // for backward compatability
        this.yMajTic = value;
        break;
      case "ticklength":
        this.tickLength = value;
        break;
      case "labelticklength":
        this.majTickLength = value;
        break;
      case "x10thsok":
        this.x10ths = (value === true);
        break;
      case "y10thsok":
        this.y10ths = (value === true);
        break;
      case "strokecolor":
        this.strokeColor = value;
        break;
      case "fillcolor":
        this.fillColor = value;
        break;
      case "fontsize":
        this.fontSize = Math.abs(value);
        break;
      case "fontweight":
        if ((typeof value === "string")||((typeof value === "number")&&(value>=100)&&(value<=900)))
        {
          this.fontWeight = value;
        }
        break;
      case "fontfamily":
        if (typeof value === "string")
        {
          this.fontFamily = value;
        }
        break;
      default:
        return;
    }
  }

  function setBoxAxesProperties(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined))  // null is OK, forces default
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "xunits":
        if (typeof value === "string")
        {
          this.xUnits = value;
        }
        break;
      case "yunits":
        if (typeof value === "string")
        {
          this.yUnits = value;
        }
        break;
      case "title":
        if (typeof value === "string")
        {
          this.title = value;
        }
        break;
      case "xtickinterval":
        this.xMinTic = value;
        break;
      case "ytickinterval":
        this.yMinTic = value;
        break;
      case "strokecolor":
        this.strokeColor = value;
        break;
      case "fillcolor":
        this.fillColor = value;
        break;
      case "gridcolor":
        this.fillColor = value;
        break;
      case "fontsize":
        this.fontSize = Math.abs(value);
        break;
      case "fontweight":
        if ((typeof value === "string")||((typeof value === "number")&&(value>=100)&&(value<=900)))
        {
          this.fontWeight = value;
        }
        break;
      case "fontfamily":
        if (typeof value === "string")
        {
          this.fontFamily = value;
        }
        break;
      default:
        return;
    }
  }

  CangoCore.prototype.drawAxes = function(xMin, xMax, yMin, yMax, options)
  {
    var opt, prop,
        x, y,
        pos,
        data = [],
        ticLen,
        majTicLen,
        xLblOfs = 9/this.yscl,   // will remain 9 when converted to pixels
        yLblOfs = 9/this.xscl,    // pixels
        dataCmds,
        xOfs = 40,
        yOfs = 40,      // pixels
      	lorg = 1,
        side = 1,                 // 1 or -1 depending on the side of the axis to label
        xU = "", yU = "",
        xL = "", yL = "",
        isoGC,                    // for plotting in pixels
        tickCmds, bigTickCmds,
        xTics, yTics,
        ll, ur,
        xmin, xmax, ymin, ymax,
        parms = {
          xOrg: 0,
          yOrg: 0,
          xMinTic: "auto",
          yMinTic: "auto",
          xMajTic: "auto",
          yMajTic: "auto",
          tickLength: 7,      // in pixels (default = 7 pixels)
          majTickLength: 10,
          x10ths: false,
          y10ths: false,
          xUnits: "",
          yUnits: "",
          xLabel: "",
          yLabel: "",
          strokeColor: null,
          fillColor: null,
          fontSize: null,
          fontWeight: null,
          fontFamily: null,
          setProperty: setPropertyValue };

    // get WC of the gridbox to default to edge of plot area
    if (this.yDown) // SVG vpOrg is upper left of gridbox
    {
      ll = this.toWorldCoords(this.vpOrgX, this.vpOrgY+this.vpH);
      ur = this.toWorldCoords(this.vpOrgX+this.vpW, this.vpOrgY);
      ymin = (yMin === undefined)? ur.y : yMin;
      ymax = (yMax === undefined)? ll.y : yMax;
    }
    else // RHC vpOrg is lower left of gridbox
    {
      ll = this.toWorldCoords(this.vpOrgX, this.vpOrgY);
      ur = this.toWorldCoords(this.vpOrgX+this.vpW, this.vpOrgY-this.vpH); // px -ve UP the screen so -vpH
      ymin = (yMin === undefined)? ll.y : yMin;
      ymax = (yMax === undefined)? ur.y : yMax;
    }
    xmin = (xMin === undefined)? ll.x : xMin;
    xmax = (xMax === undefined)? ur.x : xMax;
    parms.xOrg = xmin;
    parms.yOrg = ymin;
    opt = (typeof options === 'object')? options: {};   // avoid undeclared object errors
    // check for all supported options
    for (prop in opt)
    {
      // check that this is opt's own property, not inherited from prototype
      if (opt.hasOwnProperty(prop))
      {
        parms.setProperty(prop, opt[prop]);
      }
    }

    // to get uniform label positions use raw pixel (SVG) positioning
    isoGC = new Cango(this.cId);   // use current context to get the canvas ID
    // draw all ticks defined in pixels and drawn in world coords (convert px/cgo.xscl with iso=true)
    ticLen = parms.tickLength/this.xscl;     // in pixels (default = 5 pixels)
    majTicLen = parms.majTickLength/this.xscl;     // in pixels (default = 10 pixels)
    tickCmds = new Path(['M', -ticLen/2, 0, 'L', ticLen/2, 0], {
      'iso':true,
      'strokeColor':parms.strokeColor});
    bigTickCmds = new Path(['M', -majTicLen/2, 0, 'L', majTicLen/2, 0], {
      'iso':true,
      'strokeColor':parms.strokeColor});

    if ((parms.xMinTic === undefined)||(parms.xMinTic === null)||(parms.xMinTic === "auto"))  // xMinTic===0 means no x ticks
    {
      xTics = new AxisTicsAuto(xmin, xmax, parms.xMajTic);
    }
    else
    {
      xTics = new AxisTicsManual(xmin, xmax, parms.xMinTic, parms.xMajTic);
    }
    if ((parms.yMinTic === undefined)||(parms.yMinTic === null)||(parms.yMinTic === "auto"))  // yMinTic===0 means no y ticks
    {
      yTics = new AxisTicsAuto(ymin, ymax, parms.yMajTic);
    }
    else
    {
      yTics = new AxisTicsManual(ymin, ymax, parms.yMinTic, parms.yMajTic);
    }

    // draw axes
    data = ['M', xmin, parms.yOrg, 'L', xmax, parms.yOrg, 'M', parms.xOrg, ymin, 'L', parms.xOrg, ymax];
    this.drawPath(data, {strokeColor:parms.strokeColor});
    // X axis tick marks
    if (xTics.ticStep)
    {
      for(x=xTics.tic1; x<=xmax; x+=xTics.ticStep)
      {
        tickCmds.transform.rotate(-90);
        tickCmds.transform.translate(x, parms.yOrg);
        this.render(tickCmds);     // maintain aspect ratio, rotate 90deg
      }
    }
    // Y axis tick marks
    if (yTics.ticStep)
    {
      for(y=yTics.tic1; y<=ymax; y+=yTics.ticStep)
      {
        tickCmds.transform.translate(parms.xOrg, y);
        this.render(tickCmds);
      }
    }
    // major ticks X axis
    if (xTics.lblStep)
    {
      for(x=xTics.lbl1; x<=xmax; x+=xTics.lblStep)
      {
        bigTickCmds.transform.rotate(-90);
        bigTickCmds.transform.translate(x, parms.yOrg);
        this.render(bigTickCmds);
      }
    }
    // major ticks Y axis
    if (yTics.lblStep)
    {
      for(y=yTics.lbl1; y<=ymax; y+=yTics.lblStep)
      {
        bigTickCmds.transform.translate(parms.xOrg, y);
        this.render(bigTickCmds);
      }
    }

    // now label the axes
		if (xTics.lblStep)
		{
    	// X axis, decide whether to label above or below X axis
  		if ((parms.yOrg<ymin+0.55*(ymax-ymin)) && !this.yDown)
    	{   // x axis on bottom half of screen
    		side = -1;
    		lorg = 2;
    	}
    	else
    	{
    	  side = 1;
    		lorg = 8;
    	}
    	for (x = xTics.lbl1; x<=xmax; x += xTics.lblStep)
    	{
  			// skip label at the origin if it would be on the other axis
  			if ((x===parms.xOrg)&&(parms.yOrg>ymin)&&(parms.yOrg<ymax))
        {
  				continue;
        }
        this.drawText(engNotation(x, parms.x10ths), {
          x:x,
          y:parms.yOrg-side*xLblOfs,
          lorg:lorg,
          fillColor:parms.fillColor,
          fontSize:parms.fontSize,
          fontWeight:parms.fontWeight,
          fontFamily:parms.fontFamily });
    	}
    }

		if (yTics.lblStep)
		{
    	// Y axis, decide whether to label to right or left of Y axis
      if (parms.xOrg < xmin+0.5*(xmax-xmin))
    	{  // y axis on left half of screen
    		side = 1;
    		lorg = 6;
    	}
    	else
    	{
    	  side = 1;
    		lorg = 6;
    	}
    	for (y = yTics.lbl1; y<=ymax; y += yTics.lblStep)
    	{
  			// skip label at the origin if it would be on the other axis
  			if ((y===parms.yOrg)&&(parms.xOrg>xmin)&&(parms.xOrg<xmax))
        {
  				continue;
        }
        this.drawText(engNotation(y, parms.y10ths), {
          x:parms.xOrg-side*yLblOfs,
          y:y,
          lorg:lorg,
          fillColor:parms.fillColor,
          fontSize:parms.fontSize,
          fontWeight:parms.fontWeight,
          fontFamily:parms.fontFamily});
    	}
    }

    if (parms.xUnits.length>0)
    {
      xU = "("+parms.xUnits+")";
    }
    if (parms.yUnits.length>0)
    {
      yU = "("+parms.yUnits+")";
    }

    if (parms.xLabel.length>0)
    {
      xL = parms.xLabel;
    }
  	if (((parms.yOrg<ymin+0.55*(ymax-ymin)) && this.yDown)||((parms.yOrg>ymin+0.45*(ymax-ymin)) && !this.yDown))
    {
      side = -1;
      lorg = 3;
    }
    else
    {
      side = 1;
      lorg = 9;
    }
    pos = this.toPixelCoords(xmax, parms.yOrg);
    dataCmds = new Text(xL+xU, {
      lorg:lorg,
      fillColor:parms.fillColor,
      fontSize:parms.fontSize,
      fontWeight:parms.fontWeight,
      fontFamily:parms.fontFamily });
    dataCmds.transform.translate(pos.x, pos.y + side*xOfs);
    isoGC.render(dataCmds);

    if (parms.yLabel.length>0)
    {
      yL = parms.yLabel;
    }
  	// Y axis, decide whether to label to right or left of Y axis
  	if (parms.xOrg < xmin+0.5*(xmax-xmin))
  	{
  		// y axis on left half of screen
  		side = -1;
      lorg = (this.yDown)? 7: 9;
  	}
  	else
  	{
  	  side = 1;
      lorg = (this.yDown)? 1: 3;
  	}
    pos = this.toPixelCoords(parms.xOrg, ymax);
    dataCmds = new Text(yL+yU, {
      lorg:lorg,
      fillColor:parms.fillColor,
      fontSize:parms.fontSize,
      fontWeight:parms.fontWeight,
      fontFamily:parms.fontFamily });
    dataCmds.transform.rotate(-90);
    dataCmds.transform.translate(pos.x + side*yOfs, pos.y);
    isoGC.render(dataCmds);
  };

  CangoCore.prototype.drawBoxAxes = function(xMin, xMax, yMin, yMax, options)
  {
		var opt, prop,
        pos,
        x, y,
        data = [],
        ticLen = 4/this.xscl,     // will be 4 when converted to pixels
        xLblOfs = 8/this.yscl,    // pixels
        yLblOfs = 8/this.xscl,    // pixels
        lorg,
      	lbl, lbl2 = "/div",
        tickCmds,
        tickRot = (this.yDown)? -90: 90,
    		xTics, yTics,
        parms = {
          xMinTic: "auto",
          yMinTic: "auto",
          xUnits: "",
          yUnits: "",
          title: "",
          strokeColor: '#ffffff',
          fillColor: '#cccccc',
          gridColor: 'rgba(255,255,255,0.2)',
          fontSize: null,
          fontWeight: null,
          fontFamily: null,
          setProperty: setBoxAxesProperties };

    if (!this.yDown)
    {
      xLblOfs *= -1;
    }
    opt = (typeof options === 'object')? options: {};   // avoid undeclared object errors
    // check for all supported options
    for (prop in opt)
    {
      // check that this is opt's own property, not inherited from prototype
      if (opt.hasOwnProperty(prop))
      {
        parms.setProperty(prop, opt[prop]);
      }
    }

    tickCmds = new Path(['M', 0, 0, 'L', -ticLen, 0], {"strokeColor":parms.strokeColor, 'iso':true});

    if ((!parms.xMinTic)||(parms.xMinTic === "auto"))
    {
      xTics = new AxisTicsAuto(xMin, xMax);
    }
    else
    {
      xTics = new AxisTicsManual(xMin, xMax, parms.xMinTic);
    }
    if ((!parms.yMinTic)||(parms.yMinTic === "auto"))
    {
      yTics = new AxisTicsAuto(yMin, yMax);
    }
    else
    {
      yTics = new AxisTicsManual(yMin, yMax, parms.yMinTic);
    }
		// Draw box axes
    data = ['M', xMin, yMin, 'L', xMin, yMax, xMax, yMax, xMax, yMin, 'z'];
    this.drawPath(data, {strokeColor:parms.fillColor});

  	for (x=xTics.tic1; x<=xMax; x += xTics.ticStep)
  	{
  	  tickCmds.transform.rotate(tickRot);
  	  tickCmds.transform.translate(x, yMin);
      this.render(tickCmds);  // just draw the tick mark
      if ((x !== xMin)&&(x !== xMax))        // no dots on the box
      {
        this.drawPath(['M', x, yMin, 'L', x, yMax], {strokeColor:'rgba(255,255,255,0.2)'});
      }
  	}
  	for (y=yTics.tic1; y<=yMax; y += yTics.ticStep)
  	{
  	  tickCmds.transform.translate(xMin, y);
      this.render(tickCmds);      // just draw the tick mark
      if ((y !== yMin)&&(y !== yMax))
      {
        this.drawPath(['M', xMin, y, 'L', xMax, y], {strokeColor:'rgba(255,255,255,0.2)'});
      }
  	}
		// Now labels, X axis, label only first and last tic below X axis
    lorg = (this.yDown)? 7: 1;
		x = xTics.tic1;
    this.drawText(engNotation(x), {
      x:x,
      y:yMin - xLblOfs,
      fillColor:parms.fillColor,
      lorg:lorg,
      fontSize:parms.fontSize,
      fontWeight:parms.fontWeight,
      fontFamily:parms.fontFamily });
  	while(x+xTics.ticStep <= 1.05*xMax)
    {
  		x += xTics.ticStep;
    }
    lorg = (this.yDown)? 9: 3;
    pos = this.toPixelCoords(x, yMin);
    this.drawText(engNotation(x), {
      x:x,
      y:yMin - xLblOfs,
      fillColor:parms.fillColor,
      lorg:lorg,
      fontSize:parms.fontSize,
      fontWeight:parms.fontWeight,
      fontFamily:parms.fontFamily });

		// Y axis, label bottom and top tics to left of Y axis
 		y = yTics.tic1;
    pos = this.toPixelCoords(xMin, y);
    this.drawText(engNotation(y), {
      x:xMin - yLblOfs,
      y:y,
      fillColor:parms.fillColor,
      lorg:6,
      fontSize:parms.fontSize,
      fontWeight:parms.fontWeight,
      fontFamily:parms.fontFamily });
  	while (y + yTics.ticStep <= 1.05*yMax)
    {
			y += yTics.ticStep;
    }
    this.drawText(engNotation(y), {
      x:xMin - yLblOfs,
      y:y,
      fillColor:parms.fillColor,
      lorg:6,
      fontSize:parms.fontSize,
      fontWeight:parms.fontWeight,
      fontFamily:parms.fontFamily });
    // x axis label
    if (typeof parms.xUnits === "string")
    {
      lbl = engNotation(xTics.ticStep)+parms.xUnits+"/div";
    }
    else
    {
      lbl = engNotation(xTics.ticStep)+"/div";
    }
    lorg = (this.yDown)? 8: 2;
    x = xMin+(xMax-xMin)/2;
    pos = this.toPixelCoords(x, yMin);
    this.drawText(lbl, {
      x:x,
      y:yMin - xLblOfs,
      fillColor:parms.fillColor,
      lorg:lorg,
      fontSize:parms.fontSize,
      fontWeight:parms.fontWeight,
      fontFamily:parms.fontFamily });
    // y axis label
    if (parms.yUnits.length)
    {
      lbl = engNotation(yTics.ticStep)+parms.yUnits;
    }
    else
    {
      lbl = engNotation(yTics.ticStep);
    }
    if (!this.yDown)
    {
      lbl2 = lbl.slice(0);       // copy lbl
      lbl = "/div";              // swap them
    }
    y = yMin+(yMax-yMin)/2;
    pos = this.toPixelCoords(xMin, y);
    this.drawText(lbl, {
      x:xMin - yLblOfs,
      y:y-xLblOfs,
      fillColor:parms.fillColor,
      lorg:6,
      fontSize:parms.fontSize,
      fontWeight:parms.fontWeight,
      fontFamily:parms.fontFamily });
    y = yMin+(yMax-yMin)/2;
    this.drawText(lbl2, {
      x:xMin - yLblOfs,
      y:y+xLblOfs,
      fillColor:parms.fillColor,
      lorg:6,
      fontSize:parms.fontSize,
      fontWeight:parms.fontWeight,
      fontFamily:parms.fontFamily });
    // title
    lorg = (this.yDown)? 1: 7;
    if (typeof parms.title === "string")
    {
      this.drawText(parms.title, {
        x:xMin,
        y:yMax + xLblOfs,
        fillColor:parms.fillColor,
        lorg:lorg,
        fontSize:parms.fontSize,
        fontWeight:parms.fontWeight,
        fontFamily:parms.fontFamily });
    }
	};

  CangoCore.prototype.drawHTMLText = function(str, options)
  {
    var opt = (typeof options === 'object')? options: {},   // avoid undeclared object errors
        xOfs = opt.x || 0,
        yOfs = opt.y || 0,
        txtCol = opt.fillColor || opt.fillcolor || this.penCol,
        size = opt.fontSize || opt.fontsize || this.fontSize,         // fontSize in pxs
        weight = opt.fontWeight || opt.fontweight || this.fontWeight, // weight in string or number 100..900
        family = opt.fontFamily || opt.fontFamily || this.fontFamily,
        deg = opt.degs || 0,
        topPx, leftPx,
        lorg = 1,
        lorgWC = ["", " transform-origin:0% 0%; transform: translate(0%,0%)",
                      " transform-origin:50% 0%; transform: translate(-50%,0%)",
                      " transform-origin:100% 0%; transform: translate(-100%,0%)",
                      " transform-origin:0% 50%; transform: translate(0%,-50%)",
                      " transform-origin:50% 50%; transform: translate(-50%,-50%)",
                      " transform-origin:100% 50%; transform: translate(-100%,-50%)",
                      " transform-origin:0% 100%; transform: translate(0%,-100%)",
                      " transform-origin:50% 100%; transform: translate(-50%,-100%)",
                      " transform-origin:100% 100%; transform: translate(-100%,-100%)"],
        divNode,
        styleTxt = "",
        p;

    function createHTMLoverlay(gc)
    {
      var ovlHTML, newOvl,
          ovlId,
          cvs = gc.cnvs,
          currOvl;

      ovlId = gc.cId+"_aovl_";
      // create 1px square DIV place at top left to give position reference to HTML children
      ovlHTML = "<div id='"+ovlId+"' style='position:absolute; width:1px; height:1px;'></div>";
      if (document.getElementById(ovlId))
      {
        currOvl = document.getElementById(ovlId);
        currOvl.parentNode.removeChild(currOvl);
      }
      cvs.insertAdjacentHTML('afterend', ovlHTML);
      // make it the same size as the background canvas
      newOvl = document.getElementById(ovlId);
      newOvl.style.backgroundColor = 'transparent';
      newOvl.style.left = gc.cnvs.offsetLeft+'px';
      newOvl.style.top = gc.cnvs.offsetTop+'px';
      newOvl.style.fontFamily = gc.fontFamily;
      newOvl.style.lineHeight = '1.4em';

      return newOvl;
    }

    if (typeof str !== 'string')
    {
      return;
    }
    if (document.getElementById(this.cId+"_aovl_") === null)
    {
      this.cnvs.alphaOvl = createHTMLoverlay(this);
    }
    if (typeof(opt.lorg) == "number" && [1,2,3,4,5,6,7,8,9].indexOf(opt.lorg) != -1)
    {
      lorg = opt.lorg;
    }

    divNode = document.createElement("div");
    divNode.style.position = "absolute";
    divNode.style.backgroundColor = "transparent";
    // to calc label top position
    p = this.toPixelCoords(xOfs, yOfs);
    // style the div depending of the lorg value eg set text-align to left right or center
    topPx = p.y.toFixed(0);
    leftPx = p.x.toFixed(0);
    styleTxt += "top:"+topPx+"px; left:"+leftPx+"px; color:"+txtCol+"; font-family:"+family+"; font-size:"+size+"px; font-weight:"+weight+";"+lorgWC[lorg];
    if (deg)
    {
      styleTxt += " rotate("+(-deg)+"deg); ";
    }

    divNode.style.cssText += styleTxt;
    divNode.innerHTML = str;
    this.cnvs.alphaOvl.appendChild(divNode);
  };

  /*-------------------------------------------------------------
   This text code is based on Jim Studt, CanvasTextFunctions
   see http://jim.studt.net/canvastext/
   It has been adapted to output Cgo2D format and has had Greek
   letters and a few symbols added to Hershey's original font
   -------------------------------------------------------------*/
  var hersheyFont = {};

  hersheyFont.letters = {
/*   */ ' ': {width:16, cdata:[]},
/* ! */ '!': {width:10, cdata:['M',5,21,'L',5,7,'M',5,2,'L',4,1,5,0,6,1,5,2]},
/* " */ '"': {width:16, cdata:['M',4,21,'L',4,14,'M',12,21,'L',12,14]},
/* # */ '#': {width:21, cdata:['M',11,25,'L',4,-7,'M',17,25,'L',10,-7,'M',4,12,'L',18,12,'M',3,6,'L',17,6]},
/* $ */ '$': {width:20, cdata:['M',8,25,'L',8,-4,'M',12,25,'L',12,-4,'M',17,18,'L',15,20,12,21,8,21,5,20,3,18,3,16,4,14,5,13,7,12,13,10,15,9,16,8,17,6,17,3,15,1,12,0,8,0,5,1,3,3]},
/* % */ '%': {width:24, cdata:['M',21,21,'L',3,0,'M',8,21,'L',10,19,10,17,9,15,7,14,5,14,3,16,3,18,4,20,6,21,8,21,10,20,13,19,16,19,19,20,21,21,'M',17,7,'L',15,6,14,4,14,2,16,0,18,0,20,1,21,3,21,5,19,7,17,7]},
/* & */ '&': {width:26, cdata:['M',23,12,'L',23,13,22,14,21,14,20,13,19,11,17,6,15,3,13,1,11,0,7,0,5,1,4,2,3,4,3,6,4,8,5,9,12,13,13,14,14,16,14,18,13,20,11,21,9,20,8,18,8,16,9,13,11,10,16,3,18,1,20,0,22,0,23,1,23,2]},
/* ' */ '\'': {width:10, cdata:['M',5,19,'L',4,20,5,21,6,20,6,18,5,16,4,15]},
/* ( */ '(': {width:14, cdata:['M',11,25,'L',9,23,7,20,5,16,4,11,4,7,5,2,7,-2,9,-5,11,-7]},
/* ) */ ')': {width:14, cdata:['M',3,25,'L',5,23,7,20,9,16,10,11,10,7,9,2,7,-2,5,-5,3,-7]},
/* * */ '*': {width:16, cdata:['M',8,15,'L',8,3,'M',3,12,'L',13,6,'M',13,12,'L',3,6]},
/* + */ '+': {width:26, cdata:['M',13,18,'L',13,0,'M',4,9,'L',22,9]},
/* , */ ',': {width:8, cdata:['M',5,4,'L',4,3,3,4,4,5,5,4,5,2,3,0]},
/* - */ '-': {width:26, cdata:['M',4,9,'L',22,9]},
/* . */ '.': {width:8, cdata:['M',4,5,'L',3,4,4,3,5,4,4,5]},
/* / */ '/': {width:22, cdata:['M',20,25,'L',2,-7]},
/* 0 */ '0': {width:20, cdata:['M',9,21,'L',6,20,4,17,3,12,3,9,4,4,6,1,9,0,11,0,14,1,16,4,17,9,17,12,16,17,14,20,11,21,9,21]},
/* 1 */ '1': {width:20, cdata:['M',6,17,'L',8,18,11,21,11,0]},
/* 2 */ '2': {width:20, cdata:['M',4,16,'L',4,17,5,19,6,20,8,21,12,21,14,20,15,19,16,17,16,15,15,13,13,10,3,0,17,0]},
/* 3 */ '3': {width:20, cdata:['M',5,21,'L',16,21,10,13,13,13,15,12,16,11,17,8,17,6,16,3,14,1,11,0,8,0,5,1,4,2,3,4]},
/* 4 */ '4': {width:20, cdata:['M',13,21,'L',3,7,18,7,'M',13,21,'L',13,0]},
/* 5 */ '5': {width:20, cdata:['M',15,21,'L',5,21,4,12,5,13,8,14,11,14,14,13,16,11,17,8,17,6,16,3,14,1,11,0,8,0,5,1,4,2,3,4]},
/* 6 */ '6': {width:20, cdata:['M',16,18,'L',15,20,12,21,10,21,7,20,5,17,4,12,4,7,5,3,7,1,10,0,11,0,14,1,16,3,17,6,17,7,16,10,14,12,11,13,10,13,7,12,5,10,4,7]},
/* 7 */ '7': {width:20, cdata:['M',17,21,'L',7,0,'M',3,21,'L',17,21]},
/* 8 */ '8': {width:20, cdata:['M',8,21,'L',5,20,4,18,4,16,5,14,7,13,11,12,14,11,16,9,17,7,17,4,16,2,15,1,12,0,8,0,5,1,4,2,3,4,3,7,4,9,6,11,9,12,13,13,15,14,16,16,16,18,15,20,12,21,8,21]},
/* 9 */ '9': {width:20, cdata:['M',16,14,'L',15,11,13,9,10,8,9,8,6,9,4,11,3,14,3,15,4,18,6,20,9,21,10,21,13,20,15,18,16,14,16,9,15,4,13,1,10,0,8,0,5,1,4,3]},
/* : */ ':': {width:8, cdata:['M',4,12,'L',3,11,4,10,5,11,4,12,'M',4,5,'L',3,4,4,3,5,4,4,5]},
/* ; */ ';': {width:8, cdata:['M',4,12,'L',3,11,4,10,5,11,4,12,'M',5,4,'L',4,3,3,4,4,5,5,4,5,2,3,0]},
/* < */ '<': {width:24, cdata:['M',20,18,'L',4,9,20,0]},
/* = */ '=': {width:26, cdata:['M',4,12,'L',22,12,'M',4,6,'L',22,6]},
/* > */ '>': {width:24, cdata:['M',4,18,'L',20,9,4,0]},
/* ? */ '?': {width:18, cdata:['M',3,16,'L',3,17,4,19,5,20,7,21,11,21,13,20,14,19,15,17,15,15,14,13,13,12,9,10,9,7,'M',9,2,'L',8,1,9,0,10,1,9,2]},
/* @ */ '@': {width:27, cdata:['M',18,13,'L',17,15,15,16,12,16,10,15,9,14,8,11,8,8,9,6,11,5,14,5,16,6,17,8,'M',12,16,'L',10,14,9,11,9,8,10,6,11,5,'M',18,16,'L',17,8,17,6,19,5,21,5,23,7,24,10,24,12,23,15,22,17,20,19,18,20,15,21,12,21,9,20,7,19,5,17,4,15,3,12,3,9,4,6,5,4,7,2,9,1,12,0,15,0,18,1,20,2,21,3,'M',19,16,'L',18,8,18,6,19,5]},
/* A */ 'A': {width:18, cdata:['M',9,21,'L',1,0,'M',9,21,'L',17,0,'M',4,7,'L',14,7]},
/* B */ 'B': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',13,21,16,20,17,19,18,17,18,15,17,13,16,12,13,11,'M',4,11,'L',13,11,16,10,17,9,18,7,18,4,17,2,16,1,13,0,4,0]},
/* C */ 'C': {width:21, cdata:['M',18,16,'L',17,18,15,20,13,21,9,21,7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5]},
/* D */ 'D': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',11,21,14,20,16,18,17,16,18,13,18,8,17,5,16,3,14,1,11,0,4,0]},
/* E */ 'E': {width:19, cdata:['M',4,21,'L',4,0,'M',4,21,'L',17,21,'M',4,11,'L',12,11,'M',4,0,'L',17,0]},
/* F */ 'F': {width:18, cdata:['M',4,21,'L',4,0,'M',4,21,'L',17,21,'M',4,11,'L',12,11]},
/* G */ 'G': {width:21, cdata:['M',18,16,'L',17,18,15,20,13,21,9,21,7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,18,8,'M',13,8,'L',18,8]},
/* H */ 'H': {width:22, cdata:['M',4,21,'L',4,0,'M',18,21,'L',18,0,'M',4,11,'L',18,11]},
/* I */ 'I': {width:8, cdata:['M',4,21,'L',4,0]},
/* J */ 'J': {width:16, cdata:['M',12,21,'L',12,5,11,2,10,1,8,0,6,0,4,1,3,2,2,5,2,7]},
/* K */ 'K': {width:21, cdata:['M',4,21,'L',4,0,'M',18,21,'L',4,7,'M',9,12,'L',18,0]},
/* L */ 'L': {width:17, cdata:['M',4,21,'L',4,0,'M',4,0,'L',16,0]},
/* M */ 'M': {width:24, cdata:['M',4,21,'L',4,0,'M',4,21,'L',12,0,'M',20,21,'L',12,0,'M',20,21,'L',20,0]},
/* N */ 'N': {width:22, cdata:['M',4,21,'L',4,0,'M',4,21,'L',18,0,'M',18,21,'L',18,0]},
/* O */ 'O': {width:22, cdata:['M',9,21,'L',7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,19,8,19,13,18,16,17,18,15,20,13,21,9,21]},
/* P */ 'P': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',13,21,16,20,17,19,18,17,18,14,17,12,16,11,13,10,4,10]},
/* Q */ 'Q': {width:22, cdata:['M',9,21,'L',7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,19,8,19,13,18,16,17,18,15,20,13,21,9,21,'M',12,4,'L',18,-2]},
/* R */ 'R': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',13,21,16,20,17,19,18,17,18,15,17,13,16,12,13,11,4,11,'M',11,11,'L',18,0]},
/* S */ 'S': {width:20, cdata:['M',17,18,'L',15,20,12,21,8,21,5,20,3,18,3,16,4,14,5,13,7,12,13,10,15,9,16,8,17,6,17,3,15,1,12,0,8,0,5,1,3,3]},
/* T */ 'T': {width:16, cdata:['M',8,21,'L',8,0,'M',1,21,'L',15,21]},
/* U */ 'U': {width:22, cdata:['M',4,21,'L',4,6,5,3,7,1,10,0,12,0,15,1,17,3,18,6,18,21]},
/* V */ 'V': {width:18, cdata:['M',1,21,'L',9,0,'M',17,21,'L',9,0]},
/* W */ 'W': {width:24, cdata:['M',2,21,'L',7,0,'M',12,21,'L',7,0,'M',12,21,'L',17,0,'M',22,21,'L',17,0]},
/* X */ 'X': {width:20, cdata:['M',3,21,'L',17,0,'M',17,21,'L',3,0]},
/* Y */ 'Y': {width:18, cdata:['M',1,21,'L',9,11,9,0,'M',17,21,'L',9,11]},
/* Z */ 'Z': {width:20, cdata:['M',17,21,'L',3,0,'M',3,21,'L',17,21,'M',3,0,'L',17,0]},
/* [ */ '[': {width:14, cdata:['M',4,25,'L',4,-7,'M',5,25,'L',5,-7,'M',4,25,'L',11,25,'M',4,-7,'L',11,-7]},
/* \ */ '\\': {width:14, cdata:['M',0,21,'L',14,-3]},
/* ] */ ']': {width:14, cdata:['M',9,25,'L',9,-7,'M',10,25,'L',10,-7,'M',3,25,'L',10,25,'M',3,-7,'L',10,-7]},
/* ^ */ '^': {width:16, cdata:['M',8,23,'L',0,9,'M',8,23,'L',16,9]},
/* _ */ '_': {width:18, cdata:['M',0,-7,'L',18,-7]},
/* ` */ '`': {width:8, cdata:['M',5,16,'L',3,14,3,12,4,11,5,12,4,13,3,12]},
/* a */ 'a': {width:19, cdata:['M',15,14,'L',15,0,'M',15,11,'L',13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* b */ 'b': {width:19, cdata:['M',4,21,'L',4,0,'M',4,11,'L',6,13,8,14,11,14,13,13,15,11,16,8,16,6,15,3,13,1,11,0,8,0,6,1,4,3]},
/* c */ 'c': {width:18, cdata:['M',15,11,'L',13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* d */ 'd': {width:19, cdata:['M',15,21,'L',15,0,'M',15,11,'L',13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* e */ 'e': {width:18, cdata:['M',3,8,'L',15,8,15,10,14,12,13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* f */ 'f': {width:12, cdata:['M',10,21,'L',8,21,6,20,5,17,5,0,'M',2,14,'L',9,14]},
/* g */ 'g': {width:19, cdata:['M',15,14,'L',15,-2,14,-5,13,-6,11,-7,8,-7,6,-6,'M',15,11,'L',13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* h */ 'h': {width:19, cdata:['M',4,21,'L',4,0,'M',4,10,'L',7,13,9,14,12,14,14,13,15,10,15,0]},
/* i */ 'i': {width:8, cdata:['M',3,21,'L',4,20,5,21,4,22,3,21,'M',4,14,'L',4,0]},
/* j */ 'j': {width:10, cdata:['M',5,21,'L',6,20,7,21,6,22,5,21,'M',6,14,'L',6,-3,5,-6,3,-7,1,-7]},
/* k */ 'k': {width:17, cdata:['M',4,21,'L',4,0,'M',14,14,'L',4,4,'M',8,8,'L',15,0]},
/* l */ 'l': {width:8, cdata:['M',4,21,'L',4,0]},
/* m */ 'm': {width:30, cdata:['M',4,14,'L',4,0,'M',4,10,'L',7,13,9,14,12,14,14,13,15,10,15,0,'M',15,10,'L',18,13,20,14,23,14,25,13,26,10,26,0]},
/* n */ 'n': {width:19, cdata:['M',4,14,'L',4,0,'M',4,10,'L',7,13,9,14,12,14,14,13,15,10,15,0]},
/* o */ 'o': {width:19, cdata:['M',8,14,'L',6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3,16,6,16,8,15,11,13,13,11,14,8,14]},
/* p */ 'p': {width:19, cdata:['M',4,14,'L',4,-7,'M',4,11,'L',6,13,8,14,11,14,13,13,15,11,16,8,16,6,15,3,13,1,11,0,8,0,6,1,4,3]},
/* q */ 'q': {width:19, cdata:['M',15,14,'L',15,-7,'M',15,11,'L',13,13,11,14,8,14,6,13,4,11,3,8,3,6,4,3,6,1,8,0,11,0,13,1,15,3]},
/* r */ 'r': {width:13, cdata:['M',4,14,'L',4,0,'M',4,8,'L',5,11,7,13,9,14,12,14]},
/* s */ 's': {width:17, cdata:['M',14,11,'L',13,13,10,14,7,14,4,13,3,11,4,9,6,8,11,7,13,6,14,4,14,3,13,1,10,0,7,0,4,1,3,3]},
/* t */ 't': {width:12, cdata:['M',5,21,'L',5,4,6,1,8,0,10,0,'M',2,14,'L',9,14]},
/* u */ 'u': {width:19, cdata:['M',4,14,'L',4,4,5,1,7,0,10,0,12,1,15,4,'M',15,14,'L',15,0]},
/* v */ 'v': {width:16, cdata:['M',2,14,'L',8,0,'M',14,14,'L',8,0]},
/* w */ 'w': {width:22, cdata:['M',3,14,'L',7,0,'M',11,14,'L',7,0,'M',11,14,'L',15,0,'M',19,14,'L',15,0]},
/* x */ 'x': {width:17, cdata:['M',3,14,'L',14,0,'M',14,14,'L',3,0]},
/* y */ 'y': {width:16, cdata:['M',2,14,'L',8,0,'M',14,14,'L',8,0,6,-4,4,-6,2,-7,1,-7]},
/* z */ 'z': {width:17, cdata:['M',14,14,'L',3,0,'M',3,14,'L',14,14,'M',3,0,'L',14,0]},
/* { */ '{': {width:14, cdata:['M',9,25,'L',7,24,6,23,5,21,5,19,6,17,7,16,8,14,8,12,6,10,'M',7,24,'L',6,22,6,20,7,18,8,17,9,15,9,13,8,11,4,9,8,7,9,5,9,3,8,1,7,0,6,-2,6,-4,7,-6,'M',6,8,'L',8,6,8,4,7,2,6,1,5,-1,5,-3,6,-5,7,-6,9,-7]},
/* | */ '|': {width:8, cdata:['M',4,25,'L',4,-7]},
/* } */ '}': {width:14, cdata:['M',5,25,'L',7,24,8,23,9,21,9,19,8,17,7,16,6,14,6,12,8,10,'M',7,24,'L',8,22,8,20,7,18,6,17,5,15,5,13,6,11,10,9,6,7,5,5,5,3,6,1,7,0,8,-2,8,-4,7,-6,'M',8,8,'L',6,6,6,4,7,2,8,1,9,-1,9,-3,8,-5,7,-6,5,-7]},
/* ~ */ '~': {width:24, cdata:['M',3,6,'L',3,8,4,11,6,12,8,12,10,11,14,8,16,7,18,7,20,8,21,10,'M',3,8,'L',4,10,6,11,8,11,10,10,14,7,16,6,18,6,20,7,21,10,21,12]},
/*      &deg; */ '\u00B0': {width:14, cdata:['M',6,21,'L',4,20,3,18,3,16,4,14,6,13,8,13,10,14,11,16,11,18,10,20,8,21,6,21]},
/*   &middot; */ '\u00B7': {width:5, cdata:['M',2,10,'L',2,9,3,9,3,10,2,10]},
/*    &times; */ '\u00D7': {width:22, cdata:['M',4,16,'L',18,2,'M',18,16,'L',4,2]},
/*   &divide; */ '\u00F7': {width:26, cdata:['M',13,18,'L',12,17,13,16,14,17,13,18,'M',4,9,'L',22,9,'M',13,2,'L',12,1,13,0,14,1,13,2]},
/*    &Alpha; */ '\u0391': {width:18, cdata:['M',9,21,'L',1,0,'M',9,21,'L',17,0,'M',4,7,'L',14,7]},
/*     &Beta; */ '\u0392': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',13,21,16,20,17,19,18,17,18,15,17,13,16,12,13,11,'M',4,11,'L',13,11,16,10,17,9,18,7,18,4,17,2,16,1,13,0,4,0]},
/*    &Gamma; */ '\u0393': {width:17, cdata:['M',4,21,'L',4,0,'M',4,21,'L',16,21]},
/*    &Delta; */ '\u0394': {width:18, cdata:['M',9,21,'L',1,0,'M',9,21,'L',17,0,'M',1,0,'L',17,0]},
/*  &Epsilon; */ '\u0395': {width:19, cdata:['M',4,21,'L',4,0,'M',4,21,'L',17,21,'M',4,11,'L',12,11,'M',4,0,'L',17,0]},
/*     &Zeta; */ '\u0396': {width:20, cdata:['M',17,21,'L',3,0,'M',3,21,'L',17,21,'M',3,0,'L',17,0]},
/*      &Eta; */ '\u0397': {width:22, cdata:['M',4,21,'L',4,0,'M',18,21,'L',18,0,'M',4,11,'L',18,11]},
/*    &Theta; */ '\u0398': {width:22, cdata:['M',9,21,'L',7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,19,8,19,13,18,16,17,18,15,20,13,21,9,21,'M',8,11,'L',14,11]},
/*     &Iota; */ '\u0399': {width:8, cdata:['M',4,21,'L',4,0]},
/*    &Kappa; */ '\u039A': {width:21, cdata:['M',4,21,'L',4,0,'M',18,21,'L',4,7,'M',9,12,'L',18,0]},
/*   &Lambda; */ '\u039B': {width:18, cdata:['M',9,21,'L',1,0,'M',9,21,'L',17,0]},
/*       &Mu; */ '\u039C': {width:24, cdata:['M',4,21,'L',4,0,'M',4,21,'L',12,0,'M',20,21,'L',12,0,'M',20,21,'L',20,0]},
/*       &Nu; */ '\u039D': {width:22, cdata:['M',4,21,'L',4,0,'M',4,21,'L',18,0,'M',18,21,'L',18,0]},
/*       &Xi; */ '\u039E': {width:18, cdata:['M',2,21,'L',16,21,'M',6,11,'L',12,11,'M',2,0,'L',16,0]},
/*  &Omicron; */ '\u039F': {width:22, cdata:['M',9,21,'L',7,20,5,18,4,16,3,13,3,8,4,5,5,3,7,1,9,0,13,0,15,1,17,3,18,5,19,8,19,13,18,16,17,18,15,20,13,21,9,21]},
/*       &Pi; */ '\u03A0': {width:22, cdata:['M',4,21,'L',4,0,'M',18,21,'L',18,0,'M',4,21,'L',18,21]},
/*      &Rho; */ '\u03A1': {width:21, cdata:['M',4,21,'L',4,0,'M',4,21,'L',13,21,16,20,17,19,18,17,18,14,17,12,16,11,13,10,4,10]},
/*    &Sigma; */ '\u03A3': {width:18, cdata:['M',2,21,'L',9,11,2,0,'M',2,21,'L',16,21,'M',2,0,'L',16,0]},
/*      &Tau; */ '\u03A4': {width:16, cdata:['M',8,21,'L',8,0,'M',1,21,'L',15,21]},
/*  &Upsilon; */ '\u03A5': {width:18, cdata:['M',2,16,'L',2,18,3,20,4,21,6,21,7,20,8,18,9,14,9,0,'M',16,16,'L',16,18,15,20,14,21,12,21,11,20,10,18,9,14]},
/*      &Phi; */ '\u03A6': {width:20, cdata:['M',10,21,'L',10,0,'M',8,16,'L',5,15,4,14,3,12,3,9,4,7,5,6,8,5,12,5,15,6,16,7,17,9,17,12,16,14,15,15,12,16,8,16]},
/*      &Chi; */ '\u03A7': {width:20, cdata:['M',3,21,'L',17,0,'M',3,0,'L',17,21]},
/*      &Psi; */ '\u03A8': {width:22, cdata:['M',11,21,'L',11,0,'M',2,15,'L',3,15,4,14,5,10,6,8,7,7,10,6,12,6,15,7,16,8,17,10,18,14,19,15,20,15]},
/*    &Omega; */ '\u03A9': {width:20, cdata:['M',3,0,'L',7,0,4,7,3,11,3,15,4,18,6,20,9,21,11,21,14,20,16,18,17,15,17,11,16,7,13,0,17,0]},
/*    &alpha; */ '\u03B1': {width:21, cdata:['M',9,14,'L',7,13,5,11,4,9,3,6,3,3,4,1,6,0,8,0,10,1,13,4,15,7,17,11,18,14,'M',9,14,'L',11,14,12,13,13,11,15,3,16,1,17,0,18,0]},
/*     &beta; */ '\u03B2': {width:19, cdata:['M',12,21,'L',10,20,8,18,6,14,5,11,4,7,3,1,2,-7,'M',12,21,'L',14,21,16,19,16,16,15,14,14,13,12,12,9,12,'M',9,12,'L',11,11,13,9,14,7,14,4,13,2,12,1,10,0,8,0,6,1,5,2,4,5]},
/*    &gamma; */ '\u03B3': {width:19, cdata:['M',1,11,'L',3,13,5,14,6,14,8,13,9,12,10,9,10,5,9,0,'M',17,14,'L',16,11,15,9,9,0,7,-4,6,-7]},
/*    &delta; */ '\u03B4': {width:18, cdata:['M',11,14,'L',8,14,6,13,4,11,3,8,3,5,4,2,5,1,7,0,9,0,11,1,13,3,14,6,14,9,13,12,11,14,9,16,8,18,8,20,9,21,11,21,13,20,15,18]},
/*  &epsilon; */ '\u03B5': {width:16, cdata:['M',13,12,'L',12,13,10,14,7,14,5,13,5,11,6,9,9,8,'M',9,8,'L',5,7,3,5,3,3,4,1,6,0,9,0,11,1,13,3]},
/*     &zeta; */ '\u03B6': {width:15, cdata:['M',10,21,'L',8,20,7,19,7,18,8,17,11,16,14,16,'M',14,16,'L',10,14,7,12,4,9,3,6,3,4,4,2,6,0,9,-2,10,-4,10,-6,9,-7,7,-7,6,-5]},
/*      &eta; */ '\u03B7': {width:20, cdata:['M',1,10,'L',2,12,4,14,6,14,7,13,7,11,6,7,4,0,'M',6,7,'L',8,11,10,13,12,14,14,14,16,12,16,9,15,4,12,-7]},
/*     &theta */ '\u03B8': {width:21, cdata:['M',12,21,'L',9,20,7,18,5,15,4,13,3,9,3,5,4,2,5,1,7,0,9,0,12,1,14,3,16,6,17,8,18,12,18,16,17,19,16,20,14,21,12,21,'M',4,11,'L',18,11]},
/*     &iota; */ '\u03B9': {width:11, cdata:['M',6,14,'L',4,7,3,3,3,1,4,0,6,0,8,2,9,4]},
/*    &kappa; */ '\u03BA': {width:18, cdata:['M',6,14,'L',2,0,'M',16,13,'L',15,14,14,14,12,13,8,9,6,8,5,8,'M',5,8,'L',7,7,8,6,10,1,11,0,12,0,13,1]},
/*   &lambda; */ '\u03BB': {width:16, cdata:['M',1,21,'L',3,21,5,20,6,19,14,0,'M',8,14,'L',2,0]},
/*       &mu; */ '\u03BC': {width:21, cdata:['M',7,14,'L',1,-7,'M',6,10,'L',5,5,5,2,7,0,9,0,11,1,13,3,15,7,'M',17,14,'L',15,7,14,3,14,1,15,0,17,0,19,2,20,4]},
/*       &nu; */ '\u03BD': {width:18, cdata:['M',3,14,'L',6,14,5,8,4,3,3,0,'M',16,14,'L',15,11,14,9,12,6,9,3,6,1,3,0]},
/*       &xi; */ '\u03BE': {width:16, cdata:['M',10,21,'L',8,20,7,19,7,18,8,17,11,16,14,16,'M',11,16,'L',8,15,6,14,5,12,5,10,7,8,10,7,12,7,'M',10,7,'L',6,6,4,5,3,3,3,1,5,-1,9,-3,10,-4,10,-6,8,-7,6,-7]},
/*  &omicron; */ '\u03BF': {width:17, cdata:['M',8,14,'L',6,13,4,11,3,8,3,5,4,2,5,1,7,0,9,0,11,1,13,3,14,6,14,9,13,12,12,13,10,14,8,14]},
/*       &pi; */ '\u03C0': {width:22, cdata:['M',9,14,'L',5,0,'M',14,14,'L',15,8,16,3,17,0,'M',2,11,'L',4,13,7,14,20,14]},
/*      &rho; */ '\u03C1': {width:18, cdata:['M',4,8,'L',4,5,5,2,6,1,8,0,10,0,12,1,14,3,15,6,15,9,14,12,13,13,11,14,9,14,7,13,5,11,4,8,0,-7]},
/*    &sigma; */ '\u03C3': {width:20, cdata:['M',18,14,'L',8,14,6,13,4,11,3,8,3,5,4,2,5,1,7,0,9,0,11,1,13,3,14,6,14,9,13,12,12,13,10,14]},
/*      &tau; */ '\u03C4': {width:20, cdata:['M',11,14,'L',8,0,'M',2,11,'L',4,13,7,14,18,14]},
/*  &upsilon; */ '\u03C5': {width:20, cdata:['M',1,10,'L',2,12,4,14,6,14,7,13,7,11,5,5,5,2,7,0,9,0,12,1,14,3,16,7,17,11,17,14]},
/*      &phi; */ '\u03C6': {width:22, cdata:['M',8,13,'L',6,12,4,10,3,7,3,4,4,2,5,1,7,0,10,0,13,1,16,3,18,6,19,9,19,12,17,14,15,14,13,12,11,8,9,3,6,-7]},
/*      &chi; */ '\u03C7': {width:18, cdata:['M',2,14,'L',4,14,6,12,12,-5,14,-7,16,-7,'M',17,14,'L',16,12,14,9,4,-2,2,-5,1,-7]},
/*      &psi; */ '\u03C8': {width:23, cdata:['M',16,21,'L',8,-7,'M',1,10,'L',2,12,4,14,6,14,7,13,7,11,6,6,6,3,7,1,9,0,11,0,14,1,16,3,18,6,20,11,21,14]},
/*    &omega; */ '\u03C9': {width:23, cdata:['M',8,14,'L',6,13,4,10,3,7,3,4,4,1,5,0,7,0,9,1,11,4,'M',12,8,'L',11,4,12,1,13,0,15,0,17,1,19,4,20,7,20,10,19,13,18,14]},
/* &thetasym; */ '\u03D1': {width:21, cdata:['M',1,10,'L',2,12,4,14,6,14,7,13,7,11,6,6,6,3,7,1,8,0,10,0,12,1,14,4,15,6,16,9,17,14,17,17,16,20,14,21,12,21,11,19,11,17,12,14,14,11,16,9,19,7]}
  };

  hersheyFont.strWidth = function(fontSize, str)
  {
    var total = 0,
        i, c;

    for (i=0; i<str.length; i++)
    {
    	c = hersheyFont.letters[str.charAt(i)];
    	if (c)
      {
        total += c.width;
      }
    }

    return total;
  };

  hersheyFont.stringToCgo2D = function(strg, x, y, fontSz, lorg)
  {
    "use strict"
    var xOfs = x || 0,
        yOfs = y || 0,
        size = fontSz || 12,
        lorigin = lorg || 1,
        i, c, sft,
        wid = 0,
        hgt = 0,
        wid2,
        hgt2,
        lorgX, lorgY,
        dx, dy, mag,
        lorgWC,
        charData,
        cgoData = [];

    function shiftChar(cAry, xof, yof, dx, dy, scl)    // cAry = Hershey Cgo2D array, d = shift required
    {
      var newAry = [],
          x, y,
          j = 0;

      while (j<cAry.length)
      {
        if (typeof cAry[j] === "string")
        {
          newAry.push(cAry[j++]);      // push the command letter
        }
        x = xof + scl*(cAry[j++] + dx);   // j now index of x coord in x,y pair
        y = yof + scl*(cAry[j++] + dy);
        newAry.push(+x.toFixed(3), +y.toFixed(3));   // the '+' coverts string back to number
      }
      return newAry;
    }

    if (typeof strg !== 'string')
    {
      return {"cgoData": [], "width": 0, "height": 0};
    }
    /* Note: char cell is 33 pixels high, M char size is 21 pixels (0 to 21), descenders go from -7 to 21.
       to convert this data to fontSize (pixels) scale array data by fontSize/33.
       Reference height for vertically alignment is charHeight = 29 pixels. */
    wid = this.strWidth(size, strg)
    hgt = 29;           // default font size in pixels,  wid = string width in pixels
    wid2 = wid/2;
    hgt2 = hgt/2;
    lorgWC = [0, [0, hgt],  [wid2, hgt],  [wid, hgt],
                 [0, hgt2], [wid2, hgt2], [wid, hgt2],
                 [0, 0],    [wid2, 0],    [wid, 0]];
    // calc lorg offset
    if (lorgWC[lorigin] !== undefined)  // check for out of bounds
    {
      lorgX = -lorgWC[lorigin][0];
      lorgY = -lorgWC[lorigin][1]+0.25*hgt;   // correct for alphabetic baseline, its offset about 0.25*char height ;
    }
    // scale by fontSize
    mag = size/33;    // size/33 is scale factor to give requested font size in pixels
    sft = 0;          // shift to move each letter into place
    for (i=0; i<strg.length; i++)
    {
      c = hersheyFont.letters[strg.charAt(i)];
      if (c)
      {
        charData = shiftChar(c.cdata, xOfs, yOfs, sft+lorgX, lorgY, mag);
        sft += c.width;               // add character width to total
        cgoData = cgoData.concat(charData);   // make a single array of cgo2D for the whole string
      }
    }

    return {"cgoData": cgoData, "width": wid*mag, "height": hgt*mag, "weight":2.5*mag};
  };

  CangoCore.prototype.drawVectorText = function(str, options)
  {
    var opt = (typeof options === 'object')? options: {},   // avoid undeclared object errors
        // options honoured: x, y, strokeColor, fontSize, fontWeight, lorg, degs, bgFillColor,
        size = opt.fontSize || opt.fontsize || this.fontSize,
        lorg = opt.lorg || 1,
        lorigin = 1,               // locate origin
        xOfs = opt.x || 0,
        yOfs = opt.y || 0,
        txtCol = opt.strokeColor || opt.strokecolor || this.penCol,
        fontWt = opt.fontWeight || opt.fontweight || this.fontWeight, // weight in string or number 100..900
        deg = opt.degs || 0,
        bgColor = opt.bgFillColor || opt.bgfillcolor || null,
        weight = this.fontWeight,
        lnWid,
        pathData,
        txtObj,
        dx, dy,
        wid, hgt, wid2, hgt2,
        lorgWC,
        bboxData,
        bbox;

    if ([1,2,3,4,5,6,7,8,9].indexOf(lorg) !== -1)
    {
      lorigin = lorg;
    }
    pathData = hersheyFont.stringToCgo2D(str, 0, 0, size/this.xscl, lorigin);   // convert px size to WC

    // handle fontWeight using lineWidth
    if (typeof fontWt === "number" && (fontWt > 99) && (fontWt < 901))
    {
      weight = fontWt;
    }
    lnWid = 0.08*size*weight/400;
    // If box text is requested (by bgFillColor) then create the bounding box and fill it
    if (typeof bgColor === "string") // a color has been defined)
    {
      wid = pathData.width,
      hgt = pathData.height,
      lorgWC = [0, [0, hgt],   [wid/2, hgt],   [wid, hgt],
                   [0, hgt/2], [wid/2, hgt/2], [wid, hgt/2],
                   [0, 0],     [wid2, 0],      [wid, 0]];
      // calc lorg offsets
      if (lorgWC[lorg] !== undefined)  // check for out of bounds
      {
        dx = -lorgWC[lorg][0];
        dy = -lorgWC[lorg][1];
      }
      bboxData = ["M",dx,dy,"v",hgt,"h",wid,"v",-hgt,"z"];
      // expand the bounding box 10% using a border the same color
      bbox = new Shape(bboxData, {fillColor:bgColor, border: true, lineWidth:0.2*size, strokeColor:bgColor});
      if (this.yDown)
      {
        bbox.scale(1, -1);
      }
      bbox.transform.rotate(deg);
      bbox.transform.translate(xOfs, yOfs);
      this.render(bbox);
    }
    // now render the vector text
    txtObj = new Path(pathData.cgoData, {iso:true, strokeColor:txtCol, lineWidth: lnWid, lineCap:"round"});
    if (this.yDown)
    {
      txtObj.scale(1, -1);
    }
    txtObj.transform.rotate(deg);
    txtObj.transform.translate(xOfs, yOfs);
    this.render(txtObj);
  };

  CangoCore.prototype.drawArrow = function(headX, headY, options)
  {
    // added properties: x, y, shaftWidth, shaftWidthWC, headSize
    var objType = "SHAPE",
        opt = (typeof options === 'object')? options: {},   // avoid undeclared object errors
        deg = opt.degs || 0,
        sx = opt.x || 0,
        sy = opt.y || 0,
        ex = headX || 0,
        ey = headY || 0,
        lineWid = this.penWid/this.xscl,          // default lineWidth (in pixels) convert to WC
        hdSize = opt.headSize || 4,
        y2xUnits = Math.abs(this.yscl/this.xscl), // converts world coords Y axis units to X axis units
        dx = (ex-sx),                             // x component of shaft length
        dy = (ey-sy),                             // y component
        theta = 0,                                // angle of the arrow to x axis
        headAng = 21*Math.PI/180.0,               // half included angle of arrow head = 21deg
        edgeLen,                                  // X axis units
        headLen,                                  // length of arrow head along shaft
        ds,                                       // half width of shaft
        org, tip,
        len,
        p1, p2, p3, p4, p5, p6, t,
        arwData, arwRotated,
        arrowDef,
        arrowObj,
        renderOpts;

    function Point(px, py){ return {x:px, y:py};}
    function dist(p1, p2){ return Math.sqrt((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y));}
    function rotatePoint(p, rads){   // rotate a 2D point by 'rads' radians
      var sinA = Math.sin(rads),
          cosA = Math.cos(rads);
      return {x: p.x*cosA - p.y*sinA, y: p.x*sinA + p.y*cosA};
    }

    // support for zoom and pan changing shaft width
    if (opt.shaftWidthWC)
    {
      lineWid = opt.shaftWidthWC;
    }
    else if (opt.shaftWidth)
    {
      lineWid = opt.shaftWidth/this.xscl;
    }
    ds = 0.5*lineWid;
    dy *= y2xUnits;
    theta = Math.atan2(dy, dx);           // angle of the arrow to x axis
    edgeLen = hdSize*lineWid;
    headLen = edgeLen*Math.cos(headAng),      // length of arrow head along shaft
    // work in X axis units - and always draw with 'iso' true
    org = new Point(sx, sy*y2xUnits);
    tip = new Point(ex, ey*y2xUnits);
    len = dist(org, tip);
    // draw the arrow along the x axis
    p1 = new Point(0, ds);
    p2 = new Point(len-headLen, ds);
    p3 = new Point(p2.x, edgeLen*Math.sin(headAng));
    t = new Point(len, 0);
    p4 = new Point(p3.x, -p3.y);
    p5 = new Point(p2.x, -p2.y);
    p6 = new Point(p1.x, -p1.y);
    arwData = [p1, p2, p3, t, p4, p5, p6];
    // rotate array of points by theta then translate drawing origin to sx, sy
    arwRotated = arwData.map(function(p){ return rotatePoint(p, theta)});
    // convert to simple array
    arrowDef = arwRotated.reduce(function(acc, curr){
                                acc.push(curr.x, curr.y);
                                return acc; }, ["M"]);     // start with an 'M' command
    // insert the "L" at start of the line segments just for clarity (works fine without this)
    arrowDef.splice(3, 0, "L");
    arrowDef.push("Z");  // close the path for future filling
    arrowObj = new Shape(arrowDef, options);
    arrowObj.setProperty("iso", true);      // needed to keep shape in non-isotropic coords
    arrowObj.transform.rotate(deg);
    arrowObj.transform.translate(sx, sy);
    this.render(arrowObj);     // x,y scl, degs are ignored they are built into arrowDef
  };

  CangoCore.prototype.drawArrowArc = function(radius, startAngle, stopAngle, options)
  {
    // This will create an arc centred on (0,0) radius r, from angle 'startAngle' to 'stopAngle' (deg)
    // arrow head will be at stop end only, arrow head in proportion to shaft width
    var opt = (typeof options === 'object')? options: {},   // avoid undeclared object errors
        deg = opt.degs || 0,
        cx = opt.x || 0,
        cy = opt.y || 0,
        r = radius || 1,
        clockwise = opt.clockwise,
        lineWid = this.penWid/this.xscl,
        hdSize = opt.headSize || 4,
        startA = to360(startAngle),   // move angle to 0..360
        stopA = to360(stopAngle),
        sweep = clockwise? 1: 0,
        angSweep = (startA > stopA)? 1: 0,  // 1 = CW 0 = CCW
        rad = Math.PI/180,
        ds, r1, r2,
        // now tweek the head size for different line widths for looks only
        headSpanWC,           // length of arrow head along arc (in world coords)
        headSpanRad,          // length of arrow head in radians
        stopRad, startRad,
        span,
        spanRad,
        lrg,
        baseA,
        tx, ty,               // tip x,y
        qr1, qr2,             // radii of tips of barbs
        q1x, q1y, q2x, q2y,   // tips of arrow barbs
        b1x, b1y, e1x, e1y,
        b2x, b2y, e2x, e2y,
        sgnY = -1,
        arrowDef,
        arrowObj;

    function to360(a)
    {
      while (a<0)
      {
        a += 360;
      }
      while (a>=360)
      {
        a -= 360;
      }
      return parseFloat(a);    // force a float
    }

    // support for zoom and pan changing shaft width
    if (opt.shaftWidthWC)
    {
      lineWid = opt.shaftWidthWC;
    }
    else if (opt.shaftWidth)
    {
      lineWid = opt.shaftWidth/this.xscl;
    }
    ds = 0.5*lineWid;
    r1 = r-ds;
    r2 = r+ds;
    headSpanWC = 0.95*hdSize*lineWid; // length of arrow head along arc (in world coords)
    headSpanRad = headSpanWC/r;       // length of arrow head in radians
    span = angSweep? startA - stopA: stopA - startA;
    if ((angSweep && !sweep)||(!angSweep && sweep))     // XOR = going the wrong way round
    {
      // default is the wrong direction switch direction
      span = 360 - span;
    }
    spanRad = rad*span;
    lrg = (span>180)? 1: 0;
    // make sure spna is bigger than arrow head
    if (headSpanRad > spanRad)   // make arc at least as big as the requested head size
    {
      headSpanRad = spanRad;
    }
    // handle the inverted coord where Cango must reverse direction to maintain the sweep=CW convention
    if (this.yDown)
    {
      lrg = 1 - lrg;
      sgnY = 1;
    }
    else
    {
      sweep = 1 - sweep;
    }
    // construct the nodes of the arrow shape
    stopRad = sgnY*rad*stopA;
    startRad = sgnY*rad*startA;
    baseA = sweep? stopRad-sgnY*headSpanRad: stopRad+sgnY*headSpanRad;  // angle at base of arrow head
    qr1 = r-0.35*headSpanWC;             // 0.34 is sin 21deg tilt angle of head sides
    qr2 = r+0.35*headSpanWC;

    b1x = r1*Math.cos(startRad);
    b1y = r1*Math.sin(startRad)*sgnY;
    e1x = r1*Math.cos(baseA);
    e1y = r1*Math.sin(baseA)*sgnY;
    b2x = r2*Math.cos(startRad);
    b2y = r2*Math.sin(startRad)*sgnY;
    e2x = r2*Math.cos(baseA);
    e2y = r2*Math.sin(baseA)*sgnY;
    tx = r*Math.cos(stopRad);
    ty = r*Math.sin(stopRad)*sgnY;
    q1x = qr1*Math.cos(baseA);
    q1y = qr1*Math.sin(baseA)*sgnY;
    q2x = qr2*Math.cos(baseA);
    q2y = qr2*Math.sin(baseA)*sgnY;


    arrowDef = ["M", b2x,b2y, "A",r2,r2,0,lrg,sweep,e2x,e2y, "L", q2x,q2y, "A",qr2,qr2,0,0,sweep,tx,ty, "A",qr1,qr1,0,0,1-sweep,q1x,q1y, "L",e1x,e1y, "A",r1,r1,0,lrg,1-sweep,b1x,b1y, "Z"];

    arrowObj = new Shape(arrowDef, options);
    arrowObj.setProperty("iso", true);      // needed to keep shape in non-isotropic coords
    arrowObj.transform.rotate(deg);
    arrowObj.transform.translate(cx, cy);
    this.render(arrowObj);
  };



 /* ==========================================================================
  // http://kevin.vanzonneveld.net
  // +   original by: Ash Searle (http://hexmen.com/blog/)
  // + namespaced by: Michael White (http://getsprink.com)
  // +    tweaked by: Jack
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Paulo Freitas
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +      input by: Brett Zamir (http://brett-zamir.me)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Dj
  // +   improved by: Allidylls
  // *     example 1: sprintf("%01.2f", 123.1);
  // *     returns 1: 123.10
  // *     example 2: sprintf("[%10s]", 'monkey');
  // *     returns 2: '[    monkey]'
  // *     example 3: sprintf("[%'#10s]", 'monkey');
  // *     returns 3: '[####monkey]'
  // *     example 4: sprintf("%d", 123456789012345);
  // *     returns 4: '123456789012345'
 *==========================================================================*/
  sprintf = function()
  {
    var regex = /%%|%(\d+\$)?([\-\+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g,
        a = arguments,
        i = 0,
        format = a[i++];

    function pad(str, len, chr, leftJustify)
    {
      var padding;

      if (!chr)
      {
        chr = ' ';
      }
      padding = (str.length >= len) ? '' : new Array(1 + len - str.length).join(chr);
      return leftJustify ? str + padding : padding + str;
    }

    // justify()
    function justify(value, prefix, leftJustify, minWidth, zeroPad, customPadChar)
    {
      var diff = minWidth - value.length;
      if (diff > 0)
      {
        if (leftJustify || !zeroPad)
        {
          value = pad(value, minWidth, customPadChar, leftJustify);
        }
        else
        {
          value = value.slice(0, prefix.length) + pad('', diff, '0', true) + value.slice(prefix.length);
        }
      }
      return value;
    }

    // formatBaseX()
    function formatBaseX(value, base, prefix, leftJustify, minWidth, precision, zeroPad)
    {
      // Note: casts negative numbers to positive ones
      var number = value >> 0;
      prefix = prefix && number && ({'2': '0b','8': '0', '16': '0x'}[base] || '');
      value = prefix + pad(number.toString(base), precision || 0, '0', false);
      return justify(value, prefix, leftJustify, minWidth, zeroPad);
    }

    // formatString()
    function formatString(value, leftJustify, minWidth, precision, zeroPad, customPadChar)
    {
      if (precision !== null)
      {
        value = value.slice(0, precision);
      }
      return justify(value, '', leftJustify, minWidth, zeroPad, customPadChar);
    }

    // doFormat()
    function doFormat(substring, valueIndex, flags, minWidth, _, precision, type)
    {
      var number,
          prefix,
          method,
          textTransform,
          value,
          leftJustify = false,
          positivePrefix = '',
          zeroPad = false,
          prefixBaseX = false,
          customPadChar = ' ',
          flagsl = flags.length,
          j;

      if (substring === '%%')
      {
        return '%';
      }

      for (j = 0; flags && j < flagsl; j++)
      {
        switch (flags.charAt(j))
        {
          case ' ':
            positivePrefix = ' ';
            break;
          case '+':
            positivePrefix = '+';
            break;
          case '-':
            leftJustify = true;
            break;
          case "'":
            customPadChar = flags.charAt(j + 1);
            break;
          case '0':
            zeroPad = true;
            break;
          case '#':
            prefixBaseX = true;
            break;
        }
      }

      // parameters may be null, undefined, empty-string or real valued
      // we want to ignore null, undefined and empty-string values
      if (!minWidth)
      {
        minWidth = 0;
      }
      else if (minWidth === '*')
      {
        minWidth = +a[i++];
      }
      else if (minWidth.charAt(0) === '*')
      {
        minWidth = +a[minWidth.slice(1, -1)];
      }
      else
      {
        minWidth = +minWidth;
      }

      // Note: undocumented perl feature:
      if (minWidth < 0)
      {
        minWidth = -minWidth;
        leftJustify = true;
      }

      if (!isFinite(minWidth))
      {
        throw new Error('sprintf: (minimum-)width must be finite');
      }

      if (!precision)
      {
        precision = 'fFeE'.indexOf(type) > -1 ? 6 : (type === 'd') ? 0 : undefined;
      }
      else if (precision === '*')
      {
        precision = +a[i++];
      }
      else if (precision.charAt(0) === '*')
      {
        precision = +a[precision.slice(1, -1)];
      }
      else
      {
        precision = +precision;
      }

      // grab value using valueIndex if required?
      value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];

      switch (type)
      {
        case 's':
          return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);
        case 'c':
          return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);
        case 'b':
          return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'o':
          return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'x':
          return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'X':
          return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();
        case 'u':
          return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);
        case 'i':
        case 'd':
          number = +value || 0;
          number = Math.round(number - number % 1); // Plain Math.round doesn't just truncate
          prefix = number < 0 ? '-' : positivePrefix;
          value = prefix + pad(String(Math.abs(number)), precision, '0', false);
          return justify(value, prefix, leftJustify, minWidth, zeroPad);
        case 'e':
        case 'E':
        case 'f': // Should handle locales (as per setlocale)
        case 'F':
        case 'g':
        case 'G':
          number = +value;
          prefix = number < 0 ? '-' : positivePrefix;
          method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(type.toLowerCase())];
          textTransform = ['toString', 'toUpperCase'][('eEfFgG'.indexOf(type)) % 2];
          value = prefix + Math.abs(number)[method](precision);
          return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();
        default:
          return substring;
      }
    }

    return format.replace(regex, doFormat);
  };

  return CangoCore;    // return the augmented Cango object, over-writing the existing

}(Cango));    // Take the existing Cango object and add Axes drawing methods

