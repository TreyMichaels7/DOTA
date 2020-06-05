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
      matches: [],
      likes: [],
      upcoming: [],
      userList: {},
      isLoaded: false
    }
  }

  async componentDidMount() {

    const upcoming = await this.getUpcoming();
    const matches = await this.getMatches();
    
    this.getMatches()
    .then((response) => {
      console.log(response);
      this.setState({
        matches: response.matches, likes: response.likes
      })
    })

    this.getUpcoming()
    .then((response) => {
      console.log(response);
      this.setState({
        upcoming: response.upcoming
      })
    });

    let upcomingArray = upcoming.upcoming;

    let formattedUpcoming = [];
    for (let upcoming of upcomingArray) {
      formattedUpcoming.push(upcoming.matchId);
    }
    console.log(formattedUpcoming);

    let fullList = matches.likes.concat(matches.matches);
    fullList = fullList.concat(formattedUpcoming);
    //fullList.concat(upcoming.upcoming);
    const userList = await this.getUserList(fullList);
    this.setState({userList: userList, isLoaded: true});

    console.log(userList);
    
  }

  /*
  getMatchID = () => {
    let id = Math.floor(Math.random() * 9) + 1; 
    while (id === JSON.parse(localStorage.getItem("User")).id || id === localStorage.getItem("match1")
     || id === localStorage.getItem("match2") || id === localStorage.removeItem("match3")) {
      id = Math.floor(Math.random() * 9) + 1; 
    }
    return id;
  }
  */
 
  getUserList = async (idList) => {
    let userObj = {};
    for (let i = 0; i < idList.length; i++) {
      let userInfo = await this.getMatchInfo(idList[i]);
      userObj[idList[i]] = userInfo;
      
    } 
    console.log(userObj);
    return userObj;
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

    if (response.status === 202) {
      let roomBody = {
        user1: body.userId,
        user2: body.matchId
      }
      console.log(roomBody);
      this.createRoom(roomBody);
      console.log("Chatroom Created!");
    }

    console.log(response);
    console.log("Successfully liked!");
    window.location.reload();

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
    return matches;
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
  createRoom = async (body) => {
    
    // const response = await fetch("https://chatroom.kelden.me/v1/room", {
    //   method: "POST",
    //   headers: {
    //     "x-user": localStorage.getItem("User"),
    //     'Accept': 'application/json, text/plain, */*',
    //     'Content-Type': 'application/json',
    //     "Authorization": localStorage.getItem("Authorization")
    //   },
    //   body: JSON.stringify(body)
    // });
    // if (response.status >= 300) {
    //   const error = await response.text();
    //   console.log(error);
    //   return;
    // }
    // const rooms = await response.json();
    // console.log(rooms);

    var requestOptions = {
      method: 'POST',
      headers: {
        "x-user": localStorage.getItem("User"),
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      redirect: 'follow'
    };

    console.log(requestOptions.body);
    
    fetch("https://chatroom.kelden.me/v1/room", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));

    alert("You got a match!!");
    
  }

  // /v1/likes, GET Request, used to show likes for the current user and populate the pending container
  getUpcoming = async() => {
    const response = await fetch("https://chatroom.kelden.me/v1/upcoming", {
      method: "GET",
      headers: {
        "x-user": localStorage.getItem("User")
      }
    })
    .catch((error) => {
      console.log(error);
      return;
    });
    const upcoming = await response.json();
    return upcoming;
  }

  render() {
    if (!this.props.loggedIn) {
      return <Redirect to = '/' />;
    }

    let index = 0;
    let matchData = this.state.isLoaded ? this.state.matches.map((data) => {
      index++;
      if (this.state.userList[data]) {
        return <MatchCard matchInfo={this.state.userList[data]} like={this.likeSomeone} dislike={this.deleteMatch} key={index}/> 
      } else {
        return <div className="match-message">Check Back Tomorrow for New Matches!</div>;
      }
    }) : <div>Loading...</div> ;

    if (this.state.matches.length === 0) {
      matchData = <div className="match-message">Check Back Tomorrow for New Matches!</div>;
    }

    index = 0;
    let pendingData = this.state.isLoaded ? this.state.likes.map((data) => {
      index++;
      if (this.state.userList[data]) {
        return <PendingRow name={this.state.userList[data].firstName} key={index}/>;
      } else {
        return "Loading...";
      }
    }) : <PendingRow name="Loading..."/>;

    index = 0;
    let upcomingData = this.state.isLoaded ? this.state.upcoming.map((data) => {
      index++;
      if (this.state.userList[data.matchId]) {
        return <UpcomingRow name={this.state.userList[data.matchId].firstName} chatroom={data.roomId} key={index}/>;
      } else {
        return "Loading...";
      }
    }) : <PendingRow name="Loading..."/>;

    return (
      <div>
        <header>
          <NavBar signOut={this.props.signOut}/>
        </header>
        <main>
          <div className="home-main">
            <div className="match-container">
                {matchData}
            </div>
            <div className="scheduled-container">
              <div>
                <h2>Upcoming Calls</h2>
                <div className="upcoming">
                    {upcomingData}
                </div>
              </div>
              <div>
                <h2>Pending Likes</h2>
                <div className="pending">
                    {pendingData}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }
}

/*
          <button onClick={this.getMatches}>get matches/likes</button>
          <button onClick={this.getRooms}>get rooms</button>
*/

export default App;
