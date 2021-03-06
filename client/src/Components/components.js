import React, { Component, useState, Fragment } from 'react';
import { Button,  Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import { Link } from 'react-router-dom';

/*
  Navigation bar seen for logged in users.
*/
export class NavBar extends Component {

    constructor(props){
        super(props);
        this.state = {
        expanded: false,
        profileImage: JSON.parse(localStorage.getItem("User")).photoURL || "https://picsum.photos/id/10/200/300"
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
                  <Link className="nav-home-link" to="/home">Dating on the Ave</Link>
              </div>
              <Button className="nav-button" onClick={this.expandMenu}>
                  <img className="nav-profile-pic" src={this.state.profileImage} alt="profile"/>
              </Button>
              </div>
              <div className={this.state.expanded ? "expanded" : "hidden"}>
                <Link className="nav-links" to="/profile">Profile</Link>
                {/* <Link className="nav-links" to="/home">Home</Link> */}
                <span onClick={this.props.signOut}>
                    <span className="nav-links" >Sign Out</span>
                </span>
              </div>
        </nav>
        )
    }
}


/*
  Holds a potential match's name, and button to see their complete profile page.
  Also enables users to like or dislike their current potential matches.
*/
export class MatchCard extends Component {
    constructor(props) {
      super(props);
      this.state = {
        liked: false,
        hidden: false,
        matchInfo: null
      }
    }

    like = () => {
      this.props.like(this.props.matchInfo.id);
      this.setState({liked: true});
      this.props.dislike(this.props.matchInfo.id);
    }

    dislike = () => {
      this.props.dislike(this.props.matchInfo.id);
      this.setState({hidden: true})
    }
  
    render() {

      return (
        <div className={this.state.hidden ? "hidden" : "match-group"}>
          <div className="buttons">
            <button className="like" onClick={this.like}><span>&#10004;</span></button>
            <button className="dislike" onClick={this.dislike}><span>&#10008;</span></button>
          </div>
          <div className={this.state.liked ? "match-card liked" : "match-card"}>
              <div className="match-profile-container">
                <img className="match-profile" src={this.props.matchInfo.photoURL} alt={this.props.matchInfo.firstName}/>
              </div>
              <div className="match-content">
                <p>{this.props.matchInfo.firstName + "" + this.props.matchInfo.lastName}</p>
              </div>
              <div className="match-button-container">
                <ProfileModal buttonLabel="View Profile" matchInfo={this.props.matchInfo}
                  className="match-profile-modal"/>
              </div>
          </div>
        </div>
      )
    }
}

/*
  Modal acts as a profile viewing page for other users that displays all their public information.
*/
const ProfileModal = (props) => {
  const {
    buttonLabel,
    matchInfo,
    className
  } = props;

  let gender;
  if (matchInfo.gender === 1) {
    gender = "Male";
  } else if (matchInfo.gender === 2) {
    gender = "Female";
  } else {
    gender = "Other"
  }

  let sexuality;
  if (matchInfo.sexuality === 1) {
    sexuality = "Men";
  } else if (matchInfo.sexuality === 2) {
    sexuality = "Women";
  } else {
    sexuality = "Other";
  }

  const [modal, setModal] = useState(false);

  const toggle = () => setModal(!modal);

  return (
    <Fragment>
      <Button className="edit-button" onClick={toggle}>{buttonLabel}</Button>
      <Modal isOpen={modal} toggle={toggle} className={className}>
        <ModalHeader className="modal-escape" toggle={toggle}></ModalHeader>
        <ModalBody>
            <div className="profile-main">
              <div className="profile-block">
                <h1 className="profile-title">{"Viewing " + matchInfo.firstName + "'s profile"}</h1>
              </div>
              <div className="profile-container">
                <div className="profile-block">
                  <div>
                    <img className="profile-pic" src={matchInfo.photoURL} alt="profile"/>
                  </div>
                  <div className="profile-text">
                    <h2>{matchInfo.firstName + " " + matchInfo.lastName}</h2>
                    <p>Identifies as {gender}</p>
                    <p>Interested in {sexuality}</p>
                  </div>
                </div>
                <div className="edit-profile">
                </div>
              </div>
              <div className="profile-bio">
                <h2 className="profile-subtitle">Bio:</h2>
                <p className="profile-text">{matchInfo.bio}</p>
              </div>
            </div>
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
}

/*
  Displays a user's name that you have both mutually liked as well as a link to your chatroom with them.
*/
export class UpcomingRow extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <div className='upcoming-row'>
        <div>{this.props.name || "loading"}</div>
        <div><a href={"https://api.kelden.me/room/" + this.props.chatroom} className="chatroom-button">Go To Chatroom</a></div>
      </div>
    )
  }
}

/*
  Displays a user's name that you have liked.
*/
export class PendingRow extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <div className='pending-row'>
        <div>{this.props.name}</div>
      </div>
    )
  }
}