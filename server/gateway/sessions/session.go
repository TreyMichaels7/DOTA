package sessions

import (
	//"encoding/base64"
	"errors"
	//"log"
	"net/http"
	"strings"
)

const headerAuthorization = "Authorization"
const paramAuthorization = "auth"
const schemeBearer = "Bearer "

//ErrNoSessionID is used when no session ID was found in the Authorization header
var ErrNoSessionID = errors.New("no session ID found in " + headerAuthorization + " header")

//ErrInvalidScheme is used when the authorization scheme is not supported
var ErrInvalidScheme = errors.New("authorization scheme not supported")

//BeginSession creates a new SessionID, saves the `sessionState` to the store, adds an
//Authorization header to the response with the SessionID, and returns the new SessionID
func BeginSession(signingKey string, store Store, sessionState interface{}, w http.ResponseWriter) (SessionID, error) {
	sid, err := NewSessionID(signingKey)
	if err != nil {
		return InvalidSessionID, err
	}
	store.Save(sid, sessionState)
	w.Header().Add(headerAuthorization, schemeBearer + sid.String())
	return sid, nil
}

//GetSessionID extracts and validates the SessionID from the request headers
func GetSessionID(r *http.Request, signingKey string) (SessionID, error) {
	header := r.Header.Get(headerAuthorization)
	if header == "" {
		header = r.URL.Query().Get(paramAuthorization)
		if header == "" {
			return InvalidSessionID, ErrNoSessionID
		}
	}
	if !strings.Contains(header, schemeBearer) {
		return InvalidSessionID, ErrInvalidScheme
	}
	header = strings.TrimLeft(header, schemeBearer)
	sid, err := ValidateID(header, signingKey)
	if err != nil {
		return InvalidSessionID, err
	}
	return sid, nil
}

//GetState extracts the SessionID from the request,
//gets the associated state from the provided store into
//the `sessionState` parameter, and returns the SessionID
func GetState(r *http.Request, signingKey string, store Store, sessionState interface{}) (SessionID, error) {
	sid, err := GetSessionID(r, signingKey)
	if err != nil {
		return InvalidSessionID, err
	}
	if getErr := store.Get(sid, sessionState); getErr != nil {
		return InvalidSessionID, ErrStateNotFound
	}
	return sid, nil
}

//EndSession extracts the SessionID from the request,
//and deletes the associated data in the provided store, returning
//the extracted SessionID.
func EndSession(r *http.Request, signingKey string, store Store) (SessionID, error) {
	sid, err := GetSessionID(r, signingKey)
	if err != nil {
		return InvalidSessionID, err
	}
	store.Delete(sid)
	return sid, nil
}
