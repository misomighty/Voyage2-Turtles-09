(function() {
  "use strict";

  const STORAGE = chrome.storage.sync;
  const settingsIcon = document.querySelector(".settings-icon");
  const settingsPanel = document.querySelector(".settings");
  const settingsNav = document.querySelectorAll(".settings-nav li");
  const settingsSubpanels = document.querySelectorAll(".settings-subpanel");
  const userLinksPrompt = document.querySelector(".user-links-prompt");
  const userLinksInput = document.querySelector(".user-links-input");
  const userLinksName = document.querySelector(".user-links-name");
  const userLinksURL = document.querySelector(".user-links-url");
  const linksList = document.querySelector(".settings-links ul");
  const displayRecipe = document.querySelector("#displayRecipe");
  const displayTime = document.querySelector("#displayTime");
  const displayGreeting = document.querySelector("#displayGreeting");
  const displayFocus = document.querySelector("#displayFocus");
  const displayTodo = document.querySelector("#displayTodo");
  const displayQuote = document.querySelector("#displayQuote");
  const aboutText = document.querySelector(".settings-about-text");
  const settingsGeneral = document.querySelector(".settings-general");
  const toggleWidgets = document.querySelectorAll(".toggle-widget");
  const overlay = document.querySelector(".overlay");
  const manifest = chrome.runtime.getManifest();
  let userPreferences = {};
  let linkDeleteIcons;
  let userLinks;

  // Check if widget preferences have been set.
  getUserPreferences();
  // Check if any user links have been saved
  getUserLinks();
  // Activate settings link (cog icon)
  initSettingsIcon();
  // Change Settings panel when nav is clicked
  addListenerToSettingsNavigation();

  // listen for changes to visibility of Widgets in General Settings
  addListenersToGeneralSettings();

  function getUserPreferences() {
    // Is there already a userPreferences array in storage?
    STORAGE.get("userPreferences", function(obj){
      let error = chrome.runtime.lastError;
      if (error) {
        console.error("getUserPreferences(): " + error);
      }
      else {
        // if preferences exist in storage
        if (obj.userPreferences) {
          // Store them in a variable so that we can work with them.
          userPreferences = obj.userPreferences;
          // if there is, use it to set toggle switches in General Settings
          // and show/hide widgets as appropriate
          displayPreferences();
        }
      }
    });
  }

  function displayPreferences() {
    let keys = Object.keys(userPreferences);
    keys.forEach(function(key) {
      if (userPreferences[key] === false) {
        document.getElementById(key).removeAttribute("checked");
        hideWidget(key);
      }
      else {
        document.getElementById(key).setAttribute("checked", "checked");
        showWidget(key);
      }
    });
  }

  function showWidget(element) {
    let trigger = document.getElementById(element); // targets the input
    let target = document.getElementsByClassName(trigger.dataset[element.toLowerCase()]); // targets the widget container
    showElement(target[0]);
  }

  function hideWidget(element) {
    let trigger = document.getElementById(element); // targets the input
    let target = document.getElementsByClassName(trigger.dataset[element.toLowerCase()]); // targets the widget container
    hideElement(target[0]);
  }

  function getUserLinks() {
    STORAGE.get("userLinks", function(obj){
      let error = chrome.runtime.lastError;
      if (error) {
        console.error("getUserPreferences(): " + error);
      }
      else {
        // if links exist in storage
        if (obj.userLinks) {
          displayLinks(obj.userLinks);
        }
      }
    });
  }

  function displayLinks(links) {
    linksList.innerHTML = links;
    linkDeleteIcons = document.querySelectorAll(".link-delete");
    addDeleteListeners();
  }

  function addDeleteListeners() {
    // Add a listener to each delete icon "x" in Links Settings
    let keys = Object.keys(linkDeleteIcons);
    keys.forEach(function(key) {
      linkDeleteIcons[key].addEventListener("click", function deleteLink(event) {
        event.target.parentNode.remove();
        saveUserLinks();
      });
    });
  }

  function saveUserLinks() {
    STORAGE.set({"userLinks": linksList.innerHTML}, function() {
      let error = chrome.runtime.lastError;
      if (error) {
        console.error("saveUserLinks: " + error);
      }
    });
  }

  function initSettingsIcon() {
    // Toggle settings panel on and off when settings icon (cog) is clicked.
    settingsIcon.addEventListener("click", toggleSettingsPanel);
    overlay.addEventListener("click", toggleSettingsPanel);
  }

  function toggleSettingsPanel() {
    settingsIcon.classList.toggle("clicked");
    overlay.classList.toggle("hidden");
    settingsPanel.classList.toggle("hidden");
    settingsSubpanels.forEach(function(subpanel) {
      subpanel.scroll(0, 0);
    });
  }

  function addListenerToSettingsNavigation() {
    let keys = Object.keys(settingsNav);
    keys.forEach(function(key) {
      // Display appropriate settings panel when a nav item is clicked.
      settingsNav[key].addEventListener("click", function() {

        // Indicate which nav item is currently selected.
        let target = event.target;
        addClassToOneChild(".settings-nav", target, "settings-current");

        // If chosen panel is "About", pull data from manifest.
        if (target.innerHTML === "About") {
          populateAboutTab();
        }

        // If chosen panel is "Links", add event listeners.
        if (target.innerHTML === "Links") {
          initLinks();
        }

        // Display the correct panel.
        if (target.innerHTML) {
          let chosenSubpanel = document.querySelector(`#settings${target.innerHTML}`);
          hideAllChildrenButOne("settingsSubpanelContainer", chosenSubpanel);
        }
      });
    });
  }

  function populateAboutTab() {
    aboutText.innerHTML = `
    <h1>${manifest.name}</h1>
    <p class="settings-version">Personal Dashboard <span>v${manifest.version}</span></p>
    <p>Thank you for your support!</p>
    <ul>
      <li><a href="https://github.com/chingu-coders/Voyage2-Turtles-09">GitHub</a></li>
      <li><a href="https://medium.com/chingu">Chingu</a></li>
      <li><a href="#">Website</a></li>
      <li><a href="#">Twitter</a></li>
    </ul>
    <footer>Made with <span class="fa fa-heart"></span> by Chingu developers</footer>
    `;
  }

  function initLinks() {
    const linkToChromeTab = document.querySelector(".link-chrome-tab");
    const linkToApps = document.querySelector(".link-apps");

    linkToChromeTab.addEventListener("click", function chromeTab() {
      chrome.tabs.create({url: "chrome-search://local-ntp/local-ntp.html"});
    });

    linkToApps.addEventListener("click", function chromeApps() {
      chrome.tabs.create({url: "chrome://apps"});
    });

    userLinksPrompt.addEventListener("click", function linksPrompt() {
      hideElement(userLinksPrompt);
      showElement(userLinksInput);
      userLinksName.focus();
    });

    userLinksName.addEventListener("keydown", function focusURL(event) {
      if (event.keyCode === 13 && this.value !== ""){ //Enter key pressed
        userLinksURL.focus();
      }
    });

    userLinksURL.addEventListener("keydown", function(event) {
      if (event.keyCode === 13 && this.value !== ""){ //Enter key pressed
        createLink(this.value);
        saveUserLinks();
        linkDeleteIcons = document.querySelectorAll(".link-delete");
        this.value = "";
        userLinksName.value = "";
        hideElement(userLinksInput);
        showElement(userLinksPrompt);
        addDeleteListeners();
      }
    });
  }

  function createLink(value) {
    let href = prepURL(value);
    let newLink = `<a href="${href}" target="_blank">${userLinksName.value}</a><span class="link-delete">x</span>`;
    var li = document.createElement("li");
    li.innerHTML = newLink;
    li.classList.add("settings-link");
    linksList.appendChild(li);
  }

  function prepURL(url) {
    if (!url.toLowerCase().startsWith("http")) {
      url = `http://${url}`;
    }
    return url;
  }

  function addListenersToGeneralSettings() {
    // Add a listener to each toggle switch in General Settings
    let keys = Object.keys(toggleWidgets);
    keys.forEach(function(key) {
      toggleWidgets[key].children[0].addEventListener("click", showHideWidgets);
    });
  }

  function showHideWidgets() {
    // If checkbox is checked (toggle switch is on).
    // Uncheck checkbox (set toggle switch to off).
    // And update userPreferences object.
    if (this.hasAttribute("checked")) {
      this.removeAttribute("checked");
      userPreferences[this.id] = false;
      hideWidget(this.id);
    }
    // If checkbox is unchecked (toggle switch is off)
    // Check checkbox (set toggle switch to on)
    // And update userPreferences object.
    else {
      this.setAttribute("checked", "checked");
      userPreferences[this.id] = true;
      showWidget(this.id);
    }
    // Save userPreferences to chrome.storage.sync
    STORAGE.set({"userPreferences": userPreferences}, function() {
      let error = chrome.runtime.lastError;
      if (error) {
        console.error("save userPreferences: " + error);
      }
    });
  }

})();
