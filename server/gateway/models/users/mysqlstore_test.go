package users

import (
	"fmt"
	"reflect"
	"regexp"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)


// TestGetByID is a test function for the SQLStore's GetByID
func TestGetByID(t * testing.T) {
	cases := []struct {
		name         string
		expectedUser *User
		idToGet      int64
		expectError  bool
	}{
		{
			"User Found",
			&User{
				1,
				"trey",
				"michaels",
				"trey@live.com",
				[]byte ("xxxxxx"),
				"hello i am trey",
				"male",
				"men",
				"testing",
			},
			1,
			false,
		},
	}

	for _, c := range cases {
		// Create a new mock database for each case
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()

		// TODO: update based on the name of your type struct
		mainSQLStore := &SQLStore{db}

		// Create an expected row to the mock DB
		row := mock.NewRows([]string{
			"ID",
			"FirstName",
			"LastName",
			"Email",
			"PassHash",
			"Bio",
			"Gender",
			"Sexuality",
			"PhotoURL"},
		).AddRow(
			c.expectedUser.ID,
			c.expectedUser.FirstName,
			c.expectedUser.LastName,
			c.expectedUser.Email,
			c.expectedUser.PassHash,
			c.expectedUser.Bio,
			c.expectedUser.Gender,
			c.expectedUser.Sexuality,
			c.expectedUser.PhotoURL,
		)

		query := SelectQuery + "ID=?"
		if c.expectError {
			mock.ExpectQuery(query).WithArgs(c.idToGet).WillReturnError(ErrUserNotFound)
			user, err := mainSQLStore.GetByID(c.idToGet)
			if user != nil || err == nil {
				t.Errorf("Expected error [%v] but got [%v] instead", ErrUserNotFound, err)
			}
		} else {
			mock.ExpectQuery(query).WithArgs(c.idToGet).WillReturnRows(row)
			user, err := mainSQLStore.GetByID(c.idToGet)
			if err != nil {
				t.Errorf("Unexpected error on successful test [%s]: %v", c.name, err)
			}
			if !reflect.DeepEqual(user, c.expectedUser) {
				t.Errorf("Error, invalid match in test [%s]", c.name)
			}
		}

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("There were unfulfilled expectations: %s", err)
		}

	}
}

// TestGetByEmail is a test function for the SQLStore's GetByEmail
func TestGetByEmail(t * testing.T) {
	cases := []struct {
		name         string
		expectedUser *User
		emailToGet      string
		expectError  bool
	}{
		{
			"User Found With Email",
			&User{
				1,
				"trey",
				"michaels",
				"trey@live.com",
				[]byte ("xxxxxx"),
				"hello i am trey",
				"male",
				"men",
				"testing",
			},
			"test@test.com",
			false,
		},
	}

	for _, c := range cases {
		// Create a new mock database for each case
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()

		// TODO: update based on the name of your type struct
		mainSQLStore := &SQLStore{db}

		// Create an expected row to the mock DB
		row := mock.NewRows([]string{
			"ID",
			"FirstName",
			"LastName",
			"Email",
			"PassHash",
			"Bio",
			"Gender",
			"Sexuality",
			"PhotoURL"},
		).AddRow(
			c.expectedUser.ID,
			c.expectedUser.FirstName,
			c.expectedUser.LastName,
			c.expectedUser.Email,
			c.expectedUser.PassHash,
			c.expectedUser.Bio,
			c.expectedUser.Gender,
			c.expectedUser.Sexuality,
			c.expectedUser.PhotoURL,
		)

		query := SelectQuery + "Email=?"
		if c.expectError {
			mock.ExpectQuery(query).WithArgs(c.emailToGet).WillReturnError(ErrUserNotFound)
			user, err := mainSQLStore.GetByEmail(c.emailToGet)
			if user != nil || err == nil {
				t.Errorf("Expected error [%v] but got [%v] instead", ErrUserNotFound, err)
			}
		} else {
			mock.ExpectQuery(query).WithArgs(c.emailToGet).WillReturnRows(row)
			user, err := mainSQLStore.GetByEmail(c.emailToGet)
			if err != nil {
				t.Errorf("Unexpected error on successful test [%s]: %v", c.name, err)
			}
			if !reflect.DeepEqual(user, c.expectedUser) {
				t.Errorf("Error, invalid match in test [%s]", c.name)
			}
		}

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("There were unfulfilled expectations: %s", err)
		}
	}
}

func TestInsert(t *testing.T) {
	cases := []struct{
		name string
		givenUser *User
		expectedUser *User
		expectError bool
	}{
		{
			"Valid Insertion",
			&User{
				1,
				"trey",
				"michaels",
				"trey@live.com",
				[]byte ("xxxxxx"),
				"hello i am trey",
				"male",
				"men",
				"testing",
			},
			&User{
				1,
				"trey",
				"michaels",
				"trey@live.com",
				[]byte ("xxxxxx"),
				"hello i am trey",
				"male",
				"men",
				"testing",
			},
			false,
		},
	}
	for _, c := range cases {
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()
		
		mainSQLStore := &SQLStore{db}
		exec := regexp.QuoteMeta(InsertQuery)
		if c.expectError {
			mock.ExpectExec(exec).WithArgs(c.givenUser.FirstName, c.givenUser.LastName, c.givenUser.Email, c.givenUser.PassHash, 
				c.givenUser.Bio, c.givenUser.Gender, c.givenUser.Sexuality, c.givenUser.PhotoURL).WillReturnError(err)
			user, err := mainSQLStore.Insert(c.givenUser)
			if user != nil || err == nil {
				t.Errorf("Expected error [%v] but got [%v] instead", ErrUserNotFound, err)
			}
		} else {
			mock.ExpectExec(exec).WithArgs(c.givenUser.FirstName, c.givenUser.LastName, c.givenUser.Email, c.givenUser.PassHash, 
				c.givenUser.Bio, c.givenUser.Gender, c.givenUser.Sexuality, c.givenUser.PhotoURL).WillReturnResult(sqlmock.NewResult(c.expectedUser.ID, 1))
			user, err := mainSQLStore.Insert(c.givenUser)
			if err != nil {
				t.Errorf("Unexpected error on successful test [%s]: %v", c.name, err)
			}
			if !reflect.DeepEqual(user, c.expectedUser) {
				t.Errorf("Error, invalid match in test [%s]", c.name)
			}
		}
	}
}

func TestUpdate(t *testing.T) {
	cases := []struct{
		name string
		givenUser *User
		givenUpdates *Updates
		expectedUser *User
		expectError bool
	}{
		{
			"Valid Update",
			&User{
				1,
				"trey",
				"michaels",
				"trey@live.com",
				[]byte ("xxxxxx"),
				"hi i am trey",
				"female",
				"men",
				"testing",
			},
			&Updates{
				"hello i am trey",
				"male",
				"men",
				"xxxxxx",
			},
			&User{
				1,
				"trey",
				"michaels",
				"trey@live.com",
				[]byte ("xxxxxx"),
				"hello i am trey",
				"male",
				"women",
				"xxxxxx",
			},
			false,
		},
		{
			"Update not working",
			&User{
				1,
				"trey",
				"michaels",
				"trey@live.com",
				[]byte ("xxxxxx"),
				"hi i am trey",
				"female",
				"men",
				"xxxxxx",
			},
			&Updates{
				"hello i am trey",
				"male",
				"men",
				"",
			},
			&User{
				1,
				"trey",
				"michaels",
				"trey@live.com",
				[]byte ("xxxxxx"),
				"hello i am trey",
				"male",
				"women",
				"xxxxxx",
			},
			true,
		},
	}
	for _, c := range cases {
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()
		row := mock.NewRows([]string{
			"ID",
			"FirstName",
			"LastName",
			"Email",
			"PassHash",
			"Bio",
			"Gender",
			"Sexuality",
			"PhotoURL"},
		).AddRow(
			c.expectedUser.ID,
			c.expectedUser.FirstName,
			c.expectedUser.LastName,
			c.expectedUser.Email,
			c.expectedUser.PassHash,
			c.expectedUser.Bio,
			c.expectedUser.Gender,
			c.expectedUser.Sexuality,
			c.expectedUser.PhotoURL,
		)
		
		mainSQLStore := &SQLStore{db}
		exec := regexp.QuoteMeta(UpdateQuery)
		query := SelectQuery + "ID=?"
		if c.expectError {
			mock.ExpectExec(exec).WithArgs(c.givenUpdates.Bio, c.givenUpdates.Gender, c.givenUpdates.Sexuality, c.givenUpdates.PhotoURL, c.givenUser.ID).WillReturnError(err)
			user, err := mainSQLStore.Update(c.givenUser.ID, c.givenUpdates)
			if user != nil || err == nil {
				t.Errorf("Expected error [%v] but got [%v] instead", ErrUserNotFound, err)
			}

		} else {
			mock.ExpectExec(exec).WithArgs(c.givenUpdates.Bio, c.givenUpdates.Gender, c.givenUpdates.Sexuality, c.givenUpdates.PhotoURL, c.givenUser.ID).WillReturnResult(sqlmock.NewResult(c.expectedUser.ID, 1))
			mock.ExpectQuery(query).WithArgs(c.givenUser.ID).WillReturnRows(row)
			user, err := mainSQLStore.Update(c.givenUser.ID, c.givenUpdates)
			fmt.Print(user)
			fmt.Print(c.expectedUser)
			if err != nil {
				t.Errorf("Unexpected error on successful test [%s]: %v", c.name, err)
			}
			if !reflect.DeepEqual(user, c.expectedUser) {
				t.Errorf("Error, invalid match in test [%s]", c.name)
			}
			if !strings.EqualFold(user.Bio, c.expectedUser.Bio) {
				t.Errorf("Error, got %s but wanted %s", user.Bio, c.expectedUser.Bio)
			}
			if !strings.EqualFold(user.Gender, c.expectedUser.Gender) {
				t.Errorf("Error, got %s but wanted %s", user.Gender, c.expectedUser.Gender)
			}
			if !strings.EqualFold(user.Sexuality, c.expectedUser.Sexuality) {
				t.Errorf("Error, got %s but wanted %s", user.Sexuality, c.expectedUser.Sexuality)
			}
			if !strings.EqualFold(user.PhotoURL, c.expectedUser.PhotoURL) {
				t.Errorf("Error, got %s but wanted %s", user.PhotoURL, c.expectedUser.PhotoURL)
			}
		}
	}
}

func TestDelete(t *testing.T) {
	cases := []struct{
		name string
		givenID int64
		rowsAffected int64
		expectError bool
	}{
		{
			"Valid Delete",
			1,
			1,
			false,
		},
		{
			"Invalid Delete",
			0,
			0,
			true,
		},
	}
	for _, c := range cases {
		db, mock, err := sqlmock.New()
		if err != nil {
			t.Fatalf("There was a problem opening a database connection: [%v]", err)
		}
		defer db.Close()
		mainSQLStore := &SQLStore{db}
		exec := regexp.QuoteMeta(DeleteQuery)
		if c.expectError {
			mock.ExpectExec(exec).WithArgs(c.givenID).WillReturnError(err)
			err := mainSQLStore.Delete(c.givenID)
			if err == nil {
				t.Errorf("Expected error [%v] but got [%v] instead", ErrUserNotFound, err)
			}
		} else {
			mock.ExpectExec(exec).WithArgs(c.givenID).WillReturnResult(sqlmock.NewResult(c.givenID, c.rowsAffected))
			err := mainSQLStore.Delete(c.givenID)
			if err != nil {
				t.Errorf("Unexpected error on successful test [%s]: %v", c.name, err)
			}
		}
	}
}

