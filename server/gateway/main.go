package main

import (
	"log"
	"net/http"
	"os"
)

func test(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte ("hello world!"))
}


func main() {
	ADDR := os.Getenv("ADDR")
	if len(ADDR) == 0 {
		ADDR = ":443"
	}

	mux := http.NewServeMux()
	// Test route
	mux.HandleFunc("/v1/test", test)

	// Route Outlines
	mux.HandleFunc("/v1/users", test)
	mux.HandleFunc("/v1/matches", test)
	mux.HandleFunc("/v1/matches/", test)
	mux.HandleFunc("/v1/profile", test)
	mux.HandleFunc("/v1/profile/", test)
	mux.HandleFunc("/v1/chatroom", test)
	mux.HandleFunc("/v1/chatroom/", test)
	mux.HandleFunc("/v1/chatroom/invite", test)
	mux.HandleFunc("/v1/message/send", test)
	mux.HandleFunc("/v1/messages", test)
	mux.HandleFunc("/v1/sessions", test)
	mux.HandleFunc("/v1/sessions/", test)
	mux.HandleFunc("/v1/admin/matches", test)
	mux.HandleFunc("/v1/admin/profile/", test)

	log.Printf("Server is listening at %s...", ADDR)
	log.Fatal(http.ListenAndServe(ADDR, mux))
}