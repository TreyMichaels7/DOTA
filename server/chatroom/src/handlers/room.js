const path = require('path');

const postRoomHandler = async (req, res, { Room }) => {
    let xUser = req.get("X-User");
    if (!xUser) {
        res.status(401).send("User must be logged in to create a room.");
        return;
    }

    let creator = JSON.parse(xUser);
    console.log(creator);

    const { user1, user2 } = req.body;
    if (!user1 || !user2) {
        res.status(400).send("Room must have two users (user1 & user2)");
        return;
    }

    if (user1 != creator.id && user2 != creator.id) {
        res.status(400).send(`Unauthorized: Only a user from the new room can create it (user ${creator.id} is not part of the room)`);
        return;
    }

    Room.find({}, (err, rooms) => {
        if (err) {
            res.status(500).send("There was a problem with accessing the rooms");
            return;
        }
        console.log(rooms);
        // CHECKING FOR UNIQUE ROOMS... THIS IS SUPER INEFFICIENT THO RIP
        for (let currRoom of rooms) {
            if (currRoom.users.includes(user1) && currRoom.users.includes(user2)) {
                res.status(400).send("Room with these users already exists.")
                return;
            }
        }

        let users = [];
        users.push(user1);
        users.push(user2);

        const room = { users: users };
        console.log(room);

        const query = new Room(room);
        query.save((err, newRoom) => {
            if (err) {
                res.status(500).send(err);
                return;
            }

            res.status(201).json(newRoom);
        });
    });


}

// This is for debugging only, never used in the front end
const getRoomHandler = async (req, res, { Room }) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (e) {
        res.status(500).send("There was an issue getting the rooms.");
        return;
    }
}

const getRoomIdHandler = async (req, res, { Room }) => {
    // let xUser = req.get("X-User");
    let user = {
        id: 5,
        email: "kelden222@test.com",
        userName: "kelden222",
        firstName: "kelden",
        lastName: "test",
        gender: 1,
        sexuality: 2
    };

    let xUser = JSON.stringify(user);
    if (!xUser) {
        res.status(401).send("User must be logged in TO CALL.");
        return;
    }

    let creator = JSON.parse(xUser);

    if (!req.params.roomid) {
        res.status(400).send("No roomid provided");
        return;
    }

    try {
        const rooms = await Room.findById(req.params.roomid, (err, currRoom) => {
            if (err) {
                res.status(500).send("There was an issue getting the room.");
                return;
            }
            console.log(currRoom.users);
            if (currRoom.users.includes(creator.id)) {
                res.sendFile(path.join(__dirname, '../..', "/public/"));
                return;
            } else {
                // Unauthorized, take them to a "lost" page
                res.sendFile(path.join(__dirname, '../..', "/public/unauthorized.html"));
                return;
            }
        });
    } catch (e) {
        res.status(500).send("Room with that ID does not exist.");
        return;
    }
}

const deleteRoomIdHandler = async (req, res, { Room }) => {
    // DON'T RESTRICT ROOM DELETION JUST SO WE CAN DELETE ROOMS OURSSELVES
    // let xUser = req.get("X-User");
    // if (!xUser) {
    //     res.status(401).send("User must be logged in to delete a channel.");
    //     return;
    // }

    // let user = JSON.parse(xUser);
    if (!req.params.roomid) {
        res.status(400).send("No roomid provided");
        return;
    }

    const roomId = req.params.roomid;
    let delRoom;
    try {
        delRoom = await Room.findById(roomId);
    }
    catch (e) {
        res.status(400).send("Room with that id does not exist.");
        return;
    }

    Room.findOneAndRemove({ _id: roomId }, err => {
        if (err) {
            res.status(500).send("There was a problem deleting the room with that id.")
            return;
        }
        res.type('text');
        res.status(200).send("Successfully deleted the channel.");
    });
};

module.exports = { postRoomHandler, getRoomHandler, getRoomIdHandler, deleteRoomIdHandler };