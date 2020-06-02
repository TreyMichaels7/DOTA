export default {
    base: "http://localhost:443",
    testbase: "http://localhost:443",
    handlers: {
        signUp: "/v1/users",
        userInfo: "/v1/users/",
        StartSession: "/v1/sessions",
        EndSession: "/v1/sessions/mine",
    }
}