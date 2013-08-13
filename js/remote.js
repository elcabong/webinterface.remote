/*
Remote for XBMC 
Copyright 2010 Furya-creations.net

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
  Class manipulation
  http://www.openjs.com/scripts/dom/class_manipulation.php
*/




function hasClass(ele,cls) {
  return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}

function addClass(ele,cls) {
  if (!this.hasClass(ele,cls)) ele.className += " "+cls;
}

function removeClass(ele,cls) {
  if (hasClass(ele,cls)) {
    var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
    ele.className=ele.className.replace(reg,' ');
  }
}

/*
  Cookies manipulation
*/
function setCookie(name, value) {
  var today = new Date();
  var exp_date = new Date();
  exp_date.setTime(today.getTime() + (365*24*60*60*1000));
  
  document.cookie = name + "=" + value + ";expires=" + exp_date.toGMTString();
}

function getCookie(name) {
  if (document.cookie.length>0) {
    cookie_start = document.cookie.indexOf(name + "=");
    if (cookie_start != -1) {
      cookie_start = cookie_start + name.length + 1;
      cookie_end = document.cookie.indexOf(";", cookie_start);
      
      if (cookie_end == -1) {
        cookie_end = document.cookie.length;
      }
      
      return unescape(document.cookie.substring(cookie_start,cookie_end));
    }
  }
  
  return "";
}

/*
  XBMC Request
*/
var XbmcRequest = {
  /* Retrieve the key code for charac
    key code = OxFxxx where xxx is an hexadecimal ascii char code */
  getKeyCode: function(charac) {
    var asciiHexCode = charac.charCodeAt(0).toString(16); // ASCII code (hexadecimal)
    var zeros = ""; // String that will contains 0 to complete the code length

    for(i=0,j=(3-asciiHexCode.length);i<j;i++) zeros = ""+ zeros + "0"

    return "0xF" + zeros + asciiHexCode;
  },
  
  /* Retrieve the XBMC serveur URL */
  getServerUrl: function() {
    return "http://"+ window.location.hostname +":"+ window.location.port;
  },
  
  /* Send JSON RPC Request */
  sendJSonRPCRequest: function(method, params) {
    var executeRequest = true;
    if(method=="System.Shutdown") {
      executeRequest = confirm("Are you sure you want to shutdown the system ?");
    }

    if(method=="System.Suspend") {
      executeRequest = confirm("Are you sure you want to suspend the system ?");
    }	
	
    if(method=="System.Reboot") {
      executeRequest = confirm("Are you sure you want to reboot the system ?");
    }
	
    if(executeRequest) {
	   var temp = params;
	   var params2 = temp.replace(/\'/g,"\"");

		$.ajax({
				type: 'POST',
				url: this.getServerUrl()+'/jsonrpc',
				data: '{"jsonrpc": "2.0", "method": "'+ method +'", "params": '+ params2 +',  "id": 1}',
				success: function(result, textStatus, XMLHttpRequest){ JSON.stringify(result) },
				dataType: 'json',
				contentType: 'application/json'
		});	
    }
  },

  send: function(type, command, params) {    
    switch(type) {
      case 'JSON-RPC':
        params = params ? params : '{}';
        this.sendJSonRPCRequest(command, params);
        break;
    }
  }
}


/* iPhoneUI */
var iPhoneUI = {
  init: function() {
    if((navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i)) && !window.navigator.standalone) {
      addClass(document.getElementById('actions'), 'hidden');
      addClass(document.getElementById('controller'), 'hidden');
      removeClass(document.getElementById('add-to-homescreen'), 'hidden');
    }
    else {
      // Detect orientation
      iPhoneUI.orientation();
      
      // Set the location
      var anchor = 'controller';
      if(window.location.hash) {
        anchor = window.location.hash.replace('#','')
      } else {
        window.location = window.location+'#'+ anchor
      }
      
      // Add / Remove .hidden class, also look at :target from remote.css
      var sections = document.getElementsByTagName('section');
      for(var i=0, j=sections.length; i<j; i++) {
        if(sections[i].id!=anchor) {
          addClass(sections[i], 'hidden');
        }
        else {
          removeClass(sections[i], 'hidden');
        }
      }
    }
  },

  transition: function(link, backside) {
    var current = document.getElementById(link.parentNode.parentNode.parentNode.id);
    var to = document.getElementById(link.id.replace('to_',''));
    
    removeClass(to, 'hidden');
    
    if(backside) {
      addClass(current, 'slideToLeft');
    }
    else {
      addClass(current, 'slideToRight');
    }
    
    window.setTimeout(function() {
      addClass(current, 'hidden');
    }, 600);
  },

  orientation: function() {
    if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) || (navigator.userAgent.match(/iPad/i))) {
      var orient = (window.orientation==0 || window.orientation==180) ? 'landscape' : 'portrait';
      document.body.className = orient;
    } else {
		if (window.innerWidth > window.innerHeight) {
			var orient = 'landscape';
			document.body.className = orient;
		} else {
			var orient = 'portrait';
			document.body.className = orient;
		}
    }
  },
  
  toggleButton: function(id, state) {
    if(state == true) {
      addClass(id, 'on');
      removeClass(id,'off');
    }
    else {
      addClass(id, 'off'); 
      removeClass(id, 'on');
    }
  }
}

/* RemoteGestures */
var RemoteGestures = {
  init: function(id) {
    // Listeners
    element = document.getElementById(id);
    element.addEventListener("touchstart", this.touchStart, false);
    element.addEventListener("touchmove", this.touchMove, false);
    element.addEventListener("touchend", this.touchEnd, false);
    element.addEventListener("touchcancel", this.touchCancel, false);
    
    // Gesture object
    element.gesture = {};
    element.gesture.touches = 0;
    element.gesture._start = { _x: 0, _y: 0 };
    element.gesture._stop = { _x: 0, _y: 0 };
    element.gesture._threshold = { _x: 10, _y: 10 };
    element.gesture._threshold2 = { _x: 10000, _y: 400 };
    element.gesture.is_scrolling = false;
    element.gesture.direction = null;
    element.gesture.triggered = false;
  },
  
  touchStart: function(event) {
    event.preventDefault();
    
    this.gesture.touches = event.touches.length;
    this.gesture._start._x = event.touches[0].pageX;
    this.gesture._start._y = event.touches[0].pageY;
    this.gesture._stop._x = event.touches[0].pageX;
    this.gesture._stop._y = event.touches[0].pageY;    
  },
  
  touchMove: function(event) {
    event.preventDefault();
    
    this.gesture._stop._x = event.touches[0].pageX;
    this.gesture._stop._y = event.touches[0].pageY;
    
    // Horizontal or vertical direction ?
    this.gesture.direction = Math.abs(this.gesture._start._x-this.gesture._stop._x) > Math.abs(this.gesture._start._y-this.gesture._stop._y) ? 'horizontal' : 'vertical';
    
    // One finger gesture
    if(this.gesture.touches==1) {
      // No scroll action already launched
      if(!element.gesture.is_scrolling) {
        // Up, down direction = continue scrolling
        // Action only launched if the threshold is exceeded
        if(this.gesture.direction == 'vertical' && (this.gesture._start._y > this.gesture._stop._y) && ((this.gesture._start._y - this.gesture._threshold._y) >= this.gesture._stop._y)) {
          element.gesture.is_scrolling = true;
          XbmcRequest.send('JSON-RPC','Input.up'); // Up
          setTimeout(function() { element.gesture.is_scrolling = false; }, 100);
          this.gesture.triggered = true;
        }
        else if(this.gesture.direction == 'vertical' && (this.gesture._start._y < this.gesture._stop._y) && ((this.gesture._start._y+this.gesture._threshold._y) <= this.gesture._stop._y)) {
          element.gesture.is_scrolling = true;
          XbmcRequest.send('JSON-RPC','Input.down'); // Down
          setTimeout(function() { element.gesture.is_scrolling = false; }, 100);      
          this.gesture.triggered = true;  
        }
        else if(this.gesture.direction == 'horizontal' && (this.gesture._start._x < this.gesture._stop._x) && ((this.gesture._start._x+this.gesture._threshold._x) <= this.gesture._stop._x)) {
          element.gesture.is_scrolling = true;
          XbmcRequest.send('JSON-RPC','Input.right'); // right
          setTimeout(function() { element.gesture.is_scrolling = false; }, 200);      
          this.gesture.triggered = true;  
        }
		else if(this.gesture.direction == 'horizontal' && (this.gesture._start._x > this.gesture._stop._x) && ((this.gesture._start._x-this.gesture._threshold._x) >= this.gesture._stop._x)) {
          element.gesture.is_scrolling = true;
          XbmcRequest.send('JSON-RPC','Input.left'); // left
          setTimeout(function() { element.gesture.is_scrolling = false; }, 200);      
          this.gesture.triggered = true;  
        }
      }
      else if(this.gesture.touches==2) {
       // No scroll action already launched // section not working
      if(!element.gesture.is_scrolling) {
        // Up, down direction = continue scrolling
        // Action only launched if the threshold is exceeded
        if(this.gesture.direction == 'vertical' && (this.gesture._start._y > this.gesture._stop._y) && ((this.gesture._start._y - this.gesture._threshold._y) >= this.gesture._stop._y)) {
          element.gesture.is_scrolling = true;
          XbmcRequest.send('JSON-RPC','Input.up'); // up
          setTimeout(function() { element.gesture.is_scrolling = false; }, 100);
          this.gesture.triggered = true;
        }
        else if(this.gesture.direction == 'vertical' && (this.gesture._start._y < this.gesture._stop._y) && ((this.gesture._start._y+this.gesture._threshold._y) <= this.gesture._stop._y)) {
          element.gesture.is_scrolling = true;
          XbmcRequest.send('JSON-RPC','Input.down'); // Down
          setTimeout(function() { element.gesture.is_scrolling = false; }, 100);      
          this.gesture.triggered = true;  
        }
        else if(this.gesture.direction == 'horizontal' && (this.gesture._start._x < this.gesture._stop._x) && ((this.gesture._start._x+this.gesture._threshold._x) <= this.gesture._stop._x)) {
          element.gesture.is_scrolling = true;
          XbmcRequest.send('JSON-RPC','Input.right'); // right
          setTimeout(function() { element.gesture.is_scrolling = false; }, 200);      
          this.gesture.triggered = true;  
        }
		else if(this.gesture.direction == 'horizontal' && (this.gesture._start._x > this.gesture._stop._x) && ((this.gesture._start._x-this.gesture._threshold._x) >= this.gesture._stop._x)) {
          element.gesture.is_scrolling = true;
          XbmcRequest.send('JSON-RPC','Input.left'); // left
          setTimeout(function() { element.gesture.is_scrolling = false; }, 200);      
          this.gesture.triggered = true;  
        }
      }
	  }
    }
  },
  
  touchEnd: function(event) {
    event.preventDefault();
    
    // One finger gesture, if the action hasn't already been triggered (see touchMove)
    if(!this.gesture.triggered && this.gesture.touches==1) {
      // Tap - regular click
      if(this.gesture._start._x == this.gesture._stop._x && this.gesture._start._y == this.gesture._stop._y) {
        XbmcRequest.send('JSON-RPC','Input.Select'); // Ok
      }
      // Gesture
      else {
        if(this.gesture.direction == 'horizontal' && (this.gesture._start._x > this.gesture._stop._x) && ((this.gesture._start._x - this.gesture._threshold._x) >= this.gesture._stop._x))  {
          XbmcRequest.send('JSON-RPC','Input.right'); // Left
        }
        else if(this.gesture.direction == 'horizontal' && (this.gesture._start._x < this.gesture._stop._x) && ((this.gesture._start._x+this.gesture._threshold._x) <= this.gesture._stop._x)) {
          XbmcRequest.send('JSON-RPC','Input.left'); // Right
        }
        else if(this.gesture.direction == 'horizontal' && (this.gesture._start._x > this.gesture._stop._x) && ((this.gesture._start._x - this.gesture._threshold2._x) >= this.gesture._stop._x)) {
          XbmcRequest.send('JSON-RPC','Input.right'); // Left
          XbmcRequest.send('JSON-RPC','Input.right'); // Left
        }
        else if(this.gesture.direction == 'horizontal' && (this.gesture._start._x < this.gesture._stop._x) && ((this.gesture._start._x+this.gesture._threshold2._x) <= this.gesture._stop._x)) {
          XbmcRequest.send('JSON-RPC','Input.left'); // Right
          XbmcRequest.send('JSON-RPC','Input.left'); // Right
		  }
        else {
          XbmcRequest.send('JSON-RPC','Input.Select'); // Ok
        }
      }
    }
    // Two fingers gesture
    else if(!this.gesture.triggered && this.gesture.touches==2) {
      // Tap - regular click
      if(this.gesture._start._x == this.gesture._stop._x && this.gesture._start._y == this.gesture._stop._y) {
        XbmcRequest.send('JSON-RPC','Input.ContextMenu');  // Context menu
      }
	  else {
		// 2 finger swipe left
        if(this.gesture.direction == 'horizontal' && (this.gesture._start._x > this.gesture._stop._x) && ((this.gesture._start._x - this.gesture._threshold._x) >= this.gesture._stop._x))  {
          XbmcRequest.send('JSON-RPC','Input.Back');  // back
        }
		// 2 finger swipe right
        else if(this.gesture.direction == 'horizontal' && (this.gesture._start._x < this.gesture._stop._x) && ((this.gesture._start._x+this.gesture._threshold._x) <= this.gesture._stop._x)) {
			if($('.links').hasClass('hidden')){
			$('.links').removeClass('hidden');
			} else {
			$('.links').addClass('hidden'); }
        }
        else if(this.gesture.direction == 'vertical' && (this.gesture._start._y < this.gesture._stop._y) && ((this.gesture._start._y+this.gesture._threshold._y) <= this.gesture._stop._y)) {
          XbmcRequest.send('JSON-RPC','Application.SetVolume','{\'volume\':\'decrement\'}'); // Vol Down
          XbmcRequest.send('JSON-RPC','Application.SetVolume','{\'volume\':\'decrement\'}'); // Vol Down
          XbmcRequest.send('JSON-RPC','Application.SetVolume','{\'volume\':\'decrement\'}'); // Vol Down
   	    }
        if(this.gesture.direction == 'vertical' && (this.gesture._start._y > this.gesture._stop._y) && ((this.gesture._start._y - this.gesture._threshold._y) >= this.gesture._stop._y)) {
          XbmcRequest.send('JSON-RPC','Application.SetVolume','{\'volume\':\'increment\'}'); // Vol Up
          XbmcRequest.send('JSON-RPC','Application.SetVolume','{\'volume\':\'increment\'}'); // Vol Up
          XbmcRequest.send('JSON-RPC','Application.SetVolume','{\'volume\':\'increment\'}'); // Vol Up
        }		
       }
    }	   
    else {
    // Actually we don't support gestures with 3 fingers or more
    }  

	
    // Initialize values for the next event
    this.gesture.touches = 0;
    this.gesture._start = { _x: 0, _y: 0 };
    this.gesture._stop = { _x: 0, _y: 0 };
    this.gesture.is_scrolling = false;
    this.gesture.direction = null;
    this.gesture.triggered = false;
  },
  
  touchCancel: function(event) {
    event.preventDefault();
  }
}


/* Remote */
var Remote = {
  gestures_state: false,
  
  init: function() {
    // Init the gestures mode (listeners, vars)
    RemoteGestures.init('gestures_logo');
    
    // Init gestures toggle button
    this.gestures_state = getCookie('gestures') == 'true' ? true : false;
    iPhoneUI.toggleButton(document.getElementById('gestures_toggle'), this.gestures_state);
    
    // Show the controller image (or not)
    this.showController(this.gestures_state);
  },
  
  // Apply gestures mode (when selected in "settings')
  gestures: function() {
    this.gestures_state = this.gestures_state ? false : true;
    
    // Update the toggle button
    iPhoneUI.toggleButton(document.getElementById('gestures_toggle'), this.gestures_state);
    
    // Set the cookie
    setCookie('gestures', ''+ this.gestures_state +'');
    
    // Update the view
    this.showController(this.gestures_state);
  },
  
  /* Show the controller or the gestures mode logo */
  showController: function(gestures_state) {
    gestures_logo = document.getElementById('gestures_logo');
    controller_pad = document.getElementById('controller_pad');
    
    if(gestures_state == true) {
      removeClass(gestures_logo, 'hidden');
      addClass(controller_pad, 'hidden');
	}
    else {
      removeClass(controller_pad, 'hidden');
      addClass(gestures_logo, 'hidden');
    }
  }
}

/* Main */
window.onload = function() {
  iPhoneUI.init();
  Remote.init();
iPhoneUI.orientation();
  };

window.onorientationchange = function() {
  iPhoneUI.orientation();
};

function reSize() {
  iPhoneUI.orientation();
};

var resizeTimer;
$(window).resize(function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reSize, 100);
});