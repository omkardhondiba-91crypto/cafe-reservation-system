import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { signUp, signIn } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (isSignUp) {
      const { data, error } = await signUp(
        email,
        password,
        fullName
      );

      if (error) {
        setError(error.message);
      } else if (data.session) {
        setMessage("Account created successfully!");
      } else {
        setMessage(
          "Account created. Please check your email to confirm your account."
        );
      }
    } else {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      }
    }

    setLoading(false);
  }

  function switchMode() {
    setIsSignUp(!isSignUp);
    setMessage("");
    setError("");
    setPassword("");
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <h1>Café Reserve</h1>
          <p>Manage your café reservations easily</p>
        </div>

        <h2>
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        <p className="auth-subtitle">
          {isSignUp
            ? "Create an account to manage your reservations."
            : "Sign in to access your reservation dashboard."}
        </p>

        <form onSubmit={handleSubmit}>

          {isSignUp && (
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignUp
                ? "Create Account"
                : "Sign In"}
          </button>

        </form>

        <div className="auth-switch">
          {isSignUp
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            onClick={switchMode}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
}
