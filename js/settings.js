(function() {
  "use strict";

  const settingsIcon = document.querySelector(".settings-icon");
  const settingsPanel = document.querySelector(".settings");
  const settingsNav = document.querySelector(".settings-nav");
  //const settingsAbout = document.querySelector(".settings-about");
  const aboutText = document.querySelector(".settings-about-text");
  const settingsGeneral = document.querySelector(".settings-general");
  const manifest = chrome.runtime.getManifest();
  console.log(manifest.version);

  settingsIcon.addEventListener("click", toggleSettingsPanel);

  settingsNav.addEventListener("click", function() {
    let target = document.querySelector(`#settings${event.target.innerHTML}`);
    //console.log(target);
    hideAllChildrenButOne("settingsSubpanelContainer", target);
  });

  function toggleSettingsPanel() {
    settingsIcon.classList.toggle("clicked");
    settingsPanel.classList.toggle("hidden");
  }

  aboutText.innerHTML = `
    <h1>${manifest.name}</h1>
    <p class="settings-version">Personal Dashboard <span>v${manifest.version}</span></p>
    <p>Thank you for your support!</p>
    <ul>
      <li><a href="https://github.com/chingu-coders/Voyage2-Turtles-09">GitHub</a></li>
      <li><a href="https://medium.com/chingu">Chingu</a></li>
      <li><a href="">Website</a></li>
      <li><a href="">Twitter</a></li>
    </ul>
    <footer>Made with <span class="fa fa-heart"></span> by Chingu developers</footer>
  `;


/********************
 * Utility Functions
 ********************/
  function showElement(element) {
    element.classList.remove("hidden");
  }

  function hideElement(element) {
    element.classList.add("hidden");
  }

  // Based on 
  // https://stackoverflow.com/questions/17928816/how-to-get-and-hide-siblings-in-javascript
  function hideAllChildrenButOne(parentId, toRevealId) {
    let children = document.getElementById(parentId).children;
    for (let i = 0; i < children.length; i++) {
      hideElement(children[i]);
    }
    showElement(toRevealId);
  }

})();