import { useState } from "react";

function Login({ onLogin }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-neutral-900 transition-colors">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-neutral-100">
          Ready to chat?
        </h2>
        <form
          onSubmit={handleSubmit}
          className="flex bg-white dark:bg-neutral-800 p-6 rounded shadow-md transition-colors"
        >
          <input
            type="text"
            placeholder="Enter your username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 text-base border border-gray-300 dark:border-neutral-700 rounded mr-4 w-64
                       focus:outline-none focus:ring-2 focus:ring-inset focus:ring-neutral-400
                       dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-400"
          />
          <button
            type="submit"
            className="bg-neutral-300 text-gray-900 px-4 py-2 rounded hover:bg-neutral-400
                       dark:bg-neutral-600 dark:text-white dark:hover:bg-neutral-500 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
