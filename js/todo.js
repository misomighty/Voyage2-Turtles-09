"use strict";
(function (){
  $(document).ready(function(){
    let targetNum;
    let deleteIcons = $(".todo-delete");
    let taskPanel = $(".task-panel");
    let listPanel = $(".list-panel");
    let numTodos = 0;
    let numLists = 0;

    function activateTodo() {
      console.log("activated");
      $(".activate-todo").on("click", function(e){
        $(".todo-slider").slideToggle("slow");
      });
    }
    activateTodo();

    function dayElapsed(timeConstraint) {
      let currentTimeStamp = Date.now();
      let flag;
      chrome.storage.sync.get("todo_time_stamp", function(data) {
        let prevTimeStamp = data["todo_time_stamp"];
        // Querying local storage first to see if last time is available
        if (prevTimeStamp !== undefined) {
          // Checking if 30s have elapsed since the time recorded in storage
          if (currentTimeStamp - prevTimeStamp >= timeConstraint) {
            //* Updating the previous time stamp in storage to the current time
            prevTimeStamp = currentTimeStamp;
            chrome.storage.sync.set({"todo_time_stamp": prevTimeStamp});
            console.log(currentTimeStamp - data["todo_time_stamp"]);
            flag = true;
            chrome.storage.sync.set({"day_elapsed": flag});
            console.log("flag set to true");
          } else {
            flag = false;
            chrome.storage.sync.set({"day_elapsed": flag});
            console.log("flag set to false");
          }
        } else {
          // If there is no timestamp, current time is stored
          prevTimeStamp = currentTimeStamp;
          flag = false;
          chrome.storage.sync.set({"todo_time_stamp": prevTimeStamp, "day_elapsed": flag});
        }
      });
    }

    function storeTodo() {
      listPanel = $(".list-panel").html();
      taskPanel = $(".task-panel").html();
      chrome.storage.sync.set ({
        "todo": {
          "list_panel": listPanel,
          "task_panel": taskPanel,
          "todo_num": numTodos,
          "list_num": numLists
        }
      });
    }

    function getStoredTodo() {
      chrome.storage.sync.get(null, function (data) {
        if (data["todo"] !== undefined) {

          let savedLists = data["todo"]["list_panel"];
          let savedTasks = data["todo"]["task_panel"];
          let savedNumTodos = data["todo"]["todo_num"];
          let savedNumLists = data["todo"]["list_num"];

          listPanel.html(savedLists);
          numLists = savedNumLists;
          numTodos = savedNumTodos;
          taskPanel.html(savedTasks);
          // All event handlers to be added to dynamically created elements
          applyCheck();
          applyDelete();
          addNewList();
          addNewTask();
          applySelectToggle();
          renderTodoStatus();
          taskReveal();
          deleteHover();
        }
      });
    }

    function todoHandler() {
      dayElapsed(86400000);
      chrome.storage.sync.get("day_elapsed", function(data) {
        if(data["day_elapsed"]) {
          console.log("You todo list has been reset");
          deleteTodo();
        } else {
          console.log("day has not elapsed");
          getStoredTodo();
        }
      });
    }
    todoHandler();

    function deleteTodo() {
      chrome.storage.sync.get(null, function(storage){
        console.log(storage["todo"]);
      });
    }

      function renderTodoStatus() {
        $(".todo-status").html(numTodos + " todos");
      }

      function updateTodoStatus(isDelete) {
        if (!isDelete) {
          numTodos++;
        }
        if (isDelete) {
          numTodos--;
        }
        renderTodoStatus();
      }

      function updateListNum(isDelete) {
        if (!isDelete) {
          numLists++;
        }
        if (isDelete) {
          numLists--;
        }
      }

      function deleteCascade(e) {
        // List name is linked to it's corresponding <ul> via same data-target num
        targetNum = $(e.target).parent().attr("data-target");
        let linkedList = $(`ul[data-target=${targetNum}]`);
        let numTodosToDelete = linkedList.find(".task").length;
        numTodos -= numTodosToDelete;
        linkedList.remove();
        renderTodoStatus();
      }

    function applyDefaultListSelect() {
        $(".list-panel").find("li[data-target='general']").addClass("list-selected");
    }

    function deleteHover() {
      function handlerIn() {
        $(this).find(".todo-delete").removeClass("hidden");
      }
      function handlerOut() {
        $(this).find(".todo-delete").addClass("hidden");
      }
      $(".item").hover(handlerIn, handlerOut);
    }

    function applyDelete() {
      // .off() prevents multiple listeners from being added to a single task
      $(".item").find(".todo-delete").off().on("click", function(e) {
        deleteCascade(e);
        // Prevents todoNum from being altered when deleting a list
        if($(e.target).parent().hasClass("list")) {
          updateListNum(true);
        } else {
          updateTodoStatus(true);
        }
        // e.stopPropagation();
        $(e.target).parent().fadeOut(function(){
          applyDefaultListSelect();
        });
      });
      deleteHover();
    }

    function applyCheck() {
      let check = (e) => {
        // consistent behavior when user clicks either the task value or the checkbox
        let target = $(e.target);
        if(!target.is(":checked")){
          target.prop("checked", false);
          target.parent().toggleClass("checked", "");
        }else {
          target.prop("checked", true);
          target.parent().toggleClass("checked", "");
        }
      };
      $(".task > input").off().on("click", check);
    }

    function taskReveal() {
      // The lists on the left panel are linked to the tasks on the right panel via data-target
      targetNum = $(".list-panel").find(".list-selected").attr("data-target");
      $(".task-panel ul").addClass("inactive");
      $(`ul[data-target=${targetNum}]`).removeClass("inactive");
    }

    function applySelectToggle() {
      $(".list-panel li").off().on("click", function(e){
        $(".list-panel li").removeClass("list-selected");
        $(this).addClass("list-selected");
        taskReveal();
      });
    }

    function addNewList() {
      $(".list-input").off().on("keydown", function(e) {
        if (event.which === 13 && e.target.value.trim() !== "") {
          updateListNum(false);

          // Removes selected class from all li's so newest list is selected
          $(".list-panel li").removeClass("list-selected");
          let list = `
            <label>
            <li data-target="${numLists}" class="item list list-selected">${e.target.value}
            <span class="todo-delete hidden">x</span>
            </li>
            </label>`;

          // Append list to list panel
          $(".list-panel").find("ul").prepend(list);
          applySelectToggle();
          applyDelete();

          // Append an empty ul with matching data-target to task panel
          $(".task-panel").append(`<ul data-target="${numLists}"></ul>`);
          taskReveal();

          // Clear the input after user hits enter
          $(".list-input").val("");
        }
      });
    }
    addNewList();

      function addNewTask() {
        $(".task-input").off().on("keydown", function(e) {
          if (e.which === 13 && e.target.value.trim() !== "") {
            let newItem =
              `<label><li class="item task">
              <input type="checkbox">
              ${e.target.value}
              <span class="todo-delete hidden">x</span></li></label>`;

            $(".task-panel").find(`[data-target=${targetNum}]`).append(newItem);
            applyDelete();
            applyCheck();
            $(".task-input").val("");

            // Increases # tasks
            updateTodoStatus(false);

          }
        });
      }
    addNewTask();

    applyDefaultListSelect();

    $(window).on("unload", function(){
      storeTodo();
    });

  });
})();

