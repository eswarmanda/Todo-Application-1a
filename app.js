const express = require("express");
const path = require("path");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const parseISO = require("date-fns/parseISO");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(-1);
  }
};
initializeDBAndServer();

const checkingTodoValues = (request, response, next) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  let priorityArray = ["HIGH", "MEDIUM", "LOW"];
  let categoryArray = ["WORK", "HOME", "LEARNING"];
  let statusArray = ["TO DO", "IN PROGRESS", "DONE"];

  if (priorityArray.includes(priority)) {
    if (categoryArray.includes(category)) {
      if (statusArray.includes(status)) {
        if (isValid(parseISO(dueDate))) {
          next();
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};

// get list
app.get("/", async (request, response) => {
  const getListQuery = `SELECT
        *
     From
        todo;`;
  const dbResponse = await db.all(getListQuery);
  response.send(dbResponse);
  //   console.log(dbResponse);
});

// get user query
app.get("/todos/", async (request, response) => {
  const requestQuery = request.query;
  const { status, priority, search_q, category } = requestQuery;
  console.log(requestQuery);
  let priorityArray = ["HIGH", "MEDIUM", "LOW"];
  let categoryArray = ["WORK", "HOME", "LEARNING"];
  let statusArray = ["TO DO", "IN PROGRESS", "DONE"];
  const myJSON = JSON.stringify(requestQuery);
  let string = "";
  let a = "todo";
  for (let key of myJSON) {
    string += key;
  }

  if (string.includes("status")) {
    if (statusArray.includes(status)) {
      const getUsersQuery = `SELECT
                *
            FROM
                todo
            WHERE
            status = '${status}' ; `;
      const dbResponse = await db.all(getUsersQuery);
      response.send(dbResponse);
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else if (string.includes("priority")) {
    if (priorityArray.includes(priority)) {
      const getUsersQuery = `SELECT
                *
            FROM
                todo
            WHERE
            priority = '${priority}' ; `;
      const dbResponse = await db.all(getUsersQuery);
      response.send(dbResponse);
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (string.includes("category")) {
    if (categoryArray.includes(category)) {
      const getUsersQuery = `SELECT
                *
            FROM
                todo
            WHERE
           category = '${category}' ; `;
      const dbResponse = await db.all(getUsersQuery);
      response.send(dbResponse);
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else if (string.includes("search_q")) {
    const getUsersQuery = `SELECT
                *
            FROM
                todo
            WHERE
           todo = '${search_q}'; `;
    const dbResponse = await db.all(getUsersQuery);
    response.send(dbResponse);
    
  }
});

// get todo by id
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT
          *
       FROM
          todo
       WHERE
      id = '${todoId}';`;
  const dbResponse = await db.get(getTodoQuery);
  response.send(dbResponse);
});
// get todos by date
app.get("/agenda/", async (request, response) => {
  const requestQuery = request.query;
  const { date } = requestQuery;
  console.log(requestQuery);
  const dateZ = format(new Date(date), "yyyy-MM-dd");
  console.log(dateZ);

  if (parseISO(dateZ) === "Invalid Date") {
    const getTodoQuery = `SELECT
          *
       FROM
          todo
       WHERE
      due_date = '${dateZ}';`;
    const dbResponse = await db.all(getTodoQuery);
    response.send(dbResponse);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// create todo
app.post("/todos/", checkingTodoValues, async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const createTodoQuery = `
            INSERT INTO 
            todo (id, todo, priority, status, category, due_date)
            VALUES ('${id}','${todo}','${priority}','${status}','${category}','${dueDate}');`;
  await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

// update todo
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const requestBody = request.body;
  console.log(requestBody);

  const myJSON = JSON.stringify(requestBody);
  let string = "";
  let a = "todo";
  for (let key of myJSON) {
    string += key;
  }
  console.log(string.split(" "));

  const { todo, priority, status, dueDate, category } = requestBody;
  if (string.includes("todo")) {
    const getTodoQuery = `
        UPDATE todo SET todo = '${todo}' WHERE id = ${todoId}; `;
    await db.run(getTodoQuery);
    response.send("Todo Updated");
  } else if (string.includes("priority")) {
    let priorityArray = ["HIGH", "MEDIUM", "LOW"];
    if (priorityArray.includes(priority)) {
      const getPriorityQuery = `
        UPDATE todo SET priority = '${priority}' WHERE id = ${todoId}; `;
      await db.run(getPriorityQuery);
      response.send("Priority Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else if (string.includes("dueDate")) {
    if (isValid(parseISO(dueDate))) {
      const getPriorityQuery = `
        UPDATE todo SET due_date = '${dueDate}' WHERE id = ${todoId}; `;
      await db.run(getPriorityQuery);
      response.send("Due Date Updated");
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  } else if (string.includes("category")) {
    let categoryArray = ["WORK", "HOME", "LEARNING"];
    if (categoryArray.includes(category)) {
      const getPriorityQuery = `
        UPDATE todo SET category = '${category}' WHERE id = ${todoId}; `;
      await db.run(getPriorityQuery);
      response.send("Category Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    if (statusArray.includes(status)) {
      const getStatusQuery = `
        UPDATE todo SET status = '${status}' WHERE id = ${todoId}; `;
      await db.run(getStatusQuery);
      response.send("Status Updated");
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }
});

// delete todo
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  console.log(todoId);
  const deleteTodoItemQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodoItemQuery);
  response.send("Todo Deleted");
});

module.exports = app;
