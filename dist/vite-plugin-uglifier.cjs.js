"use strict";Object.defineProperties(exports,{__esModule:{value:!0},
[Symbol.toStringTag]:{value:"Module"}})
;const e=require("fs/promises"),s=require("path");function t(e){
return/^[a-zA-Z_-][a-zA-Z0-9_-]*$/.test(e)}function r(e){
return![/^tspan\d+$/i,/^path\d+$/i,/^rect\d+$/i,/^circle\d+$/i].some((s=>s.test(e)))
}function n(e){let s="";do{s=String.fromCharCode(97+e%26)+s,e=Math.floor(e/26)-1
}while(e>=0);return s}async function a(t){let r=[];const n=await e.readdir(t,{
withFileTypes:!0});for(const e of n){const n=s.join(t,e.name)
;e.isDirectory()?r=r.concat(await a(n)):r.push(n)}return r}function o(e){
const s=new Set,n=new Set,a=e.match(/([^{}]+){/g);if(a)for(const o of a){
const e=o.slice(0,-1).trim().split(",");for(const a of e){
const e=a.trim().match(/^([.#])([a-zA-Z_-][a-zA-Z0-9_-]*)/)
;e&&t(e[2])&&r(e[2])&&("."===e[1]?s.add(e[2]):"#"===e[1]&&n.add(e[2]))}}return{
classes:s,ids:n}}function c(e,s){
return e.replace(/\.([a-zA-Z_-][a-zA-Z0-9_-]*)/g,((e,t)=>s[t]?"."+s[t]:e))}
function i(e,s){
return e.replace(/#([a-zA-Z_-][a-zA-Z0-9_-]*)/g,((e,t)=>s[t]?"#"+s[t]:e))}
function l(e,s){
return e.replace(/class\s*=\s*"([^"]+)"/g,((e,t)=>`class="${t.split(/\s+/).map((e=>s[e]||e)).join(" ")}"`))
}function u(e,s){
return e.replace(/id\s*=\s*"([^"]+)"/g,((e,t)=>`id="${s[t]||t}"`))}
function d(e,s,t){
return e.replace(/(["'])([.#])([a-zA-Z_-][a-zA-Z0-9_-]*)\1/g,((e,r,n,a)=>"."===n&&s[a]?`${r}.${s[a]}${r}`:"#"===n&&t[a]?`${r}#${t[a]}${r}`:e))
}function p(e,s){
return e.replace(/\.classList\.(add|remove|toggle)\(\s*["']([^"']+)["']\s*\)/g,((e,t,r)=>s[r]?`.classList.${t}("${s[r]}")`:e))
}function f(e,s){
return e.replace(/\.className\s*=\s*["']([^"]+)["']+/g,((e,t)=>`.className = "${t.split(/\s+/).map((e=>s[e]||e)).join(" ")}"`))
}function m(e){
return e.replace(/(i\([^,]+,[^,]+),\s*"[^"]+"\s*,\s*(-?\d+\))/g,"$1, $2")}
exports.collectSelectorsFromCss=o,exports.default=function(r){const g={
enableLogging:!0,include:[],exclude:[],renameId:!0,...r};function $(e){
g.enableLogging}function h(e){
return!(g.include.length&&!g.include.some((s=>e.includes(s)))||g.exclude.length&&g.exclude.some((s=>e.includes(s))))
}let x={},A={};return{name:"vite-plugin-uglifier",apply:"build",
async buildStart(){
const r=await a(s.resolve(process.cwd(),"src")),c=new Set,i=new Set
;for(const s of r){if(!h(s))continue;const r=await e.readFile(s,"utf8")
;if(s.endsWith(".css")){const{classes:e,ids:s}=o(r)
;e.forEach((e=>c.add(e))),g.renameId&&s.forEach((e=>i.add(e)))
}else if(/\.(vue|html)$/.test(s)){let e;const s=/class\s*=\s*"([^"]+)"/g
;for(;e=s.exec(r);)e[1].split(/\s+/).forEach((e=>{t(e)&&c.add(e)}))}}
Array.from(c).sort().forEach(((e,s)=>{x[e]=n(s)
})),g.renameId&&Array.from(i).sort().forEach(((e,s)=>{A[e]=n(s)
})),$(),$(),$(),$()},transform(e,s){if(s.endsWith(".css")&&h(s)){let s=c(e,x)
;return s=i(s,A),{code:s,map:null}}},renderChunk(e){let s=d(e,x,A)
;return s=p(s,x),s=f(s,x),s=m(s),{code:s,map:null}},async closeBundle(){
const t=s.resolve(process.cwd(),"dist");for(const s of await a(t)){
if(!h(s))continue;let t=await e.readFile(s,"utf8");s.endsWith(".css")?(t=c(t,x),
t=i(t,A)):s.endsWith(".html")&&(t=l(t,x),
t=u(t,A)),await e.writeFile(s,t,"utf8"),$()}}}
},exports.getNewClassName=n,exports.isRemappableToken=r,
exports.isValidCSSName=t,
exports.removeTextArgumentInJs=m,exports.replaceCSSSelectorsInJs=d,
exports.replaceClassListManipulationInJs=p,
exports.replaceClassNameAssignmentInJs=f,
exports.replaceClassesInCss=c,exports.replaceClassesInHtml=l,
exports.replaceClassesInJs=function(e,s){
return e.replace(/(["'])([a-zA-Z_-][a-zA-Z0-9_-]*)\1/g,((e,t,r)=>s[r]?`${t}${s[r]}${t}`:e))
},
exports.replaceIdsInCss=i,exports.replaceIdsInHtml=u,exports.replaceIdsInJs=function(e,s){
return e.replace(/(["'])(#[a-zA-Z_-][a-zA-Z0-9_-]*)\1/g,((e,t,r)=>{
const n=r.slice(1);return s[n]?`${t}#${s[n]}${t}`:e}))};
