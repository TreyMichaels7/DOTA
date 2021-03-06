// Getting access to the video camera / audio
var constraints = { video: true, audio: true };

function successCallback(stream) {
    console.log("Success");
    const localVideo = document.getElementById("local-video");
    if (localVideo) { localVideo.srcObject = stream; }
    localVideo.play();
    localVideo.setAttribute('playsinline', 'true');

    stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
    });
}

function errorCallback(error) {
    console.log("navigator.getUserMedia error: ", error);
}

navigator.mediaDevices.getUserMedia(constraints)
    .then(successCallback)
    .catch(errorCallback);

// Variables
const { RTCPeerConnection, RTCSessionDescription } = window;
let pcBrowser = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection   //compatibility for firefox and chrome;
let peerConnection = new pcBrowser({
    iceServers: [{
        urls: 'turn:54.227.245.189',
        username: 'dota',
        credential: 'datingontheave'
    }]
});

let thisSocket = "";
let remoteSocket = "";
let isAlreadyCalling = false;
let activeTracks = [];

let muted = false;

window.onload = (e) => {
    // document.getElementById("local-id").play();
    // document.getElementById("mute").onclick = () => {
    //     console.log("mute");
    // };

    document.getElementById("end-call").onclick = () => {
        console.log("end");

        let loc = window.location.href.split("/");
        let roomid = loc[loc.length - 1];
        console.log(roomid);
        fetch("https://api.kelden.me/v1/room/" + roomid, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        })
            .then(console.log)
            .then(window.location.href = 'https://kelden.me/')
            // .then(open(location, '_self').close())
            .catch((error) => {
                console.log(error);
                return;
            });
    };
}

// Countdown for the call
function startTimer() {
    var distance = 1000 * 60 * 7; // 7 minutes
    var x = setInterval(() => {
        distance -= 1000;
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        document.getElementById("timer").innerHTML = minutes + "min " + seconds + "s";

        // If the count down is finished, write some text 
        if (distance < 0) {
            clearInterval(x);
            let loc = window.location.href.split("/");
            let roomid = loc[loc.length - 1];
            console.log(roomid);
            fetch("https://api.kelden.me/v1/room/" + roomid, {
                method: "DELETE",
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then()
                .then(console.log)
                .catch((error) => {
                    console.log(error);
                    return;
                });

            alert("Call has been ended");
            window.location.href = 'https://kelden.me/';
            // open(location, '_self').close();
        }
    }, 1000);
}

// Init
var socket = io.connect('https://api.kelden.me/');
// var socket = io.connect('http://localhost:80/');

// Turn Server
function checkTURNServer(turnConfig, timeout) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            if (promiseResolved) return;
            resolve(false);
            promiseResolved = true;
        }, timeout || 5000);

        var promiseResolved = false
            , myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection   //compatibility for firefox and chrome
            , pc = new myPeerConnection({ iceServers: [turnConfig] })
            , noop = function () { };
        pc.createDataChannel("");    //create a bogus data channel
        pc.createOffer(function (sdp) {
            if (sdp.sdp.indexOf('typ relay') > -1) { // sometimes sdp contains the ice candidates...
                promiseResolved = true;
                resolve(true);
            }
            pc.setLocalDescription(sdp, noop, noop);
        }, noop);    // create offer and set local description
        pc.onicecandidate = function (ice) {  //listen for candidate events
            if (promiseResolved || !ice || !ice.candidate || !ice.candidate.candidate || !(ice.candidate.candidate.indexOf('typ relay') > -1)) return;
            promiseResolved = true;
            resolve(true);
        };
    });
}


checkTURNServer({
    url: 'turn:54.227.245.189',
    username: 'dota',
    credential: 'datingontheave'
}).then(function (bool) {
    console.log('is my TURN server active? ', bool ? 'yes' : 'no');
}).catch(console.error.bind(console));

// Offer a call to callee
async function callUser(socketId) {
    console.log(`Calling ${socketId}...`);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(offer));

    socket.emit("call-user", {
        offer,
        to: socketId
    });
}

// Socket functions
socket.on('connect', (data) => {
    socket.emit('join', 'Hello World from client');
});

socket.on('disconnect-call', ({ user }) => {
    if (user == remoteSocket) {
        // Reset Peer connections
        const senders = peerConnection.getSenders();
        senders.forEach((sender) => peerConnection.removeTrack(sender));

        // fails for the new calle when you call again from this reset peer (works for this caller tho, but not who you call)

        isAlreadyCalling = false;
        remoteSocket = "";
        showRemoteVid(false);

        alert(`${user} has left the call.`);
        window.location.href = 'https://kelden.me/';
        // open(location, '_self').close();
    }
});

socket.on("get-user-id", ({ user }) => {
    thisSocket = user;
    console.log(user);
    document.getElementById('user-id').textContent = user;
});

socket.on("update-user-list", ({ users }) => {
    // let userList = document.getElementById("user-list");
    let joinCall = document.getElementById("join-call");
    console.log(users);
    if (users.length > 1) {
        let otherUser;
        for (let user of users) {
            if (user != thisSocket) {
                otherUser = user;
                break;
            }
        }
        joinCall.textContent = "Start chatting now!"
        joinCall.classList.remove("disabled-btn");
        joinCall.onclick = () => {
            callUser(otherUser); // get the latest "user" to call
        }
    } else {
        joinCall.textContent = "Waiting for your match to join...";
        joinCall.classList.add("disabled-btn");
        joinCall.onclick = () => {
            console.log("Nobody's here yet!");
        }
    }
    // userList.textContent = "";
    // for (let user of users) {
    //     if (thisSocket != user) {
    //         let row = document.createElement("LI");
    //         row.textContent = user;
    //         row.onclick = () => callUser(user);
    //         userList.appendChild(row);
    //     }
    // }
});

// Socket Call Functions
// Receive, Answer, and return video information to caller
socket.on("call-made", async data => {

    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(new RTCSessionDescription(answer));

    // Update Remote Caller ID
    remoteSocket = data.socket;
    showRemoteVid(true, remoteSocket);

    socket.emit("make-answer", {
        answer,
        to: data.socket
    });
    console.log("call-made");
});

// Receive informtaion from the callee, and call them
socket.on("answer-made", async data => {
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

    // Update Remote Caller ID
    remoteSocket = data.socket;
    showRemoteVid(true, remoteSocket);

    // Set up the call both ways
    if (!isAlreadyCalling) {
        callUser(remoteSocket);
        isAlreadyCalling = true;
    }
    console.log("answer-made");
});

socket.on("ice-candidate-made", async candidate => {
    console.log("received ice candidate: " + candidate);
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// navigator.getUserMedia = (
//     navigator.getUserMedia ||
//     navigator.webkitGetUserMedia ||
//     navigator.mozGetUserMedia ||
//     navigator.msGetUserMedia
// );

// if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
//     navigator.getUserMedia(

//     );
// } else {
//     navigator.mediaDevices.getUserMedia(
//         { video: true, audio: true },
//         stream => {
//             console.log("defined");
//             const localVideo = document.getElementById("local-video");
//             if (localVideo) { localVideo.srcObject = stream; }

//             stream.getTracks().forEach(track => {
//                 peerConnection.addTrack(track, stream)
//             });
//             console.log(stream);
//         },
//         error => { console.warn(error.message); }
//     );
// }


peerConnection.ontrack = function ({ streams: [stream] }) {
    const remoteVideo = document.getElementById("remote-video");
    if (remoteVideo) {
        remoteVideo.srcObject = stream;
        remoteVideo.setAttribute('playsinline', 'true');
        // remoteVideo.play();
    }
};

peerConnection.onicecandidate = function (evenmt) {  //listen for candidate events
    console.log("Retrieving ICE data status changed : " + event.target.iceGatheringState)
    console.log(event);
    console.log(event.candidate);
    if (event.candidate) {
        // var data = {
        //     type: 'iceCandidate',
        //     payload: event.candidate
        // };
        socket.emit("ice-candidate", {
            candidate: event.candidate
        });
    }
    // if (!ice || !ice.candidate || !ice.candidate.candidate || !(ice.candidate.candidate.indexOf('typ relay') > -1)) {
    //     console.log("Not on ice candidate");
    // } else {
    //     console.log("On ice candidate");
    //     console.log(ice);
    //     console.log("Ontrack information:");
    //     console.log(ice.currentTarget.ontrack);
    //     console.log(ice.currentTarget.ontrack.stream);
    //     console.log(ice.currentTarget.ontrack.streams);
    //     const remoteVideo = document.getElementById("remote-video");
    //     remoteVideo.srcObject = ice.currentTarget.ontrack.stream;
    // }
};

// UI Functions
function showRemoteVid(show, remoteId = "") {
    // Update Remote ID and Show
    document.getElementById('remote-id').textContent = remoteId;
    let remoteContainer = document.getElementById("remote-container");
    let remoteControls = document.querySelector(".video-button-container");

    let display = show ? "block" : "none";
    remoteContainer.style.display = display;
    remoteControls.style.display = display;

    // Move Header Logo
    let logo = document.getElementById('logo');
    let activeUsers = document.getElementById('active-users');
    if (show) {
        logo.classList.add("top-right");
        activeUsers.style.display = "none";
        startTimer();
    } else {
        logo.classList.remove("top-right");
        activeUsers.style.display = "block";
    }
}
