// Utility function
function Util () {};

/* class manipulation functions */
Util.hasClass = function(el, className) {
	return el.classList.contains(className);
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	el.classList.add(classList[0]);
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	el.classList.remove(classList[0]);	
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* DOM manipulation */
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < children.length; i++) {
    if (Util.hasClass(children[i], className)) childrenByClass.push(children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length;

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* Animate height of an element */
Util.setHeight = function(start, to, element, duration, cb, timeFunction) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = parseInt((progress/duration)*change + start);
    if(timeFunction) {
      val = Math[timeFunction](progress, start, to - start, duration);
    }
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	if(cb) cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* Smooth Scroll */
Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* Move Focus */
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* Misc */

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* Animation curves */
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */

// make focus ring visible only for keyboard navigation (i.e., tab key) 
(function() {
  var focusTab = document.getElementsByClassName('js-tab-focus'),
    shouldInit = false,
    outlineStyle = false,
    eventDetected = false;

  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusStyle(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
    outlineStyle = false;
    eventDetected = true;
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusStyle(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
    outlineStyle = true;
  };

  function resetFocusStyle(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };

  function initFocusTabs() {
    if(shouldInit) {
      if(eventDetected) resetFocusStyle(outlineStyle);
      return;
    }
    shouldInit = focusTab.length > 0;
    window.addEventListener('mousedown', detectClick);
  };

  initFocusTabs();
  window.addEventListener('initFocusTabs', initFocusTabs);
}());

function resetFocusTabsStyle() {
  window.dispatchEvent(new CustomEvent('initFocusTabs'));
};
// File#: _1_accordion
// Usage: codyhouse.co/license
(function () {
	var Accordion = function (element) {
		this.element = element;
		this.items = getChildrenByClassName(this.element, 'js-accordion__item');
		this.version = this.element.getAttribute('data-version') ? '-' + this.element.getAttribute('data-version') : '';
		this.showClass = 'accordion' + this.version + '__item--is-open';
		this.animateHeight = (this.element.getAttribute('data-animation') == 'on');
		this.multiItems = !(this.element.getAttribute('data-multi-items') == 'off');
		// deep linking options
		this.deepLinkOn = this.element.getAttribute('data-deep-link') == 'on';
		// init accordion
		this.initAccordion();
	};

	Accordion.prototype.initAccordion = function () {
		//set initial aria attributes
		for (var i = 0; i < this.items.length; i++) {
			var button = this.items[i].getElementsByTagName('button')[0],
				content = this.items[i].getElementsByClassName('js-accordion__panel')[0],
				isOpen = this.items[i].classList.contains(this.showClass) ? 'true' : 'false';
			button.setAttribute('aria-expanded', isOpen);
			button.setAttribute('aria-controls', 'accordion-content-' + i);
			button.setAttribute('id', 'accordion-header-' + i);
			button.classList.add('js-accordion__trigger');
			content.setAttribute('aria-labelledby', 'accordion-header-' + i);
			content.setAttribute('id', 'accordion-content-' + i);
		}

		//listen for Accordion events
		this.initAccordionEvents();

		// check deep linking option
		this.initDeepLink();
	};

	Accordion.prototype.initAccordionEvents = function () {
		var self = this;

		this.element.addEventListener('click', function (event) {
			var trigger = event.target.closest('.js-accordion__trigger');
			//check index to make sure the click didn't happen inside a children accordion
			if (trigger && Array.prototype.indexOf.call(self.items, trigger.parentElement) >= 0) self.triggerAccordion(trigger);
		});
	};

	Accordion.prototype.triggerAccordion = function (trigger) {
		var bool = (trigger.getAttribute('aria-expanded') === 'true');

		this.animateAccordion(trigger, bool, false);

		if (!bool && this.deepLinkOn) {
			history.replaceState(null, '', '#' + trigger.getAttribute('aria-controls'));
		}
	};

	Accordion.prototype.animateAccordion = function (trigger, bool, deepLink) {
		var self = this;
		var item = trigger.closest('.js-accordion__item'),
			content = item.getElementsByClassName('js-accordion__panel')[0],
			ariaValue = bool ? 'false' : 'true';

		if (!bool) item.classList.add(this.showClass);
		trigger.setAttribute('aria-expanded', ariaValue);
		self.resetContentVisibility(item, content, bool);

		if (!this.multiItems && !bool || deepLink) this.closeSiblings(item);
	};

	Accordion.prototype.resetContentVisibility = function (item, content, bool) {
		item.classList.toggle(this.showClass, !bool);
		content.removeAttribute("style");
		if (bool && !this.multiItems) { // accordion item has been closed -> check if there's one open to move inside viewport 
			this.moveContent();
		}
	};

	Accordion.prototype.closeSiblings = function (item) {
		//if only one accordion can be open -> search if there's another one open
		var index = Array.prototype.indexOf.call(this.items, item);
		for (var i = 0; i < this.items.length; i++) {
			if (this.items[i].classList.contains(this.showClass) && i != index) {
				this.animateAccordion(this.items[i].getElementsByClassName('js-accordion__trigger')[0], true, false);
				return false;
			}
		}
	};

	Accordion.prototype.moveContent = function () { // make sure title of the accordion just opened is inside the viewport
		var openAccordion = this.element.getElementsByClassName(this.showClass);
		if (openAccordion.length == 0) return;
		var boundingRect = openAccordion[0].getBoundingClientRect();
		if (boundingRect.top < 0 || boundingRect.top > window.innerHeight) {
			var windowScrollTop = window.scrollY || document.documentElement.scrollTop;
			window.scrollTo(0, boundingRect.top + windowScrollTop);
		}
	};

	Accordion.prototype.initDeepLink = function () {
		if (!this.deepLinkOn) return;
		var hash = window.location.hash.substr(1);
		if (!hash || hash == '') return;
		var trigger = this.element.querySelector('.js-accordion__trigger[aria-controls="' + hash + '"]');
		if (trigger && trigger.getAttribute('aria-expanded') !== 'true') {
			this.animateAccordion(trigger, false, true);
			setTimeout(function () { trigger.scrollIntoView(true); });
		}
	};

	function getChildrenByClassName(el, className) {
		var children = el.children,
			childrenByClass = [];
		for (var i = 0; i < children.length; i++) {
			if (children[i].classList.contains(className)) childrenByClass.push(children[i]);
		}
		return childrenByClass;
	};

	window.Accordion = Accordion;

	//initialize the Accordion objects
	var accordions = document.getElementsByClassName('js-accordion');
	if (accordions.length > 0) {
		for (var i = 0; i < accordions.length; i++) {
			(function (i) { new Accordion(accordions[i]); })(i);
		}
	}
}());
// File#: _1_anim-menu-btn
// Usage: codyhouse.co/license
(function() {
	var menuBtns = document.getElementsByClassName('js-anim-menu-btn');
	if( menuBtns.length > 0 ) {
		for(var i = 0; i < menuBtns.length; i++) {(function(i){
			initMenuBtn(menuBtns[i]);
		})(i);}

		function initMenuBtn(btn) {
			btn.addEventListener('click', function(event){	
				event.preventDefault();
				var status = !btn.classList.contains('anim-menu-btn--state-b');
				btn.classList.toggle('anim-menu-btn--state-b', status);
				// emit custom event
				var event = new CustomEvent('anim-menu-btn-clicked', {detail: status});
				btn.dispatchEvent(event);
			});
		};
	}
}());
// File#: _1_back-to-top
// Usage: codyhouse.co/license
(function() {
  var backTop = document.getElementsByClassName('js-back-to-top')[0];
  if( backTop ) {
	var dataElement = backTop.getAttribute('data-element');
	var scrollElement = dataElement ? document.querySelector(dataElement) : window;
	var scrollOffsetInit = parseInt(backTop.getAttribute('data-offset-in')) || parseInt(backTop.getAttribute('data-offset')) || 0, //show back-to-top if scrolling > scrollOffset
	  scrollOffsetOutInit = parseInt(backTop.getAttribute('data-offset-out')) || 0, 
	  scrollOffset = 0,
	  scrollOffsetOut = 0,
	  scrolling = false;

	// check if target-in/target-out have been set
	var targetIn = backTop.getAttribute('data-target-in') ? document.querySelector(backTop.getAttribute('data-target-in')) : false,
	  targetOut = backTop.getAttribute('data-target-out') ? document.querySelector(backTop.getAttribute('data-target-out')) : false;

	updateOffsets();
	
	//detect click on back-to-top link
	backTop.addEventListener('click', function(event) {
	  event.preventDefault();
	  if(!window.requestAnimationFrame) {
		scrollElement.scrollTo(0, 0);
	  } else {
		dataElement ? scrollElement.scrollTo({top: 0, behavior: 'smooth'}) : window.scrollTo({top: 0, behavior: 'smooth'});
	  } 
	  //move the focus to the #top-element - don't break keyboard navigation
	  moveFocus(document.getElementById(backTop.getAttribute('href').replace('#', '')));
	});
	
	//listen to the window scroll and update back-to-top visibility
	checkBackToTop();
	if (scrollOffset > 0 || scrollOffsetOut > 0) {
	  scrollElement.addEventListener("scroll", function(event) {
		if( !scrolling ) {
		  scrolling = true;
		  (!window.requestAnimationFrame) ? setTimeout(function(){checkBackToTop();}, 250) : window.requestAnimationFrame(checkBackToTop);
		}
	  });
	}

	function checkBackToTop() {
	  updateOffsets();
	  var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
	  if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
	  var condition =  windowTop >= scrollOffset;
	  if(scrollOffsetOut > 0) {
		condition = (windowTop >= scrollOffset) && (window.innerHeight + windowTop < scrollOffsetOut);
	  }
	  backTop.classList.toggle('back-to-top--is-visible', condition);
	  scrolling = false;
	}

	function updateOffsets() {
	  scrollOffset = getOffset(targetIn, scrollOffsetInit, true);
	  scrollOffsetOut = getOffset(targetOut, scrollOffsetOutInit);
	}

	function getOffset(target, startOffset, bool) {
	  var offset = 0;
	  if(target) {
		var windowTop = scrollElement.scrollTop || document.documentElement.scrollTop;
		if(!dataElement) windowTop = window.scrollY || document.documentElement.scrollTop;
		var boundingClientRect = target.getBoundingClientRect();
		offset = bool ? boundingClientRect.bottom : boundingClientRect.top;
		offset = offset + windowTop;
	  }
	  if(startOffset && startOffset) {
		offset = offset + parseInt(startOffset);
	  }
	  return offset;
	}

	function moveFocus(element) {
	  if( !element ) element = document.getElementsByTagName("body")[0];
	  element.focus();
	  if (document.activeElement !== element) {
		element.setAttribute('tabindex','-1');
		element.focus();
	  }
	};
  }
}());
// File#: _1_language-picker
// Usage: codyhouse.co/license
function nywd_get_language_url(langCode) {
	const base = window.location.origin;
	const path = window.location.pathname.split('/').at(-1);
	if (langCode == "en") {
		return `${base}/${path}`;
	} else {
		return `${base}/${langCode}/${path}`
	}
}

(function () {

	var mobileLanguageSwitcher = document.querySelector('.js-mobile-language-picker');
	console.log(mobileLanguageSwitcher);
	mobileLanguageSwitcher.addEventListener('change', (e) => {
		return window.location.replace(nywd_get_language_url(e.target.value));
	})

	var LanguagePicker = function (element) {
		this.element = element;
		this.select = this.element.getElementsByTagName('select')[0];
		this.options = this.select.getElementsByTagName('option');
		this.selectedOption = getSelectedOptionText(this);
		this.pickerId = this.select.getAttribute('id');
		this.trigger = false;
		this.dropdown = true;
		this.firstLanguage = false;
		// dropdown arrow inside the button element
		this.arrowSvgPath = '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 64 64" viewBox="0 0 64 64" id="arrow"><path fill="#111111" d="m-218.7-308.6 2-2 11.7 11.8 11.7-11.8 2 2-13.7 13.7-13.7-13.7" transform="translate(237 335)"></path></svg>';
		this.globeSvgPath = '<svg viewBox="0 0 16 16"></path></svg>';

		initLanguagePicker(this);
		initLanguagePickerEvents(this);
	};

	function initLanguagePicker(picker) {
		// create the HTML for the custom dropdown element
		picker.element.insertAdjacentHTML('beforeend', initButtonPicker(picker) + initListPicker(picker));

		// save picker elements
		picker.dropdown = picker.element.getElementsByClassName('language-picker__dropdown')[0];
		picker.languages = picker.dropdown.getElementsByClassName('language-picker__item');
		picker.firstLanguage = picker.languages[0];
		picker.trigger = picker.element.getElementsByClassName('language-picker__button')[0];
	};

	function initLanguagePickerEvents(picker) {
		// make sure to add the icon class to the arrow dropdown inside the button element
		var svgs = picker.trigger.getElementsByTagName('svg');
		svgs[0].classList.add('icon');
		svgs[1].classList.add('icon');
		// language selection in dropdown
		// ⚠️ Important: you need to modify this function in production
		initLanguageSelection(picker);

		// click events
		picker.trigger.addEventListener('click', function () {
			toggleLanguagePicker(picker, false);
		});
		// keyboard navigation
		picker.dropdown.addEventListener('keydown', function (event) {
			if (event.keyCode && event.keyCode == 38 || event.key && event.key.toLowerCase() == 'arrowup') {
				keyboardNavigatePicker(picker, 'prev');
			} else if (event.keyCode && event.keyCode == 40 || event.key && event.key.toLowerCase() == 'arrowdown') {
				keyboardNavigatePicker(picker, 'next');
			}
		});
	};

	function toggleLanguagePicker(picker, bool) {
		var ariaExpanded;
		if (bool) {
			ariaExpanded = bool;
		} else {
			ariaExpanded = picker.trigger.getAttribute('aria-expanded') == 'true' ? 'false' : 'true';
		}
		picker.trigger.setAttribute('aria-expanded', ariaExpanded);
		if (ariaExpanded == 'true') {
			picker.firstLanguage.focus(); // fallback if transition is not supported
			picker.dropdown.addEventListener('transitionend', function cb() {
				picker.firstLanguage.focus();
				picker.dropdown.removeEventListener('transitionend', cb);
			});
			// place dropdown
			placeDropdown(picker);
		}
	};

	function placeDropdown(picker) {
		var triggerBoundingRect = picker.trigger.getBoundingClientRect();
		picker.dropdown.classList.toggle('language-picker__dropdown--right', (window.innerWidth < triggerBoundingRect.left + picker.dropdown.offsetWidth));
		picker.dropdown.classList.toggle('language-picker__dropdown--up', (window.innerHeight < triggerBoundingRect.bottom + picker.dropdown.offsetHeight));
	};

	function checkLanguagePickerClick(picker, target) { // if user clicks outside the language picker -> close it
		if (!picker.element.contains(target)) toggleLanguagePicker(picker, 'false');
	};

	function moveFocusToPickerTrigger(picker) {
		if (picker.trigger.getAttribute('aria-expanded') == 'false') return;
		if (document.activeElement.closest('.language-picker__dropdown') == picker.dropdown) picker.trigger.focus();
	};

	function initButtonPicker(picker) { // create the button element -> picker trigger
		// check if we need to add custom classes to the button trigger
		var customClasses = picker.element.getAttribute('data-trigger-class') ? ' ' + picker.element.getAttribute('data-trigger-class') : '';

		var button = '<button class="language-picker__button' + customClasses + '" aria-label="' + picker.select.value + ' ' + picker.element.getElementsByTagName('label')[0].textContent + '" aria-expanded="false" aria-controls="' + picker.pickerId + '-dropdown">';
		button = button + '<span aria-hidden="true" class="language-picker__label language-picker__flag language-picker__flag--' + picker.select.value + '">' + picker.globeSvgPath + '<em>' + picker.selectedOption + '</em>';
		button = button + picker.arrowSvgPath + '</span>';
		return button + '</button>';
	};

	function initListPicker(picker) { // create language picker dropdown
		var list = '<div class="language-picker__dropdown" aria-describedby="' + picker.pickerId + '-description" id="' + picker.pickerId + '-dropdown">';
		list = list + '<p class="sr-only" id="' + picker.pickerId + '-description">' + picker.element.getElementsByTagName('label')[0].textContent + '</p>';
		list = list + '<ul class="language-picker__list" role="listbox">';
		for (var i = 0; i < picker.options.length; i++) {
			var selected = picker.options[i].selected ? ' aria-selected="true"' : '',
				language = picker.options[i].getAttribute('lang');
			list = list + '<li><a lang="' + language + '" hreflang="' + language + '" href="' + getLanguageUrl(picker.options[i]) + '"' + selected + ' role="option" data-value="' + picker.options[i].value + '" class="language-picker__item language-picker__flag language-picker__flag--' + picker.options[i].value + '"><span>' + picker.options[i].text + '</span></a></li>';
		};
		return list;
	};

	function getSelectedOptionText(picker) { // used to initialize the label of the picker trigger button
		var label = '';
		if ('selectedIndex' in picker.select) {
			label = picker.options[picker.select.selectedIndex].text;
		} else {
			label = picker.select.querySelector('option[selected]').text;
		}
		return label;
	};

	function getLanguageUrl(option) {
		// ⚠️ Important: You should replace this return value with the real link to your website in the selected language
		// option.value gives you the value of the language that you can use to create your real url (e.g, 'english' or 'italiano')
		return nywd_get_language_url(option.lang)
	};

	function initLanguageSelection(picker) {
		picker.element.getElementsByClassName('language-picker__list')[0].addEventListener('click', function (event) {
			var language = event.target.closest('.language-picker__item');
			if (!language) return;

			if (language.hasAttribute('aria-selected') && language.getAttribute('aria-selected') == 'true') {
				// selecting the same language
				event.preventDefault();
				picker.trigger.setAttribute('aria-expanded', 'false'); // hide dropdown
			}
		});
	};

	function keyboardNavigatePicker(picker, direction) {
		var index = Array.prototype.indexOf.call(picker.languages, document.activeElement);
		index = (direction == 'next') ? index + 1 : index - 1;
		if (index < 0) index = picker.languages.length - 1;
		if (index >= picker.languages.length) index = 0;
		elMoveFocus(picker.languages[index]);
	};

	function elMoveFocus(element) {
		element.focus();
		if (document.activeElement !== element) {
			element.setAttribute('tabindex', '-1');
			element.focus();
		}
	};

	//initialize the LanguagePicker objects
	var languagePicker = document.getElementsByClassName('js-language-picker');
	if (languagePicker.length > 0) {
		var pickerArray = [];
		for (var i = 0; i < languagePicker.length; i++) {
			(function (i) { pickerArray.push(new LanguagePicker(languagePicker[i])); })(i);
		}

		// listen for key events
		window.addEventListener('keyup', function (event) {
			if (event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
				// close language picker on 'Esc'
				pickerArray.forEach(function (element) {
					moveFocusToPickerTrigger(element); // if focus is within dropdown, move it to dropdown trigger
					toggleLanguagePicker(element, 'false'); // close dropdown
				});
			}
		});
		// close language picker when clicking outside it
		window.addEventListener('click', function (event) {
			pickerArray.forEach(function (element) {
				checkLanguagePickerClick(element, event.target);
			});
		});
	}
}());
if(!Util) function Util () {};

Util.hasClass = function(el, className) {
  return el.classList.contains(className);
};

Util.addClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.add(classList[0]);
  if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
  var classList = className.split(' ');
  el.classList.remove(classList[0]);
  if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName('body')[0];
  element.focus();
  if (document.activeElement !== element) {
	element.setAttribute('tabindex','-1');
	element.focus();
  }
};


Util.cssSupports = function(property, value) {
  return CSS.supports(property, value);
};

// File#: _1_off-canvas-content
// Usage: codyhouse.co/license
(function() {
	var OffCanvas = function(element) {
		this.element = element;
		this.wrapper = document.getElementsByClassName('js-off-canvas')[0];
		this.main = document.getElementsByClassName('off-canvas__main')[0];
		this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
		this.closeBtn = this.element.getElementsByClassName('js-off-canvas__close-btn');
		this.selectedTrigger = false;
		this.firstFocusable = null;
		this.lastFocusable = null;
		this.animating = false;
		initOffCanvas(this);
	};	

	function initOffCanvas(panel) {
		panel.element.setAttribute('aria-hidden', 'true');
		for(var i = 0 ; i < panel.triggers.length; i++) { // listen to the click on off-canvas content triggers
			panel.triggers[i].addEventListener('click', function(event){
				panel.selectedTrigger = event.currentTarget;
				event.preventDefault();
				togglePanel(panel);
			});
		}

		// listen to the triggerOpenPanel event -> open panel without a trigger button
		panel.element.addEventListener('triggerOpenPanel', function(event){
			if(event.detail) panel.selectedTrigger = event.detail;
			openPanel(panel);
		});
		// listen to the triggerClosePanel event -> open panel without a trigger button
		panel.element.addEventListener('triggerClosePanel', function(event){
			closePanel(panel);
		});
	};

	function togglePanel(panel) {
		var status = (panel.element.getAttribute('aria-hidden') == 'true') ? 'close' : 'open';
		if(status == 'close') openPanel(panel);
		else closePanel(panel);
	};

	function openPanel(panel) {
		if(panel.animating) return; // already animating
		emitPanelEvents(panel, 'openPanel', '');
		panel.animating = true;
		panel.element.setAttribute('aria-hidden', 'false');
		panel.wrapper.classList.add('off-canvas--visible');
		getFocusableElements(panel);
		var transitionEl = panel.element;
		if(panel.closeBtn.length > 0 && !panel.closeBtn[0].classList.contains('js-off-canvas__a11y-close-btn')) transitionEl = 	panel.closeBtn[0];
		transitionEl.addEventListener('transitionend', function cb(){
			// wait for the end of transition to move focus and update the animating property
			panel.animating = false;
			Util.moveFocus(panel.element);
			transitionEl.removeEventListener('transitionend', cb);
		});
		initPanelEvents(panel);
	};

	function closePanel(panel, bool) {
		if(panel.animating) return;
		panel.animating = true;
		panel.element.setAttribute('aria-hidden', 'true');
		panel.wrapper.classList.remove('off-canvas--visible');
		panel.main.addEventListener('transitionend', function cb(){
			panel.animating = false;
			if(panel.selectedTrigger) panel.selectedTrigger.focus();
			setTimeout(function(){panel.selectedTrigger = false;}, 10);
			panel.main.removeEventListener('transitionend', cb);
		});
		cancelPanelEvents(panel);
		emitPanelEvents(panel, 'closePanel', bool);
	};

	function initPanelEvents(panel) { //add event listeners
		panel.element.addEventListener('keydown', handleEvent.bind(panel));
		panel.element.addEventListener('click', handleEvent.bind(panel));
	};

	function cancelPanelEvents(panel) { //remove event listeners
		panel.element.removeEventListener('keydown', handleEvent.bind(panel));
		panel.element.removeEventListener('click', handleEvent.bind(panel));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'keydown':
				initKeyDown(this, event);
				break;
			case 'click':
				initClick(this, event);
				break;
		}
	};

	function initClick(panel, event) { // close panel when clicking on close button
		if( !event.target.closest('.js-off-canvas__close-btn')) return;
		event.preventDefault();
		closePanel(panel, 'close-btn');
	};

	function initKeyDown(panel, event) {
		if( event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape' ) {
			//close off-canvas panel on esc
			closePanel(panel, 'key');
		} else if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
			//trap focus inside panel
			trapFocus(panel, event);
		}
	};

	function trapFocus(panel, event) {
		if( panel.firstFocusable == document.activeElement && event.shiftKey) {
			//on Shift+Tab -> focus last focusable element when focus moves out of panel
			event.preventDefault();
			panel.lastFocusable.focus();
		}
		if( panel.lastFocusable == document.activeElement && !event.shiftKey) {
			//on Tab -> focus first focusable element when focus moves out of panel
			event.preventDefault();
			panel.firstFocusable.focus();
		}
	};

	function getFocusableElements(panel) { //get all focusable elements inside the off-canvas content
		var allFocusable = panel.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
		getFirstVisible(panel, allFocusable);
		getLastVisible(panel, allFocusable);
	};

	function getFirstVisible(panel, elements) { //get first visible focusable element inside the off-canvas content
		for(var i = 0; i < elements.length; i++) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				panel.firstFocusable = elements[i];
				return true;
			}
		}
	};

	function getLastVisible(panel, elements) { //get last visible focusable element inside the off-canvas content
		for(var i = elements.length - 1; i >= 0; i--) {
			if( elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length ) {
				panel.lastFocusable = elements[i];
				return true;
			}
		}
	};

	function emitPanelEvents(panel, eventName, target) { // emit custom event
		var event = new CustomEvent(eventName, {detail: target});
		panel.element.dispatchEvent(event);
	};

	function moveFocusFn(element) {
	element.focus();
	if (document.activeElement !== element) {
	  element.setAttribute('tabindex','-1');
	  element.focus();
	}
  };

	//initialize the OffCanvas objects
	var offCanvas = document.getElementsByClassName('js-off-canvas__panel');
	if( offCanvas.length > 0 ) {
		for( var i = 0; i < offCanvas.length; i++) {
			(function(i){new OffCanvas(offCanvas[i]);})(i);
		}
	}
}());
// File#: _1_pre-header
// Usage: codyhouse.co/license
(function() {
	var preHeader = document.getElementsByClassName('js-pre-header');
	if(preHeader.length > 0) {
		for(var i = 0; i < preHeader.length; i++) {
			(function(i){ addPreHeaderEvent(preHeader[i]);})(i);
		}

		function addPreHeaderEvent(element) {
			var close = element.getElementsByClassName('js-pre-header__close-btn')[0];
			if(close) {
				close.addEventListener('click', function(event) {
					event.preventDefault();
					element.classList.add('pre-header--is-hidden');
				});
			}
		}
	}
}());
// File#: _1_swipe-content
(function() {
	var SwipeContent = function(element) {
		this.element = element;
		this.delta = [false, false];
		this.dragging = false;
		this.intervalId = false;
		initSwipeContent(this);
	};

	function initSwipeContent(content) {
		content.element.addEventListener('mousedown', handleEvent.bind(content));
		content.element.addEventListener('touchstart', handleEvent.bind(content), {passive: true});
	};

	function initDragging(content) {
		//add event listeners
		content.element.addEventListener('mousemove', handleEvent.bind(content));
		content.element.addEventListener('touchmove', handleEvent.bind(content), {passive: true});
		content.element.addEventListener('mouseup', handleEvent.bind(content));
		content.element.addEventListener('mouseleave', handleEvent.bind(content));
		content.element.addEventListener('touchend', handleEvent.bind(content));
	};

	function cancelDragging(content) {
		//remove event listeners
		if(content.intervalId) {
			(!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
			content.intervalId = false;
		}
		content.element.removeEventListener('mousemove', handleEvent.bind(content));
		content.element.removeEventListener('touchmove', handleEvent.bind(content));
		content.element.removeEventListener('mouseup', handleEvent.bind(content));
		content.element.removeEventListener('mouseleave', handleEvent.bind(content));
		content.element.removeEventListener('touchend', handleEvent.bind(content));
	};

	function handleEvent(event) {
		switch(event.type) {
			case 'mousedown':
			case 'touchstart':
				startDrag(this, event);
				break;
			case 'mousemove':
			case 'touchmove':
				drag(this, event);
				break;
			case 'mouseup':
			case 'mouseleave':
			case 'touchend':
				endDrag(this, event);
				break;
		}
	};

	function startDrag(content, event) {
		content.dragging = true;
		// listen to drag movements
		initDragging(content);
		content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
		// emit drag start event
		emitSwipeEvents(content, 'dragStart', content.delta, event.target);
	};

	function endDrag(content, event) {
		cancelDragging(content);
		// credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
		var dx = parseInt(unify(event).clientX), 
		dy = parseInt(unify(event).clientY);
	  
	  // check if there was a left/right swipe
		if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
		var s = getSign(dx - content.delta[0]);
			
			if(Math.abs(dx - content.delta[0]) > 30) {
				(s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);	
			}
		
		content.delta[0] = false;
	  }
		// check if there was a top/bottom swipe
	  if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
		  var y = getSign(dy - content.delta[1]);

		  if(Math.abs(dy - content.delta[1]) > 30) {
			(y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
		}

		content.delta[1] = false;
	  }
		// emit drag end event
	  emitSwipeEvents(content, 'dragEnd', [dx, dy]);
	  content.dragging = false;
	};

	function drag(content, event) {
		if(!content.dragging) return;
		// emit dragging event with coordinates
		(!window.requestAnimationFrame) 
			? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250) 
			: content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
	};

	function emitDrag(event) {
		emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
	};

	function unify(event) { 
		// unify mouse and touch events
		return event.changedTouches ? event.changedTouches[0] : event; 
	};

	function emitSwipeEvents(content, eventName, detail, el) {
		var trigger = false;
		if(el) trigger = el;
		// emit event with coordinates
		var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
		content.element.dispatchEvent(event);
	};

	function getSign(x) {
		if(!Math.sign) {
			return ((x > 0) - (x < 0)) || +x;
		} else {
			return Math.sign(x);
		}
	};

	window.SwipeContent = SwipeContent;
	
	//initialize the SwipeContent objects
	var swipe = document.getElementsByClassName('js-swipe-content');
	if( swipe.length > 0 ) {
		for( var i = 0; i < swipe.length; i++) {
			(function(i){new SwipeContent(swipe[i]);})(i);
		}
	}
}());
// File#: _2_carousel
// Usage: codyhouse.co/license
(function() {
  var Carousel = function(opts) {
	this.options = extendProps(Carousel.defaults , opts);
	this.element = this.options.element;
	this.listWrapper = this.element.getElementsByClassName('carousel__wrapper')[0];
	this.list = this.element.getElementsByClassName('carousel__list')[0];
	this.items = this.element.getElementsByClassName('carousel__item');
	this.initItems = []; // store only the original elements - will need this for cloning
	this.itemsNb = this.items.length; //original number of items
	this.visibItemsNb = 1; // tot number of visible items
	this.itemsWidth = 1; // this will be updated with the right width of items
	this.itemOriginalWidth = false; // store the initial width to use it on resize
	this.selectedItem = 0; // index of first visible item 
	this.translateContainer = 0; // this will be the amount the container has to be translated each time a new group has to be shown (negative)
	this.containerWidth = 0; // this will be used to store the total width of the carousel (including the overflowing part)
	this.ariaLive = false;
	// navigation
	this.controls = this.element.getElementsByClassName('js-carousel__control');
	this.animating = false;
	// autoplay
	this.autoplayId = false;
	this.autoplayPaused = false;
	//drag
	this.dragStart = false;
	// resize
	this.resizeId = false;
	// used to re-initialize js
	this.cloneList = [];
	// store items min-width
	this.itemAutoSize = false;
	// store translate value (loop = off)
	this.totTranslate = 0;
	// modify loop option if navigation is on
	if(this.options.nav) this.options.loop = false;
	// store counter elements (if present)
	this.counter = this.element.getElementsByClassName('js-carousel__counter');
	this.counterTor = this.element.getElementsByClassName('js-carousel__counter-tot');
	initCarouselLayout(this); // get number visible items + width items
	setItemsWidth(this, true); 
	insertBefore(this, this.visibItemsNb); // insert clones before visible elements
	updateCarouselClones(this); // insert clones after visible elements
	resetItemsTabIndex(this); // make sure not visible items are not focusable
	initAriaLive(this); // set aria-live region for SR
	initCarouselEvents(this); // listen to events
	initCarouselCounter(this);
	this.element.classList.add('carousel--loaded');
  };
  
  //public carousel functions
  Carousel.prototype.showNext = function() {
	showNextItems(this);
  };

  Carousel.prototype.showPrev = function() {
	showPrevItems(this);
  };

  Carousel.prototype.startAutoplay = function() {
	startAutoplay(this);
  };

  Carousel.prototype.pauseAutoplay = function() {
	pauseAutoplay(this);
  };
  
  //private carousel functions
  function initCarouselLayout(carousel) {
	// evaluate size of single elements + number of visible elements
	var itemStyle = window.getComputedStyle(carousel.items[0]),
	  containerStyle = window.getComputedStyle(carousel.listWrapper),
	  itemWidth = parseFloat(itemStyle.getPropertyValue('width')),
	  itemMargin = parseFloat(itemStyle.getPropertyValue('margin-right')),
	  containerPadding = parseFloat(containerStyle.getPropertyValue('padding-left')),
	  containerWidth = parseFloat(containerStyle.getPropertyValue('width'));

	if(!carousel.itemAutoSize) {
	  carousel.itemAutoSize = itemWidth;
	}

	// if carousel.listWrapper is hidden -> make sure to retrieve the proper width
	containerWidth = getCarouselWidth(carousel, containerWidth);

	if( !carousel.itemOriginalWidth) { // on resize -> use initial width of items to recalculate 
	  carousel.itemOriginalWidth = itemWidth;
	} else {
	  itemWidth = carousel.itemOriginalWidth;
	}

	if(carousel.itemAutoSize) {
	  carousel.itemOriginalWidth = parseInt(carousel.itemAutoSize);
	  itemWidth = carousel.itemOriginalWidth;
	}
	// make sure itemWidth is smaller than container width
	if(containerWidth < itemWidth) {
	  carousel.itemOriginalWidth = containerWidth
	  itemWidth = carousel.itemOriginalWidth;
	}
	// get proper width of elements
	carousel.visibItemsNb = parseInt((containerWidth - 2*containerPadding + itemMargin)/(itemWidth+itemMargin));
	carousel.itemsWidth = parseFloat( (((containerWidth - 2*containerPadding + itemMargin)/carousel.visibItemsNb) - itemMargin).toFixed(1));
	carousel.containerWidth = (carousel.itemsWidth+itemMargin)* carousel.items.length;
	carousel.translateContainer = 0 - ((carousel.itemsWidth+itemMargin)* carousel.visibItemsNb);
	// flexbox fallback
	if(!flexSupported) carousel.list.style.width = (carousel.itemsWidth + itemMargin)*carousel.visibItemsNb*3+'px';
	
	// this is used when loop == off
	carousel.totTranslate = 0 - carousel.selectedItem*(carousel.itemsWidth+itemMargin);
	if(carousel.items.length <= carousel.visibItemsNb) carousel.totTranslate = 0;

	centerItems(carousel); // center items if carousel.items.length < visibItemsNb
	alignControls(carousel); // check if controls need to be aligned to a different element
  };

  function setItemsWidth(carousel, bool) {
	for(var i = 0; i < carousel.items.length; i++) {
	  carousel.items[i].style.width = carousel.itemsWidth+"px";
	  if(bool) carousel.initItems.push(carousel.items[i]);
	}
  };

  function updateCarouselClones(carousel) { 
	if(!carousel.options.loop) return;
	// take care of clones after visible items (needs to run after the update of clones before visible items)
	if(carousel.items.length < carousel.visibItemsNb*3) {
	  insertAfter(carousel, carousel.visibItemsNb*3 - carousel.items.length, carousel.items.length - carousel.visibItemsNb*2);
	} else if(carousel.items.length > carousel.visibItemsNb*3 ) {
	  removeClones(carousel, carousel.visibItemsNb*3, carousel.items.length - carousel.visibItemsNb*3);
	}
	// set proper translate value for the container
	setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
  };

  function initCarouselEvents(carousel) {
	// listen for click on previous/next arrow
	// dots navigation
	if(carousel.options.nav) {
	  carouselCreateNavigation(carousel);
	  carouselInitNavigationEvents(carousel);
	}

	if(carousel.controls.length > 0) {
	  carousel.controls[0].addEventListener('click', function(event){
		event.preventDefault();
		showPrevItems(carousel);
		updateAriaLive(carousel);
	  });
	  carousel.controls[1].addEventListener('click', function(event){
		event.preventDefault();
		showNextItems(carousel);
		updateAriaLive(carousel);
	  });

	  // update arrow visility -> loop == off only
	  resetCarouselControls(carousel);
	  // emit custom event - items visible
	  emitCarouselActiveItemsEvent(carousel)
	}
	// autoplay
	if(carousel.options.autoplay) {
	  startAutoplay(carousel);
	  // pause autoplay if user is interacting with the carousel
	  if(!carousel.options.autoplayOnHover) {
		carousel.element.addEventListener('mouseenter', function(event){
		  pauseAutoplay(carousel);
		  carousel.autoplayPaused = true;
		});
		carousel.element.addEventListener('mouseleave', function(event){
		  carousel.autoplayPaused = false;
		  startAutoplay(carousel);
		});
	  }
	  if(!carousel.options.autoplayOnFocus) {
		carousel.element.addEventListener('focusin', function(event){
		  pauseAutoplay(carousel);
		  carousel.autoplayPaused = true;
		});
	  
		carousel.element.addEventListener('focusout', function(event){
		  carousel.autoplayPaused = false;
		  startAutoplay(carousel);
		});
	  }
	}
	// drag events
	if(carousel.options.drag && window.requestAnimationFrame) {
	  //init dragging
	  new SwipeContent(carousel.element);
	  carousel.element.addEventListener('dragStart', function(event){
		if(event.detail.origin && event.detail.origin.closest('.js-carousel__control')) return;
		if(event.detail.origin && event.detail.origin.closest('.js-carousel__navigation')) return;
		if(event.detail.origin && !event.detail.origin.closest('.carousel__wrapper')) return;
		carousel.element.classList.add('carousel--is-dragging');
		pauseAutoplay(carousel);
		carousel.dragStart = event.detail.x;
		animateDragEnd(carousel);
	  });
	  carousel.element.addEventListener('dragging', function(event){
		if(!carousel.dragStart) return;
		if(carousel.animating || Math.abs(event.detail.x - carousel.dragStart) < 10) return;
		var translate = event.detail.x - carousel.dragStart + carousel.translateContainer;
		if(!carousel.options.loop) {
		  translate = event.detail.x - carousel.dragStart + carousel.totTranslate; 
		}
		setTranslate(carousel, 'translateX('+translate+'px)');
	  });
	}
	// reset on resize
	window.addEventListener('resize', function(event){
	  pauseAutoplay(carousel);
	  clearTimeout(carousel.resizeId);
	  carousel.resizeId = setTimeout(function(){
		resetCarouselResize(carousel);
		// reset dots navigation
		resetDotsNavigation(carousel);
		resetCarouselControls(carousel);
		setCounterItem(carousel);
		startAutoplay(carousel);
		centerItems(carousel); // center items if carousel.items.length < visibItemsNb
		alignControls(carousel);
		// emit custom event - items visible
		emitCarouselActiveItemsEvent(carousel)
	  }, 250)
	});
	// keyboard navigation
	carousel.element.addEventListener('keydown', function(event){
			if(event.keyCode && event.keyCode == 39 || event.key && event.key.toLowerCase() == 'arrowright') {
				carousel.showNext();
			} else if(event.keyCode && event.keyCode == 37 || event.key && event.key.toLowerCase() == 'arrowleft') {
				carousel.showPrev();
			}
		});
  };

  function showPrevItems(carousel) {
	if(carousel.animating) return;
	carousel.animating = true;
	carousel.selectedItem = getIndex(carousel, carousel.selectedItem - carousel.visibItemsNb);
	animateList(carousel, '0', 'prev');
  };

  function showNextItems(carousel) {
	if(carousel.animating) return;
	carousel.animating = true;
	carousel.selectedItem = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb);
	animateList(carousel, carousel.translateContainer*2+'px', 'next');
  };

  function animateDragEnd(carousel) { // end-of-dragging animation
	carousel.element.addEventListener('dragEnd', function cb(event){
	  carousel.element.removeEventListener('dragEnd', cb);
	  carousel.element.classList.remove('carousel--is-dragging');
	  if(event.detail.x - carousel.dragStart < -40) {
		carousel.animating = false;
		showNextItems(carousel);
	  } else if(event.detail.x - carousel.dragStart > 40) {
		carousel.animating = false;
		showPrevItems(carousel);
	  } else if(event.detail.x - carousel.dragStart == 0) { // this is just a click -> no dragging
		return;
	  } else { // not dragged enought -> do not update carousel, just reset
		carousel.animating = true;
		animateList(carousel, carousel.translateContainer+'px', false);
	  }
	  carousel.dragStart = false;
	});
  };

  function animateList(carousel, translate, direction) { // takes care of changing visible items
	pauseAutoplay(carousel);
	carousel.list.classList.add('carousel__list--animating');
	var initTranslate = carousel.totTranslate;
	if(!carousel.options.loop) {
	  translate = noLoopTranslateValue(carousel, direction);
	}
	setTimeout(function() {setTranslate(carousel, 'translateX('+translate+')');});
	if(transitionSupported) {
	  carousel.list.addEventListener('transitionend', function cb(event){
		if(event.propertyName && event.propertyName != 'transform') return;
		carousel.list.classList.remove('carousel__list--animating');
		carousel.list.removeEventListener('transitionend', cb);
		animateListCb(carousel, direction);
	  });
	} else {
	  animateListCb(carousel, direction);
	}
	if(!carousel.options.loop && (initTranslate == carousel.totTranslate)) {
	  // translate value was not updated -> trigger transitionend event to restart carousel
	  carousel.list.dispatchEvent(new CustomEvent('transitionend'));
	}
	resetCarouselControls(carousel);
	setCounterItem(carousel);
	// emit custom event - items visible
	emitCarouselActiveItemsEvent(carousel)
  };

  function noLoopTranslateValue(carousel, direction) {
	var translate = carousel.totTranslate;
	if(direction == 'next') {
	  translate = carousel.totTranslate + carousel.translateContainer;
	} else if(direction == 'prev') {
	  translate = carousel.totTranslate - carousel.translateContainer;
	} else if(direction == 'click') {
	  translate = carousel.selectedDotIndex*carousel.translateContainer;
	}
	if(translate > 0)  {
	  translate = 0;
	  carousel.selectedItem = 0;
	}
	if(translate < - carousel.translateContainer - carousel.containerWidth) {
	  translate = - carousel.translateContainer - carousel.containerWidth;
	  carousel.selectedItem = carousel.items.length - carousel.visibItemsNb;
	}
	if(carousel.visibItemsNb > carousel.items.length) translate = 0;
	carousel.totTranslate = translate;
	return translate + 'px';
  };

  function animateListCb(carousel, direction) { // reset actions after carousel has been updated
	if(direction) updateClones(carousel, direction);
	carousel.animating = false;
	// reset autoplay
	startAutoplay(carousel);
	// reset tab index
	resetItemsTabIndex(carousel);
  };

  function updateClones(carousel, direction) {
	if(!carousel.options.loop) return;
	// at the end of each animation, we need to update the clones before and after the visible items
	var index = (direction == 'next') ? 0 : carousel.items.length - carousel.visibItemsNb;
	// remove clones you do not need anymore
	removeClones(carousel, index, false);
	// add new clones 
	(direction == 'next') ? insertAfter(carousel, carousel.visibItemsNb, 0) : insertBefore(carousel, carousel.visibItemsNb);
	//reset transform
	setTranslate(carousel, 'translateX('+carousel.translateContainer+'px)');
  };

  function insertBefore(carousel, nb, delta) {
	if(!carousel.options.loop) return;
	var clones = document.createDocumentFragment();
	var start = 0;
	if(delta) start = delta;
	for(var i = start; i < nb; i++) {
	  var index = getIndex(carousel, carousel.selectedItem - i - 1),
		clone = carousel.initItems[index].cloneNode(true);
	  clone.classList.add('js-clone');
	  clones.insertBefore(clone, clones.firstChild);
	}
	carousel.list.insertBefore(clones, carousel.list.firstChild);
	emitCarouselUpdateEvent(carousel);
  };

  function insertAfter(carousel, nb, init) {
	if(!carousel.options.loop) return;
	var clones = document.createDocumentFragment();
	for(var i = init; i < nb + init; i++) {
	  var index = getIndex(carousel, carousel.selectedItem + carousel.visibItemsNb + i),
		clone = carousel.initItems[index].cloneNode(true);
	  clone.classList.add('js-clone');
	  clones.appendChild(clone);
	}
	carousel.list.appendChild(clones);
	emitCarouselUpdateEvent(carousel);
  };

  function removeClones(carousel, index, bool) {
	if(!carousel.options.loop) return;
	if( !bool) {
	  bool = carousel.visibItemsNb;
	}
	for(var i = 0; i < bool; i++) {
	  if(carousel.items[index]) carousel.list.removeChild(carousel.items[index]);
	}
  };

  function resetCarouselResize(carousel) { // reset carousel on resize
	var visibleItems = carousel.visibItemsNb;
	// get new items min-width value
	resetItemAutoSize(carousel);
	initCarouselLayout(carousel); 
	setItemsWidth(carousel, false);
	resetItemsWidth(carousel); // update the array of original items -> array used to create clones
	if(carousel.options.loop) {
	  if(visibleItems > carousel.visibItemsNb) {
		removeClones(carousel, 0, visibleItems - carousel.visibItemsNb);
	  } else if(visibleItems < carousel.visibItemsNb) {
		insertBefore(carousel, carousel.visibItemsNb, visibleItems);
	  }
	  updateCarouselClones(carousel); // this will take care of translate + after elements
	} else {
	  // reset default translate to a multiple value of (itemWidth + margin)
	  var translate = noLoopTranslateValue(carousel);
	  setTranslate(carousel, 'translateX('+translate+')');
	}
	resetItemsTabIndex(carousel); // reset focusable elements
  };

  function resetItemAutoSize(carousel) {
	if(!cssPropertiesSupported) return;
	// remove inline style
	carousel.items[0].removeAttribute('style');
	// get original item width 
	carousel.itemAutoSize = getComputedStyle(carousel.items[0]).getPropertyValue('width');
  };

  function resetItemsWidth(carousel) {
	for(var i = 0; i < carousel.initItems.length; i++) {
	  carousel.initItems[i].style.width = carousel.itemsWidth+"px";
	}
  };

  function resetItemsTabIndex(carousel) {
	var carouselActive = carousel.items.length > carousel.visibItemsNb;
	var j = carousel.items.length;
	for(var i = 0; i < carousel.items.length; i++) {
	  if(carousel.options.loop) {
		if(i < carousel.visibItemsNb || i >= 2*carousel.visibItemsNb ) {
		  carousel.items[i].setAttribute('tabindex', '-1');
		} else {
		  if(i < j) j = i;
		  carousel.items[i].removeAttribute('tabindex');
		}
	  } else {
		if( (i < carousel.selectedItem || i >= carousel.selectedItem + carousel.visibItemsNb) && carouselActive) {
		  carousel.items[i].setAttribute('tabindex', '-1');
		} else {
		  if(i < j) j = i;
		  carousel.items[i].removeAttribute('tabindex');
		}
	  }
	}
	resetVisibilityOverflowItems(carousel, j);
  };

  function startAutoplay(carousel) {
	if(carousel.options.autoplay && !carousel.autoplayId && !carousel.autoplayPaused) {
	  carousel.autoplayId = setInterval(function(){
		showNextItems(carousel);
	  }, carousel.options.autoplayInterval);
	}
  };

  function pauseAutoplay(carousel) {
	if(carousel.options.autoplay) {
	  clearInterval(carousel.autoplayId);
	  carousel.autoplayId = false;
	}
  };

  function initAriaLive(carousel) { // create an aria-live region for SR
	if(!carousel.options.ariaLive) return;
	// create an element that will be used to announce the new visible slide to SR
	var srLiveArea = document.createElement('div');
	srLiveArea.setAttribute('class', 'sr-only js-carousel__aria-live');
	srLiveArea.setAttribute('aria-live', 'polite');
	srLiveArea.setAttribute('aria-atomic', 'true');
	carousel.element.appendChild(srLiveArea);
	carousel.ariaLive = srLiveArea;
  };

  function updateAriaLive(carousel) { // announce to SR which items are now visible
	if(!carousel.options.ariaLive) return;
	carousel.ariaLive.innerHTML = 'Item '+(carousel.selectedItem + 1)+' selected. '+carousel.visibItemsNb+' items of '+carousel.initItems.length+' visible';
  };

  function getIndex(carousel, index) {
	if(index < 0) index = getPositiveValue(index, carousel.itemsNb);
	if(index >= carousel.itemsNb) index = index % carousel.itemsNb;
	return index;
  };

  function getPositiveValue(value, add) {
	value = value + add;
	if(value > 0) return value;
	else return getPositiveValue(value, add);
  };

  function setTranslate(carousel, translate) {
	carousel.list.style.transform = translate;
	carousel.list.style.msTransform = translate;
  };

  function getCarouselWidth(carousel, computedWidth) { // retrieve carousel width if carousel is initially hidden
	var closestHidden = carousel.listWrapper.closest('.sr-only');
	if(closestHidden) { // carousel is inside an .sr-only (visually hidden) element
	  closestHidden.classList.remove('sr-only');
	  computedWidth = carousel.listWrapper.offsetWidth;
	  closestHidden.classList.add('sr-only');
	} else if(isNaN(computedWidth)){
	  computedWidth = getHiddenParentWidth(carousel.element, carousel);
	}
	return computedWidth;
  };

  function getHiddenParentWidth(element, carousel) {
	var parent = element.parentElement;
	if(parent.tagName.toLowerCase() == 'html') return 0;
	var style = window.getComputedStyle(parent);
	if(style.display == 'none' || style.visibility == 'hidden') {
	  parent.setAttribute('style', 'display: block!important; visibility: visible!important;');
	  var computedWidth = carousel.listWrapper.offsetWidth;
	  parent.style.display = '';
	  parent.style.visibility = '';
	  return computedWidth;
	} else {
	  return getHiddenParentWidth(parent, carousel);
	}
  };

  function resetCarouselControls(carousel) {
	if(carousel.options.loop) return;
	// update arrows status
	if(carousel.controls.length > 0) {
	  (carousel.totTranslate == 0) 
		? carousel.controls[0].setAttribute('disabled', true) 
		: carousel.controls[0].removeAttribute('disabled');
	  (carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth) || carousel.items.length <= carousel.visibItemsNb) 
		? carousel.controls[1].setAttribute('disabled', true) 
		: carousel.controls[1].removeAttribute('disabled');
	}
	// update carousel dots
	if(carousel.options.nav) {
	  var selectedDot = carousel.navigation.getElementsByClassName(carousel.options.navigationItemClass+'--selected');
	  if(selectedDot.length > 0) selectedDot[0].classList.remove(carousel.options.navigationItemClass+'--selected');

	  var newSelectedIndex = getSelectedDot(carousel);
	  if(carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth)) {
		newSelectedIndex = carousel.navDots.length - 1;
	  }
	  carousel.navDots[newSelectedIndex].classList.add(carousel.options.navigationItemClass+'--selected');
	}

	(carousel.totTranslate == 0 && (carousel.totTranslate == (- carousel.translateContainer - carousel.containerWidth) || carousel.items.length <= carousel.visibItemsNb))
		? carousel.element.classList.add('carousel--hide-controls')
		: carousel.element.classList.remove('carousel--hide-controls');
  };

  function emitCarouselUpdateEvent(carousel) {
	carousel.cloneList = [];
	var clones = carousel.element.querySelectorAll('.js-clone');
	for(var i = 0; i < clones.length; i++) {
	  clones[i].classList.remove('js-clone');
	  carousel.cloneList.push(clones[i]);
	}
	emitCarouselEvents(carousel, 'carousel-updated', carousel.cloneList);
  };

  function carouselCreateNavigation(carousel) {
	if(carousel.element.getElementsByClassName('js-carousel__navigation').length > 0) return;
  
	var navigation = document.createElement('ol'),
	  navChildren = '';

	var navClasses = carousel.options.navigationClass+' js-carousel__navigation';
	if(carousel.items.length <= carousel.visibItemsNb) {
	  navClasses = navClasses + ' is-hidden';
	}
	navigation.setAttribute('class', navClasses);

	var dotsNr = Math.ceil(carousel.items.length/carousel.visibItemsNb),
	  selectedDot = getSelectedDot(carousel),
	  indexClass = carousel.options.navigationPagination ? '' : 'sr-only'
	for(var i = 0; i < dotsNr; i++) {
	  var className = (i == selectedDot) ? 'class="'+carousel.options.navigationItemClass+' '+carousel.options.navigationItemClass+'--selected js-carousel__nav-item"' :  'class="'+carousel.options.navigationItemClass+' js-carousel__nav-item"';
	  navChildren = navChildren + '<li '+className+'><button class="reset js-tab-focus" style="outline: none;"><span class="'+indexClass+'">'+ (i+1) + '</span></button></li>';
	}
	navigation.innerHTML = navChildren;
	carousel.element.appendChild(navigation);
  };

  function carouselInitNavigationEvents(carousel) {
	carousel.navigation = carousel.element.getElementsByClassName('js-carousel__navigation')[0];
	carousel.navDots = carousel.element.getElementsByClassName('js-carousel__nav-item');
	carousel.navIdEvent = carouselNavigationClick.bind(carousel);
	carousel.navigation.addEventListener('click', carousel.navIdEvent);
  };

  function carouselRemoveNavigation(carousel) {
	if(carousel.navigation) carousel.element.removeChild(carousel.navigation);
	if(carousel.navIdEvent) carousel.navigation.removeEventListener('click', carousel.navIdEvent);
  };

  function resetDotsNavigation(carousel) {
	if(!carousel.options.nav) return;
	carouselRemoveNavigation(carousel);
	carouselCreateNavigation(carousel);
	carouselInitNavigationEvents(carousel);
  };

  function carouselNavigationClick(event) {
	var dot = event.target.closest('.js-carousel__nav-item');
	if(!dot) return;
	if(this.animating) return;
	this.animating = true;
	var index = Array.prototype.indexOf.call(this.navDots, dot);
	this.selectedDotIndex = index;
	this.selectedItem = index*this.visibItemsNb;
	animateList(this, false, 'click');
  };

  function getSelectedDot(carousel) {
	return Math.ceil(carousel.selectedItem/carousel.visibItemsNb);
  };

  function initCarouselCounter(carousel) {
	if(carousel.counterTor.length > 0) carousel.counterTor[0].textContent = carousel.itemsNb;
	setCounterItem(carousel);
  };

  function setCounterItem(carousel) {
	if(carousel.counter.length == 0) return;
	var totalItems = carousel.selectedItem + carousel.visibItemsNb;
	if(totalItems > carousel.items.length) totalItems = carousel.items.length;
	carousel.counter[0].textContent = totalItems;
  };

  function centerItems(carousel) {
	if(!carousel.options.justifyContent) return;
	carousel.list.classList.toggle('justify-center', carousel.items.length < carousel.visibItemsNb);
  };

  function alignControls(carousel) {
	if(carousel.controls.length < 1 || !carousel.options.alignControls) return;
	if(!carousel.controlsAlignEl) {
	  carousel.controlsAlignEl = carousel.element.querySelector(carousel.options.alignControls);
	}
	if(!carousel.controlsAlignEl) return;
	var translate = (carousel.element.offsetHeight - carousel.controlsAlignEl.offsetHeight);
	for(var i = 0; i < carousel.controls.length; i++) {
	  carousel.controls[i].style.marginBottom = translate + 'px';
	}
  };

  function emitCarouselActiveItemsEvent(carousel) {
	emitCarouselEvents(carousel, 'carousel-active-items', {firstSelectedItem: carousel.selectedItem, visibleItemsNb: carousel.visibItemsNb});
  };

  function emitCarouselEvents(carousel, eventName, eventDetail) {
	var event = new CustomEvent(eventName, {detail: eventDetail});
	carousel.element.dispatchEvent(event);
  };

  function resetVisibilityOverflowItems(carousel, j) {
	if(!carousel.options.overflowItems) return;
	var itemWidth = carousel.containerWidth/carousel.items.length,
	  delta = (window.innerWidth - itemWidth*carousel.visibItemsNb)/2,
	  overflowItems = Math.ceil(delta/itemWidth);

	for(var i = 0; i < overflowItems; i++) {
	  var indexPrev = j - 1 - i; // prev element
	  if(indexPrev >= 0 ) carousel.items[indexPrev].removeAttribute('tabindex');
	  var indexNext = j + carousel.visibItemsNb + i; // next element
	  if(indexNext < carousel.items.length) carousel.items[indexNext].removeAttribute('tabindex');
	}
  };

  var extendProps = function () {
	// Variables
	var extended = {};
	var deep = false;
	var i = 0;
	var length = arguments.length;
	// Check if a deep merge
	if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
	  deep = arguments[0];
	  i++;
	}
	// Merge the object into the extended object
	var merge = function (obj) {
	  for ( var prop in obj ) {
		if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
		// If deep merge and property is an object, merge properties
		  if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
			extended[prop] = extend( true, extended[prop], obj[prop] );
		  } else {
			extended[prop] = obj[prop];
		  }
		}
	  }
	};
	// Loop through each object and conduct a merge
	for ( ; i < length; i++ ) {
	  var obj = arguments[i];
	  merge(obj);
	}
	return extended;
  };

  Carousel.defaults = {
	element : '',
	autoplay : false,
	autoplayOnHover: false,
		autoplayOnFocus: false,
	autoplayInterval: 5000,
	loop: true,
	nav: false,
	navigationItemClass: 'carousel__nav-item',
	navigationClass: 'carousel__navigation',
	navigationPagination: false,
	drag: false,
	justifyContent: false,
	alignControls: false,
	overflowItems: false
  };

  window.Carousel = Carousel;

  //initialize the Carousel objects
  var carousels = document.getElementsByClassName('js-carousel'),
	flexSupported = CSS.supports('align-items', 'stretch'),
	transitionSupported = CSS.supports('transition', 'transform'),
	cssPropertiesSupported = ('CSS' in window && CSS.supports('color', 'var(--color-var)'));

  if( carousels.length > 0) {
	for( var i = 0; i < carousels.length; i++) {
	  (function(i){
		var autoplay = (carousels[i].getAttribute('data-autoplay') && carousels[i].getAttribute('data-autoplay') == 'on') ? true : false,
		  autoplayInterval = (carousels[i].getAttribute('data-autoplay-interval')) ? carousels[i].getAttribute('data-autoplay-interval') : 5000,
		  autoplayOnHover = (carousels[i].getAttribute('data-autoplay-hover') && carousels[i].getAttribute('data-autoplay-hover') == 'on') ? true : false,
					autoplayOnFocus = (carousels[i].getAttribute('data-autoplay-focus') && carousels[i].getAttribute('data-autoplay-focus') == 'on') ? true : false,
		  drag = (carousels[i].getAttribute('data-drag') && carousels[i].getAttribute('data-drag') == 'on') ? true : false,
		  loop = (carousels[i].getAttribute('data-loop') && carousels[i].getAttribute('data-loop') == 'off') ? false : true,
		  nav = (carousels[i].getAttribute('data-navigation') && carousels[i].getAttribute('data-navigation') == 'on') ? true : false,
		  navigationItemClass = carousels[i].getAttribute('data-navigation-item-class') ? carousels[i].getAttribute('data-navigation-item-class') : 'carousel__nav-item',
		  navigationClass = carousels[i].getAttribute('data-navigation-class') ? carousels[i].getAttribute('data-navigation-class') : 'carousel__navigation',
		  navigationPagination = (carousels[i].getAttribute('data-navigation-pagination') && carousels[i].getAttribute('data-navigation-pagination') == 'on') ? true : false,
		  overflowItems = (carousels[i].getAttribute('data-overflow-items') && carousels[i].getAttribute('data-overflow-items') == 'on') ? true : false,
		  alignControls = carousels[i].getAttribute('data-align-controls') ? carousels[i].getAttribute('data-align-controls') : false,
		  justifyContent = (carousels[i].getAttribute('data-justify-content') && carousels[i].getAttribute('data-justify-content') == 'on') ? true : false;
		new Carousel({element: carousels[i], autoplay : autoplay, autoplayOnHover: autoplayOnHover, autoplayOnFocus: autoplayOnFocus,autoplayInterval : autoplayInterval, drag: drag, ariaLive: true, loop: loop, nav: nav, navigationItemClass: navigationItemClass, navigationPagination: navigationPagination, navigationClass: navigationClass, overflowItems: overflowItems, justifyContent: justifyContent, alignControls: alignControls});
	  })(i);
	}
  };
}());
// File#: _2_dropdown
// Usage: codyhouse.co/license
(function() {
	var Dropdown = function(element) {
		this.element = element;
		this.trigger = this.element.getElementsByClassName('js-dropdown__trigger')[0];
		this.dropdown = this.element.getElementsByClassName('js-dropdown__menu')[0];
		this.triggerFocus = false;
		this.dropdownFocus = false;
		this.hideInterval = false;
		// sublevels
		this.dropdownSubElements = this.element.getElementsByClassName('js-dropdown__sub-wrapper');
		this.prevFocus = false; // store element that was in focus before focus changed
		this.addDropdownEvents();
	};
	
	Dropdown.prototype.addDropdownEvents = function(){
		//place dropdown
		var self = this;
		this.placeElement();
		this.element.addEventListener('placeDropdown', function(event){
			self.placeElement();
		});
		// init dropdown
		this.initElementEvents(this.trigger, this.triggerFocus); // this is used to trigger the primary dropdown
		this.initElementEvents(this.dropdown, this.dropdownFocus); // this is used to trigger the primary dropdown
		// init sublevels
		this.initSublevels(); // if there are additional sublevels -> bind hover/focus events
	};

	Dropdown.prototype.placeElement = function() {
		// remove inline style first
		this.dropdown.removeAttribute('style');
		// check dropdown position
		var triggerPosition = this.trigger.getBoundingClientRect(),
			isRight = (window.innerWidth < triggerPosition.left + parseInt(getComputedStyle(this.dropdown).getPropertyValue('width')));

		var xPosition = isRight ? 'right: 0px; left: auto;' : 'left: 0px; right: auto;';
		this.dropdown.setAttribute('style', xPosition);
	};

	Dropdown.prototype.initElementEvents = function(element, bool) {
		var self = this;
		element.addEventListener('mouseenter', function(){
			bool = true;
			self.showDropdown();
		});
		element.addEventListener('focus', function(){
			self.showDropdown();
		});
		element.addEventListener('mouseleave', function(){
			bool = false;
			self.hideDropdown();
		});
		element.addEventListener('focusout', function(){
			self.hideDropdown();
		});
	};

	Dropdown.prototype.showDropdown = function(){
		if(this.hideInterval) clearInterval(this.hideInterval);
		// remove style attribute
		this.dropdown.removeAttribute('style');
		this.placeElement();
		this.showLevel(this.dropdown, true);
	};

	Dropdown.prototype.hideDropdown = function(){
		var self = this;
		if(this.hideInterval) clearInterval(this.hideInterval);
		this.hideInterval = setTimeout(function(){
			var dropDownFocus = document.activeElement.closest('.js-dropdown'),
				inFocus = dropDownFocus && (dropDownFocus == self.element);
			// if not in focus and not hover -> hide
			if(!self.triggerFocus && !self.dropdownFocus && !inFocus) {
				self.hideLevel(self.dropdown, true);
				// make sure to hide sub/dropdown
				self.hideSubLevels();
				self.prevFocus = false;
			}
		}, 300);
	};

	Dropdown.prototype.initSublevels = function(){
		var self = this;
		var dropdownMenu = this.element.getElementsByClassName('js-dropdown__menu');
		for(var i = 0; i < dropdownMenu.length; i++) {
			var listItems = dropdownMenu[i].children;
			// bind hover
		new menuAim({
		  menu: dropdownMenu[i],
		  activate: function(row) {
			  var subList = row.getElementsByClassName('js-dropdown__menu')[0];
			  if(!subList) return;
					row.querySelector('a').classList.add('dropdown__item--hover');
			  self.showLevel(subList);
		  },
		  deactivate: function(row) {
			  var subList = row.getElementsByClassName('dropdown__menu')[0];
			  if(!subList) return;
					row.querySelector('a').classList.remove('dropdown__item--hover');
			  self.hideLevel(subList);
		  },
		  submenuSelector: '.js-dropdown__sub-wrapper',
		});
		}
		// store focus element before change in focus
		this.element.addEventListener('keydown', function(event) { 
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				self.prevFocus = document.activeElement;
			}
		});
		// make sure that sublevel are visible when their items are in focus
		this.element.addEventListener('keyup', function(event) {
			if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
				// focus has been moved -> make sure the proper classes are added to subnavigation
				var focusElement = document.activeElement,
					focusElementParent = focusElement.closest('.js-dropdown__menu'),
					focusElementSibling = focusElement.nextElementSibling;

				// if item in focus is inside submenu -> make sure it is visible
				if(focusElementParent && !focusElementParent.classList.contains('dropdown__menu--is-visible')) {
					self.showLevel(focusElementParent);
				}
				// if item in focus triggers a submenu -> make sure it is visible
				if(focusElementSibling && !focusElementSibling.classList.contains('dropdown__menu--is-visible')) {
					self.showLevel(focusElementSibling);
				}

				// check previous element in focus -> hide sublevel if required 
				if( !self.prevFocus) return;
				var prevFocusElementParent = self.prevFocus.closest('.js-dropdown__menu'),
					prevFocusElementSibling = self.prevFocus.nextElementSibling;
				
				if( !prevFocusElementParent ) return;
				
				// element in focus and element prev in focus are siblings
				if( focusElementParent && focusElementParent == prevFocusElementParent) {
					if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
					return;
				}

				// element in focus is inside submenu triggered by element prev in focus
				if( prevFocusElementSibling && focusElementParent && focusElementParent == prevFocusElementSibling) return;
				
				// shift tab -> element in focus triggers the submenu of the element prev in focus
				if( focusElementSibling && prevFocusElementParent && focusElementSibling == prevFocusElementParent) return;
				
				var focusElementParentParent = focusElementParent.parentNode.closest('.js-dropdown__menu');
				
				// shift tab -> element in focus is inside the dropdown triggered by a siblings of the element prev in focus
				if(focusElementParentParent && focusElementParentParent == prevFocusElementParent) {
					if(prevFocusElementSibling) self.hideLevel(prevFocusElementSibling);
					return;
				}
				
				if(prevFocusElementParent && prevFocusElementParent.classList.contains('dropdown__menu--is-visible')) {
					self.hideLevel(prevFocusElementParent);
				}
			}
		});
	};

	Dropdown.prototype.hideSubLevels = function(){
		var visibleSubLevels = this.dropdown.getElementsByClassName('dropdown__menu--is-visible');
		if(visibleSubLevels.length == 0) return;
		while (visibleSubLevels[0]) {
			this.hideLevel(visibleSubLevels[0]);
		 }
		 var hoveredItems = this.dropdown.getElementsByClassName('dropdown__item--hover');
		 while (hoveredItems[0]) {
			hoveredItems[0].classList.remove('dropdown__item--hover');
		 }
	};

	Dropdown.prototype.showLevel = function(level, bool){
		if(bool == undefined) {
			//check if the sublevel needs to be open to the left
			level.classList.remove('dropdown__menu--left');
			var boundingRect = level.getBoundingClientRect();
			if(window.innerWidth - boundingRect.right < 5 && boundingRect.left + window.scrollX > 2*boundingRect.width) level.classList.add('dropdown__menu--left');
		}
		
		level.classList.add('dropdown__menu--is-visible');
		level.classList.remove('dropdown__menu--hide');
	};

	Dropdown.prototype.hideLevel = function(level, bool){
		if(!level.classList.contains('dropdown__menu--is-visible')) return;
		level.classList.remove('dropdown__menu--is-visible');
		level.classList.add('dropdown__menu--hide');
		
		level.addEventListener('transitionend', function cb(event){
			if(event.propertyName != 'opacity') return;
			level.removeEventListener('transitionend', cb);
			if(level.classList.contains('dropdown__menu--is-hidden')) level.classList.remove('dropdown__menu--is-hidden', 'dropdown__menu--left');
			if(bool && !level.classList.contains('dropdown__menu--is-visible')) level.setAttribute('style', 'width: 0px; overflow: hidden;');
		});
	};

	window.Dropdown = Dropdown;

	var dropdown = document.getElementsByClassName('js-dropdown');
	if( dropdown.length > 0 ) { // init Dropdown objects
		for( var i = 0; i < dropdown.length; i++) {
			(function(i){new Dropdown(dropdown[i]);})(i);
		}
	}
}());
// File#: _2_flexi-header
// Usage: codyhouse.co/license
(function() {
  var flexHeader = document.getElementsByClassName('js-f-header');
	if(flexHeader.length > 0) {
		var menuTrigger = flexHeader[0].getElementsByClassName('js-anim-menu-btn')[0],
			firstFocusableElement = getMenuFirstFocusable();

		// we'll use these to store the node that needs to receive focus when the mobile menu is closed 
		var focusMenu = false;

		resetFlexHeaderOffset();
		setAriaButtons();

		menuTrigger.addEventListener('anim-menu-btn-clicke', function(event){
			toggleMenuNavigation(event.detail);
		});

		// listen for key events
		window.addEventListener('keyup', function(event){
			// listen for esc key
			if( (event.keyCode && event.keyCode == 27) || (event.key && event.key.toLowerCase() == 'escape' )) {
				// close navigation on mobile if open
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger)) {
					focusMenu = menuTrigger; // move focus to menu trigger when menu is close
					menuTrigger.click();
				}
			}
			// listen for tab key
			if( (event.keyCode && event.keyCode == 9) || (event.key && event.key.toLowerCase() == 'tab' )) {
				// close navigation on mobile if open when nav loses focus
				if(menuTrigger.getAttribute('aria-expanded') == 'true' && isVisible(menuTrigger) && !document.activeElement.closest('.js-f-header')) menuTrigger.click();
			}
		});

		// detect click on a dropdown control button - expand-on-mobile only
		flexHeader[0].addEventListener('click', function(event){
			var btnLink = event.target.closest('.js-f-header__dropdown-control');
			if(!btnLink) return;
			!btnLink.getAttribute('aria-expanded') ? btnLink.setAttribute('aria-expanded', 'true') : btnLink.removeAttribute('aria-expanded');
		});

		// detect mouseout from a dropdown control button - expand-on-mobile only
		flexHeader[0].addEventListener('mouseout', function(event){
			var btnLink = event.target.closest('.js-f-header__dropdown-contros');
			if(!btnLink) return;
			// check layout type
			if(getLayout() == 'mobile') return;
			btnLink.removeAttribute('aria-expanded');
		});

		// close dropdown on focusout - expand-on-mobile only
		flexHeader[0].addEventListener('focusin', function(event){
			var btnLink = event.target.closest('.js-f-header__dropdown-control'),
				dropdown = event.target.closest('.f-header__dropdown');
			if(dropdown) return;
			if(btnLink && btnLink.hasAttribute('aria-expanded')) return;
			// check layout type
			if(getLayout() == 'mobile') return;
			var openDropdown = flexHeader[0].querySelector('.js-f-header__dropdown-control[aria-expanded="true"]');
			if(openDropdown) openDropdown.removeAttribute('aria-expanded');
		});

		// listen for resize
		var resizingId = false;
		window.addEventListener('resize', function() {
			clearTimeout(resizingId);
			resizingId = setTimeout(doneResizing, 500);
		});

		function getMenuFirstFocusable() {
			var focusableEle = flexHeader[0].getElementsByClassName('f-header__nav')[0].querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary'),
				firstFocusable = false;
			for(var i = 0; i < focusableEle.length; i++) {
				if( focusableEle[i].offsetWidth || focusableEle[i].offsetHeight || focusableEle[i].getClientRects().length ) {
					firstFocusable = focusableEle[i];
					break;
				}
			}

			return firstFocusable;
	};
	
	function isVisible(element) {
	  return (element.offsetWidth || element.offsetHeight || element.getClientRects().length);
		};

		function doneResizing() {
			if( !isVisible(menuTrigger) && flexHeader[0].classList.contains('f-header--expanded')) {
				menuTrigger.click();
			}
			resetFlexHeaderOffset();
		};
		
		function toggleMenuNavigation(bool) { // toggle menu visibility on small devices
			document.getElementsByClassName('f-header__nav')[0].classList.toggle('f-header__nav--is-visible', bool);
			flexHeader[0].classList.toggle('f-header--expanded', bool);
			menuTrigger.setAttribute('aria-expanded', bool);
			if(bool) firstFocusableElement.focus(); // move focus to first focusable element
			else if(focusMenu) {
				focusMenu.focus();
				focusMenu = false;
			}
		};

		function resetFlexHeaderOffset() {
			// on mobile -> update max height of the flexi header based on its offset value (e.g., if there's a fixed pre-header element)
			document.documentElement.style.setProperty('--f-header-offset', flexHeader[0].getBoundingClientRect().top+'px');
		};

		function setAriaButtons() {
			var btnDropdown = flexHeader[0].getElementsByClassName('js-f-header__dropdown-control');
			for(var i = 0; i < btnDropdown.length; i++) {
				var id = 'f-header-dropdown-'+i,
					dropdown = btnDropdown[i].nextElementSibling;
				if(dropdown.hasAttribute('id')) {
					id = dropdown.getAttribute('id');
				} else {
					dropdown.setAttribute('id', id);
				}
				btnDropdown[i].setAttribute('aria-controls', id);	
			}
		};

		function getLayout() {
			return getComputedStyle(flexHeader[0], ':before').getPropertyValue('content').replace(/\'|"/g, '');
		};
	}
}());
if (!Util) function Util() { };

Util.addClass = function (el, className) {
	var classList = className.split(' ');
	el.classList.add(classList[0]);
	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.cssSupports = function (property, value) {
	return CSS.supports(property, value);
};

// File#: _2_off-canvas-navigation
// Usage: codyhouse.co/license
(function () {
	var OffCanvasNav = function (element) {
		this.element = element;
		this.panel = this.element.getElementsByClassName('js-off-canvas__panel')[0];
		this.trigger = document.querySelectorAll('[aria-controls="' + this.panel.getAttribute('id') + '"]')[0];
		this.svgAnim = this.trigger.getElementsByTagName('circle');
		initOffCanvasNav(this);
	};

	function initOffCanvasNav(canvas) {
		if (transitionSupported) {
			// do not allow click on menu icon while the navigation is animating
			canvas.trigger.addEventListener('click', function (event) {
				canvas.trigger.style.setProperty('pointer-events', 'none');
			});
			canvas.panel.addEventListener('openPanel', function (event) {
				canvas.trigger.style.setProperty('pointer-events', 'none');
			});
			canvas.panel.addEventListener('transitionend', function (event) {
				if (event.propertyName == 'visibility') {
					canvas.trigger.style.setProperty('pointer-events', '');
				}
			});
		}

		if (canvas.svgAnim.length > 0) { // create the circle fill-in effect
			var circumference = (2 * Math.PI * canvas.svgAnim[0].getAttribute('r')).toFixed(2);
			canvas.svgAnim[0].setAttribute('stroke-dashoffset', circumference);
			canvas.svgAnim[0].setAttribute('stroke-dasharray', circumference);
			Util.addClass(canvas.trigger, 'offnav-control--ready-to-animate');
		}

		canvas.panel.addEventListener('closePanel', function (event) {
			// if the navigation is closed using keyboard or a11y close btn -> change trigger icon appearance (from arrow to menu icon) 
			if (event.detail == 'key' || event.detail == 'close-btn') {
				canvas.trigger.click();
			}
		});
	};

	// init OffCanvasNav objects
	var offCanvasNav = document.getElementsByClassName('js-off-canvas--nav'),
		transitionSupported = Util.cssSupports('transition');
	if (offCanvasNav.length > 0) {
		for (var i = 0; i < offCanvasNav.length; i++) {
			(function (i) { new OffCanvasNav(offCanvasNav[i]); })(i);
		}
	}
}());
// File#: _3_hiding-nav
// Usage: codyhouse.co/license
(function() {
  var hidingNav = document.getElementsByClassName('js-hide-nav');
  if(hidingNav.length > 0 && window.requestAnimationFrame) {
	var mainNav = Array.prototype.filter.call(hidingNav, function(element) {
	  return element.classList.contains('js-hide-nav--main');
	}),
	subNav = Array.prototype.filter.call(hidingNav, function(element) {
	  return element.classList.contains('js-hide-nav--sub');
	});
	
	var scrolling = false,
	  previousTop = window.scrollY,
	  currentTop = window.scrollY,
	  scrollDelta = 10,
	  scrollOffset = 150, // scrollY needs to be bigger than scrollOffset to hide navigation
	  headerHeight = 0; 

	var navIsFixed = false; // check if main navigation is fixed
	if(mainNav.length > 0 && mainNav[0].classList.contains('hide-nav--fixed')) navIsFixed = true;

	// store button that triggers navigation on mobile
	var triggerMobile = getTriggerMobileMenu();
	var prevElement = createPrevElement();
	var mainNavTop = 0;
	// list of classes the hide-nav has when it is expanded -> do not hide if it has those classes
	var navOpenClasses = hidingNav[0].getAttribute('data-nav-target-class'),
	  navOpenArrayClasses = [];
	if(navOpenClasses) navOpenArrayClasses = navOpenClasses.split(' ');
	getMainNavTop();
	if(mainNavTop > 0) {
	  scrollOffset = scrollOffset + mainNavTop;
	}
	
	// init navigation and listen to window scroll event
	getHeaderHeight();
	initSecondaryNav();
	initFixedNav();
	resetHideNav();
	window.addEventListener('scroll', function(event){
	  if(scrolling) return;
	  scrolling = true;
	  window.requestAnimationFrame(resetHideNav);
	});

	window.addEventListener('resize', function(event){
	  if(scrolling) return;
	  scrolling = true;
	  window.requestAnimationFrame(function(){
		if(headerHeight > 0) {
		  getMainNavTop();
		  getHeaderHeight();
		  initSecondaryNav();
		  initFixedNav();
		}
		// reset both navigation
		hideNavScrollUp();

		scrolling = false;
	  });
	});

	function getHeaderHeight() {
	  headerHeight = mainNav[0].offsetHeight;
	};

	function initSecondaryNav() { // if there's a secondary nav, set its top equal to the header height
	  if(subNav.length < 1 || mainNav.length < 1) return;
	  subNav[0].style.top = (headerHeight - 1)+'px';
	};

	function initFixedNav() {
	  if(!navIsFixed || mainNav.length < 1) return;
	  mainNav[0].style.marginBottom = '-'+headerHeight+'px';
	};

	function resetHideNav() { // check if navs need to be hidden/revealed
	  currentTop = window.scrollY;
	  if(currentTop - previousTop > scrollDelta && currentTop > scrollOffset) {
		hideNavScrollDown();
	  } else if( previousTop - currentTop > scrollDelta || (previousTop - currentTop > 0 && currentTop < scrollOffset) ) {
		hideNavScrollUp();
	  } else if( previousTop - currentTop > 0 && subNav.length > 0 && subNav[0].getBoundingClientRect().top > 0) {
		setTranslate(subNav[0], '0%');
	  }
	  // if primary nav is fixed -> toggle bg class
	  if(navIsFixed) {
		var scrollTop = window.scrollY || window.pageYOffset;
		mainNav[0].classList.toggle('hide-nav--has-bg', (scrollTop > headerHeight + mainNavTop));
	  }
	  previousTop = currentTop;
	  scrolling = false;
	};

	function hideNavScrollDown() {
	  // if there's a secondary nav -> it has to reach the top before hiding nav
	  if( subNav.length  > 0 && subNav[0].getBoundingClientRect().top > headerHeight) return;
	  // on mobile -> hide navigation only if dropdown is not open
	  if(triggerMobile && triggerMobile.getAttribute('aria-expanded') == "true") return;
	  // check if main nav has one of the following classes
	  if( mainNav.length > 0 && (!navOpenClasses || !checkNavExpanded())) {
		setTranslate(mainNav[0], '-100%'); 
		mainNav[0].addEventListener('transitionend', addOffCanvasClass);
	  }
	  if( subNav.length  > 0 ) setTranslate(subNav[0], '-'+headerHeight+'px');
	};

	function hideNavScrollUp() {
	  if( mainNav.length > 0 ) {setTranslate(mainNav[0], '0%'); mainNav[0].classList.remove('hide-nav--off-canvas');mainNav[0].removeEventListener('transitionend', addOffCanvasClass);}
	  if( subNav.length  > 0 ) setTranslate(subNav[0], '0%');
	};

	function addOffCanvasClass() {
	  mainNav[0].removeEventListener('transitionend', addOffCanvasClass);
	  mainNav[0].classList.add('hide-nav--off-canvas');
	};

	function setTranslate(element, val) {
	  element.style.transform = 'translateY('+val+')';
	};

	function getTriggerMobileMenu() {
	  // store trigger that toggle mobile navigation dropdown
	  var triggerMobileClass = hidingNav[0].getAttribute('data-mobile-trigger');
	  if(!triggerMobileClass) return false;
	  if(triggerMobileClass.indexOf('#') == 0) { // get trigger by ID
		var trigger = document.getElementById(triggerMobileClass.replace('#', ''));
		if(trigger) return trigger;
	  } else { // get trigger by class name
		var trigger = hidingNav[0].getElementsByClassName(triggerMobileClass);
		if(trigger.length > 0) return trigger[0];
	  }
	  
	  return false;
	};

	function createPrevElement() {
	  // create element to be inserted right before the mainNav to get its top value
	  if( mainNav.length < 1) return false;
	  var newElement = document.createElement("div"); 
	  newElement.setAttribute('aria-hidden', 'true');
	  mainNav[0].parentElement.insertBefore(newElement, mainNav[0]);
	  var prevElement =  mainNav[0].previousElementSibling;
	  prevElement.style.opacity = '0';
	  return prevElement;
	};

	function getMainNavTop() {
	  if(!prevElement) return;
	  mainNavTop = prevElement.getBoundingClientRect().top + window.scrollY;
	};

	function checkNavExpanded() {
	  var navIsOpen = false;
	  for(var i = 0; i < navOpenArrayClasses.length; i++){
		if(mainNav[0].classList.contains(navOpenArrayClasses[i].trim())) {
		  navIsOpen = true;
		  break;
		}
	  }
	  return navIsOpen;
	};
	
  } else {
	// if window requestAnimationFrame is not supported -> add bg class to fixed header
	var mainNav = document.getElementsByClassName('js-hide-nav--main');
	if(mainNav.length < 1) return;
	if(mainNav[0].classList.contains('hide-nav--fixed')) mainNav[0].classList.add('hide-nav--has-bg');
  }
}());
const isElement = (selector) => document.body.contains(document.querySelector(selector))
const handleBlockBodyScroll = (node) => {
    document.body.dataset.locked = node.dataset.lockBody === "true" ? "true" : "false"
}

const loadAccordion = () => {
    if (!isElement("[data-js='accordion']"))
        return;

    const accordions = document.querySelectorAll("[data-js='accordion']")
    accordions.forEach(elem => elem.addEventListener('click', function (e) {
        const accordion = e.target.closest("[data-js='accordion']")
        accordion.dataset.open = accordion.dataset.open === "true" ? "false" : "true"
    }))
}

const loadCarousels = () => {
    if (!isElement(".swiper"))
        return;

    const swiper = new Swiper(".swiper", {
        pagination: {
            el: ".swiper-pagination",
            bulletClass: "inline-block h-2 w-2 rounded-full bg-notActive",
            bulletActiveClass: "bg-primary"

        },
        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
            navigationDisabledClass: "bg-notActive"
        },
    })
}

const loadActivators = () => {
    if (!isElement("[data-js='activators']"))
        return;

    const activators = document.querySelectorAll("[data-js='activators']")
    activators.forEach(elem => elem.addEventListener('click', function (e) {
        const activator = e.target.closest("[data-js='activators']")
        const targetSelector = activator.dataset.target;
        if (!targetSelector || !isElement(targetSelector))
            return;

        const target = document.querySelector(targetSelector)
        handleBlockBodyScroll(activator)
        target.dataset.open = target.dataset.open === "true" ? "false" : "true"
    }))
}

const bootstrap = () => {
    loadAccordion()
    loadActivators()
    loadCarousels();
}
bootstrap()