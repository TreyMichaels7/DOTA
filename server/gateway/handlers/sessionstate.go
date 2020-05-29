package handlers

import (
	"time"
	"github.com/DOTA/server/gateway/models/users"
)

//The SessionState struct that holds the time that the session began
//as well as the specific user that started the session.
type SessionState struct {
	Time time.Time  `json:"time,omitempty"`
	User users.User `json:"user,omitempty"`
}