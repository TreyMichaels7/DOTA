
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { NavBar, MatchCard, UpcomingRow, PendingRow } from '../Components/components';
import api from '../Constants/APIEndpoints';

/*
  Central Page where the logged in user can see their potential matches, 
  users that they have liked, as well as their upcoming chatrooms.
*/
export class HomePage extends Component {

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
      Generates a list of any user that is either a like, potential match, or involved in an upcoming chatroom call.
      Takes in a list of user id's as a parameter. 
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
  
    /*
      Takes in a user's id, and makes a GET Request to call for their user information.
      Requires an authorized user to make the call.
    */
    getMatchInfo = async (id) => {
  
      const response = await fetch(api.base + api.handlers.userInfo + id.toString(), {
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
  
    /*
     /v1/likes, POST Request, used to generate a new like for the current user
     If successful, adds a new like to the User's current likes. If the user that was liked
     also likes the current user back, a chatroom is created.
    */
    likeSomeone = async(id) => {
      let body = {
        userId: JSON.parse(localStorage.getItem("User"))["id"],
        matchId: id
      }
      const response = await fetch(api.base + "/v1/likes", {
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
  
    /*
     /v1/matches, GET Request, used to show current matches for the current user.
    */
    getMatches = async() => {
      const response = await fetch(api.base + "/v1/matches", {
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
  
    /*
     /v1/matches, POST Request, used to generate a new match
     Takes in a request body of the current user's id as well as a param value of the potential match's id.
     Adds the potential match id to the current user's matches.
    */
    newMatch = async(id) => {
        let body = {
          userId: JSON.parse(localStorage.getItem("User"))["id"],
          matchId: id
        }
        const response = await fetch(api.base + "/v1/matches", {
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
  
    /*
     /v1/matches, DELETE Request, used to remove a match from the current user
     Takes in a request body of the current user's id as well as a param value of the match's id.
    */
    deleteMatch = async(id) => {
      let body = {
        userId: JSON.parse(localStorage.getItem("User"))["id"],
        matchId: id
      }
  
      await fetch(api.base + "/v1/matches", {
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
     /v1/room, GET Request, used to show current matches for the current user.
     */
    getRooms = async () => {
      const response = await fetch(api.base + "/v1/room", {
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
  
    /*
     /v1/room, POST Request, used to create a new chatroom for the current user if two users mutually like each other.
     Takes in a body parameter which holds the current user's id as well as the match's id to create a chatroom exclusively for 
     those two users.
    */
    createRoom = async (body) => {
      
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
      
      fetch(api.base + "/v1/room", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
  
      alert("You got a match!!");
      
    }
  
    /*
     /v1/upcoming, GET Request, used to show the current upcoming chatrooms the user has available.
     Returns a JSON object of the upcoming rooms with the room id's and the user id's involved.
    */
    getUpcoming = async() => {
      const response = await fetch(api.base + "/v1/upcoming", {
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
  
    /*
      If not logged in, redirects to the landing sign in page.
      Other wise the Home Page is rendered.
    */
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