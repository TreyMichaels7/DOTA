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
    this.setState({ user,
      loggedIn: true
    });
  }

  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route exact path='/'><LandingPage/></Route>
            <Route path='/home'>{this.state.loggedIn ? <HomePage/> : <LandingPage/>}</Route>
            <Route path='/register' render={(props) => <CreateProfilePage {...props} adoptCallback={this.setUser}/>}></Route>
            <Route path='/profile'>{this.state.loggedIn ? <ProfilePage/> : <LandingPage/>}</Route>
            <Route path='/edit'><EditProfilePage/></Route>
            <Redirect to ={this.state.loggedIn ? '/home' : '/'} />
          </Switch>
        </div>
      </Router>
    )
  }

}

class LandingPage extends Component {
  render() {
    return (
      <main className="landing-main">
        <h1 className="landing-title">Dating on the Ave</h1>
        <h2 className="landing-subtitle">The Exclusive Dating Platform for UW Students</h2>
        <div className="sign-in">
          <input type="email" className="input-field" placeholder="Ex: 123@uw.edu"/>
          <input type="password" className="input-field" placeholder="Min 6 Characters" minLength="6"/>
          <span className="sign-in-button">
            <Link className="landing-links" to="/home">Sign In</Link>
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
      console.log(this.state.completed);
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
      console.log(user);
      this.props.adoptCallback(user);
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
            <Input type="file" name="uploadProfile" id="profilePic" className="input-field white-field" value={this.state.photoURL} onChange={this.handleChange}/>
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
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      bio: "",
      gender: "male",
      preference: "Men",
      uploadProfile: "",
    }
  }

  handleChange = (event) => {
    let val = event.target.value;
    this.setState({
        [event.target.name]: val
    });
  }

  submitForm = () => {

  }

  render() {
    return (
      <main className="register-main">
        <h1 className="register-title">Edit Profile</h1>
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
            <Label className="field-title" for="preference">Interested In*:</Label>
            <Input type="select" name="preference" id="preference" className="input-field white-field" value={this.state.sexuality} onChange={this.handleChange}>
              <option>male</option>
              <option>female</option>
              <option>other</option>
            </Input>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="uploadProfile">Upload Profile</Label>
            <Input type="file" name="uploadProfile" id="profilePic" className="input-field white-field" value={this.state.uploadProfile} onChange={this.handleChange}/>
          </FormGroup>
        </Form>
        <div className="register-button-group">
          <span className="sign-up-button">
              <Link className="landing-links" onClick={this.submitForm} to="/profile">Submit</Link>
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
    return (
      <div>
        <header>
          <NavBar/>
        </header>
        <main>

        </main>
      </div>
    )
  }
}

class ProfilePage extends Component {
  render() {
    return (
      <div>
        <header>
          <NavBar/>
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
                <img src="" alt=""/>
              </div>
              <div className="profile-text">
                <h2>UserName, 18, M</h2>
                <p>Studies Computer Science</p>
                <p>Interested in Females</p>
                <p>He/Him</p>
              </div>
            </div>
            <div className="edit-profile">
            </div>
          </div>
          <div className="profile-bio">
            <h2 className="profile-subtitle">Bio:</h2>
            <p className="profile-text">FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY FULL BIOGRAPHY</p>
          </div>
          <div className="profile-avail">
            <h2 className="profile-subtitle">Availability:</h2>
            <p className="profile-text">Typically free between 10pm-2am</p>
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
    console.log(this.state.expanded);
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
          <Link className="nav-links" to="/">Sign Out</Link>
        </div>
      </nav>
    )
  }
}

export default App;
