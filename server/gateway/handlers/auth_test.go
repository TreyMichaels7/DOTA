package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"reflect"
	"strings"
	"testing"
	"time"

	"github.com/DOTA/server/gateway/models/users"
	"github.com/DOTA/server/gateway/sessions"
	//"github.com/gorilla/mux"
)

func TestUsersHandler(t *testing.T) {

	user := &users.User{
		ID: 0,
		FirstName: "trey",
		LastName: "michaels",
		Email: "trey@live.com",
		PassHash: []byte ("xxxxxx"),
		Bio: "hello i am trey",
		Gender: "male",
		Sexuality: "men",
		PhotoURL: "testing",
	}

	newUser := &users.NewUser{
		FirstName: "trey",
		LastName: "michaels",
		Email: "trey@live.com",
		Password: "xxxxxx",
		Bio: "hello i am trey",
		Gender: "male",
		Sexuality: "men",
		PhotoURL: "testing",
	}

	hc := &HandlerContext{
		SigningKey: "xxxxxx",
		SessionStore: sessions.NewMemStore(time.Second * 10, time.Second * 50),
		UserStore: &users.FakeStore{},
	}

	cases := []struct {
		testName string
		reqType string
		contentType string
		postUser *users.NewUser
		hc *HandlerContext
		expectedStatus int
		expectedError bool
	}{
		{
			"Valid Test with /sessions",
			"POST",
			"application/json",
			newUser,
			hc,
			http.StatusCreated,
			false,
		},
		{
			"Invalid Test with wrong Content Type",
			"POST",
			"text/plain",
			newUser,
			hc,
			http.StatusUnsupportedMediaType,
			true,
		},
		{
			"Invalid Test with wrong method",
			"DELETE",
			"application/json",
			newUser,
			hc,
			http.StatusMethodNotAllowed,
			true,		
		},
	}
	for _, c := range cases {
		rr := httptest.NewRecorder()
		buffer, err := json.Marshal(c.postUser)
	
		if err != nil {
			t.Fatalf("error: %v", err)
		}
	
		req, err := http.NewRequest(c.reqType, "/v1/users/", bytes.NewBuffer(buffer))
	
		if err != nil {
			t.Fatalf("error: %v", err)
		}
		req.Header.Set("Content-Type", c.contentType)
		c.hc.UsersHandler(rr, req)
		if c.reqType == "POST" {
			if !c.expectedError {
				if ctype := rr.Header().Get("Content-Type"); ctype != "application/json" {
					t.Errorf("content type header does not match: got %v want %v",
						ctype, "application/json")
				}

				if status := rr.Code; status != c.expectedStatus {
					t.Errorf("handler returned wrong status code: got %v want %v",
						status, c.expectedStatus)
				}

				responseUser := &users.User{
					Email: "trey@live.com",
					PassHash: []byte("xxxxxx"),
				}
			
				json.NewDecoder(rr.Body).Decode(responseUser)
				responseUser.PhotoURL = "testing"
				
				if !reflect.DeepEqual(user, responseUser) {
					t.Errorf("Expected user does not match output user: got %v want %v",
					responseUser, user)
				}
			} else {
				if status := rr.Code; status != c.expectedStatus {
					t.Errorf("handler returned wrong status code: got %v want %v",
						status, c.expectedStatus)
				}
			}
		} else {
			if status := rr.Code; status != c.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v",
					status, c.expectedStatus)
			}
		}
	}
}


func TestSpecificUserHandlerForGet(t *testing.T) {

	user := &users.User{
		ID: 1,
		FirstName: "trey",
		LastName: "michaels",
		Email: "trey@live.com",
		PassHash: []byte ("xxxxxx"),
		Bio: "hello i am trey",
		Gender: "male",
		Sexuality: "men",
		PhotoURL: "testing",
	}

	hc := &HandlerContext{
		SigningKey: "xxxxxx",
		SessionStore: sessions.NewMemStore(time.Second * 10, time.Second * 50),
		UserStore: &users.FakeStore{},
	}

	sessionState := &SessionState{
		Time: time.Now(),
		User: *user,
	}

	cases := []struct {
		testName string
		reqType string
		contentType string
		URI string
		hc *HandlerContext
		expectedStatus int
		expectedError bool
	}{
		{
			"Valid Test with /me",
			"GET",
			"application/json",
			"/v1/users/1",
			hc,
			http.StatusOK,
			false,
		},
		{
			"Valid Test with /1",
			"GET",
			"application/json",
			"/v1/users/1",
			hc,
			http.StatusOK,
			false,
		},
		{
			"Invalid Test with Post",
			"POST",
			"application/json",
			"/v1/users/1",
			hc,
			http.StatusMethodNotAllowed,
			true,
		},
	}
	for _, c := range cases {
		req, err := http.NewRequest(c.reqType, c.URI, nil)
		if err != nil {
			t.Fatalf("error: %v", err)
		}
		req.Header.Set("Content-Type", c.contentType)
		rr := httptest.NewRecorder()
		_, err = sessions.BeginSession(c.hc.SigningKey, c.hc.SessionStore, sessionState, rr)
		if err != nil {
			http.Error(rr, "Error beginning session", http.StatusInternalServerError)
			return
		}
		req.Header.Set("Authorization", rr.Header().Get("Authorization"))
		c.hc.SpecificUserHandler(rr, req)
		if c.reqType == "GET" {
			if !c.expectedError {
				if ctype := rr.Header().Get("Content-Type"); ctype != "application/json" {
					t.Errorf("content type header does not match: got %v want %v",
						ctype, "application/json")
				}
				
				if status := rr.Code; status != c.expectedStatus {
					t.Errorf("handler returned wrong status code: got %v want %v",
						status, c.expectedStatus)
				}
			
				responseUser := &users.User{
					Email: "trey@live.com",
					PassHash: []byte("xxxxxx"),
				}
			
				json.NewDecoder(rr.Body).Decode(responseUser)
				if !reflect.DeepEqual(user, responseUser) {
					t.Errorf("Expected user does not match output user: got %v want %v",
					responseUser, user)
				}
			} else {
				if status := rr.Code; status != c.expectedStatus {
					t.Errorf("handler returned wrong status code: got %v want %v in %s",
						status, c.expectedStatus, c.testName)
				}
			}
		} else {
			if status := rr.Code; status != c.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v in %s",
				status, c.expectedStatus, c.testName)
			}
			if ctype := rr.Header().Get("Content-Type"); ctype != "text/plain; charset=utf-8" {
				t.Errorf("content type header does not match: got %v want %v",
					ctype, "text/plain; charset=utf-8")
			}
		}
	}
}

func TestSpecificUserHandlerForPatch(t *testing.T) {

	user := &users.User{
		ID: 1,
		FirstName: "trey",
		LastName: "michaels",
		Email: "trey@live.com",
		PassHash: []byte ("xxxxxx"),
		Bio: "hello i am trey",
		Gender: "male",
		Sexuality: "men",
		PhotoURL: "testing",
	}

	updates := &users.Updates{
		Bio: "bye trey",
		Gender: "female",
		Sexuality: "women",
		PhotoURL: "xxxxxx",
	}

	hc := &HandlerContext{
		SigningKey: "xxxxxx",
		SessionStore: sessions.NewMemStore(time.Second * 10, time.Second * 50),
		UserStore: &users.FakeStore{},
	}

	sessionState := &SessionState{
		Time: time.Now(),
		User: *user,
	}

	cases := []struct {
		testName string
		reqType string
		contentType string
		URI string
		hc *HandlerContext
		expectedError bool
		expectedStatus int
	}{
		{
			"Valid Test with /1",
			"PATCH",
			"application/json",
			"/v1/users/1",
			hc,
			false,
			http.StatusOK,
		},
		{
			"Invalid Test with /5",
			"PATCH",
			"application/json",
			"/v1/users/5",
			hc,
			true,
			http.StatusForbidden,
		},
		{
			"Invalid Test with wrong content type",
			"PATCH",
			"text/plain; charset=utf-8",
			"/v1/users/1",
			hc,
			true,
			http.StatusUnsupportedMediaType,
		},
	}
	for _, c := range cases {
		buffer, err := json.Marshal(updates)
		req, err := http.NewRequest(c.reqType, c.URI, bytes.NewBuffer(buffer))
		if err != nil {
			t.Fatalf("error: %v", err)
		}
		req.Header.Set("Content-Type", c.contentType)
		rr := httptest.NewRecorder()
		_, err = sessions.BeginSession(c.hc.SigningKey, c.hc.SessionStore, sessionState, rr)
		if err != nil {
			http.Error(rr, "Error beginning session", http.StatusInternalServerError)
			return
		}
		req.Header.Set("Authorization", rr.Header().Get("Authorization"))
		c.hc.SpecificUserHandler(rr, req)
		if c.reqType == "PATCH" {
			if status := rr.Code; status != c.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v case %s",
					status, c.expectedStatus, c.testName)
			}
			if !c.expectedError {
				if ctype := rr.Header().Get("Content-Type"); ctype != c.contentType {
					t.Errorf("content type header does not match: got %v want %v in %s",
						ctype, c.contentType, c.testName)
				}
				responseUpdates := &users.Updates{}
				json.NewDecoder(rr.Body).Decode(responseUpdates)
				if !reflect.DeepEqual(updates, responseUpdates) {
					t.Errorf("Expected updates does not match output updates: got %v want %v",
					responseUpdates, updates)
				}
			} 
		} else {
			if status := rr.Code; status != c.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v case %s",
					status, c.expectedStatus, c.testName)
			}
		}
	}
}

func TestSessionsHandler(t *testing.T) {

	hc := &HandlerContext{
		SigningKey: "xxxxxx",
		SessionStore: sessions.NewMemStore(time.Second * 10, time.Second * 50),
		UserStore: &users.FakeStore{},
	}

	user, _ := hc.UserStore.GetByEmail("trey@live.com")
	user.PassHash = []byte("xxxxxx")
	sessionState := &SessionState{
		Time: time.Now(),
		User: *user,
	}

	cases := []struct {
		testName string
		reqType string
		URI string
		expectedStatus int
		credentials *users.Credentials
		expectedError bool
	}{
		{
			"Valid Test with /sessions",
			"POST",
			"/v1/sessions",
			http.StatusCreated,
			&users.Credentials{
				Email: "trey@live.com",
				Password: "xxxxxx",
			},
			false,
		},
		{
			"Invalid Test with wrong method",
			"PATCH",
			"/v1/sessions",
			http.StatusMethodNotAllowed,
			&users.Credentials{
				Email: "trey@live.com",
				Password: "xxxxxx",
			},
			true,
		
		},
		{
			"Invalid Test with pass creds",
			"POST",
			"/v1/sessions",
			http.StatusUnauthorized,
			&users.Credentials{
				Email: "trey@live.com",
				Password: "passhash321",
			},
			true,		
		},
		{
			"Invalid Test with wrong email creds",
			"POST",
			"/v1/sessions",
			http.StatusUnauthorized,
			&users.Credentials{
				Email: "test@hello.com",
				Password: "xxxxxx",
			},
			true,		
		},
		
	}
	for _, c := range cases {

		buffer, err := json.Marshal(c.credentials)
		req, err := http.NewRequest(c.reqType, c.URI, bytes.NewBuffer(buffer))
		if err != nil {
			t.Fatalf("error: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()
		
		_, err = sessions.BeginSession(hc.SigningKey, hc.SessionStore, sessionState, rr)
		if err != nil {
			http.Error(rr, "Error beginning session", http.StatusInternalServerError)
			return
		}

		req.Header.Set("Authorization", rr.Header().Get("Authorization"))
		hc.SessionsHandler(rr, req)
		if c.reqType == "POST" {
			if status := rr.Code; status != c.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v",
					status, c.expectedStatus)
			}

			if !c.expectedError {
				if ctype := rr.Header().Get("Content-Type"); ctype != "application/json" {
					t.Errorf("content type header does not match: got %v want %v",
						ctype, "application/json")
				}
			} 
		} else {
			if status := rr.Code; status != c.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v",
					status, c.expectedStatus)
			}
		}
	}
	
}

func TestSpecificSessionHandler(t *testing.T) {

	user := &users.User{
		ID: 1,
		FirstName: "trey",
		LastName: "michaels",
		Email: "trey@live.com",
		PassHash: []byte ("xxxxxx"),
		Bio: "hello i am trey",
		Gender: "male",
		Sexuality: "men",
		PhotoURL: "testing",
	}

	hc := &HandlerContext{
		SigningKey: "xxxxxx",
		SessionStore: sessions.NewMemStore(time.Second * 10, time.Second * 50),
		UserStore: &users.FakeStore{},
	}

	sessionState := &SessionState{
		Time: time.Now(),
		User: *user,
	}

	cases := []struct {
		testName string
		reqType string
		URI string
		expectedStatus int
		expectedError bool
	}{
		{
			"Valid Test with /sessions",
			"DELETE",
			"/v1/sessions/delete",
			http.StatusOK,
			false,
		},
		{
			"Invalid Test with wrong URI",
			"DELETE",
			"/v1/sessions/you",
			http.StatusForbidden,
			true,
		
		},
		{
			"Invalid Test with wrong method",
			"POST",
			"/v1/sessions/delete",
			http.StatusMethodNotAllowed,
			true,		
		},
	}
	for _, c := range cases {
		req, err := http.NewRequest(c.reqType, c.URI, nil)
		if err != nil {
			t.Fatalf("error: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		rr := httptest.NewRecorder()
		_, err = sessions.BeginSession(hc.SigningKey, hc.SessionStore, sessionState, rr)
		if err != nil {
			http.Error(rr, "Error beginning session", http.StatusInternalServerError)
			return
		}
		req.Header.Set("Authorization", rr.Header().Get("Authorization"))
		hc.SpecificSessionHandler(rr, req)
		if c.reqType == "DELETE" {
			if c.expectedError {
				uriParts := strings.Split(c.URI, "/")
				id := uriParts[len(uriParts)-1]
				if !strings.EqualFold(id, "mine") {
					if status := rr.Code; status != c.expectedStatus {
						t.Errorf("handler returned wrong status code: got %v want %v",
							status, c.expectedStatus)
					}
				}
			} else {
				if status := rr.Code; status != c.expectedStatus {
					t.Errorf("handler returned wrong status code: got %v want %v",
						status, c.expectedStatus)
				}
				if body := rr.Body; bytes.Equal(body.Bytes(), []byte ("Signed Out")) {
					t.Errorf("handler returned wrong message: got %v want %v",
						body, bytes.NewBufferString("Signed Out"))
				}
			}
		} else {
			if status := rr.Code; status != c.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v",
					status, c.expectedStatus)
			}
		}
	}
}

