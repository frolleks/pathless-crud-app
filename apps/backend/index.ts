import pathless from "pathless";
import { cors } from "pathless/middleware";
import sql from "./db";

const app = pathless();

app.use(cors());

app.get("/", (req, res) => {
  res.text("hello!");
});

app.get("/todo/:id", async (req, res) => {
  const { id }: any = req.params;

  try {
    // Fetch the todo item by ID
    const todo = await sql`SELECT * FROM tasks WHERE id = ${id}`;

    // Check if a todo item with the given ID exists
    if (todo.length === 0) {
      res.status(404).json({ message: "Todo not found" });
    } else {
      // Respond with the fetched todo
      res.json(todo[0]);
    }
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({ message: "Error fetching todo" });
  }
});

app.get("/todo", async (req, res) => {
  try {
    // Fetch all tasks from the "tasks" table
    const todos = await sql`SELECT * FROM tasks`;

    // Return the fetched tasks as a JSON response
    res.json({ todos });
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ message: "Error fetching todos" });
  }
});

app.post("/todo", async (req, res) => {
  const body = req.body;

  // Input validation: Check if the title is provided
  if (!body.title) {
    res.status(400).json({ message: "Title is required" });
  }

  try {
    // Insert the new todo into the database, returning the inserted row
    const insertedTodo = await sql`
      INSERT INTO tasks (title, done) VALUES (
        ${body.title}, 
        FALSE
      ) 
      RETURNING id, title, done, created_at;
    `;

    // Respond with the inserted todo
    res.json({
      message: "Todo created!",
      todo: insertedTodo[0], // Return the inserted todo
    });
  } catch (error) {
    console.error("Error inserting todo:", error);
    res.status(500).json({ message: "Error creating todo" });
  }
});

app.put("/todo/:id", async (req, res) => {
  const { id }: any = req.params;
  const { title, done } = req.body;

  // Input validation: Ensure at least one field is provided
  if (title === undefined && done === undefined) {
    return res
      .status(400)
      .json({ message: "Either title or done status is required" });
  }

  try {
    // Check if the todo with the given ID exists
    const existingTodo = await sql`SELECT * FROM tasks WHERE id = ${id}`;
    if (existingTodo.length === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Build the update query manually
    let query = sql`UPDATE tasks SET `;
    const params = [];

    if (title !== undefined) {
      query = sql`${query} title = ${title}`;
      params.push("title");
    }

    if (done !== undefined) {
      // If title was also updated, append a comma
      if (params.length > 0) {
        query = sql`${query},`;
      }
      query = sql`${query} done = ${done}`;
      params.push("done");
    }

    query = sql`${query} WHERE id = ${id} RETURNING id, title, done, created_at`;

    // Run the update query
    const updatedTodo = await query;

    // Respond with the updated todo
    res.json({
      message: "Todo updated!",
      todo: updatedTodo[0], // Return the updated todo
    });
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ message: "Error updating todo" });
  }
});

app.delete("/todo/:id", async (req, res) => {
  const { id }: any = req.params;

  try {
    // Check if the todo with the given ID exists
    const existingTodo = await sql`SELECT * FROM tasks WHERE id = ${id}`;
    if (existingTodo.length === 0) {
      res.status(404).json({ message: "Todo not found" });
      return;
    }

    // Delete the todo item
    await sql`DELETE FROM tasks WHERE id = ${id}`;

    // Respond with a success message
    res.json({ message: "Todo deleted successfully!" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ message: "Error deleting todo" });
  }
});

app.listen(3000, () => {
  console.log("Application is running!");
});
