import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import api from '../Constants/APIEndpoints';

/*
  Page where a new user can create their own profile. 
*/
export class CreateProfilePage extends Component {
  
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
        photoURL: "https://picsum.photos/id/10/200/300",
        completed: false
      }
    }
  
    /*
      Handles the change of a specific input field value and 
      alters the component state equal to that value.
      Will also check to ensure that all required fields are completed.
    */
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
  
    /*
      Submits a form that contains all the required information needed in order to generate a new user account.
      If not all the required forms are filled, the user will be notified and have to continue filling out the fields.
      Otherwise, they will be notified their account was successfully created and they will be redirected to the home page.
    */
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
        localStorage.setItem("Logged-In", true);
        const user = await response.json();
        localStorage.setItem("User", JSON.stringify(user));
        this.props.setUser(user);
        alert("Profile Successfully Created!");
      }
    }
  
    /*
      If user is logged in, redirects to the home page. Otherwise it displays the page to create a new user account.
    */
    render() {
      if (this.props.loggedIn) {
        return <Redirect to = '/home' />;
      }
  
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
                <span className="landing-links" onClick={this.submitForm}>Submit</span>
            </span>
            <span className="sign-up-button">
                <Link className="landing-links" to="/">Back</Link>
            </span>
          </div>
        </main>
      )
    }
  }

