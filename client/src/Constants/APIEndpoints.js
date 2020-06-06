export default {
    base: "https://api.kelden.me",
    testbase: "http://localhost:443",
    handlers: {
        signUp: "/v1/users",
        userInfo: "/v1/users/",
        StartSession: "/v1/sessions",
        EndSession: "/v1/sessions/mine",
    }
}