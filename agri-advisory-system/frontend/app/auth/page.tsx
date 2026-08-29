"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Use relative URL so Next.js proxy forwards to backend on port 8000
const API_BASE_URL = "";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Support login via email or username mapping to the backend schema
    const payload = isLogin
      ? { email: form.email, password: form.password } // form.email field doubles as username/email input
      : {
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword
        };

    const endpoint = isLogin ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/auth/signup`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        // Optional: Save user info/session token if returned
        if (data.user?.id) {
          localStorage.setItem("user_id", data.user.id);
        }
        router.push("/dashboard");
      } else {
        alert(data.detail || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Network or server error:", err);
      alert("Unable to connect to the backend server. Make sure FastAPI (uvicorn) is running on port 8000.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md border dark:border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">
          {isLogin ? "Sign In to Farmer Advisory" : "Farmer Account Registration"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="First Name"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
                required
              />
            </>
          )}
          <input
            type="text"
            placeholder="Username or Gmail / Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
            required
          />
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
              required
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
            required
          />
          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full p-3 border rounded dark:bg-gray-800 dark:text-white"
              required
            />
          )}
          <button
            type="submit"
            className="w-full py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm dark:text-gray-400">
          {isLogin ? "Don't have an account?" : "Already registered?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-600 font-semibold underline ml-1"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-gray-500 hover:underline">← Back to Home Page</a>
        </div>
      </div>
    </div>
  );
}