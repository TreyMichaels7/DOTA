package users

import (
	"database/sql"
	_ "github.com/go-sql-driver/mysql"
)

type SQLStore struct {
	db *sql.DB
}

func NewSQLStore(db *sql.DB) *SQLStore {
	return &SQLStore{db}
}


const SelectQuery = "select ID,FirstName,LastName,Email,PassHash,Bio,Gender,Sexuality,PhotoURL from Users where "
const InsertQuery = "insert into Users(FirstName,LastName,Email,PassHash,Bio,Gender,Sexuality,PhotoURL) values (?,?,?,?,?,?)"
const UpdateQuery = "Update Users set Bio = ?, Gender = ?, Sexuality = ?, PhotoURL = ? where ID = ?"
const DeleteQuery = "Delete from Users where ID = ?"

//GetByID returns the User with the given ID
func (ss *SQLStore) GetByID(id int64) (*User, error) {
	row, err := ss.db.Query(SelectQuery + "ID=?", id)
	if err != nil {
		return nil, err
	}
	defer row.Close()
	user := &User{}
	row.Next()
	if err = row.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, 
		&user.PassHash, &user.Bio, &user.Gender, &user.Sexuality, &user.PhotoURL); err != nil {
			return nil, err
		}
	if err = row.Err(); err != nil {
		return nil, err
	}
	return user, nil
}

//GetByEmail returns the User with the given email
func (ss *SQLStore) GetByEmail(email string) (*User, error) {
	row, err := ss.db.Query(SelectQuery + "Email=?", email)
	if err != nil {
		return nil, err
	}
	defer row.Close()
	user := &User{}
	row.Next()
	if err = row.Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, 
		&user.PassHash, &user.Bio, &user.Gender, &user.Sexuality, &user.PhotoURL); err != nil {
			return nil, err
		}
	if err = row.Err(); err != nil {
		return nil, err
	}
	return user, nil
}

//Insert inserts the user into the database, and returns
//the newly-inserted User, complete with the DBMS-assigned ID
func (ss *SQLStore) Insert(user *User) (*User, error) {
	res, err := ss.db.Exec(InsertQuery, user.FirstName, user.LastName, user.Email, user.PassHash, user.Bio, user.Gender, user.Sexuality, user.PhotoURL)
	if err != nil {
		return nil, err
	} 
	id, err := res.LastInsertId()
	if err != nil {
		return nil, err
	}
	user.ID = id
	return user, nil
}

//Update applies UserUpdates to the given user ID
//and returns the newly-updated user
func (ss *SQLStore) Update(id int64, updates *Updates) (*User, error) {
	_, err := ss.db.Exec(UpdateQuery, updates.Bio, updates.Gender, updates.Sexuality, updates.PhotoURL, id)
	if err != nil {
		return nil, err
	}
	return ss.GetByID(id)
}

//Delete deletes the user with the given ID
func (ss *SQLStore) Delete(id int64) error {
	_, err := ss.db.Exec(DeleteQuery, id)
	if err != nil {
		return err
	}
	return nil
}
