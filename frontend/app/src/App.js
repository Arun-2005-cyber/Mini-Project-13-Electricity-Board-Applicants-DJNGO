import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/screens/Home.jsx";
import Header from "./components/screens/Header.jsx";
import EditApplicant from "./components/screens/EditApplicant.jsx";
import Stats from "./components/screens/Stats.jsx";
import LoginScreen from "./components/screens/LoginScreen.jsx";
import SignupScreen from "./components/screens/SignupScreen.jsx";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./Context/AuthContext";
import AddApplicant from "./components/screens/AddApplicant";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/EditApplicant/:id"
            element={
              <PrivateRoute>
                <EditApplicant />
              </PrivateRoute>
            }
          />
          <Route
            path="/statisticsCollection/"
            element={
              <PrivateRoute>
                <Stats />
              </PrivateRoute>
            }
          />
          <Route path="/login/" element={<LoginScreen />} />
          <Route path="/signup/" element={<SignupScreen />} />

          <Route
            path="/add-applicant"
            element={<PrivateRoute><AddApplicant /></PrivateRoute>}
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>

  );
}

export default App;
