package users

import (
	"strings"
	"testing"

	"golang.org/x/crypto/bcrypt"
)
//TODO: add tests for the various functions in user.go, as described in the assignment.
//use `go test -cover` to ensure that you are covering all or nearly all of your code paths.

func TestValidate(t *testing.T) {

	cases := []struct {
		TestName 	string
		TestUser *NewUser
		expectError bool
	}{
		{
			"Valid New User",
			&NewUser{
			"trey",
			"michaels",
			"treymichaels@live.com",
			"xxxxxx",
			"Hi I am trey",
			1,
			2,
			"testing"},
			false,
		},
		{
			"Invalid Email",
			&NewUser{
			"trey",
			"michaels",
			"treymichaels",
			"xxxxxx",
			"Hi I am trey",
			1,
			2,
			"testing"},
			true,
		},
		{
			"Password too short",
			&NewUser{
				"trey",
				"michaels",
				"treymichaels@live.com",
				"xxxx",
				"Hi I am trey",
				1,
				2,
				"testing"},
			true,
		},
	}
	for _, c := range cases {
		err := c.TestUser.Validate()
		if err != nil && !c.expectError {
			t.Fatalf("case %s: unexpected error:%v\n", c.TestName, err)
		}
		if c.expectError && err == nil {
			t.Fatalf("case %s: expected error but didn't get one:%v\n", c.TestName, err)
		}
	}
}

func TestToUser(t *testing.T) {
	cases := []struct {
		TestName string
		TestNew *NewUser
		ExpectUser *User
		ExpectError bool
	}{
		{
			"New user is created with normal email",
			&NewUser{
				"trey",
				"michaels",
				"treymichaels@live.com",
				"xxxxxx",
				"Hi I am trey",
				1,
				2,
				"testing"},
			&User{
				1,
				"trey",
				"michaels",
				"trey@live.com",
				[]byte ("xxxxxx"),
				"Hi I am trey",
				1,
				2,
				"testing",
			},
			false,
		},
	}
	for i, c := range cases {
		user, err := c.TestNew.ToUser()
		if err != nil && !c.ExpectError {
			t.Errorf("case %s: unexpected error:\n", c.TestName)
		}
		if c.ExpectError && err == nil {
			t.Errorf("case %s: expected error but didn't get one\n", c.TestName)
		}
		if user != nil {
			user.ID = 1
			passErr := c.ExpectUser.SetPassword(c.TestNew.Password) 
			if passErr != nil {
				t.Errorf("case #%d: Error in setting password\n", i)
			}
			matchErr := bcrypt.CompareHashAndPassword(c.ExpectUser.PassHash, []byte(c.TestNew.Password))
			if matchErr != nil {
				t.Errorf("case #%d: Passhash does not match Expected password\n", i)
			}
		}
	}
}

func TestFullName(t *testing.T) {
	cases := []struct {
		TestName string
		TestUser *User
		ExpectFullName string
	}{
		{
			"Return full name with both first and last available",
			&User{
				1,
				"trey",
				"michaels",
				"trey@live.com",
				[]byte ("xxxxxx"),
				"Hi I am trey",
				1,
				2,
				"testing",
			},
			"trey michaels",
		},
	}
	for _, c := range cases {
		fullName := c.TestUser.FullName()
		if !strings.EqualFold(fullName, c.ExpectFullName) {
			t.Errorf("case %s: expected full name: %s, retrieved: %s \n", c.TestName, c.ExpectFullName, fullName)
		}
	}
}

func TestAuthenticate(t *testing.T) {
	testUser := &User{
		1,
		"trey",
		"michaels",
		"trey@live.com",
		[]byte ("xxxxxx"),
		"hello i am trey",
		1,
		1,
		"testing",
	}

	cases := []struct {
		TestName string
		Attempt string
		ExpectError bool
	}{
		{
			"Correct Password",
			"xxxxxx",
			false,
		},
		{
			"Incorrect Password",
			"yyyyyy",
			true,
		},
	}
	testUser.SetPassword("xxxxxx")
	for _, c := range cases {
		err := testUser.Authenticate(c.Attempt)
		if err != nil && !c.ExpectError {
			t.Errorf("case %s: unexpected error:\n", c.TestName)
		}
		if c.ExpectError && err == nil {
			t.Errorf("case %s: expected error but didn't get one\n", c.TestName)
		}
	}
}

func TestApplyUpdates(t *testing.T) {

	testUser := &User{
		1,
		"trey",
		"michaels",
		"trey@live.com",
		[]byte ("xxxxxx"),
		"Hi I am trey",
		1,
		2,
		"testing",
	}

	cases := []struct {
		TestName	string
		UpdateBio	string
		UpdateGender int32
		UpdateSexuality int32
		UpdatePhotoURL string
		ExpectBio string
		ExpectGender int32
		ExpectSexuality int32
		ExpectPhotoURL string
		ExpectError bool
	}{
		{
			"Update everything",
			"i love sushi",
			2,
			2,
			"xxxxxx",
			"i love sushi",
			2,
			2,
			"xxxxxx",
			false,
		},
		{
			"No change in photoURL",
			"i love sushi",
			2,
			2,
			"",
			"i love sushi",
			2,
			2,
			"xxxxxx",
			false,
		},
	}
	for _, c := range cases {
		err := testUser.ApplyUpdates(&Updates{
			c.UpdateBio,
			c.UpdateGender,
			c.UpdateSexuality,
			c.UpdatePhotoURL,
		})
		if err != nil && !c.ExpectError {
			t.Fatalf("case %s: unexpected error:%v\n", c.TestName, err)
		}
		if c.ExpectError && err == nil {
			t.Fatalf("case %s: expected error but didn't get one:%v\n", c.TestName, err)
		}
		if !strings.EqualFold(testUser.Bio, c.ExpectBio) {
			t.Errorf("case %s: expected Bio: %s, retrieved: %s \n", c.TestName, c.ExpectBio, testUser.Bio)
		}
		if !strings.EqualFold(testUser.PhotoURL, c.ExpectPhotoURL) {
			t.Errorf("case %s: expected PhotoURL: %s, retrieved: %s \n", c.TestName, c.ExpectPhotoURL, testUser.PhotoURL)
		}
	}
}