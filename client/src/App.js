import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom';
import { NavBar, MatchCard } from './Components/components';
import { CreateProfilePage } from './Pages/CreateProfilePage';
import { LandingPage } from './Pages/LandingPage';
import { EditProfilePage } from './Pages/EditProfilePage';
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
  * @description sets the user
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

  signOut = async (e) => {
    console.log("HELLO!");
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

class HomePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      match1: localStorage.getItem("match1") || null,
      match2: localStorage.getItem("match2") || null,
      match3: localStorage.getItem("match3") || null,
      match1user: null,
      match2user: null,
      match3user: null
    }
  }

  async componentDidMount() {
    if (!localStorage.getItem("match1")) {
      await localStorage.setItem("match1", this.getMatchID());
    }
    if (!localStorage.getItem("match2")) {
      await localStorage.setItem("match2", this.getMatchID());
    }
    if (!localStorage.getItem("match3")) {
      await localStorage.setItem("match3", this.getMatchID());
    }

    const m1 = await this.getMatchInfo(this.state.match1);
    const m2 = await this.getMatchInfo(this.state.match2);
    const m3 = await this.getMatchInfo(this.state.match3);

    this.setState({
      match1user: m1,
      match2user: m2,
      match3user: m3
    });

  }

  getMatchID = () => {
    let id = Math.floor(Math.random() * 9) + 1; 
    while (id === JSON.parse(localStorage.getItem("User")).id || id === localStorage.getItem("match1")
     || id === localStorage.getItem("match2") || id === localStorage.removeItem("match3")) {
      id = Math.floor(Math.random() * 9) + 1; 
    }
    return id;
  }

  getMatchInfo = async (id) => {
    const response = await fetch(api.testbase + api.handlers.userInfo + id.toString(), {
      method: "GET",
      headers: {
        "Authorization": localStorage.getItem("Authorization")
      }
    })

    if (response.status >= 300) {
      const error = await response.text();
      console.log(error);
      return;
    }

    const foundUser = await response.json();
    return foundUser;

  }

  getMatches = async() => {
    const response = await fetch("https://chatroom.kelden.me/v1/matches", {
      method: "GET",
      headers: {
        "x-user": localStorage.getItem("User")
      }
    })
    .catch((error) => {
      console.log(error);
      return;
    });
    const matches = await response.json();
    console.log(matches);
    /*
    if (response.status >= 300) {
      const error = await response.text();
      console.log(error);
      return;
    }
    const matches = await response.json();
    console.log(matches);
    */
  }

  deleteMatch = async(id) => {
    let body = {
      userId: 1,
      matchId: id
    }

    const response = await fetch("https://chatroom.kelden.me/v1/matches", {
      method: "DELETE",
      headers: {
        "x-user": localStorage.getItem("User"),
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .catch((error) => {
      console.log(error);
      return;
    });
    
    console.log(body);
    console.log("Successfully deleted");
  } 

  /*
  createRoom = () => {
    const response = await fetch("https://chatroom.kelden.me/v1/room", {
      method: "POST",
      headers: {
        "Authorization": localStorage.getItem("Authorization")
      }
    });
    if (response.status >= 300) {
      const error = await response.text();
      console.log(error);
      return;
    }
    const rooms = await response.json();
  }

            <button onClick={() => this.deleteMatch(3)}>delete match</button>
          <button onClick={this.getMatches}>get matches</button>
  */

  render() {
    if (!this.props.loggedIn) {
      return <Redirect to = '/' />;
    }

    let matchCardOne = this.state.match1user ? <MatchCard matchInfo={this.state.match1user} />  : <div>Loading...</div>
    let matchCardTwo = this.state.match2user ? <MatchCard matchInfo={this.state.match2user} />  : <div>Loading...</div>
    let matchCardThree = this.state.match2user ? <MatchCard matchInfo={this.state.match3user} />  : <div>Loading...</div>

    return (
      <div>
        <header>
          <NavBar signOut={this.props.signOut}/>
        </header>
        <main>
          <div className="home-main">
            <div className="match-container">
                {matchCardOne}
                {matchCardTwo}
                {matchCardThree}
            </div>
            <div className="scheduled-container">
              <div>
                <h2>Upcoming Calls</h2>
                <div className="upcoming"></div>
              </div>
              <div>
                <h2>Pending</h2>
                <div className="pending"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

class ProfilePage extends Component {

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

  setGenderAndSexuality = () => {
    if (this.state.user.gender === 1) {
      this.setState({gender: "Male"});
    } else if (this.state.user.gender === 2) {
      this.setState({gender: "Female"});
    } else {
      this.setState({gender: "Other"});
    }
    console.log(this.state.gender);

    if (this.state.user.sexuality === 1) {
      this.setState({sexuality: "Men"});
    } else if (this.state.user.sexuality === 2) {
      this.setState({sexuality: "Women"});
    } else {
      this.setState({sexuality: "other"});
    }
    console.log(this.state.sexuality);
  }
  
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

export default App;
