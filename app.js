/*  
*  original author
Author: Paulo Nunes
Original: https://github.com/syndicatefx/textpad/blob/master/app.js ( Thanksssss to Paulo Nunes for the original code )
Filename: app.js

Code modified and cleaned up by 2nul
https://github.com/2nul/simplejot

LICENSE: MIT

*/

// I would like to extend my thanks to all the authors!

// https://github.com/eligrey/FileSaver.js
var saveAs=saveAs||function(r){"use strict";if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var e=r.document,o=function(){return r.URL||r.webkitURL||r},t=e.createElementNS("http://www.w3.org/1999/xhtml","a"),f="download"in t,n=function(r){var e=new MouseEvent("click");r.dispatchEvent(e)},i=/Version\/[\d\.]+.*Safari/.test(navigator.userAgent),a=r.webkitRequestFileSystem,d=r.requestFileSystem||a||r.mozRequestFileSystem,C=function(e){(r.setImmediate||r.setTimeout)(function(){throw e},0)},m="application/octet-stream",S=0,h=4e4,g=function(r){var e=function(){"string"==typeof r?o().revokeObjectURL(r):r.remove()};setTimeout(e,h)},c=function(r,e,o){e=[].concat(e);for(var t=e.length;t--;){var f=r["on"+e[t]];if("function"==typeof f)try{f.call(r,o||r)}catch(n){C(n)}}},u=function(r){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(r.type)?new Blob([String.fromCharCode(65279),r],{type:r.type}):r},s=function(e,C,h){h||(e=u(e));var s,l,v,p=this,w=e.type,y=!1,x=function(){c(p,"writestart progress write writeend".split(" "))},R=function(){if(l&&i&&"undefined"!=typeof FileReader){var t=new FileReader;return t.onloadend=function(){var r=t.result;l.location.href="data:attachment/file"+r.slice(r.search(/[,;]/)),p.readyState=p.DONE,x()},t.readAsDataURL(e),void(p.readyState=p.INIT)}if((y||!s)&&(s=o().createObjectURL(e)),l)l.location.href=s;else{var f=r.open(s,"_blank");void 0===f&&i&&(r.location.href=s)}p.readyState=p.DONE,x(),g(s)},O=function(r){return function(){return p.readyState!==p.DONE?r.apply(this,arguments):void 0}},b={create:!0,exclusive:!1};return p.readyState=p.INIT,C||(C="download"),f?(s=o().createObjectURL(e),void setTimeout(function(){t.href=s,t.download=C,n(t),x(),g(s),p.readyState=p.DONE})):(r.chrome&&w&&w!==m&&(v=e.slice||e.webkitSlice,e=v.call(e,0,e.size,m),y=!0),a&&"download"!==C&&(C+=".download"),(w===m||a)&&(l=r),d?(S+=e.size,void d(r.TEMPORARY,S,O(function(r){r.root.getDirectory("saved",b,O(function(r){var o=function(){r.getFile(C,b,O(function(r){r.createWriter(O(function(o){o.onwriteend=function(e){l.location.href=r.toURL(),p.readyState=p.DONE,c(p,"writeend",e),g(r)},o.onerror=function(){var r=o.error;r.code!==r.ABORT_ERR&&R()},"writestart progress write abort".split(" ").forEach(function(r){o["on"+r]=p["on"+r]}),o.write(e),p.abort=function(){o.abort(),p.readyState=p.DONE},p.readyState=p.WRITING}),R)}),R)};r.getFile(C,{create:!1},O(function(r){r.remove(),o()}),O(function(r){r.code===r.NOT_FOUND_ERR?o():R()}))}),R)}),R)):void R())},l=s.prototype,v=function(r,e,o){return new s(r,e,o)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(r,e,o){return o||(r=u(r)),navigator.msSaveOrOpenBlob(r,e||"download")}:(l.abort=function(){var r=this;r.readyState=r.DONE,c(r,"abort")},l.readyState=l.INIT=0,l.WRITING=1,l.DONE=2,l.error=l.onwritestart=l.onprogress=l.onwrite=l.onabort=l.onerror=l.onwriteend=null,v)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);"undefined"!=typeof module&&module.exports?module.exports.saveAs=saveAs:"undefined"!=typeof define&&null!==define&&null!==define.amd&&define([],function(){return saveAs});

// https://github.com/hxgf/smoke.js
(function(e,t){var n={smoketimeout:[],init:false,zindex:1e3,i:0,bodyload:function(e){var r=t.createElement("div");r.setAttribute("id","smoke-out-"+e);r.className="smoke-base";r.style.zIndex=n.zindex;n.zindex++;t.body.appendChild(r)},newdialog:function(){var t=(new Date).getTime();t=Math.random(1,99)+t;if(!n.init){n.listen(e,"load",function(){n.bodyload(t)})}else{n.bodyload(t)}return t},forceload:function(){},build:function(t,r){n.i++;r.stack=n.i;t=t.replace(/\n/g,"<br />");t=t.replace(/\r/g,"<br />");var i="",s="OK",o="Cancel",u="",a="",f;if(r.type==="prompt"){i='<div class="dialog-prompt">'+'<input id="dialog-input-'+r.newid+'" type="text" '+(r.params.value?'value="'+r.params.value+'"':"")+" />"+"</div>"}if(r.params.ok){s=r.params.ok}if(r.params.cancel){o=r.params.cancel}if(r.params.classname){u=r.params.classname}if(r.type!=="signal"){a='<div class="dialog-buttons">';if(r.type==="alert"){a+='<button id="alert-ok-'+r.newid+'">'+s+"</button>"}else if(r.type==="quiz"){if(r.params.button_1){a+='<button class="quiz-button" id="'+r.type+"-ok1-"+r.newid+'">'+r.params.button_1+"</button>"}if(r.params.button_2){a+='<button class="quiz-button" id="'+r.type+"-ok2-"+r.newid+'">'+r.params.button_2+"</button>"}if(r.params.button_3){a+='<button class="quiz-button" id="'+r.type+"-ok3-"+r.newid+'">'+r.params.button_3+"</button>"}if(r.params.button_cancel){a+='<button id="'+r.type+"-cancel-"+r.newid+'" class="cancel">'+r.params.button_cancel+"</button>"}}else if(r.type==="prompt"||r.type==="confirm"){if(r.params.reverseButtons){a+='<button id="'+r.type+"-ok-"+r.newid+'">'+s+"</button>"+'<button id="'+r.type+"-cancel-"+r.newid+'" class="cancel">'+o+"</button>"}else{a+='<button id="'+r.type+"-cancel-"+r.newid+'" class="cancel">'+o+"</button>"+'<button id="'+r.type+"-ok-"+r.newid+'">'+s+"</button>"}}a+="</div>"}f='<div id="smoke-bg-'+r.newid+'" class="smokebg"></div>'+'<div class="dialog smoke '+u+'">'+'<div class="dialog-inner">'+t+i+a+"</div>"+"</div>";if(!n.init){n.listen(e,"load",function(){n.finishbuild(t,r,f)})}else{n.finishbuild(t,r,f)}},finishbuild:function(e,r,i){var s=t.getElementById("smoke-out-"+r.newid);s.className="smoke-base smoke-visible  smoke-"+r.type;s.innerHTML=i;while(s.innerHTML===""){s.innerHTML=i}if(n.smoketimeout[r.newid]){clearTimeout(n.smoketimeout[r.newid])}n.listen(t.getElementById("smoke-bg-"+r.newid),"click",function(){n.destroy(r.type,r.newid);if(r.type==="prompt"||r.type==="confirm"||r.type==="quiz"){r.callback(false)}else if(r.type==="alert"&&typeof r.callback!=="undefined"){r.callback()}});switch(r.type){case"alert":n.finishbuildAlert(e,r,i);break;case"confirm":n.finishbuildConfirm(e,r,i);break;case"quiz":n.finishbuildQuiz(e,r,i);break;case"prompt":n.finishbuildPrompt(e,r,i);break;case"signal":n.finishbuildSignal(e,r,i);break;default:throw"Unknown type: "+r.type}},finishbuildAlert:function(r,i,s){n.listen(t.getElementById("alert-ok-"+i.newid),"click",function(){n.destroy(i.type,i.newid);if(typeof i.callback!=="undefined"){i.callback()}});t.onkeyup=function(t){if(!t){t=e.event}if(t.keyCode===13||t.keyCode===32||t.keyCode===27){n.destroy(i.type,i.newid);if(typeof i.callback!=="undefined"){i.callback()}}}},finishbuildConfirm:function(r,i,s){n.listen(t.getElementById("confirm-cancel-"+i.newid),"click",function(){n.destroy(i.type,i.newid);i.callback(false)});n.listen(t.getElementById("confirm-ok-"+i.newid),"click",function(){n.destroy(i.type,i.newid);i.callback(true)});t.onkeyup=function(t){if(!t){t=e.event}if(t.keyCode===13||t.keyCode===32){n.destroy(i.type,i.newid);i.callback(true)}else if(t.keyCode===27){n.destroy(i.type,i.newid);i.callback(false)}}},finishbuildQuiz:function(r,i,s){var o,u,a;n.listen(t.getElementById("quiz-cancel-"+i.newid),"click",function(){n.destroy(i.type,i.newid);i.callback(false)});if(o=t.getElementById("quiz-ok1-"+i.newid))n.listen(o,"click",function(){n.destroy(i.type,i.newid);i.callback(o.innerHTML)});if(u=t.getElementById("quiz-ok2-"+i.newid))n.listen(u,"click",function(){n.destroy(i.type,i.newid);i.callback(u.innerHTML)});if(a=t.getElementById("quiz-ok3-"+i.newid))n.listen(a,"click",function(){n.destroy(i.type,i.newid);i.callback(a.innerHTML)});t.onkeyup=function(t){if(!t){t=e.event}if(t.keyCode===27){n.destroy(i.type,i.newid);i.callback(false)}}},finishbuildPrompt:function(r,i,s){var o=t.getElementById("dialog-input-"+i.newid);setTimeout(function(){o.focus();o.select()},100);n.listen(t.getElementById("prompt-cancel-"+i.newid),"click",function(){n.destroy(i.type,i.newid);i.callback(false)});n.listen(t.getElementById("prompt-ok-"+i.newid),"click",function(){n.destroy(i.type,i.newid);i.callback(o.value)});t.onkeyup=function(t){if(!t){t=e.event}if(t.keyCode===13){n.destroy(i.type,i.newid);i.callback(o.value)}else if(t.keyCode===27){n.destroy(i.type,i.newid);i.callback(false)}}},finishbuildSignal:function(r,i,s){t.onkeyup=function(t){if(!t){t=e.event}if(t.keyCode===27){n.destroy(i.type,i.newid);if(typeof i.callback!=="undefined"){i.callback()}}};n.smoketimeout[i.newid]=setTimeout(function(){n.destroy(i.type,i.newid);if(typeof i.callback!=="undefined"){i.callback()}},i.timeout)},destroy:function(e,r){var i=t.getElementById("smoke-out-"+r);if(e!=="quiz"){var s=t.getElementById(e+"-ok-"+r)}var o=t.getElementById(e+"-cancel-"+r);i.className="smoke-base";if(s){n.stoplistening(s,"click",function(){});t.onkeyup=null}if(e==="quiz"){var u=t.getElementsByClassName("quiz-button");for(var a=0;a<u.length;a++){n.stoplistening(u[a],"click",function(){});t.onkeyup=null}}if(o){n.stoplistening(o,"click",function(){})}n.i=0;i.innerHTML=""},alert:function(e,t,r){if(typeof r!=="object"){r=false}var i=n.newdialog();n.build(e,{type:"alert",callback:t,params:r,newid:i})},signal:function(e,t,r){if(typeof r!=="object"){r=false}var i=5e3;if(r.duration!=="undefined"){i=r.duration}var s=n.newdialog();n.build(e,{type:"signal",callback:t,timeout:i,params:r,newid:s})},confirm:function(e,t,r){if(typeof r!=="object"){r=false}var i=n.newdialog();n.build(e,{type:"confirm",callback:t,params:r,newid:i})},quiz:function(e,t,r){if(typeof r!=="object"){r=false}var i=n.newdialog();n.build(e,{type:"quiz",callback:t,params:r,newid:i})},prompt:function(e,t,r){if(typeof r!=="object"){r=false}var i=n.newdialog();return n.build(e,{type:"prompt",callback:t,params:r,newid:i})},listen:function(e,t,n){if(e.addEventListener){return e.addEventListener(t,n,false)}if(e.attachEvent){return e.attachEvent("on"+t,n)}return false},stoplistening:function(e,t,n){if(e.removeEventListener){return e.removeEventListener(t,n,false)}if(e.detachEvent){return e.detachEvent("on"+t,n)}return false}};n.init=true;if(typeof module!="undefined"&&module.exports){module.exports=n}else if(typeof define==="function"&&define.amd){define("smoke",[],function(){return n})}else{this.smoke=n}})(window,document)

// https://github.com/RadLikeWhoa/Countable
!function(e){"use strict";function n(e){for(var n,t,r=[],o=0,i=e.length;i>o;)n=e.charCodeAt(o++),n>=55296&&56319>=n&&i>o?(t=e.charCodeAt(o++),56320==(64512&t)?r.push(((1023&n)<<10)+(1023&t)+65536):(r.push(n,t),o--)):r.push(n);return r}function t(e,n){var t=Object.prototype.toString.call(e),r=e&&(("[object NodeList]"===t||"[object HTMLCollection]"===t)&&e.length||1===e.nodeType),o=n&&"function"==typeof n;return"console"in window&&"warn"in console&&(r||console.warn("Countable: No valid elements were found"),o||console.warn('Countable: "'+n+'" is not a valid callback function')),r&&o}function r(e){var n={hardReturns:!1,stripTags:!1,ignoreReturns:!1,ignoreZeroWidth:!0};for(var t in e)n.hasOwnProperty(t)&&(n[t]=e[t]);return n}function o(e,t){var r,o=""+("value"in e?e.value:e.innerText||e.textContent);return t.stripTags&&(o=o.replace(/<\/?[a-z][^>]*>/gi,"")),t.ignoreZeroWidth&&(o=o.replace(/[\u200B]+/,"")),r=o.trim(),{paragraphs:r?(r.match(t.hardReturns?/\n{2,}/g:/\n+/g)||[]).length+1:0,sentences:r?(r.match(/[.?!…]+./g)||[]).length+1:0,words:r?(r.replace(/['";:,.?¿\-!¡]+/g,"").match(/\S+/g)||[]).length:0,characters:r?n(r.replace(/\s/g,"")).length:0,all:n(t.ignoreReturns?o.replace(/[\n\r]/g,""):o).length}}function i(e,n){var t=e.length;if("undefined"!=typeof t)for(;t--;)n(e[t]);else n(e)}var a=[],c="oninput"in document?"input":"keyup";navigator.userAgent.match(/MSIE 9.0/)&&(c="keyup"),String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")});var u={live:function(e,n,u){var l=r(u),s=function(e){var t=function(){n.call(e,o(e,l))};a.push({element:e,handler:t}),t(),e.addEventListener?e.addEventListener(c,t,!1):e.attachEvent&&e.attachEvent("on"+c,t)};if(t(e,n))return e.length?i(e,s):s(e),this},die:function(e){return t(e,function(){})?(i(e,function(e){var n;i(a,function(t){t.element===e&&(n=t)}),n&&(e.removeEventListener?e.removeEventListener(c,n.handler,!1):e.detachEvent&&e.detachEvent("on"+c,n.handler),a.splice(a.indexOf(n),1))}),this):void 0},once:function(e,n,a){return t(e,n)?(i(e,function(e){n.call(e,o(e,r(a)))}),this):void 0},count:function(e,n,t){return this.once(e,n,t)},enabled:function(e){var n=!1;return e&&1===e.nodeType&&i(a,function(t){t.element===e&&(n=!0)}),n}};"object"==typeof exports?module.exports=u:"function"==typeof define&&define.amd?define(function(){return u}):e.Countable=u}(this);

document.addEventListener("DOMContentLoaded", function(event) {

  document.querySelectorAll(
  ".btn-group button, footer button, section button"
).forEach(function(button) {

  button.addEventListener("click", function(e) {

    var rect = button.getBoundingClientRect();

    button.style.setProperty(
      "--ripple-x",
      (e.clientX - rect.left) + "px"
    );

    button.style.setProperty(
      "--ripple-y",
      (e.clientY - rect.top) + "px"
    );

    button.classList.remove("ripple");

    void button.offsetWidth;

    button.classList.add("ripple");

    setTimeout(function() {
      button.classList.remove("ripple");
    }, 450);
  });

});


  var title   = document.getElementById("fileName"),
      content = document.getElementById("fileContent"),
      start   = document.getElementById("start"),
      home    = document.getElementById("homepage"),
      save    = document.getElementById("save"),
      clear   = document.getElementById("clear"),
      settings= document.getElementById("settings"),
      setMenu = document.getElementById("setMenu"),
      notesBtn  = document.getElementById("notes"),
      notesMenu = document.getElementById("notesMenu"),
      noteList  = document.getElementById("noteList"),
      newNote   = document.getElementById("newNote"),
      fs      = document.getElementById("fs"),
      lh      = document.getElementById("lh"),
      lw      = document.getElementById("lw"),
      theme   = document.getElementById("theme"),
      reset   = document.getElementById("reset"),
      info    = document.getElementById("info"),
      chars   = document.getElementById("charCounter"),
      words   = document.getElementById("wordCounter"),
      noteWarning = document.getElementById("noteWarning"),
      dismissNoteWarning = document.getElementById("dismissNoteWarning"),
      disableNoteWarning = document.getElementById("disableNoteWarning");

  function hasStorage() { 
    var test = 'test';
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  };

  var NOTES_PREFIX = "SimpleJot-note:";
  var NOTE_WARNING_DISMISSED = "SimpleJot-note-warning-dismissed";
  var currentNote  = "";

  function showNoteWarning() {
    if(localStorage.getItem(NOTE_WARNING_DISMISSED) !== "true") {
      noteWarning.hidden = false;
      dismissNoteWarning.focus();
    }
  }

  dismissNoteWarning.addEventListener("click", function() {
    noteWarning.hidden = true;
  });

  disableNoteWarning.addEventListener("click", function() {
    localStorage.setItem(NOTE_WARNING_DISMISSED, "true");
    noteWarning.hidden = true;
  });

  function getNoteNames() {
    var names = [];
    for(var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if(key.indexOf(NOTES_PREFIX) === 0) {
        names.push(key.slice(NOTES_PREFIX.length));
      }
    }
    return names.sort();
  }

  function saveCurrentNote() {
    if(currentNote) {
      localStorage.setItem(NOTES_PREFIX + currentNote, content.value);
    }
  }

  function updateCounters() {
    Countable.once(content, function(counter) {
      words.innerHTML = counter.words + ":words";
      chars.innerHTML = counter.all + ":chars";
    });
  }

  function openNote(name) {
    saveCurrentNote();
    currentNote = name;
    localStorage.setItem("SimpleJot-current", name);
    title.value = name;
    content.value = localStorage.getItem(NOTES_PREFIX + name) || "";
    updateCounters();
  }

  function renderNoteList() {
    noteList.innerHTML = "";
    var names = getNoteNames();
    for(var i = 0; i < names.length; i++) {
      var name = names[i];
      var li = document.createElement("li");
      if(name === currentNote) {
        li.className = "note--current";
      }
      var openBtn = document.createElement("button");
      openBtn.className = "note-open";
      openBtn.setAttribute("data-note", name);
      openBtn.appendChild(document.createTextNode(name));
      openBtn.addEventListener("click", function() {
        openNote(this.getAttribute("data-note"));
        notesMenu.classList.remove("notes-menu--open");
        notesBtn.classList.remove("notes-btn--active");
      });
      var delBtn = document.createElement("button");
      delBtn.className = "note-delete";
      delBtn.title = "Delete note";
      delBtn.setAttribute("data-note", name);
      delBtn.appendChild(document.createTextNode("×"));
      delBtn.addEventListener("click", function() {
        trashNote(this.getAttribute("data-note"));
      });
      li.appendChild(openBtn);
      li.appendChild(delBtn);
      noteList.appendChild(li);
    }
  }

  function trashNote(name) {
    smoke.confirm("This will trash note \"" + name + "\" and clear it from SimpleJot's localstorage data, are you sure?",function(e) {
      if(e) {
        localStorage.removeItem(NOTES_PREFIX + name);
        if(name === currentNote) {
          currentNote = "";
          localStorage.removeItem('SimpleJot-current');
          title.value = "";
          content.value = "";
          words.innerHTML = "0:words";
          chars.innerHTML = "0:chars";
        }
        renderNoteList();
      }}, {
      reverseButtons: true,
      ok: "YES",
      cancel: "NO"
    });
  };

  if(hasStorage() === true){
    if(localStorage.getItem("SimpleJot-title") !== null || localStorage.getItem("SimpleJot-content") !== null) {
      var legacyTitle = localStorage.getItem("SimpleJot-title") || "Untitled";
      localStorage.setItem(NOTES_PREFIX + legacyTitle, localStorage.getItem("SimpleJot-content") || "");
      localStorage.removeItem("SimpleJot-title");
      localStorage.removeItem("SimpleJot-content");
      localStorage.setItem("SimpleJot-current", legacyTitle);
    }

    content.addEventListener("input", function() {
      saveCurrentNote();
    });

    title.addEventListener("input", function() {
      var newName = this.value;
      if(newName && newName !== currentNote && localStorage.getItem(NOTES_PREFIX + newName) === null) {
        localStorage.setItem(NOTES_PREFIX + newName, currentNote ? (localStorage.getItem(NOTES_PREFIX + currentNote) || "") : content.value);
        if(currentNote) {
          localStorage.removeItem(NOTES_PREFIX + currentNote);
        }
        currentNote = newName;
        localStorage.setItem("SimpleJot-current", newName);
        renderNoteList();
      }
    });

    var savedNote = localStorage.getItem("SimpleJot-current");
    if(savedNote !== null && localStorage.getItem(NOTES_PREFIX + savedNote) !== null) {
      openNote(savedNote);
    } else if(getNoteNames().length) {
      openNote(getNoteNames()[0]);
    }
    renderNoteList();

    if(localStorage.getItem("SimpleJot-theme")) {
      var themeClass = localStorage.getItem("SimpleJot-theme");
      document.querySelector("html").classList.add(themeClass);
    }

    if(localStorage.getItem("SimpleJot-settings")) {
      content.style.cssText = localStorage.getItem("SimpleJot-settings");
    }

    if(localStorage.getItem("SimpleJot-settings-fs")) {
      fs.value = localStorage.getItem("SimpleJot-settings-fs");
    }

    if(localStorage.getItem("SimpleJot-settings-lh")) {
      lh.value = localStorage.getItem("SimpleJot-settings-lh");
    }

    if(localStorage.getItem("SimpleJot-settings-lw")) {
      lw.value = localStorage.getItem("SimpleJot-settings-lw");
    }

    showNoteWarning();


  }else{ 
    smoke.alert("Sorry, either your browser doesn't support LocalStorage, or you have exceeded storage limits!");
  };

  save.addEventListener("click", function(event) {
    event.preventDefault();
    var blob = new Blob([content.value || content.placeholder],{type: "text/plain;charset=utf-8"});

    if(title.value == "") {
      
      smoke.prompt("Please give your file a title!\n or just keep the default below.", function(e) {
        if(e) {
          title.value = e;
          if(e !== currentNote && localStorage.getItem(NOTES_PREFIX + e) === null) {
            localStorage.setItem(NOTES_PREFIX + e, content.value);
            if(currentNote) {
              localStorage.removeItem(NOTES_PREFIX + currentNote);
            }
            currentNote = e;
            localStorage.setItem("SimpleJot-current", e);
            renderNoteList();
          }
          saveAs(blob, title.value + ".txt");
        }
      }, {
        reverseButtons: true,
        value: "my-text-pad-file",
        ok: "Save",
        cancel: "Cancel"
      });

    } else {
      saveAs(blob, title.value + ".txt");
    };

  }, false);

 

  clear.addEventListener("click", function(e) {
    if(content.value == "" && title.value == "") {
      smoke.alert("There is nothing to delete!\nGo ahead and write something first.")
    } else {
      smoke.confirm("This will trash your current note and clear it from SimpleJot's localstorage data, are you sure?",function(e) {
        if(e) {
          if(currentNote) {
            localStorage.removeItem(NOTES_PREFIX + currentNote);
          }
          localStorage.removeItem('SimpleJot-current');
          currentNote = "";
          title.value = "";
          content.value = "";
          words.innerHTML = "0:words";
          chars.innerHTML = "0:chars";
          renderNoteList();
        }}, {
        reverseButtons: true,
        ok: "YES",
        cancel: "NO"
      });
    };
  });

 

  settings.addEventListener("click", function() {
    this.classList.toggle("settings-btn--active");
    setMenu.classList.toggle("settings-menu--open");
    notesBtn.classList.remove("notes-btn--active");
    notesMenu.classList.remove("notes-menu--open");
  });

  notesBtn.addEventListener("click", function() {
    this.classList.toggle("notes-btn--active");
    notesMenu.classList.toggle("notes-menu--open");
    setMenu.classList.remove("settings-menu--open");
    settings.classList.remove("settings-btn--active");
    renderNoteList();
  });

  newNote.addEventListener("click", function() {
    smoke.prompt("Name your new note:", function(e) {
      if(e) {
        if(localStorage.getItem(NOTES_PREFIX + e) !== null) {
          smoke.alert("A note with that name already exists!");
        } else {
          saveCurrentNote();
          localStorage.setItem(NOTES_PREFIX + e, "");
          currentNote = e;
          localStorage.setItem("SimpleJot-current", e);
          renderNoteList();
          title.value = e;
          content.value = "";
          updateCounters();
          notesMenu.classList.remove("notes-menu--open");
          notesBtn.classList.remove("notes-btn--active");
          content.focus();
        }
      }
    }, {
      reverseButtons: true,
      ok: "Create",
      cancel: "Cancel"
    });
  });

  function textSettings() {
   
    fsValue = fs.value;
    lhValue = lh.value;
    lwValue = lw.value;

   
    settingValues = "font-size:" + fsValue + "em;line-height:" + lhValue + ";padding-left:" + lwValue + "em;padding-right:" + lwValue + "em;";
    
   
    localStorage.setItem("SimpleJot-settings", settingValues);
    localStorage.setItem("SimpleJot-settings-fs", fsValue);
    localStorage.setItem("SimpleJot-settings-lh", lhValue);
    localStorage.setItem("SimpleJot-settings-lw", lwValue);
  };

 

  fs.addEventListener("input", function() {
    val = fs.value;
    content.style.fontSize = val + "em";
    textSettings();
  });

 

  lh.addEventListener("input", function() {
    val = lh.value;
    content.style.lineHeight = val;
    textSettings();
  });

 

  lw.addEventListener("input", function() {
    val = lw.value;
    content.style.paddingLeft = val + "em";
    content.style.paddingRight = val + "em";
    textSettings();
  });

 

  theme.addEventListener("click", function() {
    document.querySelector("html").classList.toggle("night");

    var themeClass = localStorage.getItem("SimpleJot-theme");

    if(themeClass == "night") {
      localStorage.removeItem("SimpleJot-theme");
    } else {
      localStorage.setItem("SimpleJot-theme", "night");
    }
  });

 

  reset.addEventListener("click", function() {
    localStorage.removeItem("SimpleJot-settings");
    localStorage.removeItem("SimpleJot-settings-fs");
    localStorage.removeItem("SimpleJot-settings-lh");
    localStorage.removeItem("SimpleJot-settings-lw");

    content.removeAttribute("style");
    
    fs.value = 1;
    lh.value = 1.9;
    lw.value = 16;

  });

 

  content.addEventListener("click", function() {
    setMenu.classList.remove("settings-menu--open");
    settings.classList.remove("settings-btn--active");
    notesMenu.classList.remove("notes-menu--open");
    notesBtn.classList.remove("notes-btn--active");
  });
 
  start.addEventListener("click", function() {
    home.classList.remove("active");
    content.focus();
  });

 

  info.addEventListener("click", function() {
    home.classList.add("active");
  });

  Countable.live(content, function(counter) {
    words.innerHTML = counter.words + ":words";
    chars.innerHTML = counter.all + ":chars";
  });

});
