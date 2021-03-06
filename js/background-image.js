"use strict";

const bg = {
  defaultBgUrl: "https://images.unsplash.com/photo-1473800447596-01729482b8eb?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&s=40eba4c15ec393c84db9c76380d26869",
  query: "https://api.unsplash.com/photos/random?collections=1291922" + "&client_id=" + config.unsplashApplicationId + "&orientation=landscape",
  renderPhotographer: document.querySelector("#image-photographer"),
  renderLocation: document.querySelector("#image-location"),
};

function queryUnsplash () {
  fetch(bg.query).then(response => response.json()).then(data =>
  {
    // IMAGE DATA VARS
    let bgUrl = data.urls.regular;
    let photographerData = data.user.name;
    let imageDescriptionData = data.description;
    let username = data.user.username;
    let linkToUser = `https://unsplash.com/@${username}?utm_source=over&utm_medium=referral&utm_campaign=api-credit`;
    let imageLocationData = data.user.location || username;

    // SAVE BG URL TO STORAGE
    chrome.storage.sync.set ({
      "bg_url": bgUrl,
      "photographer": photographerData,
      "location": imageLocationData,
      "username": username,
      "link": linkToUser
    });
  });
}

(function (){
  let currentTimeStamp = Date.now();
  chrome.storage.sync.get("time_stamp", function(data) {
    let prevTimeStamp = data["time_stamp"];

    // Querying local storage first to see if last time is available
    if (prevTimeStamp !== undefined) {
      // Checking if 30s have elapsed since the time recorded in storage
      if (currentTimeStamp - prevTimeStamp >= 1800000) {
        //* Updating the previous time stamp in storage to the current time
        prevTimeStamp = currentTimeStamp;
        chrome.storage.sync.set({"time_stamp": prevTimeStamp});
        //console.log("time until change");
        //console.log(1800000 - data["time_stamp"]);
        //* Fetching a new background from unsplash
        queryUnsplash();
      } else {
        // Setting BG url to the last stored BG using null to get the entire object
        chrome.storage.sync.get(null, function (data) {
          let savedBg = data["bg_url"];
          let savedPhotographer = data["photographer"];
          let savedLocation = data["location"];
          let savedLinkToUser = data["link"];
          let savedUsername = data["username"];
        });
      }
    } else {
      // If there is no timestamp, current time is stored
      prevTimeStamp = currentTimeStamp;
      chrome.storage.sync.set({"time_stamp": prevTimeStamp});
      queryUnsplash();

    }
  });
})();

// FOCUS BACKGROUND
(function () {
  const mouseOverFocus = () => {
    $("#bottom-row").siblings().not(".settings-icon-wrapper").fadeTo("slow", 0);
    $(".credits").siblings().not(".settings-icon-wrapper").fadeTo("slow", 0);
  };

  let timer ;

  const mouseOutFocus = () => {
    $("#bottom-row").siblings().not(".settings-icon-wrapper", "#focus-encouragement").fadeTo("slow", 1);
    $(".credits").siblings().not(".settings-icon-wrapper", "#focus-encouragement").fadeTo("slow", 1);
    clearTimeout(timer);
  };

  $(".credits").mouseenter( () => {
    timer = window.setTimeout(mouseOverFocus, 3000);
  });
  $(".credits").mouseleave( () => {
    clearTimeout(timer);
    window.setTimeout(mouseOutFocus, 500);
  });
})();
