import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Form, FormGroup, Label, Input } from 'reactstrap';
import api from '../Constants/APIEndpoints';

export class EditProfilePage extends Component {
  
    constructor(props) {
      super(props);
      this.state = {
        bio: "",
        gender: "male",
        sexuality: "male",
        photoURL: "https://picsum.photos/id/10/200/300",
        submitted: false
      }
  
    }
  
    handleChange = (event) => {
      let val = event.target.value;
      this.setState({
          [event.target.name]: val
      });
    }
  
    
    updateStorage = async (id) => {
      console.log(api.testbase + api.handlers.userInfo + id);
      const response = await fetch(api.testbase + api.handlers.userInfo + id, {
        method: "GET",
        headers: ({
          "Authorization": localStorage.getItem("Authorization")
        })
      });
  
      if (response.status >= 300) {
        const error = await response.text();
        alert(error);
        return;
      }
  
      const user = await response.json();
      localStorage.setItem("User", JSON.stringify(user));
      alert("Profile successfully updated!");
      this.setState({submitted: true});
    }
    
  
    updateUser = async (e) => {
      let getUser = JSON.parse(localStorage.getItem("User"));
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
  
      console.log(api.testbase + api.handlers.userInfo + getUser['id']);
      console.log(localStorage.getItem("Authorization"));
      const response = await fetch(api.testbase + api.handlers.userInfo + getUser['id'], {
        method: "PATCH",
        body: JSON.stringify(sendData),
        headers: ({
          "Authorization": localStorage.getItem("Authorization"),
          "Content-Type": "application/json"
        })
      });
  
      if (response.status >= 300) {
        const error = await response.text();
        alert(error);
        return;
      }
  
      const update = await response.json();
      console.log(update);
      console.log("Updated!");
      this.updateStorage(getUser['id']);
    }
  
  
  
    render() {
      if (!this.props.loggedIn) {
        return <Redirect to = '/' />;
      }
  
      if (this.state.submitted) {
        this.setState({submitted: false});
        return <Redirect to = '/profile'/>
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
                <span className="landing-links" onClick={this.updateUser}>Submit</span>
            </span>
            <span className="sign-up-button">
                <Link className="landing-links" to="/profile">Back</Link>
            </span>
          </div>
        </main>
      )
    }
  }