package users

import (
	"fmt"
	"net/mail"

	//"strings"
	"golang.org/x/crypto/bcrypt"
)

//gravatarBasePhotoURL is the base URL for Gravatar image requests.
//See https://id.gravatar.com/site/implement/images/ for details
const gravatarBasePhotoURL = "https://www.gravatar.com/avatar/"

//bcryptCost is the default bcrypt cost to use when hashing passwords
var bcryptCost = 13

//User represents a user account in the database
type User struct {
	ID        int64  `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"-"` //never JSON encoded/decoded
	PassHash  []byte `json:"-"` //never JSON encoded/decoded
	Bio       string `json:"bio"`
	Gender    int32  `json:"gender"`
	Sexuality int32  `json:"sexuality"`
	PhotoURL  string `json:"photoURL"`
}

//Credentials represents user sign-in credentials
type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

//NewUser represents a new user signing up for an account
type NewUser struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Bio       string `json:"bio"`
	Gender    int32  `json:"gender"`
	Sexuality int32  `json:"sexuality"`
	PhotoURL  string `json:"photoURL"`
}

//Updates represents allowed updates to a user profile
type Updates struct {
	Bio       string `json:"bio"`
	Gender    int32  `json:"gender"`
	Sexuality int32  `json:"sexuality"`
	PhotoURL  string `json:"photoURL"`
}

//Validate validates the new user and returns an error if
//any of the validation rules fail, or nil if its valid
func (nu *NewUser) Validate() error {
	if len(nu.FirstName) == 0 {
		return fmt.Errorf("Must have a first name")
	}
	if len(nu.LastName) == 0 {
		return fmt.Errorf("Must have a last name")
	}
	_, err := mail.ParseAddress(nu.Email)
	if err != nil {
		return fmt.Errorf("Must be a valid email address")
	}
	if len(nu.Password) < 6 {
		return fmt.Errorf("Password Length must be at least 6 characters")
	}
	if nu.Gender < 1 {
		return fmt.Errorf("Must have a gender")
	}

	if nu.Sexuality < 1 {
		return fmt.Errorf("Must have a sexuality")
	}
	return nil
}

//ToUser converts the NewUser to a User, setting the
//PhotoURL and PassHash fields appropriately
func (nu *NewUser) ToUser() (*User, error) {
	err := nu.Validate()
	if err != nil {
		return nil, err
	}
	u := &User{
		FirstName: nu.FirstName,
		LastName:  nu.LastName,
		Email:     nu.Email,
		Bio:       nu.Bio,
		Gender:    nu.Gender,
		Sexuality: nu.Sexuality,
		PhotoURL:  nu.PhotoURL,
	}
	u.SetPassword(nu.Password)
	return u, nil
}

//FullName returns the user's full name, in the form:
// "<FirstName> <LastName>"
//If either first or last name is an empty string, no
//space is put between the names. If both are missing,
//this returns an empty string
func (u *User) FullName() string {
	return u.FirstName + " " + u.LastName
}

//SetPassword hashes the password and stores it in the PassHash field
func (u *User) SetPassword(password string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 13)
	if err != nil {
		return err
	}
	u.PassHash = hash
	return nil
}

//Authenticate compares the plaintext password against the stored hash
//and returns an error if they don't match, or nil if they do
func (u *User) Authenticate(password string) error {
	if err := bcrypt.CompareHashAndPassword(u.PassHash, []byte(password)); err != nil {
		return err
	}
	return nil
}

//ApplyUpdates applies the updates to the user. An error
//is returned if the updates are invalid
func (u *User) ApplyUpdates(updates *Updates) error {
	if len(updates.PhotoURL) > 0 {
		u.PhotoURL = updates.PhotoURL
	}

	u.Bio = updates.Bio
	u.Gender = updates.Gender
	u.Sexuality = updates.Sexuality
	return nil
}
