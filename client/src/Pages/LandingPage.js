import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Input } from 'reactstrap';
import api from '../Constants/APIEndpoints';

export class LandingPage extends Component {

    constructor(props) {
      super(props);
      this.state = {
        email: "",
        password: "",
      }
    }
  
    handleChange = (event) => {
      let val = event.target.value;
      this.setState({
          [event.target.name]: val
      });
    }
  
    signIn = async (e) => {
  
      const email = this.state.email;
      const password = this.state.password;
      const sendData = {
        email,
        password
      }
  
      const response = await fetch(api.testbase + api.handlers.StartSession, {
        method: "POST",
        body: JSON.stringify(sendData),
        headers: new Headers({
          "Content-Type": "application/json"
        })
      });
  
      if (response.status >= 300) {
        const error = await response.text();
        alert(error);
        return;
      }
  
      const authToken = response.headers.get("Authorization");
      localStorage.setItem("Authorization", authToken);
      localStorage.setItem("Logged-In", true);
      const user = await response.json();
      localStorage.setItem("User", JSON.stringify(user));
      this.props.setUser(user);
      alert("Logging in...");
      return <Redirect to ="/home"/>
    }
   
    render() {
      if (this.props.loggedIn) {
        return <Redirect to = '/home' />;
      }
  
      return (
        <main className="landing-main">
          <h1 className="landing-title">Dating on the Ave</h1>
          <h2 className="landing-subtitle">The Exclusive Dating Platform for UW Students</h2>
          <div className="sign-in">
            <Input type="email" name="email" className="input-field" value={this.state.email} onChange={this.handleChange} placeholder="Ex: 123@uw.edu"/>
            <Input type="password" name="password" className="input-field" value={this.state.password} onChange={this.handleChange} placeholder="Min 6 Characters" minLength="6"/>
            <span className="sign-in-button" >
              <span className="landing-links" onClick={this.signIn}>Sign In</span>
            </span>
            <p className="landing-text">--Or--</p>
            <p className="landing-text">Don't Have an Account?</p>
            <span className="sign-up-button">
              <Link className="landing-links" to="/register">Sign Up with a Valid UW Email</Link>
            </span>
          </div>
        </main>
      )
    }
  }