package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/DOTA/server/gateway/models/users"
	"github.com/DOTA/server/gateway/sessions"
)

//Accepts Post Requests to create a new user and session, Content-Type must be application/json
func (hc *HandlerContext) UsersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		ctype := r.Header.Get("Content-Type")
		if !strings.HasPrefix(ctype, "application/json") {
			http.Error(w, "Request body must be in JSON", http.StatusUnsupportedMediaType)
			return
		}

		newUser := &users.NewUser{}
		json.NewDecoder(r.Body).Decode(newUser)

		user, err := newUser.ToUser()
		if err != nil {
			http.Error(w, "Error validating user info" + err.Error(), http.StatusBadRequest)
			return
		}

		insertedUser, _ := hc.UserStore.Insert(user)


		sessionState := &SessionState{
			Time: time.Now(),
			User: *user,
		}

		_, err = sessions.BeginSession(hc.SigningKey, hc.SessionStore, sessionState, w)
		if err != nil {
			http.Error(w, "Unauthorized user:" + err.Error(), http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)

		json.NewEncoder(w).Encode(insertedUser)
		return
	}
	http.Error(w, "HTTP Response Status:", http.StatusMethodNotAllowed)
}

//Takes GET or PATCH Requests, get gathers a user's information, PATCH Updates a user's information. For PATCH
//Content-Type must be application/json and user must be authorized.
func (hc *HandlerContext) SpecificUserHandler(w http.ResponseWriter, r *http.Request) {
	sessionState := &SessionState{}
	_, err := sessions.GetState(r, hc.SigningKey, hc.SessionStore, sessionState)

	if err != nil {
		http.Error(w, "Unauthorized user:" + err.Error(), http.StatusUnauthorized)
		return
	}

	u, _ := url.Parse(r.URL.Path)
	uri := u.RequestURI()
	uriParts := strings.Split(uri, "/")
	id := uriParts[len(uriParts)-1]
	
	var idVal int64
	idVal, _ = strconv.ParseInt(id, 10, 64)

	if r.Method == "GET" {
		user, err := hc.UserStore.GetByID(idVal)
		if err != nil {
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(user)
		return
	} else if r.Method == "PATCH" {
		if idVal != sessionState.User.ID {
			http.Error(w, "Error, status forbidden", http.StatusForbidden)
			return
		}
		ctype := r.Header.Get("Content-Type")
		if !strings.HasPrefix(ctype, "application/json") {
			http.Error(w, "Request body must be in JSON", http.StatusUnsupportedMediaType)
			return
		}
		updates := &users.Updates{}
		json.NewDecoder(r.Body).Decode(updates)

		hc.UserStore.Update(idVal, updates)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		json.NewEncoder(w).Encode(updates)
		return
	}
	http.Error(w, "HTTP Response Status:", http.StatusMethodNotAllowed)
}

//Takes POST Requests only, Begins a new session for a user with valid credentials.
//Body must be Content-Type application/json
func (hc *HandlerContext) SessionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		ctype := r.Header.Get("Content-Type")
		if !strings.HasPrefix(ctype, "application/json") {
			http.Error(w, "Request body must be in JSON:", http.StatusUnsupportedMediaType)
			return
		}

		credentials := &users.Credentials{}
		json.NewDecoder(r.Body).Decode(credentials)
		user, err := hc.UserStore.GetByEmail(credentials.Email)
		if err != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return 
		}

		if authErr := user.Authenticate(credentials.Password); authErr != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		sessionState := &SessionState{}
		sessions.BeginSession(hc.SigningKey, hc.SessionStore, sessionState, w)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)

		j := json.NewEncoder(w)
		j.Encode(user)
		return
	}
	http.Error(w, "HTTP Response Status:", http.StatusMethodNotAllowed)
}

//Takes DELETE Requests only, closes a specific session.
func (hc *HandlerContext) SpecificSessionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "DELETE" {
		u, _ := url.Parse(r.URL.Path)
		uri := u.RequestURI()
		uriParts := strings.Split(uri, "/")
		id := uriParts[len(uriParts)-1]
		if !strings.EqualFold(id, "delete") {
			http.Error(w, "Bad Request", http.StatusForbidden)
			return
		}
		sessions.EndSession(r, hc.SigningKey, hc.SessionStore)
		w.Write([]byte ("Signed out"))
		return
	}
	http.Error(w, "HTTP Response Status:", http.StatusMethodNotAllowed)
}