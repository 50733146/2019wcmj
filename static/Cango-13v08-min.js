var Cango,Path,Shape,Img,Text,ClipMask,Group,LinearGradient,RadialGradient,Tweener,initZoomPan,shapeDefs
!function(){"use strict"
function t(t,e,s){return t.attachEvent?t.attachEvent("on"+e,s):t.addEventListener(e,s)}function e(t){var s,i
if(void 0!==t){if(null===t)return null
s=Array.isArray(t)?[]:{}
for(i in t)t[i]&&"object"==typeof t[i]?s[i]=e(t[i]):s[i]=t[i]
return s}}function s(){this.p2dWC=null,this.p2dPX=null}function i(t,e,s){var i,r,a=this
this.cgo=null,this.layer=null,this.target=null,this.grabCallback=t||null,this.dragCallback=e||null,this.dropCallback=s||null,this.grabCsrPos={x:0,y:0},this.dwgOrg={x:0,y:0},this.grabOfs={x:0,y:0},this.grab=function(t){var e,s=t||window.event
return i=this.cgo.bkgCanvas.layers.length,r=this.cgo.bkgCanvas.layers[i-1].cElem,r.onmouseup=function(t){a.drop(t)},r.onmouseout=function(t){a.drop(t)},e=this.cgo.getCursorPosWC(s),this.grabCsrPos.x=e.x,this.grabCsrPos.y=e.y,this.dwgOrg.x=this.target.dwgOrg.x,this.dwgOrg.y=this.target.dwgOrg.y,this.target.parent?this.grabOfs={x:e.x-this.dwgOrg.x+this.target.parent.dwgOrg.x,y:e.y-this.dwgOrg.y+this.target.parent.dwgOrg.y}:this.grabOfs={x:e.x-this.dwgOrg.x,y:e.y-this.dwgOrg.y},this.grabCallback&&this.grabCallback(e),r.onmousemove=function(t){a.drag(t)},s.preventDefault?s.preventDefault():window.event.returnValue=!1,!1},this.drag=function(t){var e
this.dragCallback&&(e=this.cgo.getCursorPosWC(t),window.requestAnimationFrame(function(){a.dragCallback(e)}))},this.drop=function(t){var e=this.cgo.getCursorPosWC(t)
r.onmouseup=null,r.onmouseout=null,r.onmousemove=null,this.dropCallback&&this.dropCallback(e)},this.cancelDrag=function(t){r.onmouseup=null,r.onmouseout=null,r.onmousemove=null,this.dropCallback&&this.dropCallback(t)}}function r(t,e,s){return{x:t*s.a+e*s.c+s.e,y:t*s.b+e*s.d+s.f}}function a(t){t.a=1,t.b=0,t.c=0,t.d=1,t.e=0,t.f=0}function n(t){var e=t[0]||0,s=t[1]||0
return this.hasOwnProperty("type")?void(this.ofsTfm=this.ofsTfm.translate(e,s)):{x:this.x+e,y:this.y+s}}function o(t){var e=t[0]||0,s=t[1]||0,i=Math.PI/180,r=Math.tan(-e*i),a=Math.tan(s*i)
return this.hasOwnProperty("type")?(this.ofsTfm=this.ofsTfm.skewX(e*i),void(this.ofsTfm=this.ofsTfm.skewY(s*i))):{x:this.x+this.y*r,y:this.x*a+this.y}}function h(t){var e=t[0]||1,s=t[1]||e
return this.hasOwnProperty("type")?void(this.ofsTfm=this.ofsTfm.scaleNonUniform(e,s)):{x:this.x*e,y:this.y*s}}function l(t){var e=t[0]||0,s=Math.PI/180,i=Math.sin(-e*s),r=Math.cos(-e*s)
return this.hasOwnProperty("type")?void(this.ofsTfm=this.ofsTfm.rotate(e)):{x:this.x*r+this.y*i,y:-this.x*i+this.y*r}}function c(t){var e=t[0]||0,s=Math.PI/180,i=Math.sin(-e*s),r=Math.cos(-e*s)
return this.hasOwnProperty("type")?void(this.ofsTfm=this.ofsTfm.rotate(e*s)):{x:this.x*r+this.y*i,y:-this.x*i+this.y*r}}function d(t,e){var s=Array.prototype.slice.call(arguments).slice(2)
this.type=t,this.distortFn=e,this.args=s}function u(t){var e=this
this.parent=t,this.translate=function(t,s){var i=new d("TRN",n,t,s)
e.parent.ofsTfmAry.unshift(i)},this.scale=function(t,s){var i=new d("SCL",h,t,s)
e.parent.ofsTfmAry.push(i)},this.rotate=function(t){var s=new d("ROT",l,t)
e.parent.ofsTfmAry.push(s)},this.skew=function(t,s){var i=new d("SKW",o,t,s)
e.parent.ofsTfmAry.push(i)},this.revolve=function(t){var s=new d("REV",c,t)
e.parent.ofsTfmAry.unshift(s)},this.reset=function(){e.parent.ofsTfmAry=[],a(e.parent.ofsTfm)}}function p(t){var e=this
this.parent=t,this.translate=function(t,s){var i=new d("TRN",n,t,s)
e.parent.hardTfmAry.unshift(i)},this.scale=function(t,s){var i=new d("SCL",h,t,s)
e.parent.hardTfmAry.unshift(i)},this.rotate=function(t){var s=new d("ROT",l,t)
e.parent.hardTfmAry.unshift(s)},this.skew=function(t,s){var i=new d("SKW",o,t,s)
e.parent.hardTfmAry.unshift(i)},this.reset=function(){e.parent.hardTfmAry=[]}}function f(t,e){var s=[1,2,3,4,5,6,7,8,9]
if("string"==typeof t&&void 0!==e)switch(t.toLowerCase()){case"fillrule":if("string"!=typeof e)return;("evenodd"===e||"nonzero"===e)&&(this.fillRule=e)
break
case"fillcolor":this.fillCol=e
break
case"strokecolor":this.strokeCol=e
break
case"linewidth":case"strokewidth":"number"==typeof e&&e>0&&(this.lineWidth=e)
break
case"linewidthwc":"number"==typeof e&&e>0&&(this.lineWidthWC=e)
break
case"linecap":if("string"!=typeof e)return;("butt"===e||"round"===e||"square"===e)&&(this.lineCap=e)
break
case"iso":case"isotropic":1==e||"iso"===e||"isotropic"===e?this.iso=!0:this.iso=!1
break
case"dashed":Array.isArray(e)&&e[0]?this.dashed=e:this.dashed=[]
break
case"dashoffset":this.dashOffset=e||0
break
case"border":e===!0&&(this.border=!0),e===!1&&(this.border=!1)
break
case"fontsize":"number"==typeof e&&e>0&&(this.fontSize=e)
break
case"fontweight":("string"==typeof e||"number"==typeof e&&e>=100&&900>=e)&&(this.fontWeight=e)
break
case"fontfamily":"string"==typeof e&&(this.fontFamily=e)
break
case"bgfillcolor":this.bgFillColor=e
break
case"imgwidth":this.width=Math.abs(e)
break
case"imgheight":this.height=Math.abs(e)
break
case"lorg":-1!==s.indexOf(e)&&(this.lorg=e)
break
case"shadowoffsetx":this.shadowOffsetX=e||0
break
case"shadowoffsety":this.shadowOffsetY=e||0
break
case"shadowblur":this.shadowBlur=e||0
break
case"shadowcolor":this.shadowColor=e
break
default:return}}function g(){this.type="OBJ2D",this.drawCmds=[],this.pthCmds=new s,this.lineWidthWC=null,this.lineWidth=null,this.savScale=1,this.iso=!0,this.parent=null,this.dwgOrg={x:0,y:0},this.hardTfmAry=[],this.ofsTfmAry=[],this.netTfmAry=[],this.ofsTfm=document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGMatrix(),this.netTfm=document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGMatrix(),this.hardTransform=new p(this),this.transform=new u(this),this.dragNdrop=null}function v(t,e){void 0===e?t.setTransform(1,0,0,0,1,0):t.setTransform(e.matrix[0][0],e.matrix[0][1],e.matrix[1][0],e.matrix[1][1],e.matrix[2][0],e.matrix[2][1])}function y(t,e,s,i,r,a){var n
this.id=t,this.gc=e,this.drawFn=i,this.pathFn=r,this.options=a,this.currState={time:0},this.nextState={time:0},this.gc.ctx.save(),"function"==typeof s&&s.call(this,this.options),"function"==typeof this.drawFn?this.drawFn.call(this,this.options):console.log("invalid animation draw function"),this.gc.ctx.restore()
for(n in this.nextState)this.nextState.hasOwnProperty(n)&&(this.currState[n]=this.nextState[n])}function m(t){var e,s,i=null,r=!1,a=Date.now()
t.prevAnimMode===t.modes.STOPPED&&(t.startTime=a-t.startOfs),e=a-t.startTime,t.animTasks.forEach(function(a){a.gc.cId!==i&&(r=!0,i=a.gc.cId),a.gc.ctx.save(),t.prevAnimMode===t.modes.STOPPED&&(a.currState.time=0),r&&a.gc.clearCanvas(),"function"==typeof a.pathFn&&a.pathFn.call(a,e,a.options),"function"==typeof a.drawFn&&a.drawFn.call(a,a.options),r=!1,a.gc.ctx.restore(),s=a.currState,a.currState=a.nextState,a.nextState=s,a.currState.time=e}),t.currTime=e}function x(){this.animTasks=[],this.timer=null,this.modes={PAUSED:1,STOPPED:2,PLAYING:3,STEPPING:4},this.animMode=this.modes.STOPPED,this.prevAnimMode=this.modes.STOPPED,this.startTime=0,this.startOfs=0,this.currTime=0,this.stepTime=50}function C(t,e){this.id=t,this.cElem=e,this.dragObjects=[]}function w(t){var e,s=t.bkgCanvas.layers[0]
for(e=1;e<t.bkgCanvas.layers.length;e++)if(t.bkgCanvas.layers[e].id===t.cId){s=t.bkgCanvas.layers[e]
break}return s}function b(t){function e(e){function s(e){var s=t.cnvs.getBoundingClientRect()
return{x:e.clientX-s.left,y:e.clientY-s.top}}function i(t,e,s){var i,r=t.dragNdrop.cgo,a=r.yDown?r.xscl:-r.xscl,n=T.translate(r.vpOrgX+r.xoffset,r.vpOrgY+r.yoffset).scaleNonUniform(r.xscl,a).multiply(t.netTfm)
return"IMG"!==t.type||r.yDown?"TEXT"===t.type&&(n=n.scaleNonUniform(1/r.xscl,1/a)):n=n.flipY(),r.ctx.save(),r.ctx.setTransform(n.a,n.b,n.c,n.d,n.e,n.f),r.ctx.beginPath(),t.drawCmds.forEach(function(t){r.ctx[S[t.type]].apply(r.ctx,t.values)}),i=r.ctx.isPointInPath(e,s),r.ctx.restore(),i}var r,a,n,o,h,l,c=e||window.event
r=s(c),n=t.bkgCanvas.layers.length
t:for(h=n-1;h>=0;h--)for(o=t.bkgCanvas.layers[h],l=o.dragObjects.length-1;l>=0;l--)if(a=o.dragObjects[l],i(a,r.x,r.y)&&a.dragNdrop){a.dragNdrop.grab(c)
break t}}t.cnvs.onmousedown=e}var O=0,T=document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGMatrix()
const S={M:"moveTo",L:"lineTo",C:"bezierCurveTo",Z:"closePath"}
return SVGPathElement.prototype.getPathData&&SVGPathElement.prototype.setPathData||!function(){var t={Z:"Z",M:"M",L:"L",C:"C",Q:"Q",A:"A",H:"H",V:"V",S:"S",T:"T",z:"Z",m:"m",l:"l",c:"c",q:"q",a:"a",h:"h",v:"v",s:"s",t:"t"},e=function(t){this._string=t,this._currentIndex=0,this._endIndex=this._string.length,this._prevCommand=null,this._skipOptionalSpaces()},s=-1!==window.navigator.userAgent.indexOf("MSIE ")
e.prototype={parseSegment:function(){var e=this._string[this._currentIndex],s=t[e]?t[e]:null
if(null===s){if(null===this._prevCommand)return null
if(s=("+"===e||"-"===e||"."===e||e>="0"&&"9">=e)&&"Z"!==this._prevCommand?"M"===this._prevCommand?"L":"m"===this._prevCommand?"l":this._prevCommand:null,null===s)return null}else this._currentIndex+=1
this._prevCommand=s
var i=null,r=s.toUpperCase()
return"H"===r||"V"===r?i=[this._parseNumber()]:"M"===r||"L"===r||"T"===r?i=[this._parseNumber(),this._parseNumber()]:"S"===r||"Q"===r?i=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber()]:"C"===r?i=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseNumber()]:"A"===r?i=[this._parseNumber(),this._parseNumber(),this._parseNumber(),this._parseArcFlag(),this._parseArcFlag(),this._parseNumber(),this._parseNumber()]:"Z"===r&&(this._skipOptionalSpaces(),i=[]),null===i||i.indexOf(null)>=0?null:{type:s,values:i}},hasMoreData:function(){return this._currentIndex<this._endIndex},peekSegmentType:function(){var e=this._string[this._currentIndex]
return t[e]?t[e]:null},initialCommandIsMoveTo:function(){if(!this.hasMoreData())return!0
var t=this.peekSegmentType()
return"M"===t||"m"===t},_isCurrentSpace:function(){var t=this._string[this._currentIndex]
return" ">=t&&(" "===t||"\n"===t||"	"===t||"\r"===t||"\f"===t)},_skipOptionalSpaces:function(){for(;this._currentIndex<this._endIndex&&this._isCurrentSpace();)this._currentIndex+=1
return this._currentIndex<this._endIndex},_skipOptionalSpacesOrDelimiter:function(){return this._currentIndex<this._endIndex&&!this._isCurrentSpace()&&","!==this._string[this._currentIndex]?!1:(this._skipOptionalSpaces()&&this._currentIndex<this._endIndex&&","===this._string[this._currentIndex]&&(this._currentIndex+=1,this._skipOptionalSpaces()),this._currentIndex<this._endIndex)},_parseNumber:function(){var t=0,e=0,s=1,i=0,r=1,a=1,n=this._currentIndex
if(this._skipOptionalSpaces(),this._currentIndex<this._endIndex&&"+"===this._string[this._currentIndex]?this._currentIndex+=1:this._currentIndex<this._endIndex&&"-"===this._string[this._currentIndex]&&(this._currentIndex+=1,r=-1),this._currentIndex===this._endIndex||(this._string[this._currentIndex]<"0"||this._string[this._currentIndex]>"9")&&"."!==this._string[this._currentIndex])return null
for(var o=this._currentIndex;this._currentIndex<this._endIndex&&this._string[this._currentIndex]>="0"&&this._string[this._currentIndex]<="9";)this._currentIndex+=1
if(this._currentIndex!==o)for(var h=this._currentIndex-1,l=1;h>=o;)e+=l*(this._string[h]-"0"),h-=1,l*=10
if(this._currentIndex<this._endIndex&&"."===this._string[this._currentIndex]){if(this._currentIndex+=1,this._currentIndex>=this._endIndex||this._string[this._currentIndex]<"0"||this._string[this._currentIndex]>"9")return null
for(;this._currentIndex<this._endIndex&&this._string[this._currentIndex]>="0"&&this._string[this._currentIndex]<="9";)s*=10,i+=(this._string.charAt(this._currentIndex)-"0")/s,this._currentIndex+=1}if(this._currentIndex!==n&&this._currentIndex+1<this._endIndex&&("e"===this._string[this._currentIndex]||"E"===this._string[this._currentIndex])&&"x"!==this._string[this._currentIndex+1]&&"m"!==this._string[this._currentIndex+1]){if(this._currentIndex+=1,"+"===this._string[this._currentIndex]?this._currentIndex+=1:"-"===this._string[this._currentIndex]&&(this._currentIndex+=1,a=-1),this._currentIndex>=this._endIndex||this._string[this._currentIndex]<"0"||this._string[this._currentIndex]>"9")return null
for(;this._currentIndex<this._endIndex&&this._string[this._currentIndex]>="0"&&this._string[this._currentIndex]<="9";)t*=10,t+=this._string[this._currentIndex]-"0",this._currentIndex+=1}var c=e+i
return c*=r,t&&(c*=Math.pow(10,a*t)),n===this._currentIndex?null:(this._skipOptionalSpacesOrDelimiter(),c)},_parseArcFlag:function(){if(this._currentIndex>=this._endIndex)return null
var t=null,e=this._string[this._currentIndex]
if(this._currentIndex+=1,"0"===e)t=0
else{if("1"!==e)return null
t=1}return this._skipOptionalSpacesOrDelimiter(),t}}
var i=function(t){if(!t||0===t.length)return[]
var s=new e(t),i=[]
if(s.initialCommandIsMoveTo())for(;s.hasMoreData();){var r=s.parseSegment()
if(null===r)break
i.push(r)}return i},r=SVGPathElement.prototype.setAttribute,a=SVGPathElement.prototype.removeAttribute,n=window.Symbol?Symbol():"__cachedPathData",o=window.Symbol?Symbol():"__cachedNormalizedPathData",h=function(t,e,s,i,r,a,n,o,l,c){var d,u,p,f,g=function(t){return Math.PI*t/180},v=function(t,e,s){var i=t*Math.cos(s)-e*Math.sin(s),r=t*Math.sin(s)+e*Math.cos(s)
return{x:i,y:r}},y=g(n),m=[]
if(c)d=c[0],u=c[1],p=c[2],f=c[3]
else{var x=v(t,e,-y)
t=x.x,e=x.y
var C=v(s,i,-y)
s=C.x,i=C.y
var w=(t-s)/2,b=(e-i)/2,O=w*w/(r*r)+b*b/(a*a)
O>1&&(O=Math.sqrt(O),r=O*r,a=O*a)
var T
T=o===l?-1:1
var S=r*r,k=a*a,_=S*k-S*b*b-k*w*w,A=S*b*b+k*w*w,P=T*Math.sqrt(Math.abs(_/A))
p=P*r*b/a+(t+s)/2,f=P*-a*w/r+(e+i)/2,d=Math.asin(parseFloat(((e-f)/a).toFixed(9))),u=Math.asin(parseFloat(((i-f)/a).toFixed(9))),p>t&&(d=Math.PI-d),p>s&&(u=Math.PI-u),0>d&&(d=2*Math.PI+d),0>u&&(u=2*Math.PI+u),l&&d>u&&(d-=2*Math.PI),!l&&u>d&&(u-=2*Math.PI)}var I=u-d
if(Math.abs(I)>120*Math.PI/180){var W=u,M=s,N=i
u=l&&u>d?d+120*Math.PI/180*1:d+120*Math.PI/180*-1,s=p+r*Math.cos(u),i=f+a*Math.sin(u),m=h(s,i,M,N,r,a,n,0,l,[u,W,p,f])}I=u-d
var E=Math.cos(d),D=Math.sin(d),L=Math.cos(u),G=Math.sin(u),R=Math.tan(I/4),V=4/3*r*R,Y=4/3*a*R,H=[t,e],F=[t+V*D,e-Y*E],X=[s+V*G,i-Y*L],j=[s,i]
if(F[0]=2*H[0]-F[0],F[1]=2*H[1]-F[1],c)return[F,X,j].concat(m)
m=[F,X,j].concat(m)
for(var z=[],B=0;B<m.length;B+=3){var r=v(m[B][0],m[B][1],y),a=v(m[B+1][0],m[B+1][1],y),Z=v(m[B+2][0],m[B+2][1],y)
z.push([r.x,r.y,a.x,a.y,Z.x,Z.y])}return z},l=function(t){return t.map(function(t){return{type:t.type,values:Array.prototype.slice.call(t.values)}})},c=function(t){var e=[],s=null,i=null,r=null,a=null
return t.forEach(function(t){var n=t.type
if("M"===n){var o=t.values[0],h=t.values[1]
e.push({type:"M",values:[o,h]}),r=o,a=h,s=o,i=h}else if("m"===n){var o=s+t.values[0],h=i+t.values[1]
e.push({type:"M",values:[o,h]}),r=o,a=h,s=o,i=h}else if("L"===n){var o=t.values[0],h=t.values[1]
e.push({type:"L",values:[o,h]}),s=o,i=h}else if("l"===n){var o=s+t.values[0],h=i+t.values[1]
e.push({type:"L",values:[o,h]}),s=o,i=h}else if("C"===n){var l=t.values[0],c=t.values[1],d=t.values[2],u=t.values[3],o=t.values[4],h=t.values[5]
e.push({type:"C",values:[l,c,d,u,o,h]}),s=o,i=h}else if("c"===n){var l=s+t.values[0],c=i+t.values[1],d=s+t.values[2],u=i+t.values[3],o=s+t.values[4],h=i+t.values[5]
e.push({type:"C",values:[l,c,d,u,o,h]}),s=o,i=h}else if("Q"===n){var l=t.values[0],c=t.values[1],o=t.values[2],h=t.values[3]
e.push({type:"Q",values:[l,c,o,h]}),s=o,i=h}else if("q"===n){var l=s+t.values[0],c=i+t.values[1],o=s+t.values[2],h=i+t.values[3]
e.push({type:"Q",values:[l,c,o,h]}),s=o,i=h}else if("A"===n){var o=t.values[5],h=t.values[6]
e.push({type:"A",values:[t.values[0],t.values[1],t.values[2],t.values[3],t.values[4],o,h]}),s=o,i=h}else if("a"===n){var o=s+t.values[5],h=i+t.values[6]
e.push({type:"A",values:[t.values[0],t.values[1],t.values[2],t.values[3],t.values[4],o,h]}),s=o,i=h}else if("H"===n){var o=t.values[0]
e.push({type:"H",values:[o]}),s=o}else if("h"===n){var o=s+t.values[0]
e.push({type:"H",values:[o]}),s=o}else if("V"===n){var h=t.values[0]
e.push({type:"V",values:[h]}),i=h}else if("v"===n){var h=i+t.values[0]
e.push({type:"V",values:[h]}),i=h}else if("S"===n){var d=t.values[0],u=t.values[1],o=t.values[2],h=t.values[3]
e.push({type:"S",values:[d,u,o,h]}),s=o,i=h}else if("s"===n){var d=s+t.values[0],u=i+t.values[1],o=s+t.values[2],h=i+t.values[3]
e.push({type:"S",values:[d,u,o,h]}),s=o,i=h}else if("T"===n){var o=t.values[0],h=t.values[1]
e.push({type:"T",values:[o,h]}),s=o,i=h}else if("t"===n){var o=s+t.values[0],h=i+t.values[1]
e.push({type:"T",values:[o,h]}),s=o,i=h}else("Z"===n||"z"===n)&&(e.push({type:"Z",values:[]}),s=r,i=a)}),e},d=function(t){var e=[],s=null,i=null,r=null,a=null,n=null,o=null,l=null
return t.forEach(function(t){if("M"===t.type){var c=t.values[0],d=t.values[1]
e.push({type:"M",values:[c,d]}),o=c,l=d,a=c,n=d}else if("C"===t.type){var u=t.values[0],p=t.values[1],f=t.values[2],g=t.values[3],c=t.values[4],d=t.values[5]
e.push({type:"C",values:[u,p,f,g,c,d]}),i=f,r=g,a=c,n=d}else if("L"===t.type){var c=t.values[0],d=t.values[1]
e.push({type:"L",values:[c,d]}),a=c,n=d}else if("H"===t.type){var c=t.values[0]
e.push({type:"L",values:[c,n]}),a=c}else if("V"===t.type){var d=t.values[0]
e.push({type:"L",values:[a,d]}),n=d}else if("S"===t.type){var v,y,f=t.values[0],g=t.values[1],c=t.values[2],d=t.values[3]
"C"===s||"S"===s?(v=a+(a-i),y=n+(n-r)):(v=a,y=n),e.push({type:"C",values:[v,y,f,g,c,d]}),i=f,r=g,a=c,n=d}else if("T"===t.type){var u,p,c=t.values[0],d=t.values[1]
"Q"===s||"T"===s?(u=a+(a-i),p=n+(n-r)):(u=a,p=n)
var v=a+2*(u-a)/3,y=n+2*(p-n)/3,m=c+2*(u-c)/3,x=d+2*(p-d)/3
e.push({type:"C",values:[v,y,m,x,c,d]}),i=u,r=p,a=c,n=d}else if("Q"===t.type){var u=t.values[0],p=t.values[1],c=t.values[2],d=t.values[3],v=a+2*(u-a)/3,y=n+2*(p-n)/3,m=c+2*(u-c)/3,x=d+2*(p-d)/3
e.push({type:"C",values:[v,y,m,x,c,d]}),i=u,r=p,a=c,n=d}else if("A"===t.type){var C=Math.abs(t.values[0]),w=Math.abs(t.values[1]),b=t.values[2],O=t.values[3],T=t.values[4],c=t.values[5],d=t.values[6]
if(0===C||0===w)e.push({type:"C",values:[a,n,c,d,c,d]}),a=c,n=d
else if(a!==c||n!==d){var S=h(a,n,c,d,C,w,b,O,T)
S.forEach(function(t){e.push({type:"C",values:t})}),a=c,n=d}}else"Z"===t.type&&(e.push(t),a=o,n=l)
s=t.type}),e}
SVGPathElement.prototype.setAttribute=function(t,e){"d"===t&&(this[n]=null,this[o]=null),r.call(this,t,e)},SVGPathElement.prototype.removeAttribute=function(t,e){"d"===t&&(this[n]=null,this[o]=null),a.call(this,t)},SVGPathElement.prototype.getPathData=function(t){if(t&&t.normalize){if(this[o])return l(this[o])
var e
this[n]?e=l(this[n]):(e=i(this.getAttribute("d")||""),this[n]=l(e))
var s=d(c(e))
return this[o]=l(s),s}if(this[n])return l(this[n])
var e=i(this.getAttribute("d")||"")
return this[n]=l(e),e},SVGPathElement.prototype.setPathData=function(t){if(0===t.length)s?this.setAttribute("d",""):this.removeAttribute("d")
else{for(var e="",i=0,r=t.length;r>i;i+=1){var a=t[i]
i>0&&(e+=" "),e+=a.type,a.values&&a.values.length>0&&(e+=" "+a.values.join(" "))}this.setAttribute("d",e)}},SVGRectElement.prototype.getPathData=function(t){var e=this.x.baseVal.value,s=this.y.baseVal.value,i=this.width.baseVal.value,r=this.height.baseVal.value,a=this.hasAttribute("rx")?this.rx.baseVal.value:this.ry.baseVal.value,n=this.hasAttribute("ry")?this.ry.baseVal.value:this.rx.baseVal.value
a>i/2&&(a=i/2),n>r/2&&(n=r/2)
var o=[{type:"M",values:[e+a,s]},{type:"H",values:[e+i-a]},{type:"A",values:[a,n,0,0,1,e+i,s+n]},{type:"V",values:[s+r-n]},{type:"A",values:[a,n,0,0,1,e+i-a,s+r]},{type:"H",values:[e+a]},{type:"A",values:[a,n,0,0,1,e,s+r-n]},{type:"V",values:[s+n]},{type:"A",values:[a,n,0,0,1,e+a,s]},{type:"Z",values:[]}]
return o=o.filter(function(t){return"A"!==t.type||0!==t.values[0]&&0!==t.values[1]?!0:!1}),t&&t.normalize===!0&&(o=d(o)),o},SVGCircleElement.prototype.getPathData=function(t){var e=this.cx.baseVal.value,s=this.cy.baseVal.value,i=this.r.baseVal.value,r=[{type:"M",values:[e+i,s]},{type:"A",values:[i,i,0,0,1,e,s+i]},{type:"A",values:[i,i,0,0,1,e-i,s]},{type:"A",values:[i,i,0,0,1,e,s-i]},{type:"A",values:[i,i,0,0,1,e+i,s]},{type:"Z",values:[]}]
return t&&t.normalize===!0&&(r=d(r)),r},SVGEllipseElement.prototype.getPathData=function(t){var e=this.cx.baseVal.value,s=this.cy.baseVal.value,i=this.rx.baseVal.value,r=this.ry.baseVal.value,a=[{type:"M",values:[e+i,s]},{type:"A",values:[i,r,0,0,1,e,s+r]},{type:"A",values:[i,r,0,0,1,e-i,s]},{type:"A",values:[i,r,0,0,1,e,s-r]},{type:"A",values:[i,r,0,0,1,e+i,s]},{type:"Z",values:[]}]
return t&&t.normalize===!0&&(a=d(a)),a},SVGLineElement.prototype.getPathData=function(){return[{type:"M",values:[this.x1.baseVal.value,this.y1.baseVal.value]},{type:"L",values:[this.x2.baseVal.value,this.y2.baseVal.value]}]},SVGPolylineElement.prototype.getPathData=function(){for(var t=[],e=0;e<this.points.numberOfItems;e+=1){var s=this.points.getItem(e)
t.push({type:0===e?"M":"L",values:[s.x,s.y]})}return t},SVGPolygonElement.prototype.getPathData=function(){for(var t=[],e=0;e<this.points.numberOfItems;e+=1){var s=this.points.getItem(e)
t.push({type:0===e?"M":"L",values:[s.x,s.y]})}return t.push({type:"Z",values:[]}),t}}(),void 0===shapeDefs&&(shapeDefs={circle:function(t){var e=t||1
return["m",-.5*e,0,"c",0,-.27614*e,.22386*e,-.5*e,.5*e,-.5*e,"c",.27614*e,0,.5*e,.22386*e,.5*e,.5*e,"c",0,.27614*e,-.22386*e,.5*e,-.5*e,.5*e,"c",-.27614*e,0,-.5*e,-.22386*e,-.5*e,-.5*e,"z"]},ellipse:function(t,e){var s=t||1,i=s
return"number"==typeof e&&e>0&&(i=e),["m",-.5*s,0,"c",0,-.27614*i,.22386*s,-.5*i,.5*s,-.5*i,"c",.27614*s,0,.5*s,.22386*i,.5*s,.5*i,"c",0,.27614*i,-.22386*s,.5*i,-.5*s,.5*i,"c",-.27614*s,0,-.5*s,-.22386*i,-.5*s,-.5*i,"z"]},square:function(t){var e=t||1
return["m",.5*e,-.5*e,"l",0,e,-e,0,0,-e,"z"]},rectangle:function(t,e,s){var i,r=t||1,a=e||r
return void 0===s||0>=s?["m",-r/2,-a/2,"l",r,0,0,a,-r,0,"z"]:(i=Math.min(r/2,a/2,s),["m",-r/2+i,-a/2,"l",r-2*i,0,"a",i,i,0,0,1,i,i,"l",0,a-2*i,"a",i,i,0,0,1,-i,i,"l",-r+2*i,0,"a",i,i,0,0,1,-i,-i,"l",0,-a+2*i,"a",i,i,0,0,1,i,-i,"z"])},triangle:function(t){var e=t||1
return["m",.5*e,-.289*e,"l",-.5*e,.866*e,-.5*e,-.866*e,"z"]},cross:function(t){var e=t||1
return["m",-.5*e,0,"l",e,0,"m",-.5*e,-.5*e,"l",0,e]},ex:function(t){var e=t||1
return["m",-.3535*e,-.3535*e,"l",.707*e,.707*e,"m",-.707*e,0,"l",.707*e,-.707*e]}}),LinearGradient=function(t,e,s,i){this.grad=[t,e,s,i],this.colorStops=[],this.addColorStop=function(){this.colorStops.push(arguments)}},RadialGradient=function(t,e,s,i,r,a){this.grad=[t,e,s,i,r,a],this.colorStops=[],this.addColorStop=function(){this.colorStops.push(arguments)}},Tweener=function(t,e,s){this.delay=t||0,this.dur=e||5e3,this.reStartOfs=0,this.loop=!1,this.loopAll=!1
var i=this,r="noloop"
"string"==typeof s&&(r=s.toLowerCase()),"loop"===r?this.loop=!0:"loopall"===r&&(this.loopAll=!0),this.getVal=function(t,e,s){var r,a,n,o,h,l,c,d,u,p=0
if(0===t&&(i.reStartOfs=0),c=t-i.reStartOfs,c>i.dur+i.delay&&i.dur>0&&(i.loop||i.loopAll)&&(i.reStartOfs=i.loop?t-i.delay:t,c=0),p=0,c>i.delay&&(p=c-i.delay),!Array.isArray(e))return e
if(!e.length)return 0
if(1===e.length)return e[0]
if(0===p)return e[0]
if(p>=i.dur)return e[e.length-1]
if(r=e.length-1,!Array.isArray(s)||e.length!==s.length)return a=i.dur/r,n=Math.floor(p/a),o=(p-n*a)/a,e[n]+o*(e[n+1]-e[n])
for(d=[].concat(e),u=[].concat(s),0!==u[0]&&(d.unshift(d[0]),u.unshift(0)),100!==u[u.length-1]&&(d.push(d[d.length-1]),u.push(100)),h=0,l=p/i.dur;h<u.length-1&&u[h+1]/100<l;)h++
return a=(u[h+1]-u[h])/100,o=(l-u[h]/100)/a,d[h]+o*(d[h+1]-d[h])}},Group=function(){this.type="GRP",this.parent=null,this.children=[],this.ofsTfmAry=[],this.netTfmAry=[],this.ofsTfm=document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGMatrix(),this.netTfm=document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGMatrix(),this.transform=new u(this),this.dragNdropHandlers=null,this.addObj.apply(this,arguments)},Group.prototype.deleteObj=function(t){var e=this.children.indexOf(t)
e>=0&&(this.children.splice(e,1),t.parent=null)},Group.prototype.addObj=function(){function t(t){t.parent=s,s.children.push(t),!t.dragNdrop&&s.dragNdropHandlers&&(t.enableDrag.apply(t,s.dragNdropHandlers),t.dragNdrop.target=s)}function e(s){s.forEach(function(s){Array.isArray(s)?e(s):s&&s.type&&t(s)})}var s=this
e(Array.prototype.slice.call(arguments))},Group.prototype.translate=function(t,e){function s(i){i.children.forEach(function(i){"GRP"===i.type?s(i):i.translate(t,e)})}s(this)},Group.prototype.rotate=function(t){function e(s){s.children.forEach(function(s){"GRP"===s.type?e(s):s.rotate(t)})}e(this)},Group.prototype.skew=function(t,e){function s(i){i.children.forEach(function(i){"GRP"===i.type?s(i):i.skew(t,e)})}s(this)},Group.prototype.scale=function(t,e){function s(t){t.children.forEach(function(t){"GRP"===t.type?s(t):t.scale(i,r)})}var i=t,r=e||i
s(this)},Group.prototype.enableDrag=function(t,e,s){function i(a){a.children.forEach(function(a){"GRP"===a.type?i(a):null===a.dragNdrop&&(a.enableDrag(t,e,s),a.dragNdrop.target=r)})}var r=this
this.dragNdropHandlers=arguments,i(this)},Group.prototype.disableDrag=function(){function t(e){e.children.forEach(function(e){"GRP"===e.type?t(e):e.disableDrag()})}this.dragNdropHandlers=void 0,t(this)},g.prototype.enableDrag=function(t,e,s){this.dragNdrop=new i(t,e,s),this.dragNdrop.target=this},g.prototype.disableDrag=function(){var t
this.dragNdrop&&(t=this.dragNdrop.layer.dragObjects.indexOf(this),this.dragNdrop.layer.dragObjects.splice(t,1),this.dragNdrop=null)},ClipMask=function(t,e){var s,i=e||{}
g.call(this),this.type="CLIP",this.iso=!1,this.fillRule="nonzero",this.drawCmds=[],"string"==typeof t&&t.length?(s=document.createElementNS("http://www.w3.org/2000/svg","path"),s.setAttribute("d",t),this.drawCmds=s.getPathData({normalize:!0})):Array.isArray(t)&&t.length&&("number"==typeof t[0]&&t.splice(0,0,"M"),s=document.createElementNS("http://www.w3.org/2000/svg","path"),s.setAttribute("d",t.join(" ")),this.drawCmds=s.getPathData({normalize:!0})),i.hasOwnProperty("iso")?this.setProperty("iso",i.iso):i.hasOwnProperty("isotropic")?this.setProperty("iso",i.isotropic):this.iso=!1,i.hasOwnProperty("fillRule")&&(this.fillRule=i.fillRule)},ClipMask.prototype=Object.create(g.prototype),ClipMask.prototype.constructor=ClipMask,ClipMask.prototype.setProperty=f,ClipMask.prototype.appendPath=function(t){var s=this,i=e(this.drawCmds),n=e(t.drawCmds)
this.hardTfmAry.length&&(this.hardTfmAry.forEach(function(t){t.distortFn.call(s,t.args)}),i.forEach(function(t){var e,i,a
if(t.values.length){for(i=[],a=0;a<t.values.length;a+=2)e=r(t.values[a],t.values[a+1],s.ofsTfm),i.push(e.x,e.y)
t.values=i}}),a(this.ofsTfm),this.hardTfmAry.length=0),t.hardTfmAry.length&&(t.hardTfmAry.forEach(function(e){e.distortFn.call(t,e.args)}),n.forEach(function(e){var s,i,a
if(e.values.length){for(i=[],a=0;a<e.values.length;a+=2)s=r(e.values[a],e.values[a+1],t.ofsTfm),i.push(s.x,s.y)
e.values=i}}),a(t.ofsTfm)),this.drawCmds=i.concat(n)},ClipMask.prototype.translate=function(t,e){this.hardTransform.translate(t,e)},ClipMask.prototype.rotate=function(t){this.hardTransform.rotate(t)},ClipMask.prototype.skew=function(t,e){this.hardTransform.skew(t,e)},ClipMask.prototype.scale=function(t,e){this.hardTransform.scale(t,e)},ClipMask.prototype.dup=function(){var t=new ClipMask
return t.type=this.type,t.drawCmds=e(this.drawCmds),t.parent=null,t.dwgOrg=e(this.dwgOrg),t.hardTfmAry=e(this.hardTfmAry),t.ofsTfmAry=e(this.ofsTfmAry),t.fillRule=this.fillRule,t.border=this.border,t.strokeCol=this.strokeCol,t.lineWidth=this.lineWidth,t.lineWidthWC=this.lineWidthWC,t.lineCap=this.lineCap,t.iso=this.iso,t},Path=function(t,e){var s,i
ClipMask.call(this,t),this.type="PATH",this.border=!1,this.strokeCol=null,this.fillCol=null,this.lineCap=null,this.iso=!1,this.shadowOffsetX=0,this.shadowOffsetY=0,this.shadowBlur=0,this.shadowColor="#000000",this.dashed=[],this.dashOffset=0,s="object"==typeof e?e:{}
for(i in s)s.hasOwnProperty(i)&&this.setProperty(i,s[i])},Path.prototype=Object.create(ClipMask.prototype),Path.prototype.constructor=Path,Path.prototype.setProperty=f,Path.prototype.dup=function(){var t=new Path
return t.type=this.type,t.drawCmds=e(this.drawCmds),t.parent=null,t.dwgOrg=e(this.dwgOrg),t.hardTfmAry=e(this.hardTfmAry),t.ofsTfmAry=e(this.ofsTfmAry),t.border=this.border,t.strokeCol=this.strokeCol,t.fillCol=this.fillCol,t.lineWidth=this.lineWidth,t.lineWidthWC=this.lineWidthWC,t.lineCap=this.lineCap,t.savScale=1,t.iso=this.iso,t.fillRule=this.fillRule,t.shadowOffsetX=this.shadowOffsetX,t.shadowOffsetY=this.shadowOffsetY,t.shadowBlur=this.shadowBlur,t.shadowColor=this.shadowColor,t.dashed=e(this.dashed),t.dashOffset=this.dashOffset,t},Shape=function(t,e){var s=e||{}
Path.call(this,t,e),this.type="SHAPE",s.hasOwnProperty("iso")?this.setProperty("iso",s.iso):s.hasOwnProperty("isotropic")?this.setProperty("iso",s.isotropic):this.iso=!0},Shape.prototype=Object.create(Path.prototype),Shape.prototype.constructor=Shape,Img=function(t,e){var i,r
g.call(this),this.type="IMG","string"==typeof t?(this.imgBuf=new Image,this.imgBuf.src=t):t instanceof Image&&(this.imgBuf=t),this.pthCmds=new s,this.drawCmds=[],this.width=0,this.height=0,this.imgLorgX=0,this.imgLorgY=0,this.lorg=1,this.border=!1,this.strokeCol=null,this.lineWidthWC=null,this.lineWidth=null,this.lineCap=null,this.savScale=1,this.shadowOffsetX=0,this.shadowOffsetY=0,this.shadowBlur=0,this.shadowColor="#000000",i="object"==typeof e?e:{}
for(r in i)i.hasOwnProperty(r)&&this.setProperty(r,i[r])},Img.prototype=Object.create(g.prototype),Img.prototype.constructor=Img,Img.prototype.setProperty=f,Img.prototype.translate=function(t,e){this.hardTransform.translate(t,e)},Img.prototype.rotate=function(t){this.hardTransform.rotate(t)},Img.prototype.skew=function(t,e){this.hardTransform.skew(t,e)},Img.prototype.scale=function(t,e){this.hardTransform.scale(t,e)},Img.prototype.dup=function(){var t=new Img
return t.type=this.type,t.pthCmds=new s,t.drawCmds=e(this.drawCmds),t.imgBuf=this.imgBuf,t.dwgOrg=e(this.dwgOrg),t.dragNdrop=null,t.hardTfmAry=e(this.hardTfmAry),t.ofsTfmAry=e(this.ofsTfmAry),t.border=this.border,t.strokeCol=this.strokeCol,t.lineWidth=this.lineWidth,t.lineWidthWC=this.lineWidthWC,t.lineCap=this.lineCap,t.savScale=1,t.iso=this.iso,t.dashed=e(this.dashed),t.dashOffset=this.dashOffset,t.width=this.width,t.height=this.height,t.imgLorgX=this.imgLorgX,t.imgLorgY=this.imgLorgY,t.lorg=this.lorg,t.shadowOffsetX=this.shadowOffsetX,t.shadowOffsetY=this.shadowOffsetY,t.shadowBlur=this.shadowBlur,t.shadowColor=this.shadowColor,t},Img.prototype.formatImg=function(){var t,e,s,i,r,a,n,o,h,l,c,d,u,p=0,f=0
this.imgBuf.width||console.log("in image onload handler yet image NOT loaded!"),this.width&&this.height?(t=this.width,e=this.height):this.width&&!this.height?(t=this.width,e=t*this.imgBuf.height/this.imgBuf.width):this.height&&!this.width?(e=this.height,t=e*this.imgBuf.width/this.imgBuf.height):(t=this.imgBuf.width,e=this.iso?t*this.imgBuf.height/this.imgBuf.width:this.imgBuf.height),s=t/2,i=e/2,u=[0,[0,0],[s,0],[t,0],[0,i],[s,i],[t,i],[0,e],[s,e],[t,e]],void 0!==u[this.lorg]&&(p=-u[this.lorg][0],f=-u[this.lorg][1]),this.imgLorgX=p,this.imgLorgY=f,this.width=t,this.height=e,r=p,a=f,n=p,o=f+e,h=p+t,l=f+e,c=p+t,d=f,this.drawCmds=[{type:"M",values:[r,a]},{type:"L",values:[n,o]},{type:"L",values:[h,l]},{type:"L",values:[c,d]},{type:"Z",values:[]}]},Text=function(t,e){var i,r
g.call(this),this.type="TEXT",this.txtStr=t,this.pthCmds=new s,this.drawCmds=[],this.width=0,this.height=0,this.imgLorgX=0,this.imgLorgY=0,this.lorg=1,this.border=!1,this.fillCol=null,this.bgFillColor=null,this.strokeCol=null,this.fontSize=null,this.fontSizeZC=null,this.fontWeight=null,this.fontFamily=null,this.lineWidthWC=null,this.lineWidth=null,this.lineCap=null,this.savScale=1,this.shadowOffsetX=0,this.shadowOffsetY=0,this.shadowBlur=0,this.shadowColor="#000000",i="object"==typeof e?e:{}
for(r in i)i.hasOwnProperty(r)&&this.setProperty(r,i[r])},Text.prototype=Object.create(g.prototype),Text.prototype.constructor=Text,Text.prototype.setProperty=f,Text.prototype.translate=function(t,e){this.hardTransform.translate(t,e)},Text.prototype.rotate=function(t){this.hardTransform.rotate(t)},Text.prototype.skew=function(t,e){this.hardTransform.skew(t,e)},Text.prototype.scale=function(t,e){this.hardTransform.scale(t,e)},Text.prototype.dup=function(){var t=new Text
return t.type=this.type,t.txtStr=this.txtStr.slice(0),t.pthCmds=new s,t.drawCmds=e(this.drawCmds),t.dwgOrg=e(this.dwgOrg),t.hardTfmAry=e(this.hardTfmAry),t.ofsTfmAry=e(this.ofsTfmAry),t.border=this.border,t.strokeCol=this.strokeCol,t.fillCol=this.fillCol,t.bgFillColor=this.bgFillColor,t.lineWidth=this.lineWidth,t.lineWidthWC=this.lineWidthWC,t.lineCap=this.lineCap,t.savScale=1,t.dashed=e(this.dashed),t.dashOffset=this.dashOffset,t.width=this.width,t.height=this.height,t.imgLorgX=this.imgLorgX,t.imgLorgY=this.imgLorgY,t.lorg=this.lorg,t.fontSize=this.fontSize,t.fontWeight=this.fontWeight,t.fontFamily=this.fontFamily,t.shadowOffsetX=this.shadowOffsetX,t.shadowOffsetY=this.shadowOffsetY,t.shadowBlur=this.shadowBlur,t.shadowColor=this.shadowColor,t},Text.prototype.formatText=function(t){var e,s,i,r,a,n,o,h,l,c,d,u,p,f,g=this.fontSize||t.fontSize,y=this.fontFamily||t.fontFamily,m=this.fontWeight||t.fontWeight,x=this.lorg||1,C=0,w=0
this.orgXscl||(this.orgXscl=t.xscl),f=t.xscl/this.orgXscl,this.fontSizeZC=g*f,t.ctx.save(),v(t.ctx),t.ctx.font=m+" "+g+"px "+y,e=t.ctx.measureText(this.txtStr).width,t.ctx.restore(),e*=f,s=g,s*=f,i=e/2,r=s/2,a=[0,[0,s],[i,s],[e,s],[0,r],[i,r],[e,r],[0,0],[i,0],[e,0]],void 0!==a[x]&&(C=-a[x][0],w=a[x][1]),this.imgLorgX=C,this.imgLorgY=w-.25*s,n=C,o=w,h=C,l=w-s,c=C+e,d=w-s,u=C+e,p=w,this.drawCmds=[{type:"M",values:[n,o]},{type:"L",values:[h,l]},{type:"L",values:[c,d]},{type:"L",values:[u,p]},{type:"Z",values:[]}]},x.prototype.stopAnimation=function(){window.cancelAnimationFrame(this.timer),this.prevAnimMode=this.animMode,this.animMode=this.modes.STOPPED,this.currTime=0,this.startOfs=0},x.prototype.pauseAnimation=function(){window.cancelAnimationFrame(this.timer),this.prevAnimMode=this.animMode,this.animMode=this.modes.PAUSED},x.prototype.stepAnimation=function(){function t(){m(e),e.prevAnimMode=e.modes.PAUSED,e.animMode=e.modes.PAUSED}var e=this
this.animMode!==this.modes.PLAYING&&(this.animMode===this.modes.PAUSED&&(this.startTime=Date.now()-this.currTime),this.prevAnimMode=this.animMode,this.animMode=this.modes.STEPPING,setTimeout(t,this.stepTime))},x.prototype.redrawAnimation=function(){this.animMode!==this.modes.PLAYING&&(this.startTime=Date.now()-this.currTime,m(this))},x.prototype.playAnimation=function(t,e){function s(){m(i),i.prevAnimMode=i.modes.PLAYING,e?i.currTime<e?i.timer=window.requestAnimationFrame(s):i.stopAnimation():i.timer=window.requestAnimationFrame(s)}var i=this
this.startOfs=t||0,this.animMode!==this.modes.PLAYING&&(this.animMode===this.modes.PAUSED&&(this.startTime=Date.now()-this.currTime),this.prevAnimMode=this.animMode,this.animMode=this.modes.PLAYING,this.timer=window.requestAnimationFrame(s))},Cango=function(t){function e(t,e){var s=void 0
window.addEventListener("resize",function(){void 0!=s&&(clearTimeout(s),s=void 0),s=setTimeout(function(){s=void 0,t()},e)})}function s(){var t,e,s=a.bkgCanvas.offsetTop+a.bkgCanvas.clientTop,i=a.bkgCanvas.offsetLeft+a.bkgCanvas.clientLeft,r=a.bkgCanvas.offsetWidth,n=a.bkgCanvas.offsetHeight
if(!(Math.abs(r-a.rawWidth)/r<.01&&Math.abs(n-a.rawHeight)/n<.01)&&(a.bkgCanvas.timeline&&a.bkgCanvas.timeline.animTasks.length&&a.deleteAllAnimations(),a.rawWidth=r,a.rawHeight=n,a.aRatio=r/n,a.bkgCanvas===a.cnvs))for(a.cnvs.setAttribute("width",r),a.cnvs.setAttribute("height",n),t=1;t<a.bkgCanvas.layers.length;t++)e=a.bkgCanvas.layers[t].cElem,e&&(e.style.top=s+"px",e.style.left=i+"px",e.style.width=r+"px",e.style.height=n+"px",e.setAttribute("width",r),e.setAttribute("height",n))}var i,r,a=this
return this.cId=t,this.cnvs=document.getElementById(t),null===this.cnvs?void alert("can't find canvas "+t):(this.bkgCanvas=this.cnvs,-1!==t.indexOf("_ovl_")&&(i=t.slice(0,t.indexOf("_ovl_")),this.bkgCanvas=document.getElementById(i)),this.rawWidth=this.cnvs.offsetWidth,this.rawHeight=this.cnvs.offsetHeight,this.aRatio=this.rawWidth/this.rawHeight,this.widthPW=100,this.heightPW=100/this.aRatio,this.bkgCanvas.hasOwnProperty("layers")||(this.bkgCanvas.layers=[],r=new C(this.cId,this.cnvs),this.bkgCanvas.layers[0]=r,e(s,250)),void 0===x||this.bkgCanvas.hasOwnProperty("timeline")||(this.bkgCanvas.timeline=new x),this.cnvs.hasOwnProperty("resized")||(this.cnvs.setAttribute("width",this.rawWidth),this.cnvs.setAttribute("height",this.rawHeight),this.cnvs.resized=!0),this.ctx=this.cnvs.getContext("2d"),this.yDown=!0,this.vpW=this.rawWidth,this.vpH=this.rawHeight,this.vpOrgX=0,this.vpOrgY=0,this.xscl=1,this.yscl=1,this.xoffset=0,this.yoffset=0,this.savWC={xscl:this.xscl,yscl:this.yscl,xoffset:this.xoffset,yoffset:this.yoffset},this.ctx.textAlign="left",this.ctx.textBaseline="alphabetic",this.penCol="rgba(0, 0, 0, 1.0)",this.penWid=1,this.lineCap="butt",this.paintCol="rgba(128,128,128,1.0)",this.fontSize=12,this.fontWeight=400,this.fontFamily="Consolas, Monaco, 'Andale Mono', monospace",this.clipCount=0,this.getUnique=function(){return O+=1},void b(this))},Cango.prototype.animation=function(t,e,s,i){var r,a
return a=this.cId+"_"+this.getUnique(),r=new y(a,this,t,e,s,i),this.stopAnimation(),this.bkgCanvas.timeline.animTasks.push(r),r.id},Cango.prototype.pauseAnimation=function(){this.bkgCanvas.timeline.pauseAnimation()},Cango.prototype.playAnimation=function(t,e){this.bkgCanvas.timeline.playAnimation(t,e)},Cango.prototype.stopAnimation=function(){this.bkgCanvas.timeline.stopAnimation()},Cango.prototype.stepAnimation=function(){this.bkgCanvas.timeline.stepAnimation()},Cango.prototype.deleteAnimation=function(t){var e=this
this.pauseAnimation(),this.bkgCanvas.timeline.animTasks.forEach(function(s,i){return s.id===t?void e.bkgCanvas.timeline.animTasks.splice(i,1):void 0})},Cango.prototype.deleteAllAnimations=function(){this.stopAnimation(),this.bkgCanvas.timeline.animTasks=[]},Cango.prototype.toPixelCoords=function(t,e){var s=this.vpOrgX+this.xoffset+t*this.xscl,i=this.vpOrgY+this.yoffset+e*this.yscl
return{x:s,y:i}},Cango.prototype.toWorldCoords=function(t,e){var s=(t-this.vpOrgX-this.xoffset)/this.xscl,i=(e-this.vpOrgY-this.yoffset)/this.yscl
return{x:s,y:i}},Cango.prototype.getCursorPosWC=function(t){var e=t||window.event,s=this.cnvs.getBoundingClientRect(),i=(e.clientX-s.left-this.vpOrgX-this.xoffset)/this.xscl,r=(e.clientY-s.top-this.vpOrgY-this.yoffset)/this.yscl
return{x:i,y:r}},Cango.prototype.clearCanvas=function(t){function e(t){var e=r.toPixelCoords(t.grad[0],t.grad[1]),s=r.toPixelCoords(t.grad[2],t.grad[3]),i=r.ctx.createLinearGradient(e.x,e.y,s.x,s.y)
return t.colorStops.forEach(function(t){i.addColorStop(t[0],t[1])}),i}function s(t){var e=r.toPixelCoords(t.grad[0],t.grad[1]),s=t.grad[2]*r.xscl,i=r.toPixelCoords(t.grad[3],t.grad[4]),a=t.grad[5]*r.xscl,n=r.ctx.createRadialGradient(e.x,e.y,s,i.x,i.y,a)
return t.colorStops.forEach(function(t){n.addColorStop(t[0],t[1])}),n}var i,r=this
t?(this.ctx.save(),t instanceof LinearGradient?this.ctx.fillStyle=e(t):t instanceof RadialGradient?this.ctx.fillStyle=s(t):this.ctx.fillStyle=t,this.ctx.fillRect(0,0,this.rawWidth,this.rawHeight),this.ctx.restore()):this.ctx.clearRect(0,0,this.rawWidth,this.rawHeight),i=w(this),i.dragObjects.length=0,this.cnvs.alphaOvl&&this.cnvs.alphaOvl.parentNode&&this.cnvs.alphaOvl.parentNode.removeChild(this.cnvs.alphaOvl)},Cango.prototype.gridboxPadding=function(t,e,s,i){function r(){o.vpW=o.rawWidth,o.vpH=o.rawHeight,o.vpOrgX=0,o.vpOrgY=0,o.setWorldCoordsSVG()}var a,n,o=this
if(void 0===t)return void r()
if(void 0===e){if(t>=50||0>t)return console.error("gridbox right must be greater than left"),void r()
e=t}return(0>t||t>99)&&(t=0),(0>e||e>99/this.aRatio)&&(e=0),void 0===s?s=t:0>s&&(s=0),void 0===i?i=e:0>i&&(i=0),a=100-t-s,n=100/this.aRatio-i-e,0>a||0>n?(console.error("invalid gridbox dimensions"),void r()):(this.vpW=a*this.rawWidth/100,this.vpH=n*this.rawWidth/100,this.vpOrgX=t*this.rawWidth/100,this.vpOrgY=i*this.rawWidth/100,this.yDown=!0,void this.setWorldCoordsSVG())},Cango.prototype.fillGridbox=function(t){function e(t){var e=i.toPixelCoords(t.grad[0],t.grad[1]),s=i.toPixelCoords(t.grad[2],t.grad[3]),r=i.ctx.createLinearGradient(e.x,e.y,s.x,s.y)
return t.colorStops.forEach(function(t){r.addColorStop(t[0],t[1])}),r}function s(t){var e=i.toPixelCoords(t.grad[0],t.grad[1]),s=t.grad[2]*i.xscl,r=i.toPixelCoords(t.grad[3],t.grad[4]),a=t.grad[5]*i.xscl,n=i.ctx.createRadialGradient(e.x,e.y,s,r.x,r.y,a)
return t.colorStops.forEach(function(t){n.addColorStop(t[0],t[1])}),n}var i=this,r=t||this.paintCol,a=this.yDown?this.vpOrgY:this.vpOrgY-this.vpH
this.ctx.save(),r instanceof LinearGradient?this.ctx.fillStyle=e(r):r instanceof RadialGradient?this.ctx.fillStyle=s(r):this.ctx.fillStyle=r,this.ctx.fillRect(this.vpOrgX,a,this.vpW,this.vpH),this.ctx.restore()},Cango.prototype.setWorldCoordsSVG=function(t,e,s,i){var r=t||0,a=e||0
this.yDown||(this.vpOrgY-=this.vpH,this.yDown=!0),s&&s>0?this.xscl=this.vpW/s:this.xscl=1,i&&i>0?this.yscl=this.vpH/i:this.yscl=this.xscl,this.xoffset=-r*this.xscl,this.yoffset=-a*this.yscl,this.savWC={xscl:this.xscl,yscl:this.yscl,xoffset:this.xoffset,yoffset:this.yoffset}},Cango.prototype.setWorldCoordsRHC=function(t,e,s,i){var r=t||0,a=e||0
this.yDown&&(this.vpOrgY+=this.vpH,this.yDown=!1),s&&s>0?this.xscl=this.vpW/s:this.xscl=1,i&&i>0?this.yscl=-this.vpH/i:this.yscl=-this.xscl,this.xoffset=-r*this.xscl,this.yoffset=-a*this.yscl,this.savWC={xscl:this.xscl,yscl:this.yscl,xoffset:this.xoffset,yoffset:this.yoffset}},Cango.prototype.setPropertyDefault=function(t,e){if("string"==typeof t&&void 0!==e&&null!==e)switch(t.toLowerCase()){case"fillcolor":("string"==typeof e||"object"==typeof e)&&(this.paintCol=e)
break
case"strokecolor":("string"==typeof e||"object"==typeof e)&&(this.penCol=e)
break
case"linewidth":case"strokewidth":this.penWid=e
break
case"linecap":"string"!=typeof e||"butt"!==e&&"round"!==e&&"square"!==e||(this.lineCap=e)
break
case"fontfamily":"string"==typeof e&&(this.fontFamily=e)
break
case"fontsize":this.fontSize=e
break
case"fontweight":("string"==typeof e||e>=100&&900>=e)&&(this.fontWeight=e)
break
case"steptime":e>=15&&500>=e&&(this.stepTime=e)
break
default:return}},Cango.prototype.dropShadow=function(t){var e=0,s=0,i=0,r="#000000",a=1,n=1
void 0!=t&&(e=t.shadowOffsetX||0,s=t.shadowOffsetY||0,i=t.shadowBlur||0,r=t.shadowColor||"#000000","SHAPE"===t.type||"PATH"===t.type&&!t.iso?(a*=this.xscl,n*=this.yscl):(a*=this.xscl,n*=-this.xscl)),this.ctx.shadowOffsetX=e*a,this.ctx.shadowOffsetY=s*n,this.ctx.shadowBlur=i*a,this.ctx.shadowColor=r},Cango.prototype.render=function(e,s){function i(t){var e
t.iso||(e=new d("SCL",h,1,p),t.netTfmAry.unshift(e)),a(t.ofsTfm),t.savScale=1,t.netTfmAry.forEach(function(e){"SCL"===e.type&&(t.savScale*=Math.abs(e.args[0])),"TRN"===e.type?t.iso?e.distortFn.call(t,[e.args[0],e.args[1]*p]):e.distortFn.call(t,[e.args[0],e.args[1]]):e.distortFn.call(t,e.args)}),t.netTfm=t.ofsTfm.multiply(t.grpTfm)}function r(t){var e,s,i
t.parent?(e=t.parent.netTfmAry,s=t.parent.netTfm):(e=[],s=document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGMatrix()),i=e.concat(t.ofsTfmAry),"GRP"===t.type?t.netTfmAry=i:(t.netTfmAry=i.concat(t.hardTfmAry),t.grpTfm=s),t.dwgOrg={x:0,y:0},i.forEach(function(e){t.dwgOrg=e.distortFn.call(t.dwgOrg,e.args)})}function n(){function t(e,i){e(i),"GRP"===i.type?i.children.forEach(function(s){t(e,s)}):s.push(i)}var s=[]
return t(r,e),s}function o(e){function s(){e.formatImg(),i(e),u.paintImg(e)}"IMG"===e.type?e.imgBuf.complete?s():t(e.imgBuf,"load",s):"TEXT"===e.type?(e.formatText(u),i(e),u.paintText(e)):"CLIP"===e.type?(i(e),u.applyClipMask(e)):(i(e),u.paintPath(e))}function l(t){t.transform.reset(),"GRP"===t.type&&t.children.forEach(function(t){l(t)})}var c,u=this,p=Math.abs(u.yscl/u.xscl)
return"string"!=typeof e.type?void console.log("render called on bad object type"):(s===!0&&this.clearCanvas(),"GRP"===e.type?(c=n(),c.forEach(o)):(r(e),o(e)),l(e),void this.resetClip())},Cango.prototype.genLinGrad=function(t,e){var s=t.grad[0],i=t.grad[1],a=t.grad[2],n=t.grad[3],o=r(s,i,e),h=r(a,n,e),l=this.ctx.createLinearGradient(o.x,o.y,h.x,h.y)
return t.colorStops.forEach(function(t){l.addColorStop(t[0],t[1])}),l},Cango.prototype.genRadGrad=function(t,e,s){var i=t.grad[0],a=t.grad[1],n=t.grad[2]*s,o=t.grad[3],h=t.grad[4],l=t.grad[5]*s,c=r(i,a,e),d=r(o,h,e),u=this.ctx.createRadialGradient(c.x,c.y,n,d.x,d.y,l)
return t.colorStops.forEach(function(t){u.addColorStop(t[0],t[1])}),u},Cango.prototype.paintImg=function(t){var e,s,i,r,a=this,n=t.imgBuf,o=this.yDown?this.xscl:-this.xscl,h=T.translate(this.vpOrgX+this.xoffset,this.vpOrgY+this.yoffset).scaleNonUniform(this.xscl,o).multiply(t.netTfm)
this.yDown||(h=h.flipY()),this.ctx.save(),this.ctx.setTransform(h.a,h.b,h.c,h.d,h.e,h.f),this.dropShadow(t),this.ctx.drawImage(n,t.imgLorgX,t.imgLorgY,t.width,t.height),t.border&&(this.ctx.beginPath(),t.drawCmds.forEach(function(t){a.ctx[S[t.type]].apply(a.ctx,t.values)}),this.ctx.restore(),this.ctx.save(),i=t.strokeCol||this.penCol,r=i instanceof LinearGradient?this.genLinGrad(i,h):i instanceof RadialGradient?this.genRadGrad(i,h,t.savScale*this.xscl):i,t.lineWidthWC?this.ctx.lineWidth=t.lineWidthWC*t.savScale*this.xscl:this.ctx.lineWidth=t.lineWidth||this.penWid,this.ctx.strokeStyle=r,this.ctx.lineCap=t.lineCap||this.lineCap,this.ctx.stroke(),this.ctx.restore()),null!==t.dragNdrop&&(e=w(this),e!==t.dragNdrop.layer&&t.dragNdrop.layer&&(s=t.dragNdrop.layer.dragObjects.indexOf(this),-1!==s&&t.dragNdrop.layer.dragObjects.splice(s,1)),t.dragNdrop.cgo=this,t.dragNdrop.layer=e,t.dragNdrop.layer.dragObjects.includes(t)||t.dragNdrop.layer.dragObjects.push(t))},Cango.prototype.paintPath=function(t){var e,s,i,r,a,n=this,o=this.yDown?this.xscl:-this.xscl,h=T.translate(this.vpOrgX+this.xoffset,this.vpOrgY+this.yoffset).scaleNonUniform(this.xscl,o).multiply(t.netTfm)
this.ctx.save(),this.ctx.transform(h.a,h.b,h.c,h.d,h.e,h.f),this.ctx.beginPath(),t.drawCmds.forEach(function(t){n.ctx[S[t.type]].apply(n.ctx,t.values)}),this.ctx.restore(),this.ctx.save(),e=t.fillCol||this.paintCol,s=e instanceof LinearGradient?this.genLinGrad(e,h):e instanceof RadialGradient?this.genRadGrad(e,h,t.savScale*this.xscl):e,e=t.strokeCol||this.penCol,i=e instanceof LinearGradient?this.genLinGrad(e,h):e instanceof RadialGradient?this.genRadGrad(e,h,t.savScale*this.xscl):e,this.dropShadow(t),"SHAPE"===t.type&&(this.ctx.fillStyle=s,this.ctx.fill(t.fillRule)),("PATH"===t.type||t.border)&&(t.border&&this.dropShadow(),Array.isArray(t.dashed)&&t.dashed.length&&(this.ctx.setLineDash(t.dashed),this.ctx.lineDashOffset=t.dashOffset||0),t.lineWidthWC?this.ctx.lineWidth=t.lineWidthWC*t.savScale*this.xscl:this.ctx.lineWidth=t.lineWidth||this.penWid,this.ctx.strokeStyle=i,this.ctx.lineCap=t.lineCap||this.lineCap,this.ctx.stroke(),this.ctx.setLineDash([]),this.ctx.lineDashOffset=0),this.ctx.restore(),null!==t.dragNdrop&&(r=w(this),r!==t.dragNdrop.layer&&t.dragNdrop.layer&&(a=t.dragNdrop.layer.dragObjects.indexOf(this),-1!==a&&t.dragNdrop.layer.dragObjects.splice(a,1)),t.dragNdrop.cgo=this,t.dragNdrop.layer=r,t.dragNdrop.layer.dragObjects.includes(t)||t.dragNdrop.layer.dragObjects.push(t))},Cango.prototype.applyClipMask=function(t){if(!t.drawCmds.length)return void this.resetClip()
var e=this,s=this.yDown?this.xscl:-this.xscl,i=T.translate(this.vpOrgX+this.xoffset,this.vpOrgY+this.yoffset).scaleNonUniform(this.xscl,s).multiply(t.netTfm)
this.ctx.save(),this.clipCount+=1,this.ctx.save(),this.ctx.transform(i.a,i.b,i.c,i.d,i.e,i.f),this.ctx.beginPath(),t.drawCmds.forEach(function(t){e.ctx[S[t.type]].apply(e.ctx,t.values)}),this.ctx.closePath(),this.ctx.restore(),this.ctx.clip(t.fillRule),this.ctx.fillStyle="rgba(0, 0, 0, 0.0)",this.ctx.fillRect(0,0,1,1)},Cango.prototype.resetClip=function(){for(;this.clipCount>0;)this.ctx.restore(),this.clipCount--},Cango.prototype.paintText=function(t){var e,s,i,r,a,n=this,o=this.yDown?this.xscl:-this.xscl,h=T.translate(this.vpOrgX+this.xoffset,this.vpOrgY+this.yoffset).scaleNonUniform(this.xscl,o).multiply(t.netTfm).scaleNonUniform(1/this.xscl,1/o)
e=t.fontWeight||this.fontWeight,s=t.fontSizeZC,i=t.fontFamily||this.fontFamily,this.ctx.save(),this.ctx.setTransform(h.a,h.b,h.c,h.d,h.e,h.f),"string"==typeof t.bgFillColor&&(this.ctx.save(),this.ctx.fillStyle=t.bgFillColor,this.ctx.strokeStyle=t.bgFillColor,this.ctx.lineWidth=.1*s,this.ctx.beginPath(),t.drawCmds.forEach(function(t){n.ctx[S[t.type]].apply(n.ctx,t.values)}),this.ctx.fill(),this.ctx.stroke(),this.ctx.restore()),this.ctx.font=e+" "+s+"px "+i,this.ctx.fillStyle=t.fillCol||this.paintCol,this.ctx.fillText(t.txtStr,t.imgLorgX,t.imgLorgY),t.border&&(this.dropShadow(),t.lineWidthWC?this.ctx.lineWidth=t.lineWidthWC*this.xscl:this.ctx.lineWidth=t.lineWidth||this.penWid,this.ctx.strokeStyle=t.strokeCol||this.penCol,this.ctx.lineCap=t.lineCap||this.lineCap,this.ctx.strokeText(t.txtStr,t.imgLorgX,t.imgLorgY)),this.ctx.restore(),null!==t.dragNdrop&&(r=w(this),r!==t.dragNdrop.layer&&t.dragNdrop.layer&&(a=t.dragNdrop.layer.dragObjects.indexOf(this),-1!==a&&t.dragNdrop.layer.dragObjects.splice(a,1)),t.dragNdrop.cgo=this,t.dragNdrop.layer=r,t.dragNdrop.layer.dragObjects.includes(t)||t.dragNdrop.layer.dragObjects.push(t))},Cango.prototype.drawPath=function(t,e){var s=e||{},i=s.x||0,r=s.y||0,a=s.scl||1,n=s.degs||0,o=new Path(t,e)
n&&o.transform.rotate(n),1!==a&&o.transform.scale(a),(i||r)&&o.transform.translate(i,r),this.render(o)},Cango.prototype.drawShape=function(t,e){var s=e||{},i=s.x||0,r=s.y||0,a=s.scl||1,n=s.degs||0,o=new Shape(t,e)
n&&o.transform.rotate(n),1!==a&&o.transform.scale(a),(i||r)&&o.transform.translate(i,r),this.render(o)},Cango.prototype.drawText=function(t,e){var s=e||{},i=s.x||0,r=s.y||0,a=s.scl||1,n=s.degs||0,o=new Text(t,e)
n&&o.transform.rotate(n),1!==a&&o.transform.scale(a),(i||r)&&o.transform.translate(i,r),this.render(o)},Cango.prototype.drawImg=function(t,e){var s=e||{},i=s.x||0,r=s.y||0,a=s.scl||1,n=s.degs||0,o=new Img(t,e)
n&&o.transform.rotate(n),1!==a&&o.transform.scale(a),(i||r)&&o.transform.translate(i,r),this.render(o)},Cango.prototype.createLayer=function(){var t,e,s,i,r,a,n=this.rawWidth,o=this.rawHeight,h=this.bkgCanvas.layers.length
return-1!==this.cId.indexOf("_ovl_")?(console.log("canvas layers can't create layers"),""):(s=this.getUnique(),i=this.cId+"_ovl_"+s,t="<canvas id='"+i+"' style='position:absolute' width='"+n+"' height='"+o+"'></canvas>",a=this.bkgCanvas.layers[h-1].cElem,a.insertAdjacentHTML("afterend",t),e=document.getElementById(i),e.style.backgroundColor="transparent",e.style.left=this.bkgCanvas.offsetLeft+this.bkgCanvas.clientLeft+"px",e.style.top=this.bkgCanvas.offsetTop+this.bkgCanvas.clientTop+"px",e.style.width=this.bkgCanvas.offsetWidth+"px",e.style.height=this.bkgCanvas.offsetHeight+"px",r=new C(i,e),this.bkgCanvas.layers.push(r),i)},Cango.prototype.deleteLayer=function(t){var e,s
for(s=1;s<this.bkgCanvas.layers.length;s++)this.bkgCanvas.layers[s].id===t&&(e=this.bkgCanvas.layers[s].cElem,e&&(e.alphaOvl&&e.alphaOvl.parentNode&&e.alphaOvl.parentNode.removeChild(e.alphaOvl),e.parentNode.removeChild(e)),this.bkgCanvas.layers.splice(s,1))},Cango.prototype.deleteAllLayers=function(){var t,e
for(t=this.bkgCanvas.layers.length-1;t>0;t--)e=this.bkgCanvas.layers[t].cElem,e&&(e.alphaOvl&&e.alphaOvl.parentNode&&e.alphaOvl.parentNode.removeChild(e.alphaOvl),e.parentNode.removeChild(e)),this.bkgCanvas.layers.splice(t,1)},Cango.prototype.dupCtx=function(t){this.yDown=t.yDown,this.vpW=t.vpW,this.vpH=t.vpH,this.vpOrgX=t.vpOrgX,this.vpOrgY=t.vpOrgY,this.xscl=t.xscl,this.yscl=t.yscl,this.xoffset=t.xoffset,this.yoffset=t.yoffset,this.savWC=e(t.savWC),this.penCol=t.penCol.slice(0),this.penWid=t.penWid,this.lineCap=t.lineCap.slice(0),this.paintCol=t.paintCol.slice(0),this.fontSize=t.fontSize,this.fontWeight=t.fontWeight,this.fontFamily=t.fontFamily.slice(0)},initZoomPan=function(t,e,s){function i(t){function e(e){var s=e.toPixelCoords(0,0),i=e.rawWidth/2-s.x,r=e.rawHeight/2-s.y
e.xoffset+=i-i/t,e.yoffset+=r-r/t,e.xscl/=t,e.yscl/=t}f.forEach(e),s()}function r(t,e){function i(s){s.xoffset-=t,s.yoffset-=e}f.forEach(i),s()}function a(){function t(t){t.xscl=t.savWC.xscl,t.yscl=t.savWC.yscl,t.xoffset=t.savWC.xoffset,t.yoffset=t.savWC.yoffset}f.forEach(t),s()}var n,o,h,l,c,d,u,p,f,g=["m",-7,-2,"l",7,5,7,-5],v=["m",-6,-6,"l",12,12,"m",0,-12,"l",-12,12],y=["m",-7,0,"l",14,0,"m",-7,-7,"l",0,14],m=["m",-7,0,"l",14,0]
p=new Cango(t),p.clearCanvas(),p.setWorldCoordsRHC(-p.rawWidth+44,-p.rawHeight+44),p.drawShape(shapeDefs.rectangle(114,80),{x:-17,y:0,fillColor:"rgba(0, 50, 0, 0.12)"}),h=new Shape(shapeDefs.rectangle(20,20,2),{fillColor:"rgba(0,0,0,0.2)"}),h.enableDrag(null,null,a),p.render(h),u=new Shape(shapeDefs.rectangle(20,20,2),{fillColor:"rgba(0,0,0,0.2)"}),u.enableDrag(null,null,function(){r(50,0)}),u.translate(22,0),p.render(u),l=new Shape(shapeDefs.rectangle(20,20,2),{fillColor:"rgba(0,0,0,0.2)"}),l.enableDrag(null,null,function(){r(0,-50)}),l.translate(0,22),p.render(l),d=new Shape(shapeDefs.rectangle(20,20,2),{fillColor:"rgba(0,0,0,0.2)"}),d.enableDrag(null,null,function(){r(-50,0)}),d.translate(-22,0),p.render(d),c=new Shape(shapeDefs.rectangle(20,20,2),{fillColor:"rgba(0,0,0,0.2)"}),c.enableDrag(null,null,function(){r(0,50)}),c.translate(0,-22),p.render(c),n=new Shape(shapeDefs.rectangle(20,20,2),{fillColor:"rgba(0,0,0,0.2)"}),n.enableDrag(null,null,function(){i(1/1.2)}),n.translate(-56,11),p.render(n),o=new Shape(shapeDefs.rectangle(20,20,2),{fillColor:"rgba(0,0,0,0.2)"}),o.enableDrag(null,null,function(){i(1.2)}),o.translate(-56,-11),p.render(o),g=["m",-7,-2,"l",7,5,7,-5],p.drawPath(g,{x:0,y:22,strokeColor:"white",lineWidth:2}),p.drawPath(g,{x:22,y:0,strokeColor:"white",lineWidth:2,degs:-90}),p.drawPath(g,{x:-22,y:0,strokeColor:"white",lineWidth:2,degs:90}),p.drawPath(g,{x:0,y:-22,strokeColor:"white",lineWidth:2,degs:180}),p.drawPath(y,{x:-56,y:11,strokeColor:"white",lineWidth:2}),p.drawPath(m,{x:-56,y:-11,strokeColor:"white",lineWidth:2}),p.drawPath(v,{strokeColor:"white",lineWidth:2}),f=Array.isArray(e)?e:[e]},Cango}()