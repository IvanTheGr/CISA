import React, { useState } from "react";
import { loginApi } from "../api/authApi";
import "./LoginPage.css";
import { motion, AnimatePresence } from "framer-motion";

import eyeIcon from "../Picture/eye.png";
import hiddenIcon from "../Picture/hidden.png";
import userIcon from "../Picture/user.png";
import girlImage from "../Picture/Login_icon_pepole.png";
import logoAbhi from "../Picture/Logofixone.png";

const LoginPage = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const res = await loginApi(login, password);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      window.location.href = "/";
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || "Login failed. Please try again.",
      );
      setIsLoading(false);

      setTimeout(() => {
        setErrorMessage("");
      }, 4000);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* TITLE */}
        <img
          src={logoAbhi}
          alt="logo"
          className="md:hidden w-[250px] pb-[20px] block -ml-2"
        />
        <h2 className="login-title">
          <span className="typing-line">
            Welcome to{" "}
            <span style={{ color: "#D73A30", fontWeight: "700" }}>CISA</span>
          </span>
          <br />
          <div className="overflow-hidden">
            <motion.p
              className="text-sm font-semibold mt-1 whitespace-nowrap tracking-tight"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                background: "linear-gradient(90deg, #D73A30, #872924)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Customer Information System of Abhimata
            </motion.p>
          </div>
        </h2>

        {/* ERROR ALERT */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              className="error-alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <span>⚠ {errorMessage}</span>
              <button onClick={() => setErrorMessage("")}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* USER INPUT */}
        <div className="input-wrapper">
          <input
            className="login-input"
            placeholder="User ID"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
          <img src={userIcon} className="input-icon" alt="user" />
        </div>

        {/* PASSWORD INPUT */}
        <div className="input-wrapper">
          <input
            className="login-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <img
            src={showPassword ? eyeIcon : hiddenIcon}
            alt="toggle"
            className="input-icon clickable"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        {/* LOGIN BUTTON */}
        <button
          className="login-button"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Log In"}
        </button>

        {/* FOOTER */}
        <motion.p className="mt-10 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} PT Abhimata Persada. All rights reserved.
        </motion.p>
      </div>

      {/* RIGHT SIDE BACKGROUND */}
      <div className="login-bg">
        <div className="bg-gradient"></div>
        <img src={girlImage} alt="customer service" className="girl-img" />
        <img src={logoAbhi} alt="logo" className="logo-overlay" />
      </div>
    </div>
  );
};

export default LoginPage;
