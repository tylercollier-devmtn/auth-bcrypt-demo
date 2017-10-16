import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';

class App extends Component {
  state = {
    user: null,
    showRegister: false,
    message: null
  };

  getMessage = error => error.response
    ? error.response.data
      ? error.response.data.message
      : JSON.stringify(error.response.data, null, 2)
    : error.message;

  register = () => {
    this.setState({ message: null });
    const username = this.refs.username.value;
    const password = this.refs.password.value;
    axios.post('/register', {
      username,
      password
    }).then(response => {
      this.setState({ user: response.data });
    }).catch(error => {
      this.setState({ message: 'Something went wrong: ' + this.getMessage(error) });
    });
  };
  
  login = () => {
    this.setState({ message: null });
    const username = this.refs.username.value;
    const password = this.refs.password.value;
    axios.post('/login', {
      username,
      password
    }).then(response => {
      this.setState({ user: response.data });
    }).catch(error => {
      this.setState({ message: 'Something went wrong: ' + this.getMessage(error) });
    });
  };

  logout = () => {
    axios.post('/logout').then(response => {
      this.setState({ user: null });
    }).catch(error => {
      this.setState({ message: 'Something went wrong: ' + this.getMessage(error) });
    });
  };

  render() {
    const { user, showRegister, message } = this.state;
    const userData = JSON.stringify(user, null, 2);
    const inputFields = <div>
      Username: <input ref="username" />
      {' '}
      Password: <input type="password" ref="password" />
      {' '}
    </div>

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <div className="App-intro">
          {!user && <div>
            <a href="javascript:void(0)" onClick={() => this.setState({ showRegister: false })}>Login</a>
            {' '}
            <a href="javascript:void(0)" onClick={() => this.setState({ showRegister: true })}>Register</a>
            <div className="login-or-register">
              {showRegister && <div>
                <h2>Register</h2>
                {inputFields}
                <button onClick={this.register}>Register</button>
              </div>}
              {!showRegister && <div>
                <h2>Log in</h2>
                {inputFields}
                <button onClick={this.login}>Log in</button>
              </div>}
              {message}
            </div>
          </div>}
          {user && <div className="user-info">
            <h2>User data:</h2>
            <div>{ userData }</div>
            <button onClick={this.logout}>Log out</button>
          </div>}
        </div>
      </div>
    );
  }
}

export default App;
