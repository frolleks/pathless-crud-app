/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

function App() {
  const [todos, setTodos] = useState<any[]>([]); // State to hold the list of todos
  const [newTodo, setNewTodo] = useState(""); // State for the new todo input
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [loading, setLoading] = useState(true); // Loading state

  // Function to fetch todos from the backend
  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/todo");
      const data = await response.json();
      setTodos(data.todos); // Now we correctly set the todos array
    } catch (error) {
      console.error("Error fetching todos:", error);
      setErrorMessage("Could not fetch todos.");
    } finally {
      setLoading(false); // Stop loading after fetching
    }
  };

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Function to handle form submission and add a new todo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodo) {
      setErrorMessage("Title is required");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTodo }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTodos([...todos, newTask.todo]); // Add new task to the list
        setNewTodo(""); // Clear the input
        setErrorMessage(""); // Clear any error messages
      } else {
        setErrorMessage("Error creating todo.");
      }
    } catch (error) {
      console.error("Error creating todo:", error);
      setErrorMessage("Error creating todo.");
    }
  };

  // Function to toggle the completion status of a todo
  const toggleTodo = async (id: number, done: boolean) => {
    try {
      const response = await fetch(`http://localhost:3000/todo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ done: !done }),
      });

      if (response.ok) {
        // Update the todo locally
        const updatedTodos = todos.map((todo) =>
          todo.id === id ? { ...todo, done: !done } : todo
        );
        setTodos(updatedTodos);
      } else {
        setErrorMessage("Error updating todo.");
      }
    } catch (error) {
      console.error("Error updating todo:", error);
      setErrorMessage("Error updating todo.");
    }
  };

  // Function to delete a todo
  const deleteTodo = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/todo/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the deleted todo from the list
        const updatedTodos = todos.filter((todo) => todo.id !== id);
        setTodos(updatedTodos);
      } else {
        setErrorMessage("Error deleting todo.");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      setErrorMessage("Error deleting todo.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo App</h1>

      {/* Form to add a new todo */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center">
          <input
            type="text"
            className="border rounded p-2 w-full mr-2"
            placeholder="Add a new task"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded px-4 py-2"
          >
            Add Todo
          </button>
        </div>
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      </form>

      {/* Loading state */}
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <>
          {/* List of todos */}
          <ul className="list-disc pl-5">
            {todos.length === 0 ? (
              <p>No tasks yet!</p>
            ) : (
              todos.map((todo: any) => (
                <li key={todo.id} className="mb-2 flex items-center">
                  <span
                    onClick={() => toggleTodo(todo.id, todo.done)}
                    className={`cursor-pointer ${
                      todo.done ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="bg-red-500 text-white ml-4 px-2 rounded"
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
