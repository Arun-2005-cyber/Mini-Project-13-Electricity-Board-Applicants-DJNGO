import React from 'react'
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';


function Header() {
  return (
    <>
      <nav className="navbar navbar-expand-lg bg-primary p-3" data-bs-theme="dark">
        <div className="container-fluid">
          <LinkContainer to='/'>
            <Link className="navbar-brand  text-white">Electicity Board</Link>
          </LinkContainer>

          <button className="navbar-toggler collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarColor01">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <LinkContainer to='/'>
                  <Link className="nav-link text-white">Home</Link>
                </LinkContainer>
              </li>
              <li className="nav-item">
                <LinkContainer to='/statisticsCollection'>
                  <Link className="nav-link text-white">Dash Statistics</Link>
                </LinkContainer>
              </li>
              {localStorage.getItem("user") ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link text-white">
                      Hello, {JSON.parse(localStorage.getItem("user")).username}
                    </span>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn btn-light btn-sm ms-2"
                      onClick={() => {
                        localStorage.removeItem("user");
                        window.location.href ="/login";
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <LinkContainer to='/login'>
                      <Link className="nav-link text-white">Login</Link>
                    </LinkContainer>
                  </li>
                  <li className="nav-item">
                    <LinkContainer to='/signup'>
                      <Link className="nav-link text-white">Signup</Link>
                    </LinkContainer>
                  </li>
                </>
              )}
            </ul>

          </div>
        </div>
      </nav>
    </>
  )
}

export default Header