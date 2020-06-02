import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap'
import './App.css';

import api from './Constants/APIEndpoints';

class App extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      authToken: localStorage.getItem("Authorization") || null,
      user: null,
      loggedIn: false
    }
  }

  /**
  * @description sets the user
  */
  setUser = (user) => {
    this.setState({ 
      authToken: localStorage.getItem("Authorization"),
      user,
      loggedIn: true
    });
    console.log("Logged In!");
    console.log(this.state.authToken);
    console.log(this.state.user);
    console.log(this.state.loggedIn);
  }

  signOut = async (e) => {

    this.setState({
      authToken: null,
      user: null,
      loggedIn: false
    });

    const response = await fetch(api.testbase + api.handlers.EndSession, {
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

    console.log("Logged Out!");
    alert("You have been logged out!");

  }

  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route exact path='/' render={(props) => <LandingPage {...props} loggedIn={this.state.loggedIn} setUser={this.setUser}/>}></Route>
            <Route path='/home' render={(props) => <HomePage {...props} loggedIn={this.state.loggedIn} signOut={this.signOut}/>}></Route>
            <Route path='/register' render={(props) => <CreateProfilePage {...props} setUser={this.setUser}/>}></Route>
            <Route path='/profile' render={(props) => <ProfilePage {...props} loggedIn={this.state.loggedIn} user={this.state.user}/>} signOut={this.signOut}></Route>
            <Route path='/edit' render={(props) => <EditProfilePage {...props} loggedIn={this.state.loggedIn} user={this.state.user} auth={this.state.authToken} setUser={this.setUser}/>}></Route>
            <Redirect to = '/' />
          </Switch>
        </div>
      </Router>
    )
  }

}

class LandingPage extends Component {

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
    const user = await response.json();
    this.props.setUser(user);
    alert("Logging in...");
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
            <Link className="landing-links" onClick={this.signIn} to="/" >Sign In</Link>
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

class CreateProfilePage extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      bio: "",
      gender: "male",
      sexuality: "male",
      photoURL: "",
      completed: false
    }
  }

  handleChange = (event) => {
    let val = event.target.value;
    this.setState({
        [event.target.name]: val
    });
    if (this.state.firstName !== "" && this.state.lastName !== "" && this.state.email !== "" && this.state.password !== "") {
      this.setState({
        completed: true
      });
    } else {
      this.setState({
        completed: false
      });
    }
  }

  submitForm = async (e) => {
    if (!this.state.completed) {
      e.preventDefault();
      alert("Error! Some required fields were not completed");
    } else {
      const { 
        firstName,
        lastName,
        email,
        password,
        bio,
        photoURL } = this.state;
      let gender;
      let sexuality;

      if (this.state.gender === "male") {
        gender = 1;
      } else if (this.state.gender === "female") {
        gender = 2;
      } else {
        gender = 3;
      }

      if (this.state.sexuality === "male") {
        sexuality = 1;
      } else if (this.state.sexuality === "female") {
        sexuality = 2;
      } else {
        sexuality = 3;
      }

      const sendData = {
          firstName,
          lastName,
          email,
          password,
          bio,
          gender,
          sexuality,
          photoURL
      };
      const response = await fetch(api.testbase + api.handlers.signUp, {
        method: "POST",
        body: JSON.stringify(sendData),
        headers: new Headers({
            "Content-Type": "application/json"
        })
      });
      if (response.status >= 300) {
        const error = await response.text();
        console.log(error);
        return;
      }
      const authToken = response.headers.get("Authorization");
      localStorage.setItem("Authorization", authToken);
      const user = await response.json();
      this.props.setUser(user);
      alert("Profile Successfully Created!");
    }
  }

  render() {
    return (
      <main className="register-main">
        <h1 className="register-title">Create Your Profile</h1>
        <Form className="register-form">
          <FormGroup className="form-group">
            <Label className="field-title" for="FName">First Name*:</Label>
            <Input type="text" name="firstName" id="FName" className="input-field" placeholder="First Name" maxLength="128" value={this.state.firstName} onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="LName">Last Name*:</Label>
            <Input type="text" name="lastName" id="LName" className="input-field" placeholder="Last Name" maxLength="128" value={this.state.lastName} onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="exampleEmail">Email*:</Label>
            <Input type="email" name="email" id="exampleEmail" className="input-field" placeholder="123@uw.edu" value={this.state.email} onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="examplePassword">Password*:</Label>
            <Input type="password" name="password" id="examplePassword" className="input-field" placeholder="Min 6 Characters" minLength="6" maxLength="16" value={this.state.password} onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="bio">Bio:</Label>
            <Input type="textarea" name="bio" id="bio" className="input-field" placeholder="Max 300 characters" maxLength="300" value={this.state.bio} onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="Gender">Gender*:</Label>
            <Input type="select" name="gender" id="gender" className="input-field white-field" value={this.state.gender} onChange={this.handleChange}>
              <option>male</option>
              <option>female</option>
              <option>other</option>
            </Input>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="sexuality">Interested In*:</Label>
            <Input type="select" name="sexuality" id="sexuality" className="input-field white-field" value={this.state.sexuality} onChange={this.handleChange}>
              <option>male</option>
              <option>female</option>
              <option>other</option>
            </Input>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="uploadProfile">Upload Profile</Label>
            <Input type="text" name="photoURL" id="profilePic" className="input-field white-field" value={this.state.photoURL} onChange={this.handleChange} placeholder="url path to public image"/>
          </FormGroup>
        </Form>
        <div className="register-button-group">
          <span className="sign-up-button">
              <Link className="landing-links" onClick={this.submitForm} to={this.state.completed ? "/home" : "/register"}>Submit</Link>
          </span>
          <span className="sign-up-button">
              <Link className="landing-links" to="/">Back</Link>
          </span>
        </div>
      </main>
    )
  }
}

class EditProfilePage extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      bio: "",
      gender: "male",
      sexuality: "Men",
      photoURL: "",
    }
  }

  handleChange = (event) => {
    let val = event.target.value;
    this.setState({
        [event.target.name]: val
    });
  }

  updateUser = async (e) => {
    const {
      bio,
      photoURL
    } = this.state;

    let gender;
    let sexuality;

    if (this.state.gender === "male") {
      gender = 1;
    } else if (this.state.gender === "female") {
      gender = 2;
    } else {
      gender = 3;
    }

    if (this.state.sexuality === "male") {
      sexuality = 1;
    } else if (this.state.sexuality === "female") {
      sexuality = 2;
    } else {
      sexuality = 3;
    }

    const sendData = {
      bio,
      gender,
      sexuality,
      photoURL
    }

    console.log(this.props.user.id);
    console.log(this.props.auth);
    console.log(api.testbase + api.handlers.userInfo + this.props.user.id);
    const response = await fetch(api.testbase + api.handlers.userInfo + this.props.user.id, {
      method: "PATCH",
      body: JSON.stringify(sendData),
      headers: ({
        "Authorization": this.props.auth,
        "Content-Type": "application/json"
      })
    });
    if (response.status >= 300) {
      const error = await response.text();
      alert(error);
      return;
    }
    const user = await response.json();
    this.props.setUser(user);
    console.log("Updated!");
  }

  render() {
    if (!this.props.loggedIn) {
      return <Redirect to = '/' />;
    }

    return (
      <main className="register-main">
        <h1 className="register-title">Edit Profile</h1>
        <Form className="register-form">
          <FormGroup className="form-group">
            <Label className="field-title" for="bio">Bio:</Label>
            <Input type="textarea" name="bio" id="bio" className="input-field" placeholder="Max 300 characters" maxLength="300" value={this.state.bio} onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="Gender">Gender:</Label>
            <Input type="select" name="gender" id="gender" className="input-field white-field" value={this.state.gender} onChange={this.handleChange}>
              <option>male</option>
              <option>female</option>
              <option>other</option>
            </Input>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="preference">Interested In:</Label>
            <Input type="select" name="sexuality" id="preference" className="input-field white-field" value={this.state.sexuality} onChange={this.handleChange}>
              <option>male</option>
              <option>female</option>
              <option>other</option>
            </Input>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="uploadProfile">Upload Profile</Label>
            <Input type="text" name="photoURL" id="profilePic" className="input-field white-field" value={this.state.photoURL} onChange={this.handleChange} placeholder="url path to public image"/>
          </FormGroup>
        </Form>
        <div className="register-button-group">
          <span className="sign-up-button">
              <Link className="landing-links" onClick={this.updateUser} to="/edit">Submit</Link>
          </span>
          <span className="sign-up-button">
              <Link className="landing-links" to="/profile">Back</Link>
          </span>
        </div>
      </main>
    )
  }
}


class HomePage extends Component {
  render() {
    if (!this.props.loggedIn) {
      return <Redirect to = '/' />;
    }

    return (
      <div>
        <header>
          <NavBar signOut={this.props.signOut}/>
        </header>
        <main>

        </main>
      </div>
    )
  }
}

class ProfilePage extends Component {
  
  render() {
    if (!this.props.loggedIn) {
      return <Redirect to = '/' />;
    }

    return (
      <div>
        <header>
          <NavBar signOut={this.props.signOut}/>
        </header>
        <main className="profile-main">
          <div className="profile-block">
            <h1 className="profile-title">Your Profile</h1>
            <span className="edit-button">
                <Link className="edit-links" to="/edit">Edit</Link>
            </span>
          </div>
          <div className="profile-container">
            <div className="profile-block">
              <div className="profile-pic">
                <img className="profile-pic" src={this.props.user.photoURL} alt="profile"/>
              </div>
              <div className="profile-text">
                <h2>{this.props.user.firstName + " " + this.props.user.lastName}</h2>
              </div>
            </div>
            <div className="edit-profile">
            </div>
          </div>
          <div className="profile-bio">
            <h2 className="profile-subtitle">Bio:</h2>
            <p className="profile-text">{this.props.user.bio}</p>
          </div>
        </main>
      </div>
    )
  }
}

class NavBar extends Component {

  constructor(props){
    super(props);
    this.state = {
      expanded: false
    }
  }

  expandMenu = () => {
    this.setState({expanded: !this.state.expanded});
  }

  render() {
    return (
      <nav>
        <div className="nav-bar">
          <div>
            <a className="nav-home-link" href="/home">Dating on the Ave</a>
          </div>
          <Button className="nav-profile-pic" onClick={this.expandMenu}>
            
          </Button>
        </div>
        <div className={this.state.expanded ? "expanded" : "hidden"}>
          <Link className="nav-links" to="/profile">Profile</Link>
          <Link className="nav-links" to="/home">Notifications</Link>
          <span onClick={this.props.signOut}>
            <Link className="nav-links" to="/">Sign Out</Link>
          </span>
        </div>
      </nav>
    )
  }
}

export default App;
