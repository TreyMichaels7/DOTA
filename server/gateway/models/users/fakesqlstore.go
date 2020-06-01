package users

import (
	_ "github.com/go-sql-driver/mysql"
)

type FakeStore struct {
}

//GetByID returns the User with the given ID
func (fs *FakeStore) GetByID(id int64) (*User, error) {
	if id == 1 {
		return &User{
			1,
			"trey",
			"michaels",
			"trey@live.com",
			[]byte("xxxxxx"),
			"hello i am trey",
			1,
			1,
			"testing",
		}, nil
	}
	return nil, ErrUserNotFound
}

//GetByEmail returns the User with the given email
func (fs *FakeStore) GetByEmail(email string) (*User, error) {
	if email == "trey@live.com" {
		user := &User{
			1,
			"trey",
			"michaels",
			"trey@live.com",
			[]byte("xxxxxx"),
			"hello i am trey",
			1,
			1,
			"testing",
		}
		user.SetPassword("xxxxxx")
		return user, nil
	}
	return nil, ErrUserNotFound
}

//Insert inserts the user into the database, and returns
//the newly-inserted User, complete with the DBMS-assigned ID
func (fs *FakeStore) Insert(user *User) (*User, error) {
	return user, nil
}

//Update applies UserUpdates to the given user ID
//and returns the newly-updated user
func (fs *FakeStore) Update(id int64, updates *Updates) (*User, error) {
	if id == 1 {
		return &User{
			1,
			"trey",
			"michaels",
			"trey@live.com",
			[]byte("xxxxxx"),
			updates.Bio,
			updates.Gender,
			updates.Sexuality,
			updates.PhotoURL,
		}, nil
	}
	return nil, ErrUserNotFound
}

//Delete deletes the user with the given ID
func (fs *FakeStore) Delete(id int64) error {
	if id == 1 {
		return nil
	}
	return ErrUserNotFound
}
