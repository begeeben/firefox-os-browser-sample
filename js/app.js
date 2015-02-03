// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var frameContainer = document.getElementById('frame-container');

  var gobackButton = document.getElementById('goback-button');
  var goforwardButton = document.getElementById('goforward-button');
  var urlInput = document.getElementById('url-input');
  var urlButton = document.getElementById('url-button');

  /**
   * The current displaying Tab
   */
  var currentTab;
  /**
   * The current url input cache
   */
  var currentUrlInput;
  /**
   * The default search engine URI
   *
   * @type {String}
   */
  var searchEngineUri = 'https://search.yahoo.com/search?p={searchTerms}';

  /**
   * Using an input element to check the validity of the input URL. If the input
   * is not valid, returns a search URL.
   *
   * @param  {String} input           A plaintext URL or search terms
   * @param  {String} searchEngineUri The search engine to be used
   * @return {String}                 A valid URL
   */
  function getUrlFromInput(input, searchEngineUri) {
    var urlValidate = document.createElement('input');
    urlValidate.setAttribute('type', 'url');
    urlValidate.setAttribute('value', input);

    if (!urlValidate.validity.valid) {
      var uri = searchEngineUri.replace('{searchTerms}', input);
      return uri;
    }

    return input;
  }

  /**
   * When the URL input is focused, change the input text from the current
   * page title to the page URL for editing.
   */
  urlInput.addEventListener('focus', function () {
    if (currentTab && currentTab.url) {
      urlInput.value = currentTab.url;
      urlInput.setSelectionRange(0, urlInput.value.length);
    }
  });

  /**
   * When the URL input is out of focused, change the input text to the current
   * page title.
   */
  urlInput.addEventListener('blur', function () {
    currentUrlInput = urlInput.value;

    if (currentTab && currentTab.title) {
      urlInput.value = currentTab.title;
    }
  });

  /**
   * Check the input and browse the address with a Tab object on url submit.
   */
  window.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!currentUrlInput.trim()) {
      return;
    }

    if (frameContainer.classList.contains('empty')) {
      frameContainer.classList.remove('empty');
    }

    var url = getUrlFromInput(currentUrlInput.trim(), searchEngineUri);

    if (!currentTab) {
      currentTab = new Tab(url);
      frameContainer.appendChild(currentTab.iframe);
    } else if (currentUrlInput === currentTab.title) {
      currentTab.reload();
    } else {
      currentTab.goToUrl(url);
    }
  });

  /**
   * Handle goback and goforward button clicks.
   */
  window.addEventListener('click', function (e) {
    switch (e.target) {
      case gobackButton:
        if (currentTab) {
          currentTab.goBack();
        }
        break;
      case goforwardButton:
        if (currentTab) {
          currentTab.goForward();
        }
        break;
    }
  });

  /**
   * Save the url of the currentTab on locationchange event for display.
   */
  window.addEventListener('tab:locationchange', function (e) {
    if (currentTab === e.detail) {
      currentUrlInput = currentTab.url;
    }
  });

  /**
   * Display the title of the currentTab on titlechange event.
   */
  window.addEventListener('tab:titlechange', function (e) {
    if (currentTab === e.detail) {
      urlInput.value = currentTab.title;
    }
  });

  /**
   * Enable/disable goback and goforward buttons accordingly when the
   * currentTab is loaded.
   */
  window.addEventListener('tab:loadend', function (e) {
    if (currentTab === e.detail) {
      currentTab.getCanGoBack().then(function(canGoBack) {
        gobackButton.disabled = !canGoBack;
      });

      currentTab.getCanGoForward().then(function(canGoForward) {
        goforwardButton.disabled = !canGoForward;
      });
    }
  });

});
