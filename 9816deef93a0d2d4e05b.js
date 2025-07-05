import WorkDislay from "./WorkDisplay";
import initData from "./Tasks";
import Storage from "./Storage";
const storage = new Storage();
const workDisplay = new WorkDislay();
let draggedEl = null;
let ghostEl = null;
let elWidth;
let elHeight;
let elTop;
let elLeft;
const elTasks = document.querySelector("#tasks");
function elDragDrop(event, element) {
  const closest = document.elementFromPoint(event.clientX, event.clientY);
  const {
    top
  } = closest.getBoundingClientRect();
  if (closest.classList.contains("item-task")) {
    if (event.pageY > window.scrollY + top + closest.offsetHeight / 2) {
      closest.closest(".item-tasks").insertBefore(element, closest.nextElementSibling);
    } else {
      closest.closest(".item-tasks").insertBefore(element, closest);
    }
  } else if (closest.classList.contains("item-tasks") && !closest.querySelector(".item-task")) {
    closest.append(element);
  }
}
function toObjectTasks() {
  const toDoTasks = document.querySelectorAll("#todo .item-tasks .item-task");
  const inProgressTasks = document.querySelectorAll("#in-progress .item-tasks .item-task");
  const doneTasks = document.querySelectorAll("#done .item-tasks .item-task");
  const objTasks = {
    todo: [],
    inProgress: [],
    done: []
  };
  for (const item of toDoTasks) {
    objTasks.todo.push(item.textContent.replace(" ✖", ""));
  }
  for (const item of inProgressTasks) {
    objTasks.inProgress.push(item.textContent.replace(" ✖", ""));
  }
  for (const item of doneTasks) {
    objTasks.done.push(item.textContent.replace(" ✖", ""));
  }
  storage.save(objTasks);
}
document.addEventListener("DOMContentLoaded", () => {
  const storageData = JSON.parse(storage.load());
  if (storageData !== null) {
    workDisplay.initTasks(storageData);
  } else {
    workDisplay.initTasks(initData());
  }
});
elTasks.addEventListener("mousedown", event => {
  // open add new task
  if (event.target.classList.contains("add-card")) {
    event.target.parentNode.querySelector(".input-task").classList.remove("hidden");
    event.target.classList.add("hidden");

    // cancel add task
  } else if (event.target.classList.contains("cancel-task")) {
    event.target.closest(".col-tasks").querySelector(".add-task").classList.remove("hidden");
    event.target.parentNode.classList.add("hidden");

    // add new task
  } else if (event.target.classList.contains("add-task")) {
    const elAddTask = event.target.closest(".col-tasks").querySelector(".item-tasks");
    const elInput = event.target.closest(".input-task").querySelector("#text-task");
    workDisplay.addTask(elAddTask, elInput.value);
    elInput.value = "";
    event.target.closest(".col-tasks").querySelector(".add-card").classList.remove("hidden");
    event.target.parentNode.classList.add("hidden");
    toObjectTasks();

    // delete current task
  } else if (event.target.classList.contains("del-task")) {
    const itemDel = event.target.parentNode;
    itemDel.parentNode.removeChild(itemDel);
    toObjectTasks();

    // start dragged task
  } else if (event.target.classList.contains("item-task")) {
    event.preventDefault();
    event.target.querySelector(".del-task").classList.add("hidden");
    const {
      top,
      left
    } = event.target.getBoundingClientRect();
    draggedEl = event.target;
    elWidth = draggedEl.offsetWidth;
    elHeight = draggedEl.offsetHeight;
    elLeft = event.pageX - left;
    elTop = event.pageY - top;
    ghostEl = event.target.cloneNode(true);
    ghostEl.innerHTML = "";
    ghostEl.style.backgroundColor = "grey";
    ghostEl.style.width = `${elWidth}px`;
    ghostEl.style.height = `${elHeight}px`;
    draggedEl.classList.add("dragged");
    event.target.parentNode.insertBefore(ghostEl, event.target.nextElementSibling);
    draggedEl.style.left = `${event.pageX - elLeft}px`;
    draggedEl.style.top = `${event.pageY - elTop}px`;
    draggedEl.style.width = `${elWidth}px`;
    draggedEl.style.height = `${elHeight}px`;
  }
});
elTasks.addEventListener("mouseleave", event => {
  if (draggedEl) {
    event.preventDefault();
    ghostEl.parentNode.removeChild(ghostEl);
    draggedEl.classList.remove("dragged");
    draggedEl.style = "";
    ghostEl = null;
    draggedEl = null;
  }
});
elTasks.addEventListener("mousemove", event => {
  if (draggedEl) {
    event.preventDefault();
    elDragDrop(event, ghostEl);
    draggedEl.style.left = `${event.pageX - elLeft}px`;
    draggedEl.style.top = `${event.pageY - elTop}px`;
  }
});
elTasks.addEventListener("mouseup", event => {
  if (draggedEl) {
    elDragDrop(event, draggedEl);
    ghostEl.parentNode.removeChild(ghostEl);
    draggedEl.classList.remove("dragged");
    draggedEl.style = "";
    ghostEl = null;
    draggedEl = null;
    toObjectTasks();
  }
});