import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { CreateProfilePage } from './Pages/CreateProfilePage';
import { LandingPage } from './Pages/LandingPage';
import { EditProfilePage } from './Pages/EditProfilePage';
import { ProfilePage } from './Pages/ProfilePage';
import { HomePage } from './Pages/HomePage';
import './App.css';

import api from './Constants/APIEndpoints';

class App extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      authToken: localStorage.getItem("Authorization") || null,
      user: localStorage.getItem("User") || null,
      loggedIn: localStorage.getItem("Logged-In") || false
    }
    console.log(this.state.user);

  }

  /**
    sets the state of the user for the auth token, the user info, and logged in status
  */
  setUser = (user) => {
    this.setState({ 
      authToken: localStorage.getItem("Authorization"),
      user: localStorage.getItem("User"),
      loggedIn: true
    });
    console.log("Logged In!");
    console.log(this.state.authToken);
    console.log(this.state.user);
    console.log(this.state.loggedIn);
  }

  /**
    resets the current user's state to logged out and without any information stored
    as the user is logged out and sent back to the landing sign-in page. Ends the current session.
  */
  signOut = async (e) => {
    console.log("HELLO!");
    this.setState({
      authToken: null,
      user: null,
      loggedIn: false
    });

    const response = await fetch(api.base + api.handlers.EndSession, {
      method: "DELETE",
      headers: ({
        "Authorization": this.state.authToken
      })
    });

    if (response.status >= 300) {
      const error = await response.text();
      console.log(error);
      return;
    }

    localStorage.clear();
    alert("You have been logged out!");
  }

  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route exact path='/' render={(props) => <LandingPage {...props} loggedIn={this.state.loggedIn} setUser={this.setUser}/>}></Route>
            <Route path='/home' render={(props) => <HomePage {...props} loggedIn={this.state.loggedIn} signOut={this.signOut}/>}></Route>
            <Route path='/register' render={(props) => <CreateProfilePage {...props} setUser={this.setUser} loggedIn={this.state.loggedIn}/>}></Route>
            <Route path='/profile' render={(props) => <ProfilePage {...props} loggedIn={this.state.loggedIn} signOut={this.signOut}/>}></Route>
            <Route path='/edit' render={(props) => <EditProfilePage {...props} loggedIn={this.state.loggedIn} user={this.state.user} auth={this.state.authToken} setUser={this.setUser}/>}></Route>
            <Redirect to = '/' />
          </Switch>
        </div>
      </Router>
    )
  }

}

export default App;


