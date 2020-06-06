// Admin access only
const postMatchHandler = async (req, res, { Match }) => {
    const { userId, matchId } = req.body;
    if (!userId || !matchId) {
        res.status(400).send("POST request must have both a user and a match");
        return;
    }

    Match.findOne({ userId: userId }, (err, currMatch) => {
        if (err) {
            res.status(500).send("There was an error getting matches");
            return;
        }
        let newMatch = { userId: userId };

        if (!currMatch) {
            let matchArray = [];
            matchArray.push(matchId);
            newMatch.matches = matchArray;
        } else {
            let matchArray = [...currMatch.matches];
            if (matchArray.includes(matchId)) {
                res.status(400).send("That matchId already exists for this userId");
                return;
            }

            if (matchArray.length === 3) {
                res.status(400).send(`That user already has the maximum of 3 matches (${matchArray}). Please delete matches before adding more.`);
                return;
            }

            matchArray.push(matchId);

            newMatch = currMatch;
            newMatch.matches = matchArray;
        }

        const query = new Match(newMatch);
        query.save((err, returnMatch) => {
            if (err) {
                console.log(query);
                res.status(500).send(err);
                return;
            }

            res.status(201).json(returnMatch);
        });
    });
}

const getMatchHandler = async (req, res, { Match }) => {
    let xUser = req.get("X-User");
    if (!xUser) {
        res.status(401).send("User must be logged in to view their matches.");
        return;
    }

    let creator = JSON.parse(xUser);

    Match.findOne({ userId: creator.id }, (err, currUser) => {
        if (err) {
            res.status(500).send("There was an error getting matches");
            return;
        }
        console.log(currUser);

        if (!currUser) {
            res.status(202).send("That user has no matches");
            return;
        } else {
            res.json(currUser);
        }
    });
};

const deleteMatchHandler = async (req, res, { Match }) => {
    // let xUser = req.get("X-User");
    // if (!xUser) {
    //     res.status(401).send("User must be logged in to delete a match.");
    //     return;
    // }

    // let creator = JSON.parse(xUser);

    const { userId, matchId } = req.body;    
    if (!userId || !matchId) {
        res.status(400).send("DELETE request must have both a user and a match");
        return;
    }

    // if (creator.id != userId) {
    //     res.status(403).send("You do not have permissions delete matches. (userId does not match)");
    //     return;
    // }

    Match.findOne({ userId: userId }, (err, currMatch) => {
        if (err) {
            res.status(500).send("There was an error getting matches");
            return;
        }
        let newMatch = { userId: userId };

        if (!currMatch) {
            res.status(400).send("That user has no matches to delete");
            return;
        } else {
            let matchArray = [...currMatch.matches];
            if (!matchArray.includes(matchId)) {
                res.status(400).send("That user isn't matched with the given matchId to delete");
                return;
            }
            let updatedMatchArray = matchArray.filter(match => match != matchId);
            newMatch = currMatch;
            newMatch.matches = updatedMatchArray;
        }

        const query = new Match(newMatch);
        query.save((err, returnMatch) => {
            if (err) {
                console.log(query);
                res.status(500).send(err);
                return;
            }

            res.type('text');
            res.status(202).send("successfully deleted!");
        });
    });
};


module.exports = { postMatchHandler, getMatchHandler, deleteMatchHandler }