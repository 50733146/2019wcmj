/*==========================================================================
  Filename: Cango-13v08.js
  Rev: 13
  By: A.R.Collins
  Description: A graphics library for the canvas element.
  License: Released into the public domain, latest version at
           <http://www/arc.id.au/CanvasGraphics.html>
           Please give credit to A.R.Collins <http://www.arc.id.au>
  Report bugs to tony at arc.id.au

  Date   |Description                                                   |By
  --------------------------------------------------------------------------
  14Oct12 Rev 1.00 First release based on Cango0v43                      ARC
  29Nov12 Released as Cango2v00                                          ARC
  06May14 Released as Cango4v00                                          ARC
  14Jul14 Released as Cango-5v00                                         ARC
  09Feb15 Released as Cango-6v00                                         ARC
  20Mar15 Released as Cango-7v00                                         ARC
  21Dec15 Released as Cango-8v00                                         ARC
  28Mar17 Released as Cango-9v00                                         ARC
  10Jul17 Released as Cango-10v00                                        ARC
  22Jul17 Released as Cango-11v00                                        ARC
  15Aug17 Released as Cango-12v00                                        ARC
  28Aug17 bugfix: trigger resize handler on window resize not canvas     ARC      
  04Sep17 bugfix: translate y shift for iso objs should not be scled
          with different X and Y scaling                                 ARC      
  09Sep17 Drop the now unused DrawCmd.parmsOrg                           ARC      
  10Sep17 bugfix: setProperty didn't allow Clip iso to be set
          Maintain cmdsAry or drawCmds, drop cmdsStr                     ARC      
  12Feb18 Add fillRule property to Shape
          Removed revWinding method (replaced by fillRule=evenodd)       ARC
  13Feb18 Remove drawCmds, only use Path2D to define Path objects
          Remove code only used when fullPath2DSupport = false           ARC
  14Feb18 Add SVGtoRHC method the ClipMask, Path and Shape               ARC
  15Feb18 Remove aryCmds property as unnecessary                         ARC
  20Feb18 Tidy Group.addObj make it handle nested arrays of Obj2D        ARC
  01Mar18 Remove cmdsAry from Ver 13 just use DrawCmds                   ARC
  02March Released as Cango-13v00 (last drawCmds version)                ARC
  19Mar18 Replace Array.contains with standard Array.includes
          Remove custom SVG parser use browser SVG support or polyfill   ARC
  20Mar18 Use ctx.transform rather than tranform each DrawCmd point
          Redefine DrawCmd object to use flat coord array
          Redefine DrawCmd to use raw getPathData array
          Removed DrawCmd as a n object type                             ARC
  21Mar18 Removed cgo2DToDrawCmds and svgToDrawCmds                      ARC
  22Mar18 Include the minified polyfill rather than use a separate file  ARC 
  ==========================================================================*/

// exposed globals
var Cango, 
    Path, Shape, Img, Text, ClipMask, Group,
    LinearGradient, RadialGradient, Tweener,
    initZoomPan,
    shapeDefs;  // predefined geometric shapes in Cgo2D format

(function() {
  "use strict";

  var uniqueVal = 0,    // used to generate unique value for different Cango instances
      identityMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();

  const cvsCmds = { "M": "moveTo",
                    "L": "lineTo",
                    "C": "bezierCurveTo",
                    "Z": "closePath" };

  if (!SVGPathElement.prototype.getPathData || !SVGPathElement.prototype.setPathData) {
    // @info
    //   Polyfill for SVG getPathData() and setPathData() methods. Based on:
    //   - SVGPathSeg polyfill by Philip Rogers (MIT License)
    //     https://github.com/progers/pathseg
    //   - SVGPathNormalizer by Tadahisa Motooka (MIT License)
    //     https://github.com/motooka/SVGPathNormalizer/tree/master/src
    //   - arcToCubicCurves() by Dmitry Baranovskiy (MIT License)
    //     https://github.com/DmitryBaranovskiy/raphael/blob/v2.1.1/raphael.core.js#L1837
    // @author
    //   Jarosław Foksa
    // @source
    //   https://github.com/jarek-foksa/path-data-polyfill.js/
    // @license
    //   MIT License
    !function(){var e={Z:"Z",M:"M",L:"L",C:"C",Q:"Q",A:"A",H:"H",V:"V",S:"S",T:"T",z:"Z",m:"m",l:"l",c:"c",q:"q",a:"a",h:"h",v:"v",s:"s",t:"t"},t=function(e){this._string=e,this._currentIndex=0,this._endIndex=this._string.length,this._prevCommand=null,this._skipOptionalSpaces()},s=-1!==window.navigator.userAgent.indexOf("MSIE ")
    t.prototype={parseSegment:function(){var t=this._string[this._currentIndex],s=e[t]?e[t]:null
    if(null===s){if(null===this._prevCommand)return null
    if(s=("+"===t||"-"===t||"."===t||t>="0"&&"9">=t)&&"Z"!==this._prevCommand?"M"===this._prevCommand?"L":"m"===this._prevCommand?"l":this._prevCommand:null,null===s)return null}else this._currentIndex+=1
    this._prevCommand=s
    var r=null,a=s.toUpperCase()
    return"H"===a||"V"===a?r=[this._parseNumber()]:"M"===a||"L"===a||"T"===a?r=[this._parseNumber(),this._parseNumber()]:"S"===a||"Q"===a?r=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber()]:"C"===a?r=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber()]:"A"===a?r=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseArcFlag(),this._parseArcFlag(),this._parseNumber(),this._parseNumber()]:"Z"===a&&(this._skipOptionalSpaces(),r=[]),null===r||r.indexOf(null)>=0?null:{type:s,values:r}},hasMoreData:function(){return this._currentIndex<this._endIndex},peekSegmentType:function(){var t=this._string[this._currentIndex]
    return e[t]?e[t]:null},initialCommandIsMoveTo:function(){if(!this.hasMoreData())return!0
    var e=this.peekSegmentType()
    return"M"===e||"m"===e},_isCurrentSpace:function(){var e=this._string[this._currentIndex]
    return" ">=e&&(" "===e||"\n"===e||"	"===e||"\r"===e||"\f"===e)},_skipOptionalSpaces:function(){for(;this._currentIndex<this._endIndex&&this._isCurrentSpace();)this._currentIndex+=1
    return this._currentIndex<this._endIndex},_skipOptionalSpacesOrDelimiter:function(){return this._currentIndex<this._endIndex&&!this._isCurrentSpace()&&","!==this._string[this._currentIndex]?!1:(this._skipOptionalSpaces()&&this._currentIndex<this._endIndex&&","===this._string[this._currentIndex]&&(this._currentIndex+=1,this._skipOptionalSpaces()),this._currentIndex<this._endIndex)},_parseNumber:function(){var e=0,t=0,s=1,r=0,a=1,n=1,u=this._currentIndex
    if(this._skipOptionalSpaces(),this._currentIndex<this._endIndex&&"+"===this._string[this._currentIndex]?this._currentIndex+=1:this._currentIndex<this._endIndex&&"-"===this._string[this._currentIndex]&&(this._currentIndex+=1,a=-1),this._currentIndex===this._endIndex||(this._string[this._currentIndex]<"0"||this._string[this._currentIndex]>"9")&&"."!==this._string[this._currentIndex])return null
    for(var i=this._currentIndex;this._currentIndex<this._endIndex&&this._string[this._currentIndex]>="0"&&this._string[this._currentIndex]<="9";)this._currentIndex+=1
    if(this._currentIndex!==i)for(var l=this._currentIndex-1,h=1;l>=i;)t+=h*(this._string[l]-"0"),l-=1,h*=10
    if(this._currentIndex<this._endIndex&&"."===this._string[this._currentIndex]){if(this._currentIndex+=1,this._currentIndex>=this._endIndex||this._string[this._currentIndex]<"0"||this._string[this._currentIndex]>"9")return null
    for(;this._currentIndex<this._endIndex&&this._string[this._currentIndex]>="0"&&this._string[this._currentIndex]<="9";)s*=10,r+=(this._string.charAt(this._currentIndex)-"0")/s,this._currentIndex+=1}if(this._currentIndex!==u&&this._currentIndex+1<this._endIndex&&("e"===this._string[this._currentIndex]||"E"===this._string[this._currentIndex])&&"x"!==this._string[this._currentIndex+1]&&"m"!==this._string[this._currentIndex+1]){if(this._currentIndex+=1,"+"===this._string[this._currentIndex]?this._currentIndex+=1:"-"===this._string[this._currentIndex]&&(this._currentIndex+=1,n=-1),this._currentIndex>=this._endIndex||this._string[this._currentIndex]<"0"||this._string[this._currentIndex]>"9")return null
    for(;this._currentIndex<this._endIndex&&this._string[this._currentIndex]>="0"&&this._string[this._currentIndex]<="9";)e*=10,e+=this._string[this._currentIndex]-"0",this._currentIndex+=1}var v=t+r
    return v*=a,e&&(v*=Math.pow(10,n*e)),u===this._currentIndex?null:(this._skipOptionalSpacesOrDelimiter(),v)},_parseArcFlag:function(){if(this._currentIndex>=this._endIndex)return null
    var e=null,t=this._string[this._currentIndex]
    if(this._currentIndex+=1,"0"===t)e=0
    else{if("1"!==t)return null
    e=1}return this._skipOptionalSpacesOrDelimiter(),e}}
    var r=function(e){if(!e||0===e.length)return[]
    var s=new t(e),r=[]
    if(s.initialCommandIsMoveTo())for(;s.hasMoreData();){var a=s.parseSegment()
    if(null===a)break
    r.push(a)}return r},a=SVGPathElement.prototype.setAttribute,n=SVGPathElement.prototype.removeAttribute,u=window.Symbol?Symbol():"__cachedPathData",i=window.Symbol?Symbol():"__cachedNormalizedPathData",l=function(e,t,s,r,a,n,u,i,h,v){var p,_,c,o,d=function(e){return Math.PI*e/180},y=function(e,t,s){var r=e*Math.cos(s)-t*Math.sin(s),a=e*Math.sin(s)+t*Math.cos(s)
    return{x:r,y:a}},x=d(u),f=[]
    if(v)p=v[0],_=v[1],c=v[2],o=v[3]
    else{var I=y(e,t,-x)
    e=I.x,t=I.y
    var m=y(s,r,-x)
    s=m.x,r=m.y
    var g=(e-s)/2,b=(t-r)/2,M=g*g/(a*a)+b*b/(n*n)
    M>1&&(M=Math.sqrt(M),a=M*a,n=M*n)
    var S
    S=i===h?-1:1
    var V=a*a,A=n*n,C=V*A-V*b*b-A*g*g,P=V*b*b+A*g*g,N=S*Math.sqrt(Math.abs(C/P))
    c=N*a*b/n+(e+s)/2,o=N*-n*g/a+(t+r)/2,p=Math.asin(parseFloat(((t-o)/n).toFixed(9))),_=Math.asin(parseFloat(((r-o)/n).toFixed(9))),c>e&&(p=Math.PI-p),c>s&&(_=Math.PI-_),0>p&&(p=2*Math.PI+p),0>_&&(_=2*Math.PI+_),h&&p>_&&(p-=2*Math.PI),!h&&_>p&&(_-=2*Math.PI)}var E=_-p
    if(Math.abs(E)>120*Math.PI/180){var D=_,O=s,L=r
    _=h&&_>p?p+120*Math.PI/180*1:p+120*Math.PI/180*-1,s=c+a*Math.cos(_),r=o+n*Math.sin(_),f=l(s,r,O,L,a,n,u,0,h,[_,D,c,o])}E=_-p
    var k=Math.cos(p),G=Math.sin(p),T=Math.cos(_),Z=Math.sin(_),w=Math.tan(E/4),H=4/3*a*w,Q=4/3*n*w,z=[e,t],F=[e+H*G,t-Q*k],q=[s+H*Z,r-Q*T],j=[s,r]
    if(F[0]=2*z[0]-F[0],F[1]=2*z[1]-F[1],v)return[F,q,j].concat(f)
    f=[F,q,j].concat(f)
    for(var R=[],U=0;U<f.length;U+=3){var a=y(f[U][0],f[U][1],x),n=y(f[U+1][0],f[U+1][1],x),B=y(f[U+2][0],f[U+2][1],x)
    R.push([a.x,a.y,n.x,n.y,B.x,B.y])}return R},h=function(e){return e.map(function(e){return{type:e.type,values:Array.prototype.slice.call(e.values)}})},v=function(e){var t=[],s=null,r=null,a=null,n=null
    return e.forEach(function(e){var u=e.type
    if("M"===u){var i=e.values[0],l=e.values[1]
    t.push({type:"M",values:[i,l]}),a=i,n=l,s=i,r=l}else if("m"===u){var i=s+e.values[0],l=r+e.values[1]
    t.push({type:"M",values:[i,l]}),a=i,n=l,s=i,r=l}else if("L"===u){var i=e.values[0],l=e.values[1]
    t.push({type:"L",values:[i,l]}),s=i,r=l}else if("l"===u){var i=s+e.values[0],l=r+e.values[1]
    t.push({type:"L",values:[i,l]}),s=i,r=l}else if("C"===u){var h=e.values[0],v=e.values[1],p=e.values[2],_=e.values[3],i=e.values[4],l=e.values[5]
    t.push({type:"C",values:[h,v,p,_,i,l]}),s=i,r=l}else if("c"===u){var h=s+e.values[0],v=r+e.values[1],p=s+e.values[2],_=r+e.values[3],i=s+e.values[4],l=r+e.values[5]
    t.push({type:"C",values:[h,v,p,_,i,l]}),s=i,r=l}else if("Q"===u){var h=e.values[0],v=e.values[1],i=e.values[2],l=e.values[3]
    t.push({type:"Q",values:[h,v,i,l]}),s=i,r=l}else if("q"===u){var h=s+e.values[0],v=r+e.values[1],i=s+e.values[2],l=r+e.values[3]
    t.push({type:"Q",values:[h,v,i,l]}),s=i,r=l}else if("A"===u){var i=e.values[5],l=e.values[6]
    t.push({type:"A",values:[e.values[0],e.values[1],e.values[2],e.values[3],e.values[4],i,l]}),s=i,r=l}else if("a"===u){var i=s+e.values[5],l=r+e.values[6]
    t.push({type:"A",values:[e.values[0],e.values[1],e.values[2],e.values[3],e.values[4],i,l]}),s=i,r=l}else if("H"===u){var i=e.values[0]
    t.push({type:"H",values:[i]}),s=i}else if("h"===u){var i=s+e.values[0]
    t.push({type:"H",values:[i]}),s=i}else if("V"===u){var l=e.values[0]
    t.push({type:"V",values:[l]}),r=l}else if("v"===u){var l=r+e.values[0]
    t.push({type:"V",values:[l]}),r=l}else if("S"===u){var p=e.values[0],_=e.values[1],i=e.values[2],l=e.values[3]
    t.push({type:"S",values:[p,_,i,l]}),s=i,r=l}else if("s"===u){var p=s+e.values[0],_=r+e.values[1],i=s+e.values[2],l=r+e.values[3]
    t.push({type:"S",values:[p,_,i,l]}),s=i,r=l}else if("T"===u){var i=e.values[0],l=e.values[1]
    t.push({type:"T",values:[i,l]}),s=i,r=l}else if("t"===u){var i=s+e.values[0],l=r+e.values[1]
    t.push({type:"T",values:[i,l]}),s=i,r=l}else("Z"===u||"z"===u)&&(t.push({type:"Z",values:[]}),s=a,r=n)}),t},p=function(e){var t=[],s=null,r=null,a=null,n=null,u=null,i=null,h=null
    return e.forEach(function(e){if("M"===e.type){var v=e.values[0],p=e.values[1]
    t.push({type:"M",values:[v,p]}),i=v,h=p,n=v,u=p}else if("C"===e.type){var _=e.values[0],c=e.values[1],o=e.values[2],d=e.values[3],v=e.values[4],p=e.values[5]
    t.push({type:"C",values:[_,c,o,d,v,p]}),r=o,a=d,n=v,u=p}else if("L"===e.type){var v=e.values[0],p=e.values[1]
    t.push({type:"L",values:[v,p]}),n=v,u=p}else if("H"===e.type){var v=e.values[0]
    t.push({type:"L",values:[v,u]}),n=v}else if("V"===e.type){var p=e.values[0]
    t.push({type:"L",values:[n,p]}),u=p}else if("S"===e.type){var y,x,o=e.values[0],d=e.values[1],v=e.values[2],p=e.values[3]
    "C"===s||"S"===s?(y=n+(n-r),x=u+(u-a)):(y=n,x=u),t.push({type:"C",values:[y,x,o,d,v,p]}),r=o,a=d,n=v,u=p}else if("T"===e.type){var _,c,v=e.values[0],p=e.values[1]
    "Q"===s||"T"===s?(_=n+(n-r),c=u+(u-a)):(_=n,c=u)
    var y=n+2*(_-n)/3,x=u+2*(c-u)/3,f=v+2*(_-v)/3,I=p+2*(c-p)/3
    t.push({type:"C",values:[y,x,f,I,v,p]}),r=_,a=c,n=v,u=p}else if("Q"===e.type){var _=e.values[0],c=e.values[1],v=e.values[2],p=e.values[3],y=n+2*(_-n)/3,x=u+2*(c-u)/3,f=v+2*(_-v)/3,I=p+2*(c-p)/3
    t.push({type:"C",values:[y,x,f,I,v,p]}),r=_,a=c,n=v,u=p}else if("A"===e.type){var m=Math.abs(e.values[0]),g=Math.abs(e.values[1]),b=e.values[2],M=e.values[3],S=e.values[4],v=e.values[5],p=e.values[6]
    if(0===m||0===g)t.push({type:"C",values:[n,u,v,p,v,p]}),n=v,u=p
    else if(n!==v||u!==p){var V=l(n,u,v,p,m,g,b,M,S)
    V.forEach(function(e){t.push({type:"C",values:e})}),n=v,u=p}}else"Z"===e.type&&(t.push(e),n=i,u=h)
    s=e.type}),t}
    SVGPathElement.prototype.setAttribute=function(e,t){"d"===e&&(this[u]=null,this[i]=null),a.call(this,e,t)},SVGPathElement.prototype.removeAttribute=function(e,t){"d"===e&&(this[u]=null,this[i]=null),n.call(this,e)},SVGPathElement.prototype.getPathData=function(e){if(e&&e.normalize){if(this[i])return h(this[i])
    var t
    this[u]?t=h(this[u]):(t=r(this.getAttribute("d")||""),this[u]=h(t))
    var s=p(v(t))
    return this[i]=h(s),s}if(this[u])return h(this[u])
    var t=r(this.getAttribute("d")||"")
    return this[u]=h(t),t},SVGPathElement.prototype.setPathData=function(e){if(0===e.length)s?this.setAttribute("d",""):this.removeAttribute("d")
    else{for(var t="",r=0,a=e.length;a>r;r+=1){var n=e[r]
    r>0&&(t+=" "),t+=n.type,n.values&&n.values.length>0&&(t+=" "+n.values.join(" "))}this.setAttribute("d",t)}},SVGRectElement.prototype.getPathData=function(e){var t=this.x.baseVal.value,s=this.y.baseVal.value,r=this.width.baseVal.value,a=this.height.baseVal.value,n=this.hasAttribute("rx")?this.rx.baseVal.value:this.ry.baseVal.value,u=this.hasAttribute("ry")?this.ry.baseVal.value:this.rx.baseVal.value
    n>r/2&&(n=r/2),u>a/2&&(u=a/2)
    var i=[{type:"M",values:[t+n,s]},{type:"H",values:[t+r-n]},{type:"A",values:[n,u,0,0,1,t+r,s+u]},{type:"V",values:[s+a-u]},{type:"A",values:[n,u,0,0,1,t+r-n,s+a]},{type:"H",values:[t+n]},{type:"A",values:[n,u,0,0,1,t,s+a-u]},{type:"V",values:[s+u]},{type:"A",values:[n,u,0,0,1,t+n,s]},{type:"Z",values:[]}]
    return i=i.filter(function(e){return"A"!==e.type||0!==e.values[0]&&0!==e.values[1]?!0:!1}),e&&e.normalize===!0&&(i=p(i)),i},SVGCircleElement.prototype.getPathData=function(e){var t=this.cx.baseVal.value,s=this.cy.baseVal.value,r=this.r.baseVal.value,a=[{type:"M",values:[t+r,s]},{type:"A",values:[r,r,0,0,1,t,s+r]},{type:"A",values:[r,r,0,0,1,t-r,s]},{type:"A",values:[r,r,0,0,1,t,s-r]},{type:"A",values:[r,r,0,0,1,t+r,s]},{type:"Z",values:[]}]
    return e&&e.normalize===!0&&(a=p(a)),a},SVGEllipseElement.prototype.getPathData=function(e){var t=this.cx.baseVal.value,s=this.cy.baseVal.value,r=this.rx.baseVal.value,a=this.ry.baseVal.value,n=[{type:"M",values:[t+r,s]},{type:"A",values:[r,a,0,0,1,t,s+a]},{type:"A",values:[r,a,0,0,1,t-r,s]},{type:"A",values:[r,a,0,0,1,t,s-a]},{type:"A",values:[r,a,0,0,1,t+r,s]},{type:"Z",values:[]}]
    return e&&e.normalize===!0&&(n=p(n)),n},SVGLineElement.prototype.getPathData=function(){return[{type:"M",values:[this.x1.baseVal.value,this.y1.baseVal.value]},{type:"L",values:[this.x2.baseVal.value,this.y2.baseVal.value]}]},SVGPolylineElement.prototype.getPathData=function(){for(var e=[],t=0;t<this.points.numberOfItems;t+=1){var s=this.points.getItem(t)
    e.push({type:0===t?"M":"L",values:[s.x,s.y]})}return e},SVGPolygonElement.prototype.getPathData=function(){for(var e=[],t=0;t<this.points.numberOfItems;t+=1){var s=this.points.getItem(t)
    e.push({type:0===t?"M":"L",values:[s.x,s.y]})}return e.push({type:"Z",values:[]}),e}}()
  }

  function addEvent(element, eventType, handler)
  {
    if (element.attachEvent)
    {
      return element.attachEvent('on'+eventType, handler);
    }
    return element.addEventListener(eventType, handler);
  }

  function clone(orgItem)
  {
    var newItem, i;

    if (orgItem === undefined)
    {
      return;
    }
    if (orgItem === null)
    {
      return null;
    }
    newItem = (Array.isArray(orgItem)) ? [] : {};
    for (i in orgItem)
    {
      if (orgItem[i] && typeof orgItem[i] === "object")
      {
        newItem[i] = clone(orgItem[i]);
      }
      else
      {
        newItem[i] = orgItem[i];
      }
    }
    return newItem;
  }

  function Path2DObj()
  {
    this.p2dWC = null;    // Path2D object with original svg cmds in world coordinates
    this.p2dPX = null;    // Path2D with coords scaled for canvas raw pixel coord system
  }

  if (shapeDefs === undefined)
  {
    shapeDefs = {'circle': function(diameter){
                            var d = diameter || 1;
                            return ["m", -0.5*d,0,
                            "c", 0,-0.27614*d, 0.22386*d,-0.5*d, 0.5*d,-0.5*d,
                            "c", 0.27614*d,0, 0.5*d,0.22386*d, 0.5*d,0.5*d,
                            "c", 0,0.27614*d, -0.22386*d,0.5*d, -0.5*d,0.5*d,
                            "c", -0.27614*d,0, -0.5*d,-0.22386*d, -0.5*d,-0.5*d, "z"];},

                'ellipse': function(width, height){
                            var w = width || 1,
                                h = w;
                            if ((typeof height === 'number')&&(height>0))
                            {
                              h = height;
                            }
                            return ["m", -0.5*w,0,
                            "c", 0,-0.27614*h, 0.22386*w,-0.5*h, 0.5*w,-0.5*h,
                            "c", 0.27614*w,0, 0.5*w,0.22386*h, 0.5*w,0.5*h,
                            "c", 0,0.27614*h, -0.22386*w,0.5*h, -0.5*w,0.5*h,
                            "c", -0.27614*w,0, -0.5*w,-0.22386*h, -0.5*w,-0.5*h, "z"];},

                'square': function(width){
                            var w = width || 1;
                            return ["m", 0.5*w, -0.5*w, "l", 0, w, -w, 0, 0, -w, "z"];},

                'rectangle': function(width, height, rad){
                            var w = width || 1;
                            var h = height || w;
                            var r;
                            if ((rad === undefined)||(rad<=0))
                            {
                              return ["m",-w/2,-h/2, "l",w,0, 0,h, -w,0, "z"];
                            }
                            r = Math.min(w/2, h/2, rad);
                            return ["m", -w/2+r,-h/2, "l",w-2*r,0, "a",r,r,0,0,1,r,r, "l",0,h-2*r,
                                    "a",r,r,0,0,1,-r,r, "l",-w+2*r,0, "a",r,r,0,0,1,-r,-r, "l",0,-h+2*r,
                                    "a",r,r,0,0,1,r,-r, "z"];},

                'triangle': function(side){
                            var s = side || 1;
                            return ["m", 0.5*s, -0.289*s, "l", -0.5*s, 0.866*s, -0.5*s, -0.866*s, "z"];},

                'cross': function(width){
                            var w = width || 1;
                            return ["m", -0.5*w, 0, "l", w, 0, "m", -0.5*w, -0.5*w, "l", 0, w];},

                'ex': function(diagonal){
                            var d = diagonal || 1;
                            return ["m", -0.3535*d,-0.3535*d, "l",0.707*d,0.707*d,
                                    "m",-0.707*d,0, "l",0.707*d,-0.707*d];}
                };
  }

  function Drag2D(grabFn, dragFn, dropFn)
  {
    var savThis = this,
        nLrs, 
        topCvs;

    this.cgo = null;                    // filled in by render
    this.layer = null;                  // filled in by render
    this.target = null;                 // filled by enableDrag method
    this.grabCallback = grabFn || null;
    this.dragCallback = dragFn || null;
    this.dropCallback = dropFn || null;
    this.grabCsrPos = {x:0, y:0};
    this.dwgOrg = {x:0, y:0};           // target drawing origin in world coords
    this.grabOfs = {x:0, y:0};          // csr offset from target (maybe Obj or Group) drawing origin
    // the following closures hold the scope of the Drag2D instance so 'this' points to the Drag2D
    // multiple Obj2D may use this Drag2D, hitTest passes back which it was
    this.grab = function(evt)
    {
      var event = evt||window.event,
          csrPosWC;

      // calc top canvas at grab time since layers can come and go
      nLrs = this.cgo.bkgCanvas.layers.length;
      topCvs = this.cgo.bkgCanvas.layers[nLrs-1].cElem;

      topCvs.onmouseup = function(e){savThis.drop(e);};
      topCvs.onmouseout = function(e){savThis.drop(e);};
      csrPosWC = this.cgo.getCursorPosWC(event);      // update mouse pos to pass to the owner
      // save the cursor pos its very useful
      this.grabCsrPos.x = csrPosWC.x;
      this.grabCsrPos.y = csrPosWC.y;
      // copy the parent drawing origin (for convenience)
      this.dwgOrg.x = this.target.dwgOrg.x;
      this.dwgOrg.y = this.target.dwgOrg.y;
      if (this.target.parent)
      {
        // save the cursor offset from the drawing origin (world coords) add any parent Group offset
        this.grabOfs = {x:csrPosWC.x - this.dwgOrg.x + this.target.parent.dwgOrg.x,
                        y:csrPosWC.y - this.dwgOrg.y + this.target.parent.dwgOrg.y};
      }
      else
      {
        // no parent, so same as adding 0s
        this.grabOfs = {x:csrPosWC.x - this.dwgOrg.x,
                        y:csrPosWC.y - this.dwgOrg.y};
      }

      if (this.grabCallback)
      {
        this.grabCallback(csrPosWC);    // call in the scope of dragNdrop object
      }

      topCvs.onmousemove = function(event){savThis.drag(event);};
      if (event.preventDefault)       // prevent default browser action (W3C)
      {
        event.preventDefault();
      }
      else                        // shortcut for stopping the browser action in IE
      {
        window.event.returnValue = false;
      }
      return false;
    };

    this.drag = function(event)
    {
      var csrPosWC;

      if (this.dragCallback)
      {
        csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner
        window.requestAnimationFrame(function(){savThis.dragCallback(csrPosWC);});
      }
    };

    this.drop = function(event)
    {
      var csrPosWC = this.cgo.getCursorPosWC(event);  // update mouse pos to pass to the owner

      topCvs.onmouseup = null;
      topCvs.onmouseout = null;
      topCvs.onmousemove = null;
      if (this.dropCallback)
      {
        this.dropCallback(csrPosWC);
      }
    };

    // version of drop that can be called from an app to stop a drag before the mouseup event
    this.cancelDrag = function(mousePos)
    {
      topCvs.onmouseup = null;
      topCvs.onmouseout = null;
      topCvs.onmousemove = null;
      if (this.dropCallback)
      {
        this.dropCallback(mousePos);
      }
    };
  }

  LinearGradient = function(p1x, p1y, p2x, p2y)
  {
    this.grad = [p1x, p1y, p2x, p2y];
    this.colorStops = [];
    this.addColorStop = function(){this.colorStops.push(arguments);};
  };

  RadialGradient = function(p1x, p1y, r1, p2x, p2y, r2)
  {
    this.grad = [p1x, p1y, r1, p2x, p2y, r2];
    this.colorStops = [];
    this.addColorStop = function(){this.colorStops.push(arguments);};
  };

  Tweener = function(delay, duration, loopStr)  // interpolates between values held in an array
  {
		this.delay = delay || 0;
    this.dur = duration || 5000;
    this.reStartOfs = 0;
    this.loop = false;
    this.loopAll = false;

    var savThis = this,
        loopParm = "noloop";

    if (typeof loopStr === 'string')
    {
      loopParm = loopStr.toLowerCase();
    }
    if (loopParm === 'loop')
    {
      this.loop = true;
    }
    else if (loopParm === 'loopall')
    {
      this.loopAll = true;
    }

    this.getVal = function(time, vals, keyTimes)  // vals is an array of key frame values (or a static number)
    {
      var numSlabs, slabDur, slab, frac, i,
					t = 0,
					tFrac,
					localTime,
					values, times;

      if (time === 0)       // re-starting after a stop, otherwise this can increase forever (looping is handled here)
      {
        savThis.reStartOfs = 0;     // reset this to prevent negative times
      }
      localTime = time - savThis.reStartOfs;       // handles local looping
      if ((localTime > savThis.dur+savThis.delay) && (savThis.dur > 0) && (savThis.loop || savThis.loopAll))
      {
        savThis.reStartOfs = savThis.loop? time - savThis.delay : time;      // we will correct external time to re-start
        localTime = 0;          // force re-start at frame 0 now too
      }
      t = 0;    // t is the actual local time value used for interpolating
      if (localTime > savThis.delay)    // repeat initial frame (t=0) if there is a delay to start
      {
        t = localTime - savThis.delay;   // localTime is contrained to 0 < localTime < this.dur
      }

      if (!Array.isArray(vals))    // not an array, just a static value, return it every time
      {
        return vals;
      }
      if (!vals.length)
      {
        return 0;
      }
      if (vals.length === 1)
      {
        return vals[0];
      }
      // we have at least 2 element array of values
      if (t === 0)
      {
        return vals[0];
      }
      if (t >= savThis.dur)
      {
        return vals[vals.length-1];  // freeze at end value
      }
      numSlabs = vals.length-1;
      if (!Array.isArray(keyTimes) || (vals.length !== keyTimes.length))
      {
        slabDur = savThis.dur/numSlabs;
        slab = Math.floor(t/slabDur);
        frac = (t - slab*slabDur)/slabDur;

        return vals[slab] + frac*(vals[slab+1] - vals[slab]);
      }

      // we have keyTimes to play work with copies of arrays
      values = [].concat(vals);
      times = [].concat(keyTimes);
      // make sure times start with 0
      if (times[0] !== 0)
      {
        values.unshift(values[0]);
        times.unshift(0);
      }
      // make sure times end with 100
      if (times[times.length-1] !== 100)
      {
        values.push(values[values.length-1]);
        times.push(100);
      }
      i = 0;
      tFrac = t/savThis.dur;
      while ((i < times.length-1) && (times[i+1]/100 < tFrac))
      {
        i++;
      }
      slabDur = (times[i+1]-times[i])/100;
      frac = (tFrac - times[i]/100)/slabDur;    // convert percentage time to fraction

      return values[i] + frac*(values[i+1] - values[i]);
    };
  };

  function transformPoint(px, py, m)
  {
    return {x:px*m.a + py*m.c + m.e, y:px*m.b + py*m.d + m.f};
  }

  function matrixReset(m)
  { // reset to the identity matrix
    m.a = 1;
    m.b = 0;
    m.c = 0;
    m.d = 1;
    m.e = 0;
    m.f = 0;
  }

  function translater(args)      // will be called with 'this' pointing to an Obj2D
  {
    var x = args[0] || 0,
        y = args[1] || 0;

    if (this.hasOwnProperty('type'))    // this transformer may be called on point object {x:, y: }
    {
      this.ofsTfm = this.ofsTfm.translate(x, y);   
    }
    else     // its a point to be transformed
    {
      return {x:this.x + x, y:this.y + y};  // transformPoint returns an Object {x:, y: }
    }
  }

  function skewer(args)
  {
    // Skew matrix, angles in degrees applied before translate or revolve
    var ha = args[0] || 0,
        va = args[1] || 0,
        rad = Math.PI/180.0,
				htn	= Math.tan(-ha*rad),
				vtn	= Math.tan(va*rad);

    if (this.hasOwnProperty('type'))    // this transformer may be called on point object {x:, y: }
    {
      this.ofsTfm = this.ofsTfm.skewX(ha*rad);
      this.ofsTfm = this.ofsTfm.skewY(va*rad);
    }
    else
    {
      return {x:this.x + this.y*htn, y:this.x*vtn + this.y};  // transfromPoint returns an Object {x:, y: }
    }
  }

  function scaler(args)      // will be called with 'this' pointing to an Obj2D
  {
    // scale matrix, applied before translate or revolve
    var sx = args[0] || 1,
        sy = args[1] || sx;

    if (this.hasOwnProperty('type'))
    {
      this.ofsTfm = this.ofsTfm.scaleNonUniform(sx, sy);
    }
    else    // this transformer may be called on point object {x:, y: }
    {
      return {x:this.x*sx, y:this.y*sy};  // transfromPoint returns an Object {x:, y: }
    }
  }

  function rotater(args)      // will be called with 'this' pointing to an Obj2D or point {x:, y: }
  {
    // rotate matrix, angles in degrees applied before translate or revolve
    var angle = args[0] || 0,
        rad = Math.PI/180.0,
				s	= Math.sin(-angle*rad),
        c	= Math.cos(-angle*rad);
        
    if (this.hasOwnProperty('type'))
    {
      this.ofsTfm = this.ofsTfm.rotate(angle);
    }
    else     // this transformer may be called on point object {x:, y: }
    {
      return {x:this.x*c + this.y*s, y:-this.x*s + this.y*c};  // transfromPoint returns an Object {x:, y: }
    }
  }

  function revolver(args)      // will be called with 'this' pointing to an Obj2D or point {x:, y: }
  {
    // Rotate matrix, angles in degrees can be applied after tranlation away from World Coord origin
    var angle = args[0] || 0,
        rad = Math.PI/180.0,
				s	= Math.sin(-angle*rad),
				c	= Math.cos(-angle*rad);

    if (this.hasOwnProperty('type'))
    {
      this.ofsTfm = this.ofsTfm.rotate(angle*rad);
    }
    else  // point
    {
      return {x:this.x*c + this.y*s, y:-this.x*s + this.y*c};  // transfromPoint returns an Object {x:, y: }
    }
  }

  function Distorter(type, fn)  // and other arguments
  {
    var argAry = Array.prototype.slice.call(arguments).slice(2);     // skip type and fn parameters save the rest

    this.type = type;
    this.distortFn = fn;
    this.args = argAry;     // array of arguments
  }

  function TfmTools(obj)
  {
    var savThis = this;

    this.parent = obj;
    // container for to add transforming methods to a Group or Obj2D
    // each method adds Distorter Object to the ofsTfmAry to be applied to the Obj2D when rendered
    this.translate = function(tx, ty)
    {
      var trnsDstr = new Distorter("TRN", translater, tx, ty);
      savThis.parent.ofsTfmAry.unshift(trnsDstr);
    };
    this.scale = function(scaleX, scaleY)
    {
      var sclDstr = new Distorter("SCL", scaler, scaleX, scaleY);
      savThis.parent.ofsTfmAry.push(sclDstr);
    };
    this.rotate = function(deg)
    {
      var rotDstr = new Distorter("ROT", rotater, deg);
      savThis.parent.ofsTfmAry.push(rotDstr);
    };
    this.skew = function(degH, degV)
    {
      var skwDstr = new Distorter("SKW", skewer, degH, degV);
      savThis.parent.ofsTfmAry.push(skwDstr);
    };
    this.revolve = function(deg)
    {
      var revDstr = new Distorter("REV", revolver, deg);
      savThis.parent.ofsTfmAry.unshift(revDstr);
    };
    this.reset = function()
    {
      savThis.parent.ofsTfmAry = [];
      matrixReset(savThis.parent.ofsTfm);  // reset the accumulation matrix
    };
  }

  function HardTfmTools(obj)
  {
    var savThis = this;

    this.parent = obj;
    // container for to add transforming methods to a Group or Obj2D
    // each method adds Distorter Object to the hardTfmAry to be applied to the Obj2D when rendered
    this.translate = function(tx, ty)
    {
      var trnsDstr = new Distorter("TRN", translater, tx, ty);
      savThis.parent.hardTfmAry.unshift(trnsDstr);
    };
    this.scale = function(scaleX, scaleY)
    {
      var sclDstr = new Distorter("SCL", scaler, scaleX, scaleY);
      savThis.parent.hardTfmAry.unshift(sclDstr);
    };
    this.rotate = function(deg)
    {
      var rotDstr = new Distorter("ROT", rotater, deg);
      savThis.parent.hardTfmAry.unshift(rotDstr);
    };
    this.skew = function(degH, degV)
    {
      var skwDstr = new Distorter("SKW", skewer, degH, degV);
      savThis.parent.hardTfmAry.unshift(skwDstr);
    };
    this.reset = function()
    {
      savThis.parent.hardTfmAry = [];
    };
  }

  Group = function()
  {
    this.type = "GRP";                    // enum of type to instruct the render method
    this.parent = null;                   // pointer to parent group if any
    this.children = [];                   // only Groups have children
    this.ofsTfmAry = [];                  // soft offset from any parent Group's transform
    this.netTfmAry = [];                  // ofsTfmAry with grpTfmAry concatinated
    this.ofsTfm = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();  // product of hard & ofs tfm actions, filled in at render
    this.netTfm = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();  // parent Group netTfm applied to this.ofsTfm
    this.transform = new TfmTools(this);  // soft transforms (reset after render)
    this.dragNdropHandlers = null;        // array of DnD handlers to be passed to newly added children
    // add any objects passed by forwarding them to addObj
    this.addObj.apply(this, arguments);
  };

  Group.prototype.deleteObj = function(obj)
  {
    // remove from children array
    var idx = this.children.indexOf(obj);

    if (idx >= 0)
    {
      this.children.splice(idx, 1);
      obj.parent = null;
    }
  };

  Group.prototype.addObj = function(/* arguments */)
  {
    var savThis = this;

    function addIt(child)
    {
      // point the Obj2D or Group parent property at this Group
      child.parent = savThis;            // now its a free agent link it to this group
      savThis.children.push(child);
      // enable drag and drop if this group has drag
      if (!child.dragNdrop && savThis.dragNdropHandlers)
      {
        child.enableDrag.apply(child, savThis.dragNdropHandlers);
        child.dragNdrop.target = savThis;     // the Group is the target being dragged
      }
    }

  	function iterate(args)
  	{
  		args.forEach(function(childNode){
  		  if (Array.isArray(childNode))
        {
  			  iterate(childNode);
        }
        else if (childNode && childNode.type)  // don't add undefined or non-Obj2D
        {
          addIt(childNode);
        }
  		});
    }
    
    iterate(Array.prototype.slice.call(arguments));   // convert arguments to real array
  };

  /*======================================
   * Recursively apply a hard translation
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group.prototype.translate = function(x, y)
  {
    // Apply transform to the hardOfsTfm of all Obj2D children recursively
  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  		  if (childNode.type === "GRP")
          {
  			    iterate(childNode);
          }
          else
          {
            childNode.translate(x, y);
          }
  		});
  	}

    iterate(this);
  };

  /*======================================
   * Recursively apply a hard rotation
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group.prototype.rotate = function(degs)
  {
    // Apply transform to the hardOfsTfm of all Obj2D children recursively
  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  		  if (childNode.type === "GRP")
          {
  			    iterate(childNode);
          }
          else
          {
            childNode.rotate(degs);
          }
  		});
  	}

    iterate(this);
  };

  /*======================================
   * Recursively apply a hard skew
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group.prototype.skew = function(degH, degV)
  {
    // Apply transform to the hardOfsTfm of all Obj2D children recursively
  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  		  if (childNode.type === "GRP")
          {
  			    iterate(childNode);
          }
          else
          {
            childNode.skew(degH, degV);
          }
  		});
  	}

    iterate(this);
  };

  /*======================================
   * Recursively apply a hard scale
   * to all the Obj2Ds in the family tree.
   *-------------------------------------*/
  Group.prototype.scale = function(xsc, ysc)
  {
    var xScl = xsc,
        yScl = ysc ||xScl;

    // Apply transform to the hardOfsTfm of all Obj2D children recursively
  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  		  if (childNode.type === "GRP")
          {
  		      iterate(childNode);
          }
          else
          {
            childNode.scale(xScl, yScl);
          }
  		});
  	}

    iterate(this);
  };

  /*======================================
   * Recursively add drag object to Obj2D
   * decendants.
   * When rendered all these Obj2D will be
   * added to dragObjects to be checked on
   * mousedown
   *-------------------------------------*/
  Group.prototype.enableDrag = function(grabFn, dragFn, dropFn)
  {
    var savThis = this;

  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  		  if (childNode.type === "GRP")
          {
  		      iterate(childNode);
          }
          else   // Obj2D
          {
            if (childNode.dragNdrop === null)    // don't over-write if its already assigned a handler
            {
              childNode.enableDrag(grabFn, dragFn, dropFn);
              childNode.dragNdrop.target = savThis;     // the Group is the target being dragged
            }
          }
  		});
  	}

    this.dragNdropHandlers = arguments;
    iterate(this);
  };

  /*======================================
   * Disable dragging on Obj2D children
   *-------------------------------------*/
  Group.prototype.disableDrag = function()
  {
  	function iterate(grp)
  	{
  		grp.children.forEach(function(childNode){
  		  if (childNode.type === "GRP")
          {
  		      iterate(childNode);
          }
          else
          {
            childNode.disableDrag();
          }
  		});
  	}

    this.dragNdropHandlers = undefined;
    iterate(this);
  };

  function setPropertyFn(propertyName, value)
  {
    var lorgVals = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    if ((typeof propertyName !== "string")||(value === undefined))
    {
      return;
    }

    switch (propertyName.toLowerCase())
    {
      case "fillrule":
        if (typeof value !== "string")
        {
          return;
        }
        if ((value === "evenodd")||(value ==="nonzero"))
        {
          this.fillRule = value;
        }
        break;
      case "fillcolor":
        this.fillCol = value;
        break;
      case "strokecolor":
        this.strokeCol = value;
        break;
      case "linewidth":
      case "strokewidth":                 // for backward compatability
        if ((typeof value === "number")&&(value > 0))
        {
          this.lineWidth = value;
        }
        break;
      case "linewidthwc":
        if ((typeof value === "number")&&(value > 0))
        {
          this.lineWidthWC = value;
        }
        break;
      case "linecap":
        if (typeof value !== "string")
        {
          return;
        }
        if ((value === "butt")||(value ==="round")||(value === "square"))
        {
          this.lineCap = value;
        }
        break;
      case "iso":
      case "isotropic":
        if ((value == true)||(value === 'iso')||(value === 'isotropic'))
        {
          this.iso = true;
        }
        else
        {
          this.iso = false;
        }
        break;
      case "dashed":
        if (Array.isArray(value) && value[0])
        {
          this.dashed = value;
        }
        else     // ctx.setLineDash([]) will clear dashed settings
        {
          this.dashed = [];
        }
        break;
      case "dashoffset":
        this.dashOffset = value || 0;
        break;
      case "border":
        if (value === true)
        {
          this.border = true;
        }
        if (value === false)
        {
          this.border = false;
        }
        break;
      case "fontsize":
        if ((typeof value === "number")&&(value > 0))
        {
          this.fontSize = value;
        }
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
      case "bgfillcolor":
        this.bgFillColor = value;
        break;
      case "imgwidth":
        this.width = Math.abs(value);
        break;
      case "imgheight":
        this.height = Math.abs(value);
        break;
      case "lorg":
        if (lorgVals.indexOf(value) !== -1)
        {
          this.lorg = value;
        }
        break;
      case "shadowoffsetx":
        this.shadowOffsetX = value || 0;
        break;
      case "shadowoffsety":
        this.shadowOffsetY = value || 0;
        break;
      case "shadowblur":
        this.shadowBlur = value || 0;
        break;
      case "shadowcolor":
        this.shadowColor = value;
        break;
      default:
        return;
    }
  }

  function Obj2D()
  {
    this.type = "OBJ2D";
    this.drawCmds = [];                       // DrawCmd objects
    this.pthCmds = new Path2DObj();           // Path2D data string
    this.lineWidthWC = null;                  // Path or border width world coords
    this.lineWidth = null;                    // Path or border width pixels
    this.savScale = 1;                        // Save the net scale factor applied to scale the lineWidth
    this.iso = true;                          // default for Shape, Img, Text
    this.parent = null;                       // pointer to parent Group if any
    this.dwgOrg = {x:0, y:0};                 // drawing origin (0,0) may get translated
    // properties handling transform inheritance
    this.hardTfmAry = [];                     // hard offset from any parent Group's transform
    this.ofsTfmAry = [];                      // soft offset from any parent Group's transform
    this.netTfmAry = [];                      // ofsTfmAry with grpTfmAry concatinated
    this.ofsTfm = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();      // product of hard & ofs tfm actions, filled in at render
    this.netTfm = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();      // parent Group netTfm applied to this.ofsTfm
    // enable obj.transform.rotate etc. API
    this.hardTransform = new HardTfmTools(this);    // hard transforms (they survive render)
    this.transform = new TfmTools(this);            // soft transforms (reset after render)
    this.dragNdrop = null;
  };

  Obj2D.prototype.enableDrag = function(grabFn, dragFn, dropFn)
  {
    this.dragNdrop = new Drag2D(grabFn, dragFn, dropFn);
    // fill in the Drag2D properties for use by callBacks
    this.dragNdrop.target = this;
  };

  Obj2D.prototype.disableDrag = function()
  {
    var aidx;

    if (!this.dragNdrop)
    {
      return;
    }
    // remove this object from array to be checked on mousedown
    aidx = this.dragNdrop.layer.dragObjects.indexOf(this);
    this.dragNdrop.layer.dragObjects.splice(aidx, 1);
    this.dragNdrop = null;
  };

  ClipMask = function(commands, options)
  {
    var opt = options || {},
        svgPathElem;

    // build all the Obj2D properties and assign them to this Object's properties
    Obj2D.call(this);
    this.type = "CLIP";
    this.iso = false;    // default for ClipMask and Path options can change it
    this.fillRule = "nonzero";
    this.drawCmds = [];  // allow drawCmds.length == 0 for clipMask reset
    if ((typeof commands === "string") && commands.length)  // a string will be svg commands
    {
      svgPathElem = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svgPathElem.setAttribute("d", commands);
      this.drawCmds = svgPathElem.getPathData({normalize: true}); // returns segments converted to lines and Bezier curves 
    }
    else if ((Array.isArray(commands)) && commands.length)  // array will be Cgo2D commands array
    {
      if (typeof(commands[0]) === "number")  // must be an Array of numbers
      {
        commands.splice(0, 0, "M"); // add the "M" to start (remove none) so valid SVG
      }
      svgPathElem = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svgPathElem.setAttribute("d", commands.join(" "));
      this.drawCmds = svgPathElem.getPathData({normalize: true}); // returns segments converted to lines and Bezier curves 
    }
    // only options supported are 'iso' and 'fillRule'
    if (opt.hasOwnProperty("iso"))
    {
      this.setProperty("iso", opt.iso);
    }
    else if (opt.hasOwnProperty("isotropic"))
    {
      this.setProperty("iso", opt.isotropic);
    }
    else
    {
      this.iso = false;   // default false allow word coords to distort
    }
    if (opt.hasOwnProperty("fillRule"))
    {
      this.fillRule = opt.fillRule;
    }
  };

  // make all the Obj2D methods methods of this object
  ClipMask.prototype = Object.create(Obj2D.prototype);
  ClipMask.prototype.constructor = ClipMask;        // do this or prototype constructor still Obj2D

  ClipMask.prototype.setProperty = setPropertyFn;

  ClipMask.prototype.appendPath = function(obj)
  {
    var savThis = this,
        thisDcs = clone(this.drawCmds),
        objDcs = clone(obj.drawCmds);

    // apply any hard tranforms that have been applied
    if (this.hardTfmAry.length)
    {
      // generate the hard tranform matrix if any transforms have been applied
      this.hardTfmAry.forEach(function(dtr){
        dtr.distortFn.call(savThis, dtr.args);
      });
      // this.ofsTfm now hold the hard transform matrix
      thisDcs.forEach(function(cmd){
        var tp, newVals, i;
        if (cmd.values.length)
        {
          newVals = [];
          for(i=0; i<cmd.values.length; i+=2)
          {
            tp = transformPoint(cmd.values[i], cmd.values[i+1], savThis.ofsTfm);
            newVals.push(tp.x, tp.y);
          }
          cmd.values = newVals;
        }
      });
      matrixReset(this.ofsTfm);
      this.hardTfmAry.length = 0;       // Tfms have been applied clear them
    }
    // apply any hard tranforms that have been applied
    if (obj.hardTfmAry.length)
    {
      // generate the hard tranform matrix if any transforms have been applied
      obj.hardTfmAry.forEach(function(dtr){
        dtr.distortFn.call(obj, dtr.args);
      });
      // obj.ofsTfm now hold the hard transform matrix
      objDcs.forEach(function(cmd){
        var tp, newVals, i;
        if (cmd.values.length)
        {
          newVals = [];
          for(i=0; i<cmd.values.length; i+=2)
          {
            tp = transformPoint(cmd.values[i], cmd.values[i+1], obj.ofsTfm);
            newVals.push(tp.x, tp.y);
          }
          cmd.values = newVals;
        }
      });
      matrixReset(obj.ofsTfm);
      // Tfms have only been applied to a copy so don't clear hardTfmAry
    }
    // now append the path
    this.drawCmds = thisDcs.concat(objDcs);
  };

  /*======================================
   * Apply a translation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  ClipMask.prototype.translate = function(x, y)
  {
    this.hardTransform.translate(x, y);
  };

  /*======================================
   * Apply a rotation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  ClipMask.prototype.rotate = function(degs)
  {
    this.hardTransform.rotate(degs);
  };

  /*======================================
   * Apply a skew transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  ClipMask.prototype.skew = function(degH, degV)
  {
    this.hardTransform.skew(degH, degV);
  };

  /*======================================
   * Apply a scale transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  ClipMask.prototype.scale = function(xScl, yScl)
  {
    this.hardTransform.scale(xScl, yScl);
  };

  ClipMask.prototype.dup = function()
  {
    var newObj = new ClipMask();

    newObj.type = this.type;
    newObj.drawCmds = clone(this.drawCmds);
    newObj.parent = null;                        // pointer to parent group if any
    newObj.dwgOrg = clone(this.dwgOrg);
    newObj.hardTfmAry = clone(this.hardTfmAry);  // hard offset from any parent Group's transform
    newObj.ofsTfmAry = clone(this.ofsTfmAry);    // soft offset from any parent Group's transform
    newObj.fillRule = this.fillRule;
    newObj.border = this.border;                 // ClipMask can have a border (half width showing)
    newObj.strokeCol = this.strokeCol;
    newObj.lineWidth = this.lineWidth;
    newObj.lineWidthWC = this.lineWidthWC;
    newObj.lineCap = this.lineCap;
    newObj.iso = this.iso;
    // The other objects are dynamic, calculated at render

    return newObj;         // return a object which inherits Obj2D properties
  };

  Path = function(commands, options)
  {
    var opt, prop;

    // build all the ClipMask properties and assign them to this Object's properties
    ClipMask.call(this, commands);

    this.type = "PATH";               // type string to instruct the render method
    // properties set by setProperty method, if undefined render uses Cango default
    this.border = false;              // true = stroke outline with strokeColor & lineWidth
    this.strokeCol = null;            // render will stroke a path in this color
    this.fillCol = null;              // used if type == SHAPE or TEXT
    this.lineCap = null;              // round butt or square
    this.iso = false;                 // default for a Path
    // drop shadow properties
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.shadowBlur = 0;
    this.shadowColor = "#000000";
    // dashed line properties
    this.dashed = [];
    this.dashOffset = 0;

    // now handle all the user requested options
    opt = (typeof options === 'object')? options: {};   // avoid undeclared object errors
    // check for all supported options
    for (prop in opt)
    {
      // check that this is opt's own property, not inherited from prototype
      if (opt.hasOwnProperty(prop))
      {
        this.setProperty(prop, opt[prop]);
      }
    }
  };

  Path.prototype = Object.create(ClipMask.prototype);    // make the ClipMask methods the methods of this Path object
  Path.prototype.constructor = Path;        // do this or prototype constructor still ClipMask

  Path.prototype.setProperty = setPropertyFn;

  Path.prototype.dup = function()
  {
    var newObj = new Path();

    newObj.type = this.type;
    newObj.drawCmds = clone(this.drawCmds);
    newObj.parent = null;                       // pointer to parent group if any
    newObj.dwgOrg = clone(this.dwgOrg);
    newObj.hardTfmAry = clone(this.hardTfmAry);  // hard offset from any parent Group's transform
    newObj.ofsTfmAry = clone(this.ofsTfmAry);    // soft offset from any parent Group's transform

    newObj.border = this.border;
    newObj.strokeCol = this.strokeCol;
    newObj.fillCol = this.fillCol;     // for SHAPE
    newObj.lineWidth = this.lineWidth;
    newObj.lineWidthWC = this.lineWidthWC;
    newObj.lineCap = this.lineCap;
    newObj.savScale = 1; 
    newObj.iso = this.iso;
    newObj.fillRule = this.fillRule;   // for SHAPE

    newObj.shadowOffsetX = this.shadowOffsetX;
    newObj.shadowOffsetY = this.shadowOffsetY;
    newObj.shadowBlur = this.shadowBlur;
    newObj.shadowColor = this.shadowColor;

    newObj.dashed = clone(this.dashed);
    newObj.dashOffset = this.dashOffset;
    // The other objects are dynamic, calculated at render

    return newObj;         // return a object which inherits Obj2D properties
  };

  Shape = function(commands, options)
  {
    var opt = options || {};

    // build all the Path properties and assign them to this Object's properties
    Path.call(this, commands, options);

    this.type = "SHAPE";
    // only other difference is the default value for 'iso' property
    if (opt.hasOwnProperty("iso"))
    {
      this.setProperty("iso", opt.iso);
    }
    else if (opt.hasOwnProperty("isotropic"))
    {
      this.setProperty("iso", opt.isotropic);
    }
    else
    {
      this.iso = true;   // default true = maintain aspect ratio
    }
  };

  Shape.prototype = Object.create(Path.prototype);       // make the Path methods the methods of this Shape object
  Shape.prototype.constructor = Shape;        // do this or prototype constructor still Path

  Img = function(imgData, options)
  {
    var opt, prop;
    // build all the Obj2D properties and assign them to this Object's properties
    Obj2D.call(this);

    this.type = "IMG";
    if (typeof imgData === "string")
    {
      this.imgBuf = new Image();    // pointer to the Image object when image is loaded
      this.imgBuf.src = imgData;    // start loading the image immediately
    }
    else if (imgData instanceof Image)
    {
      this.imgBuf = imgData;        // pre-loaded Image passed
    }
    this.pthCmds = new Path2DObj(); // Path2D holding the img bounding box
    this.drawCmds = [];             // DrawCmd array for the text or img bounding box
    this.width = 0;                   // only used for type = IMG, TEXT, set to 0 until image loaded
    this.height = 0;                  //     "
    this.imgLorgX = 0;                //     "
    this.imgLorgY = 0;                //     "
    this.lorg = 1;                    // used by IMG and TEXT to set drawing origin
    // properties set by setProperty method, if undefined render uses Cango default
    this.border = false;              // true = stroke outline with strokeColor & lineWidth
    this.strokeCol = null;            // render will stroke a path in this color
    this.lineWidthWC = null;          // border width world coords
    this.lineWidth = null;            // border width pixels
    this.lineCap = null;              // round, butt or square
    this.savScale = 1;                // save accumulated scale factors for lineWidth of border
    // drop shadow properties
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.shadowBlur = 0;
    this.shadowColor = "#000000";

    // now handle all the user requested options
    opt = (typeof options === 'object')? options: {};   // avoid undeclared object errors
    // check for all supported options
    for (prop in opt)
    {
      // check that this is opt's own property, not inherited from prototype
      if (opt.hasOwnProperty(prop))
      {
        this.setProperty(prop, opt[prop]);
      }
    }
  };

  // make all the Obj2D methods methods of this object
  Img.prototype = Object.create(Obj2D.prototype);
  Img.prototype.constructor = Img;        // do this or prototype constructor still Obj2D

  Img.prototype.setProperty = setPropertyFn;

  /*======================================
   * Apply a translation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Img.prototype.translate = function(x, y)
  {
    this.hardTransform.translate(x, y);
  };

  /*======================================
   * Apply a rotation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Img.prototype.rotate = function(degs)
  {
    this.hardTransform.rotate(degs);
  };

  /*======================================
   * Apply a skew transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Img.prototype.skew = function(degH, degV)
  {
    this.hardTransform.skew(degH, degV);
  };

  /*======================================
   * Apply a scale transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Img.prototype.scale = function(xScl, yScl)
  {
    this.hardTransform.scale(xScl, yScl);
  };

  Img.prototype.dup = function()
  {
    var newObj = new Img();

    newObj.type = this.type;
    newObj.pthCmds = new Path2DObj();
    newObj.drawCmds = clone(this.drawCmds);
    newObj.imgBuf = this.imgBuf;         // just copy reference
    newObj.dwgOrg = clone(this.dwgOrg);
    newObj.dragNdrop = null;
    newObj.hardTfmAry = clone(this.hardTfmAry);  // hard offset from any parent Group's transform
    newObj.ofsTfmAry = clone(this.ofsTfmAry);    // soft offset from any parent Group's transform
    newObj.border = this.border;
    newObj.strokeCol = this.strokeCol;
    newObj.lineWidth = this.lineWidth;
    newObj.lineWidthWC = this.lineWidthWC;
    newObj.lineCap = this.lineCap;
    newObj.savScale = 1; 
    newObj.iso = this.iso;
    newObj.dashed = clone(this.dashed);
    newObj.dashOffset = this.dashOffset;
    newObj.width = this.width;
    newObj.height = this.height;
    newObj.imgLorgX = this.imgLorgX;
    newObj.imgLorgY = this.imgLorgY;
    newObj.lorg = this.lorg;
    newObj.shadowOffsetX = this.shadowOffsetX;
    newObj.shadowOffsetY = this.shadowOffsetY;
    newObj.shadowBlur = this.shadowBlur;
    newObj.shadowColor = this.shadowColor;
    // The other objects are dynamic, calculated at render

    return newObj;         // return a object which inherits Obj2D properties
  };

  Img.prototype.formatImg = function()
  {
    var wid, hgt, wid2, hgt2,
        dx = 0,
        dy = 0,
        ulx, uly, llx, lly, lrx, lry, urx, ury,
        lorgWC,
        cmdsAry;

    if (!this.imgBuf.width)
    {
      console.log("in image onload handler yet image NOT loaded!");
    }
    if (this.width && this.height)
    {
      wid = this.width;
      hgt = this.height;
    }
    else if (this.width && !this.height)  // width only passed height is auto
    {
      wid = this.width;
      hgt = wid*this.imgBuf.height/this.imgBuf.width;  // default keep aspect ratio
    }
    else if (this.height && !this.width)  // height only passed width is auto
    {
      hgt = this.height;
      wid = hgt*this.imgBuf.width/this.imgBuf.height;    // default to keep aspect ratio
    }
    else    // no width or height default to natural size;
    {
      wid = this.imgBuf.width;    // default to natural width if none passed
      if (this.iso)
      {
        hgt = wid*this.imgBuf.height/this.imgBuf.width;  // default keep aspect ratio;
      }
      else
      {
        hgt = this.imgBuf.height;  // let the natural height scale with world coords
      }
    }
    wid2 = wid/2;
    hgt2 = hgt/2;
    lorgWC = [0, [0, 0],    [wid2, 0],   [wid, 0],
                 [0, hgt2], [wid2, hgt2], [wid, hgt2],
                 [0, hgt],  [wid2, hgt],  [wid, hgt]];
    if (lorgWC[this.lorg] !== undefined)
    {
      dx = -lorgWC[this.lorg][0];
      dy = -lorgWC[this.lorg][1];
    }
    this.imgLorgX = dx;     // world coords offset to drawing origin
    this.imgLorgY = dy;
    this.width = wid;       // default to natural width if none passed
    this.height = hgt;      // default to natural height if none passed
    // construct the cmdsAry for the Img bounding box
    ulx = dx;
    uly = dy;
    llx = dx;
    lly = dy+hgt;
    lrx = dx+wid;
    lry = dy+hgt;
    urx = dx+wid;
    ury = dy;
    this.drawCmds = [ {type:"M", values:[ulx, uly]}, 
                      {type:"L", values:[llx, lly]}, 
                      {type:"L", values:[lrx, lry]}, 
                      {type:"L", values:[urx, ury]}, 
                      {type:"Z", values:[]} ];
  };

  Text = function(txtString, options)
  {
    var opt, prop;
    // build all the Obj2D properties and assign them to this Object's properties
    Obj2D.call(this);

    this.type = "TEXT";               // type string to instruct the render method
    this.txtStr = txtString;          // just store the text String
    this.pthCmds = new Path2DObj();   // Path2D that draws the text bounding box
    this.drawCmds = [];             // DrawCmd array for the text or img bounding box
    this.width = 0;                   // only used for type = IMG, TEXT, set to 0 until image loaded
    this.height = 0;                  //     "
    this.imgLorgX = 0;                //     "
    this.imgLorgY = 0;                //     "
    this.lorg = 1;                    // used by IMG and TEXT to set drawing origin
    // properties set by setProperty method, if undefined render uses Cango default
    this.border = false;              // true = stroke outline with strokeColor & lineWidth
    this.fillCol = null;              // only used if type == SHAPE or TEXT
    this.bgFillColor = null;          // only used if type = TEXT
    this.strokeCol = null;            // render will stroke a path in this color
    this.fontSize = null;             // fontSize in pixels (TEXT only)
    this.fontSizeZC = null;           // fontSize zoom corrected, scaled for any change in context xscl
    this.fontWeight = null;           // fontWeight 100..900 (TEXT only)
    this.fontFamily = null;           // (TEXT only)
    this.lineWidthWC = null;          // border width world coords
    this.lineWidth = null;            // border width pixels
    this.lineCap = null;              // round, butt or square
    this.savScale = 1;                // save acculmulated scale factors to scale lineWidth of border 
    // drop shadow properties
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.shadowBlur = 0;
    this.shadowColor = "#000000";

    // now handle all the user requested options
    opt = (typeof options === 'object')? options: {};   // avoid undeclared object errors
    // check for all supported options
    for (prop in opt)
    {
      // check that this is opt's own property, not inherited from prototype
      if (opt.hasOwnProperty(prop))
      {
        this.setProperty(prop, opt[prop]);
      }
    }
  };

  // make all the Obj2D methods methods of this object
  Text.prototype = Object.create(Obj2D.prototype);
  Text.prototype.constructor = Text;        // do this or prototype constructor still Obj2D

  Text.prototype.setProperty = setPropertyFn;

  /*======================================
   * Apply a translation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Text.prototype.translate = function(x, y)
  {
    this.hardTransform.translate(x, y);
  };

  /*======================================
   * Apply a rotation transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Text.prototype.rotate = function(degs)
  {
    this.hardTransform.rotate(degs);
  };

  /*======================================
   * Apply a skew transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Text.prototype.skew = function(degH, degV)
  {
    this.hardTransform.skew(degH, degV);
  };

  /*======================================
   * Apply a scale transform to the
   * Obj2D's hardOfsTfm.
   *-------------------------------------*/
  Text.prototype.scale = function(xScl, yScl)
  {
    this.hardTransform.scale(xScl, yScl);
  };

  Text.prototype.dup = function()
  {
    var newObj = new Text();

    newObj.type = this.type;
    newObj.txtStr = this.txtStr.slice(0);
    newObj.pthCmds = new Path2DObj();
    newObj.drawCmds = clone(this.drawCmds);
    newObj.dwgOrg = clone(this.dwgOrg);
    newObj.hardTfmAry = clone(this.hardTfmAry);  // hard offset from any parent Group's transform
    newObj.ofsTfmAry = clone(this.ofsTfmAry);    // soft offset from any parent Group's transform
    newObj.border = this.border;
    newObj.strokeCol = this.strokeCol;
    newObj.fillCol = this.fillCol;
    newObj.bgFillColor = this.bgFillColor;
    newObj.lineWidth = this.lineWidth;
    newObj.lineWidthWC = this.lineWidthWC;
    newObj.lineCap = this.lineCap;
    newObj.savScale = 1; 
    newObj.dashed = clone(this.dashed);
    newObj.dashOffset = this.dashOffset;
    newObj.width = this.width;
    newObj.height = this.height;
    newObj.imgLorgX = this.imgLorgX;
    newObj.imgLorgY = this.imgLorgY;
    newObj.lorg = this.lorg;
    newObj.fontSize = this.fontSize;
    newObj.fontWeight = this.fontWeight;
    newObj.fontFamily = this.fontFamily;
    newObj.shadowOffsetX = this.shadowOffsetX;
    newObj.shadowOffsetY = this.shadowOffsetY;
    newObj.shadowBlur = this.shadowBlur;
    newObj.shadowColor = this.shadowColor;
    // The other objects are dynamic, calculated at render

    return newObj;         // return a object which inherits Obj2D properties
  };

  Text.prototype.formatText = function(gc)
  {
    var fntSz = this.fontSize || gc.fontSize,     // fontSize in pxls
        fntFm = this.fontFamily || gc.fontFamily,
        fntWt = this.fontWeight || gc.fontWeight,
        lorg = this.lorg || 1,
        wid, hgt,   // Note: char cell is ~1.4*fontSize pixels high
        wid2, hgt2,
        lorgWC,
        dx = 0,
        dy = 0,
        ulx, uly, llx, lly, lrx, lry, urx, ury,
        fntScl,
        cmdsAry;

    // support for zoom and pan
    if (!this.orgXscl)
    {
      // first time drawn save the scale
      this.orgXscl = gc.xscl;
    }
    fntScl = gc.xscl/this.orgXscl;   // scale for any zoom factor
    this.fontSizeZC = fntSz*fntScl;
    // set the drawing context to measure the size
    gc.ctx.save();
    transformCtx(gc.ctx);  // reset to identity matrix
    gc.ctx.font = fntWt+" "+fntSz+"px "+fntFm;
    wid = gc.ctx.measureText(this.txtStr).width;  // width in pixels
    gc.ctx.restore();

    wid *= fntScl;   // handle zoom scaling
    hgt = fntSz;     // TEXT height from bottom of decender to top of capitals
    hgt *= fntScl;   // handle zoom scaling
    wid2 = wid/2;
    hgt2 = hgt/2;
    lorgWC = [0, [0, hgt],  [wid2, hgt],  [wid, hgt],
                 [0, hgt2], [wid2, hgt2], [wid, hgt2],
                 [0, 0],    [wid2, 0],    [wid, 0]];
    if (lorgWC[lorg] !== undefined)
    {
      dx = -lorgWC[lorg][0];
      dy = lorgWC[lorg][1];
    }
    this.imgLorgX = dx;           // pixel offsets to drawing origin
    this.imgLorgY = dy-0.25*hgt;  // correct for alphabetic baseline, its offset about 0.25*char height

    // construct the cmdsAry for the text bounding box (world coords)
    ulx = dx;
    uly = dy;
    llx = dx;
    lly = dy-hgt;
    lrx = dx+wid;
    lry = dy-hgt;
    urx = dx+wid;
    ury = dy;
    this.drawCmds = [ {type:"M", values:[ulx, uly]}, 
                      {type:"L", values:[llx, lly]}, 
                      {type:"L", values:[lrx, lry]}, 
                      {type:"L", values:[urx, ury]}, 
                      {type:"Z", values:[]} ];
  };

  function transformCtx(ctx, xfm)  // apply a matrix transform to a canvas 2D context
  {
    if (xfm === undefined)
    {
      ctx.setTransform(1, 0, 0,
                       0, 1, 0);
    }
    else
    {
      ctx.setTransform(xfm.matrix[0][0], xfm.matrix[0][1], xfm.matrix[1][0],
                       xfm.matrix[1][1], xfm.matrix[2][0], xfm.matrix[2][1]);
    }
  }

//===============================================================================

  function AnimObj(id, gc, initFn, drawFn, pathFn, options)
  {
    var prop;

    this.id = id;
    this.gc = gc;        // the Cango context to do the drawing
    this.drawFn = drawFn;
    this.pathFn = pathFn;
    this.options = options;
    this.currState = {time:0};  // consider as read-only
    this.nextState = {time:0};  // properties can be added to this (becomes the currState after frame is drawn)
    this.gc.ctx.save();
    if (typeof initFn === "function")
    {
      initFn.call(this, this.options);  // call object creation code
    }
    // draw the object as setup by initFn (pathFn not called yet)
    if (typeof this.drawFn === "function")
    {
      this.drawFn.call(this, this.options);   // call user custom function
    }
    else
    {
      console.log("invalid animation draw function");
    }
    this.gc.ctx.restore();  // if initFn makes changes to ctx restore to pre-initFn state
    // now it has been drawn save the currState values (nextState values are generated by pathFn)
    for (prop in this.nextState)   // if initFn creates new properties, make currState match
    {
      if (this.nextState.hasOwnProperty(prop))
      {
        this.currState[prop] = this.nextState[prop];
      }
    }
  }

  // this is the actual animator that draws the frame
  function drawFrame(timeline)
  {
		var localTime,
				temp,
				prevAt = null,
				clearIt = false,
				time = Date.now();    // use this as a time stamp, browser don't all pass the same time code

		if (timeline.prevAnimMode === timeline.modes.STOPPED)
		{
			timeline.startTime = time - timeline.startOfs;                // forces localTime = 0 to start from beginning
		}
		localTime =  time - timeline.startTime;
		
		// step through all the animation tasks
		timeline.animTasks.forEach(function(at){
			if (at.gc.cId !== prevAt)
			{
				// check for new layer, only clear a layer once, there maybe several Cango contexts on each canvas
				clearIt = true;
				prevAt = at.gc.cId;
			}
			at.gc.ctx.save();
			// if re-starting after a stopAnimation reset the currState.time so pathFn doesn't get negative time between frames
			if (timeline.prevAnimMode === timeline.modes.STOPPED)
			{
				at.currState.time = 0;    // avoid -ve dT (=localTime-currState.time) in pathFn
			}
      if (clearIt)
      {
          at.gc.clearCanvas();
      }
			if (typeof(at.pathFn) === 'function')  // static objects may have null or undefined
			{
				at.pathFn.call(at, localTime, at.options);
			}
      if (typeof at.drawFn === "function")
      {
          at.drawFn.call(at, at.options);
      }
			clearIt = false;
			at.gc.ctx.restore(); // if pathFn changes any ctx properties restore to pre pathFn state
			// now swap the currState and nextState vectors (pathFn may use currState to gen nextState)
			temp = at.currState;
			at.currState = at.nextState; // save current state vector, pathFn will use it
			at.nextState = temp;
			// save the draw time for pathFn
			at.currState.time = localTime;  // save the localtime along the timeline for use by pathFn
		});

		timeline.currTime = localTime;      // timestamp of what is currently on screen
 	}
	
  function Timeline()
  {
    this.animTasks = [];    // each layer can push an AnimObj object in here
    this.timer = null;                // need to save the rAF id for cancelling
    this.modes = {PAUSED:1, STOPPED:2, PLAYING:3, STEPPING:4};     // animation modes
    this.animMode = this.modes.STOPPED;
    this.prevAnimMode = this.modes.STOPPED;
    this.startTime = 0;               // animation start time (relative to 1970)
    this.startOfs = 0;                // used if play calls with non-zero start time
    this.currTime = 0;                // timestamp of frame on screen
    this.stepTime = 50;               // animation step time interval (in msec)
  }

  Timeline.prototype.stopAnimation = function()
  {
    window.cancelAnimationFrame(this.timer);
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.STOPPED;
    // reset the currTime so play and step know to start again
    this.currTime = 0;
    this.startOfs = 0;
  };

  Timeline.prototype.pauseAnimation = function()
  {
    window.cancelAnimationFrame(this.timer);
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.PAUSED;
  };

  Timeline.prototype.stepAnimation = function()
  {
    var savThis = this;

    // this is the actual animator that draws the frame
    function drawIt()
    {
      drawFrame(savThis);
      savThis.prevAnimMode = savThis.modes.PAUSED;
      savThis.animMode = savThis.modes.PAUSED;
		}

    // eqivalent to play for one frame and pause
    if (this.animMode === this.modes.PLAYING)
    {
      return;
    }
    if (this.animMode === this.modes.PAUSED)
    {
      this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn
    }
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.STEPPING;

    setTimeout(drawIt, this.stepTime);
  };

  Timeline.prototype.redrawAnimation = function()
  {
    // eqivalent to play for one frame and pause
    if (this.animMode === this.modes.PLAYING)
    {
      return;
    }
    this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn

    drawFrame(this);
  };

  Timeline.prototype.playAnimation = function(startOfs, stopOfs)
  {
    var savThis = this;

    // this is the actual animator that draws each frame
    function drawIt()
    {
      drawFrame(savThis);
      savThis.prevAnimMode = savThis.modes.PLAYING;
      if (stopOfs)
      {
        if (savThis.currTime < stopOfs)
        {
          savThis.timer = window.requestAnimationFrame(drawIt);
        }
        else
        {
          savThis.stopAnimation();     // go back to start of time line
        }
      }
      else
      {
        savThis.timer = window.requestAnimationFrame(drawIt);   // go forever
      }
    }

    this.startOfs = startOfs || 0;
    if (this.animMode === this.modes.PLAYING)
    {
      return;
    }
    if (this.animMode === this.modes.PAUSED)
    {
      this.startTime = Date.now() - this.currTime;  // move time as if currFrame just drawn
    }
    this.prevAnimMode = this.animMode;
    this.animMode = this.modes.PLAYING;

    this.timer = window.requestAnimationFrame(drawIt);
  };
	
	//===============================================================================

  function Layer(canvasID, canvasElement)
  {
    this.id = canvasID;
    this.cElem = canvasElement;
    this.dragObjects = [];
  }

  function getLayer(cgo)
  {
    var i, lyr = cgo.bkgCanvas.layers[0];

    for (i=1; i < cgo.bkgCanvas.layers.length; i++)
    {
      if (cgo.bkgCanvas.layers[i].id === cgo.cId)
      {
        lyr = cgo.bkgCanvas.layers[i];
        break;
      }
    }
    return lyr;    // Layer object
  }

  function initDragAndDrop(savThis)
  {
    function dragHandler(evt)
    {
      var event = evt || window.event,
          csrPos, testObj, nLyrs, lyr,
          j, k;

      function getCursorPos(e)
      {
        // pass in any mouse event, returns the position of the cursor in raw pixel coords
        var rect = savThis.cnvs.getBoundingClientRect();

        return {x: e.clientX - rect.left, y: e.clientY - rect.top};
      }

      function hitTest(pathObj, csrX, csrY)
      {
        var gc = pathObj.dragNdrop.cgo,
            ysl = (gc.yDown)? gc.xscl: -gc.xscl,
            hit,
            WCtoPX = identityMatrix.translate(gc.vpOrgX+gc.xoffset, (gc.vpOrgY+gc.yoffset))
                                  .scaleNonUniform(gc.xscl, ysl)
                                  .multiply(pathObj.netTfm);

        if ((pathObj.type === 'IMG') && (!gc.yDown))
        {
          WCtoPX = WCtoPX.flipY();  // invert all world coords values
        }            
        else if (pathObj.type === 'TEXT')
        {
          WCtoPX = WCtoPX.scaleNonUniform(1/gc.xscl, 1/ysl);     // pre-invert to counter the invert to come
        }

        gc.ctx.save();       // save un-scaled
        gc.ctx.setTransform(WCtoPX.a, WCtoPX.b, WCtoPX.c, WCtoPX.d, WCtoPX.e, WCtoPX.f);
        gc.ctx.beginPath();
        pathObj.drawCmds.forEach(function(dCmd){
          gc.ctx[cvsCmds[dCmd.type]].apply(gc.ctx, dCmd.values); // add the path segment
        });
        hit = gc.ctx.isPointInPath(csrX, csrY);
 /*
  // for diagnostics on hit region, uncomment
  gc.ctx.strokeStyle = 'red';
  gc.ctx.lineWidth = (pathObj.type === 'TEXT')? 3: 3/gc.xscl;
  gc.ctx.stroke();
 */
        gc.ctx.restore();

        return hit;
      }

      csrPos = getCursorPos(event);  // savThis is any Cango ctx on the canvas
      nLyrs = savThis.bkgCanvas.layers.length;
      // run through all the registered objects and test if cursor pos is in their path
      loops:      // label to break out of nested loops
      for (j = nLyrs-1; j >= 0; j--)       // search top layer down the stack
      {
        lyr = savThis.bkgCanvas.layers[j];
        for (k = lyr.dragObjects.length-1; k >= 0; k--)  // search from last drawn to first (underneath)
        {
          testObj = lyr.dragObjects[k];
          if (hitTest(testObj, csrPos.x, csrPos.y))
          {
            // call the grab handler for this object (check it is still enabled)
            if (testObj.dragNdrop)
            {
              testObj.dragNdrop.grab(event);
              break loops;
            }
          }
        }
      }
    }

    // =========== Start Here ===========

    savThis.cnvs.onmousedown = dragHandler;   // added to all layers but only top layer will catch events
  }

  Cango = function(canvasId)
  {
    var savThis = this,
        bkgId, bkgL;

    function setResizeHandler(callback, timeout) 
    {
      var timer_id = undefined;
      window.addEventListener("resize", function(){
        if(timer_id != undefined) 
        {
            clearTimeout(timer_id);
            timer_id = undefined;
        }
        timer_id = setTimeout(function(){
            timer_id = undefined;
            callback();
          }, timeout);
      });
    }
          
    function resizeLayers()
    {
      var j, ovl,
          t = savThis.bkgCanvas.offsetTop + savThis.bkgCanvas.clientTop,
          l = savThis.bkgCanvas.offsetLeft + savThis.bkgCanvas.clientLeft,
          w = savThis.bkgCanvas.offsetWidth,
          h = savThis.bkgCanvas.offsetHeight;

      // check if canvas is resized when window -resized, allow some rounding error in layout calcs
      if ((Math.abs(w - savThis.rawWidth)/w < 0.01) && (Math.abs(h - savThis.rawHeight)/h < 0.01))
      {
        // canvas size idin't change so return
        return;
      }
      // canvas has been resized so re0size all the overlay canvases
      // kill off any animations on resize (else they stil contiune along with any new ones)
      if (savThis.bkgCanvas.timeline && savThis.bkgCanvas.timeline.animTasks.length)
      {
        savThis.deleteAllAnimations();
      }
      // fix all Cango contexts to know about new size
      savThis.rawWidth = w;
      savThis.rawHeight = h;
      savThis.aRatio = w/h;
      // there may be multiple Cango contexts a layer, try to only fix actual canvas properties once
      if (savThis.bkgCanvas !== savThis.cnvs)
      {
        return undefined;
      }
      savThis.cnvs.setAttribute('width', w);    // reset canvas pixels width
      savThis.cnvs.setAttribute('height', h);   // don't use style for this
      // step through the stack of canvases (if any)
      for (j=1; j<savThis.bkgCanvas.layers.length; j++)  // bkg is layer[0]
      {
        ovl = savThis.bkgCanvas.layers[j].cElem;
        if (ovl)
        {
          ovl.style.top = t+'px';
          ovl.style.left = l+'px';
          ovl.style.width = w+'px';
          ovl.style.height = h+'px';
          ovl.setAttribute('width', w);    // reset canvas pixels width
          ovl.setAttribute('height', h);   // don't use style for this
        }
      }
    }

    this.cId = canvasId;
    this.cnvs = document.getElementById(canvasId);
    if (this.cnvs === null)
    {
      alert("can't find canvas "+canvasId);
      return undefined;
    }
    this.bkgCanvas = this.cnvs;  // this is a background canvas so bkgCanvas points to itself
    // check if this is a context for an overlay
    if (canvasId.indexOf("_ovl_") !== -1)
    {
      // this is an overlay. get a reference to the backGround canvas
      bkgId = canvasId.slice(0,canvasId.indexOf("_ovl_"));
      this.bkgCanvas = document.getElementById(bkgId);
    }
    this.rawWidth = this.cnvs.offsetWidth;
    this.rawHeight = this.cnvs.offsetHeight;
    this.aRatio = this.rawWidth/this.rawHeight;
    this.widthPW = 100;                          // width of canvas in Percent Width Coords
    this.heightPW = 100/this.aRatio;    // height of canvas in Percent Width Coords
    if (!this.bkgCanvas.hasOwnProperty('layers'))
    {
      // create an array to hold all the overlay canvases for this canvas
      this.bkgCanvas.layers = [];
      // make a Layer object for the bkgCanvas
      bkgL = new Layer(this.cId, this.cnvs);
      this.bkgCanvas.layers[0] = bkgL;
      // make sure the overlay canvases always match the bkgCanvas size
      setResizeHandler(resizeLayers, 250);
    }
    if ((typeof Timeline !== "undefined") && !this.bkgCanvas.hasOwnProperty('timeline'))
    {
      // create a single timeline for all animations on all layers
      this.bkgCanvas.timeline = new Timeline();
    }
    if (!this.cnvs.hasOwnProperty('resized'))
    {
      // make canvas native aspect ratio equal style box aspect ratio.
      // Note: rawWidth and rawHeight are floats, assignment to ints will truncate
      this.cnvs.setAttribute('width', this.rawWidth);    // reset canvas pixels width
      this.cnvs.setAttribute('height', this.rawHeight);  // don't use style for this
      this.cnvs.resized = true;
    }
    this.ctx = this.cnvs.getContext('2d');    // draw direct to screen canvas
    this.yDown = true;                // set by setWordlCoordsRHC & setWorldCoordsSVG (SVG is default)
    this.vpW = this.rawWidth;         // vp width in pixels (no more viewport so use full canvas)
    this.vpH = this.rawHeight;        // vp height in pixels, canvas height = width/aspect ratio
    this.vpOrgX = 0;                  // gridbox origin in pixels (upper left for SVG, the default)
    this.vpOrgY = 0;                  // gridbox origin in pixels (upper left for SVG, the default)
    this.xscl = 1;                    // world x axis scale factor, default: pixels
    this.yscl = 1;                    // world y axis scale factor, +ve down (SVG style default)
    this.xoffset = 0;                 // world x origin offset from viewport left in pixels
    this.yoffset = 0;                 // world y origin offset from viewport bottom in pixels
    this.savWC = {"xscl":this.xscl,
                  "yscl":this.yscl,
                  "xoffset":this.xoffset,
                  "yoffset":this.yoffset};  // save world coords for zoom/pan
    this.ctx.textAlign = "left";      // all offsets are handled by lorg facility
    this.ctx.textBaseline = "alphabetic";
    this.penCol = "rgba(0, 0, 0, 1.0)";        // black
    this.penWid = 1;                  // pixels
    this.lineCap = "butt";
    this.paintCol = "rgba(128,128,128,1.0)";   // gray
    this.fontSize = 12;               // pixels
    this.fontWeight = 400;            // 100..900, 400 = normal,700 = bold
    this.fontFamily = "Consolas, Monaco, 'Andale Mono', monospace";
    this.clipCount = 0;               // count ClipMask calls for use by resetClip

    this.getUnique = function()
    {
      uniqueVal += 1;     // a private 'global'
      return uniqueVal;
    };

    initDragAndDrop(this);
  };

  Cango.prototype.animation = function(init, draw, path, options)
  {
    var animObj,
        animId;

    animId = this.cId+"_"+this.getUnique();
    animObj = new AnimObj(animId, this, init, draw, path, options);
    // push this into the Cango animations array
    this.stopAnimation();   // make sure we are not still running an old animation
    this.bkgCanvas.timeline.animTasks.push(animObj);

    return animObj.id;   // so the animation just created can be deleted if required
  };

  Cango.prototype.pauseAnimation = function()
  {
    this.bkgCanvas.timeline.pauseAnimation();
  };

  Cango.prototype.playAnimation = function(startTime, stopTime)
  {
    this.bkgCanvas.timeline.playAnimation(startTime, stopTime);
  };

  Cango.prototype.stopAnimation = function()
  {
    this.bkgCanvas.timeline.stopAnimation();
  };

  Cango.prototype.stepAnimation = function()
  {
    this.bkgCanvas.timeline.stepAnimation();
  };

  Cango.prototype.deleteAnimation = function(animId)
  {
    var savThis = this;
    
    this.pauseAnimation();   // pause all animations
    this.bkgCanvas.timeline.animTasks.forEach(function(task, idx){
      if (task.id === animId)
      {
        savThis.bkgCanvas.timeline.animTasks.splice(idx, 1);       // delete the animation object
        return;
      }
    });
  };

  Cango.prototype.deleteAllAnimations = function()
  {
    this.stopAnimation();
    this.bkgCanvas.timeline.animTasks = [];
  };

  Cango.prototype.toPixelCoords = function(x, y)
  {
    // transform x,y in world coords to canvas pixel coords (top left is 0,0 y axis +ve down)
    var xPx = this.vpOrgX+this.xoffset+x*this.xscl,
        yPx = this.vpOrgY+this.yoffset+y*this.yscl;

    return {x: xPx, y: yPx};
  };

  Cango.prototype.toWorldCoords = function(xPx, yPx)
  {
    // transform xPx,yPx in raw canvas pixels to world coords (lower left is 0,0 +ve up)
    var xW = (xPx - this.vpOrgX - this.xoffset)/this.xscl,
        yW = (yPx - this.vpOrgY - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango.prototype.getCursorPosWC = function(evt)
  {
    // pass in any mouse event, returns the position of the cursor in raw pixel coords
    var e = evt||window.event,
        rect = this.cnvs.getBoundingClientRect(),
        xW = (e.clientX - rect.left - this.vpOrgX - this.xoffset)/this.xscl,
        yW = (e.clientY - rect.top - this.vpOrgY - this.yoffset)/this.yscl;

    return {x: xW, y: yW};
  };

  Cango.prototype.clearCanvas = function(fillColor)
  {
    var savThis = this,
        layerObj;

    function genLinGradient(lgrad)
    {
      var p1 = savThis.toPixelCoords(lgrad.grad[0], lgrad.grad[1]),
          p2 = savThis.toPixelCoords(lgrad.grad[2], lgrad.grad[3]),
          grad = savThis.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);

      lgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

      return grad;
    }

    function genRadGradient(rgrad)
    {
      var p1 = savThis.toPixelCoords(rgrad.grad[0], rgrad.grad[1]),
          r1 = rgrad.grad[2]*savThis.xscl,
          p2 = savThis.toPixelCoords(rgrad.grad[3], rgrad.grad[4]),
          r2 = rgrad.grad[5]*savThis.xscl,
          grad = savThis.ctx.createRadialGradient(p1.x, p1.y, r1, p2.x, p2.y, r2);

      rgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

      return grad;
    }

    if (fillColor)
    {
      this.ctx.save();
      if (fillColor instanceof LinearGradient)
      {
        this.ctx.fillStyle = genLinGradient(fillColor);
      }
      else if (fillColor instanceof RadialGradient)
      {
        this.ctx.fillStyle = genRadGradient(fillColor);
      }
      else
      {
        this.ctx.fillStyle = fillColor;
      }
      this.ctx.fillRect(0, 0, this.rawWidth, this.rawHeight);
      this.ctx.restore();
    }
    else
    {
      this.ctx.clearRect(0, 0, this.rawWidth, this.rawHeight);
    }
    // all drawing erased, but graphics contexts remain intact
    // clear the dragObjects array, draggables put back when rendered
    layerObj = getLayer(this);
    layerObj.dragObjects.length = 0;
    // in case the CangoHTMLtext extension is used
    if (this.cnvs.alphaOvl && this.cnvs.alphaOvl.parentNode)
    {
      this.cnvs.alphaOvl.parentNode.removeChild(this.cnvs.alphaOvl);
    }
  };

  Cango.prototype.gridboxPadding = function(left, bottom, right, top)
  {
    // left, bottom, right, top are the padding from the respective sides, all are in % of canvas width units
    // negative values are set to 0.
    var savThis = this,
        width,
        height;

    function setDefault()
    {
      savThis.vpW = savThis.rawWidth;
      savThis.vpH = savThis.rawHeight;
      savThis.vpOrgX = 0;
      savThis.vpOrgY = 0;
      savThis.setWorldCoordsSVG(); // if new gridbox created, world coords are garbage, so reset to defaults
    }

    if (left === undefined)   // no error just resetiing to default
    {
      setDefault();
      return;
    }
    // check if only left defined
    if (bottom === undefined)  // only one parameter
    {
      if ((left >= 50) || (left < 0))
      {
        console.error("gridbox right must be greater than left");
        setDefault();
        return;
      }
      else
      {
        bottom = left;
      }
    }
    if ((left < 0) || (left > 99))
    {
      left = 0;
    }
    // now we have a valid left and a bottom
    if ((bottom < 0) || (bottom > 99/this.aRatio))
    {
      bottom = 0;
    }
    if (right === undefined)   // right == 0 is OK
    {
      right = left;
    }
    else if (right < 0)
    {
      right = 0;
    }
    if (top === undefined)    // top == 0 is OK
    {
      top = bottom;
    }
    else if (top < 0)
    {
      top = 0;
    }
    // now we have all 4 valid padding values
    width = 100 - left - right;
    height = 100/this.aRatio - top - bottom;

    if ((width < 0) || (height < 0))
    {
      console.error("invalid gridbox dimensions");
      setDefault();
      return;
    }

    this.vpW = width*this.rawWidth/100;
    this.vpH = height*this.rawWidth/100;
    // now calc upper left of viewPort in pixels = this is the vpOrg
    this.vpOrgX = left*this.rawWidth/100;
    this.vpOrgY = top*this.rawWidth/100;     // SVG vpOrg is up at the top left
    this.yDown = true;                       // reset, both setWorldCoords needs this  
    this.setWorldCoordsSVG(); // if new gridbox created, world coords are garbage, so reset to defaults
  };

  Cango.prototype.fillGridbox = function(fillColor)
  {
    var savThis = this,
        newCol = fillColor || this.paintCol,
        yCoord = (this.yDown)? this.vpOrgY: this.vpOrgY-this.vpH;

    function genLinGradient(lgrad)
    {
      var p1 = savThis.toPixelCoords(lgrad.grad[0], lgrad.grad[1]),
          p2 = savThis.toPixelCoords(lgrad.grad[2], lgrad.grad[3]),
          grad = savThis.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);

      lgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

      return grad;
    }

    function genRadGradient(rgrad)
    {
      var p1 = savThis.toPixelCoords(rgrad.grad[0], rgrad.grad[1]),
          r1 = rgrad.grad[2]*savThis.xscl,
          p2 = savThis.toPixelCoords(rgrad.grad[3], rgrad.grad[4]),
          r2 = rgrad.grad[5]*savThis.xscl,
          grad = savThis.ctx.createRadialGradient(p1.x, p1.y, r1, p2.x, p2.y, r2);

      rgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

      return grad;
    }

    this.ctx.save();
    if (newCol instanceof LinearGradient)
    {
      this.ctx.fillStyle = genLinGradient(newCol);
    }
    else if (newCol instanceof RadialGradient)
    {
      this.ctx.fillStyle = genRadGradient(newCol);
    }
    else
    {
      this.ctx.fillStyle = newCol;
    }
    this.ctx.fillRect(this.vpOrgX, yCoord, this.vpW, this.vpH); // fillRect(left, top, wid, hgt)
    this.ctx.restore();
  };

  Cango.prototype.setWorldCoordsSVG = function(vpOriginX, vpOriginY, spanX, spanY)
  {
    // gridbox origin is upper left
    var vpOrgXWC = vpOriginX || 0,  // gridbox upper left (vpOrgX) in world coords
        vpOrgYWC = vpOriginY || 0;  // gridbox upper left (vpOrgY) in world coords

    if (!this.yDown)  // RHC coords being used, switch to SVG, must change to vpOrgY
    {
      this.vpOrgY -= this.vpH;  // switch vpOrg to upper left corner of gridbox
      this.yDown = true;        // flag true for SVG world coords being used
    }
    if (spanX && (spanX > 0))
    {
      this.xscl = this.vpW/spanX;
    }
    else
    {
      this.xscl = 1;                   // use pixel units
    }
    if (spanY && (spanY > 0))
    {
      this.yscl = this.vpH/spanY;     // yscl is positive for SVG
    }
    else
    {
      this.yscl = this.xscl;          // square pixels
    }
    this.xoffset = -vpOrgXWC*this.xscl;
    this.yoffset = -vpOrgYWC*this.yscl;   // reference to upper left of gridbox
    // save values to support resetting zoom and pan
    this.savWC = {"xscl":this.xscl, "yscl":this.yscl, "xoffset":this.xoffset, "yoffset":this.yoffset};
  };

  Cango.prototype.setWorldCoordsRHC = function(vpOriginX, vpOriginY, spanX, spanY)
  {
    // gridbox origin is upper left
    var vpOrgXWC = vpOriginX || 0,  // gridbox lower left (vpOrgX) in world coords
        vpOrgYWC = vpOriginY || 0;  // gridbox lower left (vpOrgY) in world coords

    if (this.yDown)  // SVG coords being used, switch to RHC must change to vpOrgY
    {
      this.vpOrgY += this.vpH;  // switch vpOrg to lower left corner of gridbox
      this.yDown = false;       // flag false for RHC world coords
    }
    if (spanX && (spanX > 0))
    {
      this.xscl = this.vpW/spanX;
    }
    else
    {
      this.xscl = 1;                   // use pixel units
    }
    if (spanY && (spanY > 0))
    {
      this.yscl = -this.vpH/spanY;    // yscl is negative for RHC
    }
    else
    {
      this.yscl = -this.xscl;          // square pixels
    }
    this.xoffset = -vpOrgXWC*this.xscl;
    this.yoffset = -vpOrgYWC*this.yscl;
    // save these values to support resetting zoom and pan
    this.savWC = {"xscl":this.xscl, "yscl":this.yscl, "xoffset":this.xoffset, "yoffset":this.yoffset};
  };

  Cango.prototype.setPropertyDefault = function(propertyName, value)
  {
    if ((typeof propertyName !== "string")||(value === undefined)||(value === null))
    {
      return;
    }
    switch (propertyName.toLowerCase())
    {
      case "fillcolor":
        if ((typeof value === "string")||(typeof value === "object"))  // gradient will be an object
        {
          this.paintCol = value;
        }
        break;
      case "strokecolor":
        if ((typeof value === "string")||(typeof value === "object"))  // gradient will be an object
        {
          this.penCol = value;
        }
        break;
      case "linewidth":
      case "strokewidth":
        this.penWid = value;
        break;
      case "linecap":
        if ((typeof value === "string")&&((value === "butt")||(value ==="round")||(value === "square")))
        {
          this.lineCap = value;
        }
        break;
      case "fontfamily":
        if (typeof value === "string")
        {
          this.fontFamily = value;
        }
        break;
      case "fontsize":
        this.fontSize = value;
        break;
      case "fontweight":
        if ((typeof value === "string")||((value >= 100)&&(value <= 900)))
        {
          this.fontWeight = value;
        }
        break;
      case "steptime":
        if ((value >= 15)&&(value <= 500))
        {
          this.stepTime = value;
        }
        break;
      default:
        return;
    }
  };

  Cango.prototype.dropShadow = function(obj)  // no argument will reset to no drop shadows 
  {
    var xOfs = 0,
        yOfs = 0,
        radius = 0,
        color = "#000000",
        xScale = 1,
        yScale = 1;

    if (obj != undefined)
    {
      xOfs = obj.shadowOffsetX || 0;
      yOfs = obj.shadowOffsetY || 0;
      radius = obj.shadowBlur || 0;
      color = obj.shadowColor || "#000000";
      if ((obj.type === "SHAPE")||((obj.type === "PATH")&& !obj.iso))   // must scale for world coords (matrix scaling not used)
      {
        xScale *= this.xscl;
        yScale *= this.yscl;
      }
      else                         // no need to scale here (matrix scaling used)
      {
        xScale *= this.xscl;
        yScale *= -this.xscl;
      }
    }
      this.ctx.shadowOffsetX = xOfs*xScale;
      this.ctx.shadowOffsetY = yOfs*yScale;
      this.ctx.shadowBlur = radius*xScale;
      this.ctx.shadowColor = color;
  };

  /*=============================================
   * render will draw a Group or Obj2D.
   * If an Obj2D is passed, update the netTfm
   * and render it.
   * If a Group is passed, recursively update
   * the netTfm of the group's family tree,
   * then render all Obj2Ds.
   *--------------------------------------------*/
  Cango.prototype.render = function(rootObj, clear)
  {
    var savThis = this,
        objAry,
        nonIsoScl = Math.abs(savThis.yscl/savThis.xscl);

    function genNetTfmMatrix(obj)
    {
      var toIso;
      if (!obj.iso)
      {
        toIso = new Distorter("SCL", scaler, 1, nonIsoScl);
        // apply the non-iso world coord scaling to the original y coords
        obj.netTfmAry.unshift(toIso);   // scale distorter will do the job
      }
      matrixReset(obj.ofsTfm);  // clear out previous transforms
      obj.savScale = 1;            // reset the scale factor for re-calc
      // apply the net transform to the obj2D transform matrix
      obj.netTfmAry.forEach(function(dtr){
        // calc accumulated scaling to apply to lineWidth
        if (dtr.type === "SCL")
        {
          obj.savScale *= Math.abs(dtr.args[0]);
        }
        // apply world coord scaling to dwgOrg translations
        if (dtr.type === "TRN")
        {
          // call the user distort fn to do the distorting now
          if (obj.iso)
            dtr.distortFn.call(obj, [dtr.args[0], dtr.args[1]*nonIsoScl]);
          else
            dtr.distortFn.call(obj, [dtr.args[0], dtr.args[1]]);  
        }
        else
        {
          dtr.distortFn.call(obj, dtr.args);
        }
      });
      obj.netTfm = obj.ofsTfm.multiply(obj.grpTfm); // apply inherited group Tfms
    }

    function genNetTfm(obj)
    {
      var grpTfmAry, grpTfm, softTfmAry;

      if (obj.parent)   // must be a child of a Group
      {
        grpTfmAry = obj.parent.netTfmAry;    // grpTfm is always netTfm of the parent Group
        grpTfm = obj.parent.netTfm;
      }
      else                                   // must be the rootObj
      {
        grpTfmAry = [];
        grpTfm = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();
      }
      // now generate the soft transforms (that's all a Group has, hard are passed on immediately)
      softTfmAry = grpTfmAry.concat(obj.ofsTfmAry);
      if (obj.type === "GRP")
      {
        obj.netTfmAry = softTfmAry;
      }
      else
      {
        obj.netTfmAry = softTfmAry.concat(obj.hardTfmAry);
        // save the inherited transforms to be applied when obj ready to render (Images may not be loaded)
        obj.grpTfm = grpTfm;
      }
      // apply the soft transforms to the dwgOrg of the Group or the Obj2D
      // NB: hard Transforms don't move dwgOrg, they move the object relative to dwgOrg!
      obj.dwgOrg = {x:0, y:0};
      softTfmAry.forEach(function(dtr){
        obj.dwgOrg = dtr.distortFn.call(obj.dwgOrg, dtr.args);
      });
    }

    function recursiveGenNetTfm()
    {
      var flatAry = [];

      // task:function, grp: group with children
      function iterate(task, obj)
      {
        task(obj);
        if (obj.type === "GRP")    // find Obj2Ds to draw
        {
        obj.children.forEach(function(childNode){
            iterate(task, childNode);
          });
        }
        else
        {
          flatAry.push(obj);       // just push into the array to be drawn
        }
      }
      // now propagate the current grpXfm through the tree of children
      iterate(genNetTfm, rootObj);

      return flatAry;
    }

    function processObj2D(obj)
    {
      function imgLoaded()
      {
        obj.formatImg();
        genNetTfmMatrix(obj);
        savThis.paintImg(obj);
      }

      if (obj.type === "IMG")
      {
        if (obj.imgBuf.complete)    // see if already loaded
        {
          imgLoaded();
        }
        else
        {
          addEvent(obj.imgBuf, 'load', imgLoaded);
        }
      }
      else if (obj.type === "TEXT")
      {
        obj.formatText(savThis);
        genNetTfmMatrix(obj);
        savThis.paintText(obj);
      }
      else if (obj.type === "CLIP")
      {
        genNetTfmMatrix(obj);
        savThis.applyClipMask(obj);
      }
      else // "PATH" or "SHAPE"
      {
        genNetTfmMatrix(obj);
        savThis.paintPath(obj);
      }
    }

  	function iterativeReset(obj)
  	{
   	  obj.transform.reset();
  	  if (obj.type === "GRP")
      {
    	obj.children.forEach(function(childNode){
  		  iterativeReset(childNode);
  		});
      }
  	}

// ============ Start Here =====================================================

    if (typeof rootObj.type !== "string")  // "GRP", "PATH", "SHAPE", "IMG", "TEXT", "CLIP"
    {
      console.log("render called on bad object type");
      return;
    }
    if (clear === true)
    {
      this.clearCanvas();
    }
    if (rootObj.type === "GRP")
    {
      // recursively apply transforms and return the flattened tree as an array of Obj2D to be drawn
      objAry = recursiveGenNetTfm();
      // now render the Obj2Ds onto the canvas
      objAry.forEach(processObj2D);
    }
    else   // single Obj2D, type = "PATH", "SHAPE", "IMG", "TEXT", "CLIP"
    {
      genNetTfm(rootObj);
      // draw the single Obj2D onto the canvas
      processObj2D(rootObj);
    }
    // all rendering done so recursively reset the dynamic ofsTfmAry
    iterativeReset(rootObj);
    this.resetClip();         // clear all active masks
  };

  Cango.prototype.genLinGrad = function(lgrad, tfm)
  {
    var p1x = lgrad.grad[0],
        p1y = lgrad.grad[1],
        p2x = lgrad.grad[2],
        p2y = lgrad.grad[3],
        tp1 = transformPoint(p1x, p1y, tfm),
        tp2 = transformPoint(p2x, p2y, tfm),
        grad = this.ctx.createLinearGradient(tp1.x, tp1.y, tp2.x, tp2.y);
    
    lgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

    return grad;
  };

  Cango.prototype.genRadGrad = function(rgrad, tfm, scl)
  {
    var p1x = rgrad.grad[0],
        p1y = rgrad.grad[1],
        r1 = rgrad.grad[2]*scl, 
        p2x = rgrad.grad[3],
        p2y = rgrad.grad[4],
        r2 = rgrad.grad[5]*scl,
        tp1 = transformPoint(p1x, p1y, tfm),
        tp2 = transformPoint(p2x, p2y, tfm),
        grad = this.ctx.createRadialGradient(tp1.x, tp1.y, r1, tp2.x, tp2.y, r2);

    rgrad.colorStops.forEach(function(colStop){grad.addColorStop(colStop[0], colStop[1]);});

    return grad;
  };

  Cango.prototype.paintImg = function(imgObj)
  {
    // should only be called after image has been loaded into imgBuf
    var savThis = this,
        img = imgObj.imgBuf,  // this is the place the image is stored in object
        ysl = (this.yDown)? this.xscl: -this.xscl,
        currLr, aidx,
        col, stkCol,
        tp,
        WCtoPX = identityMatrix.translate(this.vpOrgX + this.xoffset, this.vpOrgY + this.yoffset)   //  viewport offset
                              .scaleNonUniform(this.xscl, ysl)     // world coords to pixels
                              .multiply(imgObj.netTfm);       // app transforms

    if (!this.yDown)
    {
      WCtoPX = WCtoPX.flipY();  // invert all world coords values
    }            

    this.ctx.save();   // save raw canvas no transforms no dropShadow
    this.ctx.setTransform(WCtoPX.a, WCtoPX.b, WCtoPX.c, WCtoPX.d, WCtoPX.e, WCtoPX.f);
    this.dropShadow(imgObj);  // set up dropShadow if any
    // now insert the image canvas ctx will apply transforms (width etc in WC)
    this.ctx.drawImage(img, imgObj.imgLorgX, imgObj.imgLorgY, imgObj.width, imgObj.height);
    if (imgObj.border)
    {
      this.ctx.beginPath();
      imgObj.drawCmds.forEach(function(dCmd){
        savThis.ctx[cvsCmds[dCmd.type]].apply(savThis.ctx, dCmd.values); // add the path segment
      });
      this.ctx.restore();   // revert to no drop shadow no transforms ready for border
      this.ctx.save();
      col = imgObj.strokeCol || this.penCol;
      if (col instanceof LinearGradient)
      {
        stkCol = this.genLinGrad(col, WCtoPX);
      }
      else if (col instanceof RadialGradient)
      {
        stkCol = this.genRadGrad(col, WCtoPX, imgObj.savScale*this.xscl);
      }
      else
      {
        stkCol = col;
      }
      if (imgObj.lineWidthWC)
      {
        this.ctx.lineWidth = imgObj.lineWidthWC*imgObj.savScale*this.xscl;   // lineWidth in world coords so scale to px
      }
      else
      {
        this.ctx.lineWidth = imgObj.lineWidth || this.penWid; 
      }
      this.ctx.strokeStyle = stkCol;
      // if properties are undefined use Cango default
      this.ctx.lineCap = imgObj.lineCap || this.lineCap;
      this.ctx.stroke();
      this.ctx.restore();    // undo the stroke style etc
    }

    if (imgObj.dragNdrop !== null)
    {
      // update dragNdrop layer to match this canvas
      currLr = getLayer(this);
      if (currLr !== imgObj.dragNdrop.layer)
      {
        if (imgObj.dragNdrop.layer)  // if not the first time rendered
        {
          // remove the object reference from the old layer
          aidx = imgObj.dragNdrop.layer.dragObjects.indexOf(this);
          if (aidx !== -1)
          {
            imgObj.dragNdrop.layer.dragObjects.splice(aidx, 1);
          }
        }
      }
      imgObj.dragNdrop.cgo = this;
      imgObj.dragNdrop.layer = currLr;
      // now push it into Cango.dragObjects array, its checked by canvas mousedown event handler
      if (!imgObj.dragNdrop.layer.dragObjects.includes(imgObj))
      {
        imgObj.dragNdrop.layer.dragObjects.push(imgObj);
      }
    }
  };

  Cango.prototype.paintPath = function(pathObj)
  {
    // used for type: PATH, SHAPE
    var savThis = this,
        tp,
        ysl = (this.yDown)? this.xscl: -this.xscl,
        col, filCol, stkCol,
        currLr, aidx,
        WCtoPX = identityMatrix.translate(this.vpOrgX+this.xoffset, (this.vpOrgY+this.yoffset))
                               .scaleNonUniform(this.xscl, ysl)
                               .multiply(pathObj.netTfm);

    this.ctx.save();   // save current context
    // make a scaled path that will render onto raw pixel scaling so lineWidth doesn't get distorted by non-iso scaling
    this.ctx.transform(WCtoPX.a, WCtoPX.b, WCtoPX.c, WCtoPX.d, WCtoPX.e, WCtoPX.f);
    this.ctx.beginPath();                      // make the canvas 'current path' the scaled path
    pathObj.drawCmds.forEach(function(dCmd){
      savThis.ctx[cvsCmds[dCmd.type]].apply(savThis.ctx, dCmd.values); // add the path segment
    });
    this.ctx.restore();  
    
    this.ctx.save();   // save current context
    col = pathObj.fillCol || this.paintCol;
    if (col instanceof LinearGradient)
    {
      filCol = this.genLinGrad(col, WCtoPX);
    }
    else if (col instanceof RadialGradient)
    {
      filCol = this.genRadGrad(col, WCtoPX, pathObj.savScale*this.xscl);
    }
    else
    {
      filCol = col;
    }
    col = pathObj.strokeCol || this.penCol;
    if (col instanceof LinearGradient)
    {
      stkCol = this.genLinGrad(col, WCtoPX);
    }
    else if (col instanceof RadialGradient)
    {
      stkCol = this.genRadGrad(col, WCtoPX, pathObj.savScale*this.xscl);
    }
    else
    {
      stkCol = col;
    }
    this.dropShadow(pathObj);    // set up dropShadow if any
    if (pathObj.type === "SHAPE")
    {
      this.ctx.fillStyle = filCol;
      this.ctx.fill(pathObj.fillRule);
    }
    if ((pathObj.type === "PATH")|| pathObj.border)
    {
      if (pathObj.border) // drop shadows for Path not border
      {
        // if Shape with border clear any drop shadow so not rendered twice
        this.dropShadow(); 
      }
      // handle dashed lines
      if (Array.isArray(pathObj.dashed) && pathObj.dashed.length)
      {
        this.ctx.setLineDash(pathObj.dashed);
        this.ctx.lineDashOffset = pathObj.dashOffset || 0;
      }
      // support for zoom and pan changing line width
      if (pathObj.lineWidthWC)
      {
        this.ctx.lineWidth = pathObj.lineWidthWC*pathObj.savScale*this.xscl;   // lineWidth in world coords so scale to px
      }
      else
      {
        this.ctx.lineWidth = pathObj.lineWidth || this.penWid; // lineWidth in pixels
      }
      this.ctx.strokeStyle = stkCol;
      this.ctx.lineCap = pathObj.lineCap || this.lineCap;
      this.ctx.stroke();   // stroke the current path
      this.ctx.setLineDash([]);   // clean up dashes (they are not reset by save/restore)
      this.ctx.lineDashOffset = 0;
    }
    this.ctx.restore();  
    if (pathObj.dragNdrop !== null)
    {
      // update dragNdrop layer to match this canvas
      currLr = getLayer(this);
      if (currLr !== pathObj.dragNdrop.layer)
      {
        if (pathObj.dragNdrop.layer)  // if not the first time rendered
        {
          // remove the object reference from the old layer
          aidx = pathObj.dragNdrop.layer.dragObjects.indexOf(this);
          if (aidx !== -1)
          {
            pathObj.dragNdrop.layer.dragObjects.splice(aidx, 1);
          }
        }
      }
      pathObj.dragNdrop.cgo = this;
      pathObj.dragNdrop.layer = currLr;
      // now push it into Cango.dragObjects array, its checked by canvas mousedown event handler
      if (!pathObj.dragNdrop.layer.dragObjects.includes(pathObj))
      {
        pathObj.dragNdrop.layer.dragObjects.push(pathObj);
      }
    }
  };

  Cango.prototype.applyClipMask = function(maskObj)
  {
    // if empty array was passed as mask definition then reset clip to full canvas
    if (!maskObj.drawCmds.length)
    {
      this.resetClip();
      return;
    }

    var savThis = this,
        tp,
        ysl = (this.yDown)? this.xscl: -this.xscl,
        WCtoPX = identityMatrix.translate(this.vpOrgX+this.xoffset, (this.vpOrgY+this.yoffset))
                              .scaleNonUniform(this.xscl, ysl)
                              .multiply(maskObj.netTfm);

    this.ctx.save();   // save current context
    this.clipCount += 1;
    this.ctx.save();   // save current context
    // make a scaled path that will render onto raw pixel scaling so lineWidth doesn't get distorted by non-iso scaling
    this.ctx.transform(WCtoPX.a, WCtoPX.b, WCtoPX.c, WCtoPX.d, WCtoPX.e, WCtoPX.f);
    this.ctx.beginPath();
    maskObj.drawCmds.forEach(function(dCmd){
      savThis.ctx[cvsCmds[dCmd.type]].apply(savThis.ctx, dCmd.values); // add the path segment
    });
    this.ctx.closePath();    // clip only works if path colosed
    this.ctx.restore();  
    this.ctx.clip(maskObj.fillRule);

    // FF 52 bugfix: force clip to take effect
    //============================================================================================
    // Workaround for Firefox 52 bug: "clip doesn't clip radial gradient fills"
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.0)";
    this.ctx.fillRect(0,0,1,1);   // any fill call will do will do
    //============================================================================================
  };

  Cango.prototype.resetClip = function()
  {
    while (this.clipCount > 0)
    {
      this.ctx.restore();
      this.clipCount--;
    }
  };

  Cango.prototype.paintText = function(txtObj)
  {
    var savThis = this,
        ysl = (this.yDown)? this.xscl: -this.xscl,
        fntWt, fntSz, fntFm,
        currLr, aidx,
        WCtoPX = identityMatrix.translate(this.vpOrgX + this.xoffset, this.vpOrgY + this.yoffset)   //  viewport offset
                              .scaleNonUniform(this.xscl, ysl)     // world coords to pixels
                              .multiply(txtObj.netTfm)
                              .scaleNonUniform(1/this.xscl, 1/ysl);       // app transforms

    // if Obj2D fontWeight or fontSize undefined use Cango default
    fntWt = txtObj.fontWeight || this.fontWeight;
    fntSz = txtObj.fontSizeZC;        // font size in pixels corrected for any zoom scaling factor
    fntFm = txtObj.fontFamily || this.fontFamily;

    this.ctx.save();   // save raw canvas no transforms no dropShadow
    this.ctx.setTransform(WCtoPX.a, WCtoPX.b, WCtoPX.c, WCtoPX.d, WCtoPX.e, WCtoPX.f);

    // if a bgFillColor is specified then fill the bounding box before rendering the text
    if (typeof txtObj.bgFillColor === "string")
    {
      // create the bounding box path
      this.ctx.save();
      this.ctx.fillStyle = txtObj.bgFillColor;
      this.ctx.strokeStyle = txtObj.bgFillColor;
      this.ctx.lineWidth = 0.10*fntSz;  // expand by 5% (10% width gives 5% outside outline)
      this.ctx.beginPath();
      txtObj.drawCmds.forEach(function(dCmd){
        savThis.ctx[cvsCmds[dCmd.type]].apply(savThis.ctx, dCmd.values); // add the path segment
      });
      this.ctx.fill();
      this.ctx.stroke();  // stroke the outline
      this.ctx.restore();
    }
    // now draw the text
    this.ctx.font = fntWt+" "+fntSz+"px "+fntFm;
    this.ctx.fillStyle = txtObj.fillCol || this.paintCol;
    this.ctx.fillText(txtObj.txtStr, txtObj.imgLorgX, txtObj.imgLorgY); // imgLorgX,Y are in pixels for text
    if (txtObj.border)
    {
      this.dropShadow(); // clear dropShadow, dont apply to the border (it will be on top of fill)
      // support for zoom and pan changing lineWidth
      if (txtObj.lineWidthWC)
      {
        this.ctx.lineWidth = txtObj.lineWidthWC*this.xscl;
      }
      else
      {
        this.ctx.lineWidth = txtObj.lineWidth || this.penWid;
      }
      // if properties are undefined use Cango default
      this.ctx.strokeStyle = txtObj.strokeCol || this.penCol;
      this.ctx.lineCap = txtObj.lineCap || this.lineCap;
      this.ctx.strokeText(txtObj.txtStr, txtObj.imgLorgX, txtObj.imgLorgY);
    }
    // undo the transforms
    this.ctx.restore();
    if (txtObj.dragNdrop !== null)
    {
      // update dragNdrop layer to match this canavs
      currLr = getLayer(this);
      if (currLr !== txtObj.dragNdrop.layer)
      {
        if (txtObj.dragNdrop.layer)  // if not the first time rendered
        {
          // remove the object reference from the old layer
          aidx = txtObj.dragNdrop.layer.dragObjects.indexOf(this);
          if (aidx !== -1)
          {
            txtObj.dragNdrop.layer.dragObjects.splice(aidx, 1);
          }
        }
      }
      txtObj.dragNdrop.cgo = this;
      txtObj.dragNdrop.layer = currLr;
      // now push it into Cango.dragObjects array, its checked by canvas mousedown event handler
      if (!txtObj.dragNdrop.layer.dragObjects.includes(txtObj))
      {
        txtObj.dragNdrop.layer.dragObjects.push(txtObj);
      }
    }
  };

  Cango.prototype.drawPath = function(pathDef, options)
  {
    var opts = options || {},
        x = opts.x || 0,
        y = opts.y || 0,
        scl = opts.scl || 1,
        degs = opts.degs || 0,
        pathObj = new Path(pathDef, options);

    if (degs)
    {
      pathObj.transform.rotate(degs);
    }
    if (scl !== 1)
    {
      pathObj.transform.scale(scl);
    }
    if (x || y)
    {
      pathObj.transform.translate(x, y);
    }
    this.render(pathObj);
  };

  Cango.prototype.drawShape = function(pathDef, options)
  {
    // outline the same as fill color
    var opts = options || {},
        x = opts.x || 0,
        y = opts.y || 0,
        scl = opts.scl || 1,
        degs = opts.degs || 0,
        pathObj = new Shape(pathDef, options);

    if (degs)
    {
      pathObj.transform.rotate(degs);
    }
    if (scl !== 1)
    {
      pathObj.transform.scale(scl);
    }
    if (x || y)
    {
      pathObj.transform.translate(x, y);
    }
    this.render(pathObj);
  };

  Cango.prototype.drawText = function(str, options)
  {
    var opts = options || {},
        x = opts.x || 0,
        y = opts.y || 0,
        scl = opts.scl || 1,
        degs = opts.degs || 0,
        txtObj = new Text(str, options);

    if (degs)
    {
      txtObj.transform.rotate(degs);
    }
    if (scl !== 1)
    {
      txtObj.transform.scale(scl);
    }
    if (x || y)
    {
      txtObj.transform.translate(x, y);
    }
    this.render(txtObj);
  };

  Cango.prototype.drawImg = function(imgRef, options)  // just load img then call render
  {
    var opts = options || {},
        x = opts.x || 0,
        y = opts.y || 0,
        scl = opts.scl || 1,
        degs = opts.degs || 0,
        imgObj = new Img(imgRef, options);

    if (degs)
    {
      imgObj.transform.rotate(degs);
    }
    if (scl !== 1)
    {
      imgObj.transform.scale(scl);
    }
    if (x || y)
    {
      imgObj.transform.translate(x, y);
    }
    this.render(imgObj);
  };

  Cango.prototype.createLayer = function()
  {
    var ovlHTML, newCvs,
        w = this.rawWidth,
        h = this.rawHeight,
        unique, ovlId,
        nLyrs = this.bkgCanvas.layers.length,  // bkg is layer 0 so at least 1
        newL,
        topCvs;

    // do not create layers on overlays - only an background canvases
    if (this.cId.indexOf("_ovl_") !== -1)
    {
      // this is an overlay canvas - can't have overlays itself
      console.log("canvas layers can't create layers");
      return "";
    }

    unique = this.getUnique();
    ovlId = this.cId+"_ovl_"+unique;
    ovlHTML = "<canvas id='"+ovlId+"' style='position:absolute' width='"+w+"' height='"+h+"'></canvas>";
    topCvs = this.bkgCanvas.layers[nLyrs-1].cElem;  // eqv to this.cnvs.layers since only bkgCanavs can get here
    topCvs.insertAdjacentHTML('afterend', ovlHTML);
    newCvs = document.getElementById(ovlId);
    newCvs.style.backgroundColor = "transparent";
    newCvs.style.left = (this.bkgCanvas.offsetLeft+this.bkgCanvas.clientLeft)+'px';
    newCvs.style.top = (this.bkgCanvas.offsetTop+this.bkgCanvas.clientTop)+'px';
    // make it the same size as the background canvas
    newCvs.style.width = this.bkgCanvas.offsetWidth+'px';
    newCvs.style.height = this.bkgCanvas.offsetHeight+'px';
//    newCvs.style.pointerEvents = 'none';    // allow mouse events to pass down to bkgCanvas
    newL = new Layer(ovlId, newCvs);
    // save the ID in an array to facilitate removal
    this.bkgCanvas.layers.push(newL);

    return ovlId;    // return the new canvas id for call to new Cango(id)
  };

  Cango.prototype.deleteLayer = function(ovlyId)
  {
    var ovlNode, i;

    for (i=1; i<this.bkgCanvas.layers.length; i++)
    {
      if (this.bkgCanvas.layers[i].id === ovlyId)
      {
        ovlNode = this.bkgCanvas.layers[i].cElem;
        if (ovlNode)
        {
          // in case the CangoHTMLtext extension is used
          if (ovlNode.alphaOvl && ovlNode.alphaOvl.parentNode)
          {
            ovlNode.alphaOvl.parentNode.removeChild(ovlNode.alphaOvl);
          }
          ovlNode.parentNode.removeChild(ovlNode);
        }
        // now delete layers array element
        this.bkgCanvas.layers.splice(i,1);       // delete the id
      }
    }
  };

  Cango.prototype.deleteAllLayers = function()
  {
    var i, ovlNode;

    for (i = this.bkgCanvas.layers.length-1; i>0; i--)   // don't delete layers[0] its the bakg canavs
    {
      ovlNode = this.bkgCanvas.layers[i].cElem;
      if (ovlNode)
      {
        // in case the CangoHTMLtext extension is used
        if (ovlNode.alphaOvl && ovlNode.alphaOvl.parentNode)
        {
          ovlNode.alphaOvl.parentNode.removeChild(ovlNode.alphaOvl);
        }
        ovlNode.parentNode.removeChild(ovlNode);
      }
      // now delete layers array element
      this.bkgCanvas.layers.splice(i,1);
    }
  };

  // copy the basic graphics context values (for an overlay)
  Cango.prototype.dupCtx = function(src_graphCtx)
  {
    // copy all the graphics context parameters into the overlay ctx.
    this.yDown = src_graphCtx.yDown;      // set by setWorldCoordsRHC or setWorldCoordsSVG to signal coord system
    this.vpW = src_graphCtx.vpW;          // vp width in pixels
    this.vpH = src_graphCtx.vpH;          // vp height in pixels
    this.vpOrgX = src_graphCtx.vpOrgX;    // vp lower left from canvas left in pixels
    this.vpOrgY = src_graphCtx.vpOrgY;    // vp lower left from canvas top
    this.xscl = src_graphCtx.xscl;        // world x axis scale factor
    this.yscl = src_graphCtx.yscl;        // world y axis scale factor
    this.xoffset = src_graphCtx.xoffset;  // world x origin offset from viewport left in pixels
    this.yoffset = src_graphCtx.yoffset;  // world y origin offset from viewport bottom in pixels
    this.savWC = clone(src_graphCtx.savWC);
    this.penCol = src_graphCtx.penCol.slice(0);   // copy value not reference
    this.penWid = src_graphCtx.penWid;    // pixels
    this.lineCap = src_graphCtx.lineCap.slice(0);
    this.paintCol = src_graphCtx.paintCol.slice(0);
    this.fontSize = src_graphCtx.fontSize;
    this.fontWeight = src_graphCtx.fontWeight;
    this.fontFamily = src_graphCtx.fontFamily.slice(0);
  };

  /*----------------------------------------------------------
   * 'initZoomPan' creates a Cango context on the overlay
   * canvas whose ID is passed as 'zpControlId'.
   * All the Cango context that is to be zoomed or panned
   * is passed in 'gc'. 'gc' may be an array of Cango contexts
   * if more than one canvas layer needs zooming.
   * The user defined function 'redraw' will be called to
   * redraw all the Cobjs on all the canvases in the new
   * zoomed or panned size or position.
   *---------------------------------------------------------*/
  initZoomPan = function(zpControlsId, gc, redraw)
  {
    var arw = ['m',-7,-2,'l',7,5,7,-5],
        crs = ['m',-6,-6,'l',12,12,'m',0,-12,'l',-12,12],
        pls = ['m',-7,0,'l',14,0,'m',-7,-7,'l',0,14],
        mns = ['m',-7,0,'l',14,0],
        zin, zout, rst, up, dn, lft, rgt,
        zpGC, gAry;

    function zoom(z)
    {
      function zm(g)
      {
        var org = g.toPixelCoords(0, 0),
            cx = g.rawWidth/2 - org.x,
            cy = g.rawHeight/2 - org.y;

        g.xoffset += cx - cx/z;
        g.yoffset += cy - cy/z;
        g.xscl /= z;
        g.yscl /= z;
      }

      gAry.forEach(zm);
      redraw();
    }

    function pan(sx, sy)
    {
      function pn(g)
      {
        g.xoffset -= sx;
        g.yoffset -= sy;
      }

      gAry.forEach(pn);
      redraw();
    }

    function resetZoomPan()
    {
      function rstzp(g)
      {
        g.xscl = g.savWC.xscl;
        g.yscl = g.savWC.yscl;
        g.xoffset = g.savWC.xoffset;
        g.yoffset = g.savWC.yoffset;
      }

      gAry.forEach(rstzp);
      redraw();
    }

    zpGC = new Cango(zpControlsId);
    // Zoom controls
    zpGC.clearCanvas();
    zpGC.setWorldCoordsRHC(-zpGC.rawWidth+44,-zpGC.rawHeight+44);

    // make a shaded rectangle for the controls
    zpGC.drawShape(shapeDefs.rectangle(114, 80), {x:-17, y:0, fillColor: "rgba(0, 50, 0, 0.12)"});

    rst = new Shape(shapeDefs.rectangle(20, 20, 2), {fillColor:"rgba(0,0,0,0.2)"});
    rst.enableDrag(null, null, resetZoomPan);
    zpGC.render(rst);

    rgt = new Shape(shapeDefs.rectangle(20, 20, 2), {fillColor:"rgba(0,0,0,0.2)"});
    // must always enable DnD before rendering !
    rgt.enableDrag(null, null, function(){pan(50, 0);});
    rgt.translate(22, 0);
    zpGC.render(rgt);

    up = new Shape(shapeDefs.rectangle(20, 20, 2), {fillColor:"rgba(0,0,0,0.2)"});
    up.enableDrag(null, null, function(){pan(0, -50);});
    up.translate(0, 22);
    zpGC.render(up);

    lft = new Shape(shapeDefs.rectangle(20, 20, 2), {fillColor:"rgba(0,0,0,0.2)"});
    lft.enableDrag(null, null, function(){pan(-50, 0);});
    lft.translate(-22, 0);
    zpGC.render(lft);

    dn = new Shape(shapeDefs.rectangle(20, 20, 2), {fillColor:"rgba(0,0,0,0.2)"});
    dn.enableDrag(null, null, function(){pan(0, 50);});
    dn.translate(0, -22);
    zpGC.render(dn);

    zin = new Shape(shapeDefs.rectangle(20, 20, 2), {fillColor:"rgba(0,0,0,0.2)"});
    zin.enableDrag(null, null, function(){zoom(1/1.2);});
    zin.translate(-56, 11);
    zpGC.render(zin);

    zout = new Shape(shapeDefs.rectangle(20, 20, 2), {fillColor:"rgba(0,0,0,0.2)"});
    zout.enableDrag(null, null, function(){zoom(1.2);});
    zout.translate(-56, -11);
    zpGC.render(zout);

    arw = ['m',-7,-2,'l',7,5,7,-5];
    zpGC.drawPath(arw, {x:0, y:22, strokeColor:"white", lineWidth:2});
    zpGC.drawPath(arw, {x:22, y:0, strokeColor:"white", lineWidth:2, degs:-90});
    zpGC.drawPath(arw, {x:-22, y:0, strokeColor:"white", lineWidth:2, degs:90});
    zpGC.drawPath(arw, {x:0, y:-22, strokeColor:"white", lineWidth:2, degs:180});
    zpGC.drawPath(pls, {x:-56, y:11, strokeColor:"white", lineWidth:2});
    zpGC.drawPath(mns, {x:-56, y:-11, strokeColor:"white", lineWidth:2});
    zpGC.drawPath(crs, {strokeColor:"white", lineWidth:2});

    if (Array.isArray(gc))
    {
      gAry = gc;
    }
    else
    {
      gAry = [gc];
    }
  };

  return Cango;
}());
