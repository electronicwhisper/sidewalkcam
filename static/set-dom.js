!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var t;t="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,t.setDOM=e()}}(function(){return function e(t,n,r){function i(d,a){if(!n[d]){if(!t[d]){var u="function"==typeof require&&require;if(!a&&u)return u(d,!0);if(o)return o(d,!0);var f=new Error("Cannot find module '"+d+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[d]={exports:{}};t[d][0].call(l.exports,function(e){var n=t[d][1][e];return i(n||e)},l,l.exports,e,t,n,r)}return n[d].exports}for(var o="function"==typeof require&&require,d=0;d<r.length;d++)i(r[d]);return i}({1:[function(e,t){"use strict";function n(e,t){s(e&&e.nodeType,"You must provide a valid node to update."),e.nodeType===N&&(e=e.documentElement),t.nodeType===g?o(e,t):r(e,"string"==typeof t?p(t,e.nodeName):t),e[h]||(e[h]=!0,l(e))}function r(e,t){if(e.nodeType===t.nodeType)if(e.nodeType===y){if(a(e,t))return;if(o(e,t),e.nodeName===t.nodeName)i(e.attributes,t.attributes);else{for(var n=t.cloneNode();e.firstChild;)n.appendChild(e.firstChild);e.parentNode.replaceChild(n,e)}}else e.nodeValue!==t.nodeValue&&(e.nodeValue=t.nodeValue);else e.parentNode.replaceChild(t,c(e)),l(t)}function i(e,t){var n,r,i,o,d;for(n=e.length;n--;)r=e[n],o=r.namespaceURI,d=r.localName,(i=t.getNamedItemNS(o,d))||e.removeNamedItemNS(o,d);for(n=t.length;n--;)r=t[n],o=r.namespaceURI,d=r.localName,i=e.getNamedItemNS(o,d),i?i.value!==r.value&&(i.value=r.value):(t.removeNamedItemNS(o,d),e.setNamedItemNS(r))}function o(e,t){for(var n,i,o,a,u,f,m=e.firstChild,s=t.firstChild,p=0;m;)p++,n=m,i=d(n),m=m.nextSibling,i&&(f||(f={}),f[i]=n);for(m=e.firstChild;s;)p--,o=s,s=s.nextSibling,f&&(a=d(o))&&(u=f[a])?(delete f[a],u!==m?e.insertBefore(u,m):m=m.nextSibling,r(u,o)):m?(n=m,m=m.nextSibling,d(n)?(e.insertBefore(o,n),l(o)):r(n,o)):(e.appendChild(o),l(o));for(i in f)p--,e.removeChild(f[i]);for(;--p>=0;)e.removeChild(c(e.lastChild))}function d(e){if(e.nodeType===y){var t=e.getAttribute(n.KEY)||e.id;return t?v+t:void 0}}function a(e,t){return f(e)&&f(t)||u(e)===u(t)||e.isEqualNode(t)}function u(e){return e.getAttribute(n.CHECKSUM)||NaN}function f(e){return null!=e.getAttribute(n.IGNORE)}function l(e){return m(e,"mount")}function c(e){return m(e,"dismount")}function m(e,t){if(d(e)){var n=document.createEvent("Event"),r={value:e};n.initEvent(t,!1,!1),Object.defineProperty(n,"target",r),Object.defineProperty(n,"srcElement",r),e.dispatchEvent(n)}for(var i=e.firstChild;i;)i=m(i,t).nextSibling;return e}function s(e,t){if(!e)throw new Error("set-dom: "+t)}n.KEY="data-key",n.IGNORE="data-ignore",n.CHECKSUM="data-checksum";var p=e(2),v="_set-dom-",h=v+"mounted",y=1,N=9,g=11;t.exports=n},{2:2}],2:[function(e,t){"use strict";var n=window.DOMParser&&new window.DOMParser,r=!1,i=!1;try{n.parseFromString("<br/>","text/html")&&(r=!0)}catch(e){var o=document.implementation.createHTMLDocument(""),d=o.documentElement,a=o.body;try{d.innerHTML+="",i=!0}catch(e){n.parseFromString("<br/>","application/xhtml+xml");var u=/(<body[^>]*>)([\s\S]*)<\/body>/}}t.exports=r?function(e,t){var r=n.parseFromString(e,"text/html");return"HTML"===t?r.documentElement:r.body.firstChild}:function(e,t){if("HTML"===t){if(i)return d.innerHTML=e,d;var r=e.match(u);if(r){var o=r[2],f=r.index+r[1].length,l=f+o.length;e=e.slice(0,f)+e.slice(l),a.innerHTML=o}for(var c=n.parseFromString(e,"application/xhtml+xml"),m=c.body;a.firstChild;)m.appendChild(a.firstChild);return c.documentElement}return a.innerHTML=e,a.firstChild}},{}]},{},[1])(1)});