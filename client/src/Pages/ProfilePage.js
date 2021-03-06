import React, { Component } from 'react';
import { NavBar } from '../Components/components';
import { Redirect, Link } from 'react-router-dom';

/*
  Page where a logged in user can view their own profile details.
*/
export class ProfilePage extends Component {

    constructor(props) {
      super(props);
      this.state = {
        user: JSON.parse(localStorage.getItem("User")),
        gender: "",
        sexuality: ""
      }
    }
  
    componentDidMount() {
      this.setGenderAndSexuality();
    }
  
    /*
      Sets the gender and sexuality values based on the numerical 
      value a user has stored for both gender and sexuality.
    */
    setGenderAndSexuality = () => {
      if (this.state.user.gender === 1) {
        this.setState({gender: "Male"});
      } else if (this.state.user.gender === 2) {
        this.setState({gender: "Female"});
      } else {
        this.setState({gender: "Other"});
      }
  
      if (this.state.user.sexuality === 1) {
        this.setState({sexuality: "Men"});
      } else if (this.state.user.sexuality === 2) {
        this.setState({sexuality: "Women"});
      } else {
        this.setState({sexuality: "other"});
      }
    }
    
    /*
      If user is logged out, redirects to the landing sign-in page. 
      Other wise it displays the personal profile page.
    */
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
                <div>
                  <img className="profile-pic" src={this.state.user.photoURL} alt="profile"/>
                </div>
                <div className="profile-text">
                  <h2>{this.state.user.firstName + " " + this.state.user.lastName}</h2>
                  <p>Identifies as {this.state.gender}</p>
                  <p>Interested in {this.state.sexuality}</p>
                </div>
              </div>
              <div className="edit-profile">
              </div>
            </div>
            <div className="profile-bio">
              <h2 className="profile-subtitle">Bio:</h2>
              <p className="profile-text">{this.state.user.bio}</p>
            </div>
          </main>
        </div>
      )
    }
  }