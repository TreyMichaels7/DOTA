package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strconv"
	"strings"
	"time"

	"DOTA/server/gateway/models/users"
	"DOTA/server/gateway/sessions"
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
			http.Error(w, "Error validating user info: "+err.Error(), http.StatusBadRequest)
			return
		}

		insertedUser, insertError := hc.UserStore.Insert(user)
		if insertError != nil {
			errMsg := fmt.Sprintf("error inserting User to database %v", insertError)
			http.Error(w, errMsg, http.StatusBadRequest)
			return
		}

		sessionState := &SessionState{
			Time: time.Now(),
			User: *user,
		}

		_, err = sessions.BeginSession(hc.SigningKey, hc.SessionStore, sessionState, w)
		if err != nil {
			http.Error(w, "Unauthorized user: "+err.Error(), http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)

		// json.NewEncoder(w).Encode(insertedUser)
		enc := json.NewEncoder(w)
		if err := enc.Encode(insertedUser); err != nil {
			errMsg := fmt.Sprintf("error encoding User with ID into a JSON %v", err)
			http.Error(w, errMsg, http.StatusInternalServerError)
			return
		}

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
		http.Error(w, "Unauthorized user:"+err.Error(), http.StatusUnauthorized)
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
		urlPath := path.Base(r.URL.Path)
		if urlPath != "mine" {
			http.Error(w, "Error: Logging out is only supported on currently authenticated user", http.StatusForbidden)
			return
		}

		_, getErr := sessions.GetSessionID(r, hc.SigningKey)
		if getErr != nil {
			errMsg := fmt.Sprintf("Error: No valid session id found: not currently signed in %v", getErr)
			http.Error(w, errMsg, http.StatusForbidden)
			return
		}

		_, delErr := sessions.EndSession(r, hc.SigningKey, hc.SessionStore)
		if delErr != nil {
			errMsg := fmt.Sprintf("Error: There was an issue deleting the current session id %v", delErr)
			http.Error(w, errMsg, http.StatusForbidden)
			return
		}

		w.Write([]byte("signed out"))
	} else {
		http.Error(w, "Error: Only DELETE Requests are allowed", http.StatusMethodNotAllowed)
		return
	}
}
