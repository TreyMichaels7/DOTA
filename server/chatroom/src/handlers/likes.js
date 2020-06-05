const postLikeHandler = async (req, res, { Match }) => {
    let xUser = req.get("X-User");
    if (!xUser) {
        res.status(401).send("User must be logged in to like a match.");
        return;
    }

    let creator = JSON.parse(xUser);

    const { userId, matchId } = req.body;
    if (!userId || !matchId) {
        res.status(400).send("POST request must have both a user and a match");
        return;
    }

    if (creator.id != userId) {
        res.status(403).send("You do not have permissions like this match. (userId does not match)");
        return;
    }

    Match.findOne({ userId: userId }, (err, currMatch) => {
        if (err) {
            res.status(500).send("There was an error getting likes");
            return;
        }
        
        Match.findOne({ userId: matchId }, (err, currLiked) => {
            let newLiked;
            let likesBack = false;
            
            if (currLiked) {
                if (currLiked.likes.length > 0) {
                    if (currLiked.likes.includes(creator.id)) {
                        let likeArray = [...currLiked.likes];
                        let updatedLikeArray = likeArray.filter(like => like != creator.id);
                        newLiked = currLiked;
                        newLiked.likes = updatedLikeArray;
                        likesBack = true;
                    }
                }
            }

            if (likesBack) {
                const query = new Match(newLiked);
                query.save((err, returnLikes) => {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }

                    console.log("THEY LIKE YOU BACK!");

                    res.type('text');
                    res.status(202).send("They like you back!");
                    return;
                });
            } else {
                let newMatch = { userId: userId };
                console.log("I'M STILL RUNIN G FOR SOME REASON!");
                if (!currMatch) {
                    let likesArray = [];
                    likesArray.push(matchId);
                    newMatch.likes = likesArray;
                } else {
                    let likesArray = [...currMatch.likes];
                    if (likesArray.includes(matchId)) {
                        res.status(400).send("That matchId already exists (in likes[]) for this userId");
                        return;
                    }

                    likesArray.push(matchId);

                    newMatch = currMatch;
                    newMatch.likes = likesArray;
                }

                const query = new Match(newMatch);
                query.save((err, returnLikes) => {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }
                    console.log("LIKE ADDED!");

                    res.status(201).json(returnLikes);
                });
            }
        });
    });
}

const getLikeHandler = async (req, res, { Match }) => {
    let xUser = req.get("X-User");
    if (!xUser) {
        res.status(401).send("User must be logged in to view their likes.");
        return;
    }

    let creator = JSON.parse(xUser);

    Match.findOne({ userId: creator.id }, (err, currUser) => {
        if (err) {
            res.status(500).send("There was an error getting likes");
            return;
        }
        console.log(currUser);

        if (!currUser) {
            res.status(400).send("That user has no likes");
            return;
        } else {
            res.json(currUser);
        }
    });
};

// ADMIN ONLY
const deleteLikeHandler = async (req, res, { Match }) => {
    // ADMIN ACCESS ONLY

    const { userId, matchId } = req.body;
    if (!userId || !matchId) {
        res.status(400).send("DELETE request must have both a user and a match");
        return;
    }

    Match.findOne({ userId: userId }, (err, currMatch) => {
        if (err) {
            res.status(500).send("There was an error getting likes");
            return;
        }
        let newMatch = { userId: userId };

        if (!currMatch) {
            res.status(400).send("That user has no likes to delete"); // not the right error, but it's okay for now
            return;
        } else {
            let likeArray = [...currMatch.likes];
            if (!likeArray.includes(matchId)) {
                res.status(400).send("That user doesn't like the given matchId");
                return;
            }
            let updatedLikeArray = likeArray.filter(like => like != matchId);
            newMatch = currMatch;
            newMatch.likes = updatedLikeArray;
        }

        const query = new Match(newMatch);
        query.save((err, returnLikes) => {
            if (err) {
                console.log(query);
                res.status(500).send(err);
                return;
            }

            res.type('text');
            res.send("successfully deleted the like!");
        });
    });
};


module.exports = { postLikeHandler, getLikeHandler, deleteLikeHandler }