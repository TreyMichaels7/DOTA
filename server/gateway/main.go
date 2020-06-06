package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"os"
	"time"

	"DOTA/server/gateway/handlers"
	"DOTA/server/gateway/models/users"
	"DOTA/server/gateway/sessions"

	"github.com/go-redis/redis"
	_ "github.com/go-sql-driver/mysql"
)

func test(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("hello world!"))
}

func main() {
	ADDR := os.Getenv("ADDR")
	if len(ADDR) == 0 {
		ADDR = ":443"
	}

	TLSCERT := os.Getenv("TLSCERT")
	if len(TLSCERT) == 0 {
		log.Fatal("No TLSCERT environment variable found")
	}

	TLSKEY := os.Getenv("TLSKEY")
	if len(TLSKEY) == 0 {
		log.Fatal("No TLSKEY environment variable found")
	}

	REDISADDR := os.Getenv("REDISADDR")
	if len(REDISADDR) == 0 {
		log.Fatal("No REDISADDR environment variable found")
	}

	SESSIONKEY := os.Getenv("SESSIONKEY")
	if len(SESSIONKEY) == 0 {
		log.Fatal("No SESSIONKEY environment variable found")
	}

	DSN := os.Getenv("DSN")
	if len(DSN) == 0 {
		log.Fatal("No DSN environment variable found")
	}

	db, err := sql.Open("mysql", DSN)
	if err != nil {
		log.Fatalf("error opening database: %v\n", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("error pinging database: %v\n", err)
	} else {
		fmt.Printf("successfully connected!\n")
	}

	hctx := handlers.HandlerContext{
		SigningKey: SESSIONKEY,
		SessionStore: sessions.NewRedisStore(redis.NewClient(&redis.Options{
			Addr:     REDISADDR,
			Password: "",
			DB:       0,
		}), time.Hour),
		UserStore: users.NewSQLStore(db),
	}

	mux := http.NewServeMux()

	// Chatroom Microservice
	chatroomDirector := func(r *http.Request) {
		r.Host = "chatroomSrv" // name of the docker instance running
		r.URL.Host = "chatroomSrv"
		r.URL.Scheme = "http"
		// r.Header.Del("X-User")

		// currSession := &handlers.SessionState{}
		// // Check if the user is authenticated
		// _, authErr := sessions.GetState(r, hctx.SigningKey, hctx.SessionStore, currSession)
		// if authErr != nil {
		// 	return
		// }

		// userHeader, err := json.Marshal(currSession.User)
		// if err != nil {
		// 	return
		// }
		// r.Header.Add("X-User", string(userHeader))
	}

	chatroomRevProxy := &httputil.ReverseProxy{Director: chatroomDirector}

	// Route Outlines

	// User registration / Profile Changes (Sign in, Sign out or Sign up)
	mux.HandleFunc("/v1/users/", hctx.SpecificUserHandler)
	mux.HandleFunc("/v1/users", hctx.UsersHandler)
	mux.HandleFunc("/v1/sessions", hctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/", hctx.SpecificSessionHandler)

	mux.Handle("/", chatroomRevProxy)
	mux.Handle("/v1/matches", chatroomRevProxy)
	mux.Handle("/v1/likes", chatroomRevProxy)
	mux.Handle("/v1/upcoming", chatroomRevProxy)
	mux.Handle("/v1/room", chatroomRevProxy)
	mux.Handle("/v1/room/{roomid}", chatroomRevProxy)
	mux.Handle("/room/{roomid}", chatroomRevProxy)

	wrappedMux := handlers.NewCORS(mux)

	log.Printf("Server is listening at %s...", ADDR)
	// log.Fatal(http.ListenAndServe(ADDR, wrappedMux))
	log.Fatal(http.ListenAndServeTLS(ADDR, TLSCERT, TLSKEY, wrappedMux))
}
