Create table if not exists Users (
    ID int primary key not null,
    FirstName varchar(128) not null,
    LastName varchar(128) not null,
    Email varchar(320) not null unique,
    PassHash binary(60) not null,
    Bio varchar(300),
    Gender varchar(60) not null,
    Sexuality varchar(100) not null,
    PhotoURL varchar(320) not null
);

alter user root identified with mysql_native_password by 'dating123';
flush privileges;