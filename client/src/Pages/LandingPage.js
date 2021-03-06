import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Input } from 'reactstrap';
import api from '../Constants/APIEndpoints';

/*
  First page that a new or unlogged in user will reach. Lets them either sign in or sign up for a new account.
*/
export class LandingPage extends Component {

    constructor(props) {
      super(props);
      this.state = {
        email: "",
        password: "",
      }
    }
  
    /*
      Handles the change of a specific input field value and 
      alters the component state equal to that value
    */
    handleChange = (event) => {
      let val = event.target.value;
      this.setState({
          [event.target.name]: val
      });
    }
  
    /*
      Enables a user to sign into their account, starting a new session and stored their data locally.
      Makes a POST Request using the credentials entered to gather and save this information.
      If their credentials are invalid the user is notified that the login failed.
    */
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
      return <Redirect to ="/home"/>
    }
    
    /*
      If the user is logged in, redirects to the home page. Otherwise, displays the landing-sign in page.
    */
    render() {
      if (this.props.loggedIn) {
        return <Redirect to = '/home' />;
      }
  
      return (
        <main className="landing-main">
          <h1 className="landing-title">Dating on the Ave</h1>
          <h2 className="landing-subtitle">The Exclusive Dating Platform for UW Students</h2>
          <div className="sign-in">
            <Input type="email" name="email" className="input-field" value={this.state.email} onChange={this.handleChange} placeholder="Email or Username"/>
            <Input type="password" name="password" className="input-field" value={this.state.password} onChange={this.handleChange} placeholder="Password" minLength="6"/>
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