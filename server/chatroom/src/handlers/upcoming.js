const getUpcomingHandler = async (req, res, { Room }) => {
    let xUser = req.get("x-user");
    if (!xUser) {
        res.status(401).send("User must be logged in to view upcoming calls.");
        return;
    }

    let creator = JSON.parse(xUser);
    Room.find({}, (err, rooms) => {
        if (err) {
            res.status(500).send("There was a problem with accessing the rooms");
            return;
        }

        let upcoming = { upcoming: [] }

        // CHECKING FOR USER in ROOMS... THIS IS SUPER INEFFICIENT THO RIP
        for (let currRoom of rooms) {
            if (currRoom.users.includes(creator.id)) {
                let otherId;
                for (let user of currRoom.users) {
                    if (user != creator.id) {
                        otherId = user;
                        break;
                    }
                }

                upcoming.upcoming.push({
                    matchId: otherId,
                    roomId: currRoom._id
                });
            }
        }

        res.status(200).json(upcoming)
        return;
    });
}

module.exports = { getUpcomingHandler }