import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { NavBar, MatchCard, UpcomingRow, PendingRow } from './Components/components';
import { CreateProfilePage } from './Pages/CreateProfilePage';
import { LandingPage } from './Pages/LandingPage';
import { EditProfilePage } from './Pages/EditProfilePage';
import { ProfilePage } from './Pages/ProfilePage';
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

    const m1 = await this.getMatchInfo(localStorage.getItem("match1"));
    const m2 = await this.getMatchInfo(localStorage.getItem("match2"));
    const m3 = await this.getMatchInfo(localStorage.getItem("match3"));

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

  // /v1/likes, GET Request, used to show likes for the current user and populate the pending container
  getLikes = async() => {
    const response = await fetch("https://chatroom.kelden.me/v1/likes", {
      method: "GET",
      headers: {
        "x-user": localStorage.getItem("User")
      }
    })
    .catch((error) => {
      console.log(error);
      return;
    });
    const likes = await response.json();
    console.log(likes);
  }

  // /v1/likes, POST Request, used to generate a new like for the current user
  likeSomeone = async(id) => {
    let body = {
      userId: JSON.parse(localStorage.getItem("User"))["id"],
      matchId: id
    }
    const response = await fetch("https://chatroom.kelden.me/v1/likes", {
      method: "POST",
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
    console.log(response);
    console.log("Successfully liked!");

  }

  // /v1/matches, GET Request, used to show current matches for the current user.
  // Tested and works
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
}

  // /v1/matches, POST Request, used to generate a new match
  // Tested and works
  newMatch = async(id) => {
      let body = {
        userId: JSON.parse(localStorage.getItem("User"))["id"],
        matchId: id
      }
      const response = await fetch("https://chatroom.kelden.me/v1/matches", {
        method: "POST",
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
      console.log(response);
      console.log("Successfully matched!");
  }

  // Tested and works
  deleteMatch = async(id) => {
    let body = {
      userId: JSON.parse(localStorage.getItem("User"))["id"],
      matchId: id
    }

    await fetch("https://chatroom.kelden.me/v1/matches", {
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

  // /v1/room, GET Request, used to show current matches for the current user.
  // Tested and works
  getRooms = async () => {
    const response = await fetch("https://chatroom.kelden.me/v1/room", {
      method: "GET",
      headers: {
        "x-user": localStorage.getItem("User")
      }
    })
    .catch((error) => {
      console.log(error);
      return;
    });
    const rooms = await response.json();
    console.log(rooms);
  }

  // /v1/room, POST Request, used to create a new chatroom for the current user if two users mutually like each oterh.
  createRoom = async () => {
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
    console.log(rooms);
  }



  render() {
    if (!this.props.loggedIn) {
      return <Redirect to = '/' />;
    }

    let matchCardOne = this.state.match1user ? <MatchCard matchInfo={this.state.match1user} like={this.likeSomeone}/>  : <div>Loading...</div>
    let matchCardTwo = this.state.match2user ? <MatchCard matchInfo={this.state.match2user} like={this.likeSomeone}/>  : <div>Loading...</div>
    let matchCardThree = this.state.match2user ? <MatchCard matchInfo={this.state.match3user} like={this.likeSomeone}/>  : <div>Loading...</div>

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
                <div className="upcoming">
                    <UpcomingRow chatroom="" name="Ashley Li"/>
                    <UpcomingRow chatroom="" name="Jenny Kim"/>
                    <UpcomingRow chatroom="" name="Kathy Nguyen"/>
                    <UpcomingRow chatroom="" name="Karen White"/>
                    <UpcomingRow chatroom="" name="Hannah Montana"/>
                    <UpcomingRow chatroom="" name="Maggie Gyllenhall"/>
                    <UpcomingRow chatroom="" name="Lena Lu"/>
                </div>
              </div>
              <div>
                <h2>Pending Likes</h2>
                <div className="pending">
                    <PendingRow name="Ashley Madison"/>
                    <PendingRow name="Lisa Ann"/>
                    <PendingRow name="Anna Kendricks"/>
                    <PendingRow name="Jamie Chung"/>
                </div>
              </div>
            </div>
          </div>
          <button onClick={this.getMatches}>get matches</button>
          <button onClick={this.getLikes}>get likes</button>
          <button onClick={this.getRooms}>get rooms</button>
        </main>
      </div>
    )
  }
}

export default App;
