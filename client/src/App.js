import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, NavLink, Switch, Redirect } from 'react-router-dom';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap'
import logo from './logo.svg';
import './App.css';

class App extends Component {
  
  constructor(props){
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route exact path='/'><LandingPage/></Route>
            <Route path='/home'><HomePage/></Route>
            <Route path='/register'><CreateProfilePage/></Route>
            <Route path='/profile'><ProfilePage/></Route>
            <Redirect to ='/' />
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
  render() {
    return (
      <main className="register-main">
        <h1 className="register-title">Create Your Profile</h1>
        <Form className="register-form">
          <FormGroup className="form-group">
            <Label className="field-title" for="FName">First Name*:</Label>
            <Input type="text" name="FName" id="FName" className="input-field" placeholder="First Name" />
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="LName">Last Name*:</Label>
            <Input type="text" name="LName" id="LName" className="input-field" placeholder="Last Name" />
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="exampleEmail">Email*:</Label>
            <Input type="email" name="email" id="exampleEmail" className="input-field" placeholder="123@uw.edu" />
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="examplePassword">Password*:</Label>
            <Input type="password" name="password" id="examplePassword" className="input-field" placeholder="Min 6 Characters" />
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="Major">Major/Intended Major:</Label>
            <Input type="text" name="major" id="major" className="input-field"/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="pronouns">Pronouns:</Label>
            <Input type="text" name="pronouns" id="pronouns" className="input-field"/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="bio">Bio:</Label>
            <Input type="textarea" name="bio" id="bio" className="input-field" placeholder="Max 300 characters"/>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="Gender">Gender*:</Label>
            <Input type="select" name="gender" id="gender" className="input-field">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Input>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="interest">Interested In*:</Label>
            <Input type="select" name="interest" id="interest" className="input-field">
              <option>Men</option>
              <option>Women</option>
              <option>Other</option>
            </Input>
          </FormGroup>
          <FormGroup className="form-group">
            <Label className="field-title" for="exampleFile">Upload Profile</Label>
            <Input type="file" name="profilePic" id="profilePic" className="input-field"/>
          </FormGroup>
        </Form>
        <div className="register-button-group">
          <span className="sign-up-button">
              <Link className="landing-links" to="/home">Submit</Link>
          </span>
          <span className="sign-up-button">
              <Link className="landing-links" to="/">Back</Link>
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
            <button className="edit-button">Edit</button>
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
          <Link className="nav-links" to="/profile">Edit Profile</Link>
          <Link className="nav-links" to="/home">Notifications</Link>
          <Link className="nav-links" to="/">Sign Out</Link>
        </div>
      </nav>
    )
  }
}

export default App;