package handlers

import (
	"net/http/httptest"
	"testing"
	"github.com/gorilla/mux"
)

func TestCORS(t *testing.T) {
	
	test := NewCORS(mux.NewRouter())

	rr := httptest.NewRecorder()
	test.ServeHTTP(rr, httptest.NewRequest("GET", "/v1/users/me", nil))
	check := rr.Header()

	if check.Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("Returned wrong header value: got %v want %v",
		check.Get("Access-Control-Allow-Origin"), "*")
	}

	if check.Get("Access-Control-Allow-Methods") != "GET, PUT, POST, PATCH, DELETE" {
		t.Errorf("Returned wrong header value: got %v want %v",
		check.Get("Access-Control-Allow-Methods"), "GET, PUT, POST, PATCH, DELETE")
	}

	if check.Get("Access-Control-Allow-Headers") != "Content-Type, Authorization" {
		t.Errorf("Returned wrong header value: got %v want %v",
		check.Get("Access-Control-Allow-Headers"), "Content-Type, Authorization")
	}

	if check.Get("Access-Control-Expose-Headers") != "Authorization" {
		t.Errorf("Returned wrong header value: got %v want %v",
		check.Get("Access-Control-Expose-Headers"), "Authorization")
	}

	if check.Get("Access-Control-Max-Age") != "600" {
		t.Errorf("Returned wrong header value: got %v want %v",
		check.Get("Access-Control-Max-Age"), "600")
	}

}