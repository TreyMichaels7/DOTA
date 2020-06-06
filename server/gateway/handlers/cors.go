package handlers

import (
	"net/http"
)

/* TODO: implement a CORS middleware handler, as described
in https://drstearns.github.io/tutorials/cors/ that responds
with the following headers to all requests:

  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, PUT, POST, PATCH, DELETE
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Expose-Headers: Authorization
  Access-Control-Max-Age: 600
*/

type CORS struct {
	handler http.Handler
}

func (c *CORS) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user, X-User")
	w.Header().Set("Access-Control-Expose-Headers", "Authorization")
	w.Header().Set("Access-Control-Max-Age", "600")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	c.handler.ServeHTTP(w, r)
}

func NewCORS(handler http.Handler) *CORS {
	return &CORS{handler}
}
