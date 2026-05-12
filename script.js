const API_URL = "http://localhost:5000/api";

let token = localStorage.getItem("token");
let username = localStorage.getItem("username");

if (token) {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("taskSection").style.display = "block";
  document.getElementById("userName").innerText = username;
  fetchTasks();
}

function showMessage(msg) {
  document.getElementById("msg").innerText = msg;
}

// REGISTER
async function registerUser() {
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  showMessage(data.message || "Registered Successfully");
}

// LOGIN
async function loginUser() {
  const email = document.getElementById("logEmail").value;
  const password = document.getElementById("logPassword").value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.name);

    token = data.token;
    username = data.name;

    document.getElementById("authSection").style.display = "none";
    document.getElementById("taskSection").style.display = "block";
    document.getElementById("userName").innerText = username;

    fetchTasks();
    showMessage("Login Successful!");
  } else {
    showMessage(data.message || "Login Failed");
  }
}

// ADD TASK
async function addTask() {
  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDesc").value;

  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title, description })
  });

  const data = await res.json();
  showMessage("Task Added Successfully!");

  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDesc").value = "";

  fetchTasks();
}

// FETCH TASKS
async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks`, {
    headers: { "Authorization": `Bearer ${token}` }
  });

  const tasks = await res.json();

  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");

    li.innerHTML = `
      <b class="${task.completed ? "completed" : ""}">${task.title}</b>
      <p class="${task.completed ? "completed" : ""}">${task.description || ""}</p>

      <div class="task-actions">
        <button class="complete-btn" onclick="toggleComplete('${task._id}', ${task.completed})">
          ${task.completed ? "Undo" : "Complete"}
        </button>

        <button class="edit-btn" onclick="editTask('${task._id}', '${task.title}', '${task.description || ""}')">
          Edit
        </button>

        <button class="delete-btn" onclick="deleteTask('${task._id}')">
          Delete
        </button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

// COMPLETE TASK
async function toggleComplete(id, currentStatus) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ completed: !currentStatus })
  });

  fetchTasks();
}

// EDIT TASK
async function editTask(id, title, description) {
  const newTitle = prompt("Edit Task Title:", title);
  const newDesc = prompt("Edit Task Description:", description);

  if (!newTitle) return;

  await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title: newTitle, description: newDesc })
  });

  fetchTasks();
}

// DELETE TASK
async function deleteTask(id) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  showMessage("Task Deleted!");
  fetchTasks();
}

// LOGOUT
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  location.reload();
}
