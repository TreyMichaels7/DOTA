Link to Google Doc For Readability: https://docs.google.com/document/d/1rjxnJF9NU1zrY1mGaobd65GU0ZK09ixvHteGNNcUoPQ/edit?usp=sharing

Project Description
-------------------

As a busy UW student, it can be hard to find time to really spend time looking for love. Each quarter, students spend hours studying for midterms and finals. Not only that, they also have to make time for various group projects and work on dense and difficult homework assignments throughout the quarter. In addition, there might be other priorities and extracurriculars that make it harder to focus on finding the one. However, that is about to change thanks to "Dating on the Ave", an exciting and revolutionary way to make connections with your peers at UW while ensuring you still have time for your other commitments.

How does this work? Well, Dating on the Ave is an online web application that will enable users to sign-up and sign-in to an account where they can establish their own basic user profiles. Profile information might include their name, age, major, pronouns, sexuality, availability, a profile picture or two, as well as a short bio about themselves. Users can also customize what information will be visible to other users. One other thing that users will be asked to optionally fill out is their contact info on other social media or their phone number, but it will not be displayable on their profile.

After the profile is created you are now ready to start using Dating on the Ave. Each day you will be given 3 people's profile cards based on your preferences, and notified when the profiles have changed. Whoever appears on your page, you will appear on their page as well. You will have the opportunity to quickly read their information, and if you're interested, you can ask/invite them to a short 7 minute video chat at a time that works with their availability that will remain pending for about a week. They will be notified and have the option to either accept/decline. If they decline, the invitation will just remain until it expires in a week. If they accept, the meeting will be scheduled and a chat room will open up at the specified time where the two users can get to know each other. There will be a notification that appears around the 5 minute warning indicating the chatroom is going to end soon. At the end of the call a prompt will appear that asks each user if they want to share their contact info with the other person. If both people agree, then their contact info will be shared with each other. Otherwise, no info will be shared. It is important to share contact info if you like someone because you do not get another chance to contact them via the platform after the call regardless of any outcome.

Ideally, this platform will be a means of connecting UW students with one another, and with the video chat functionality, prevent people from threats like getting catfished. You must have a UW email in order to prevent outsiders from also using this application. We want to encourage people who find a connection through these video chats to also continue the conversation, which is why we ask them to share their contact info with each other if they think it's worthwhile. Hopefully, we can help build relationships while fostering a safe environment.

Group Members: Kelden Lin, Trey Michaels

Project Pitch

-   Audience

    -   UW students seeking love

-   Problem

    -   Finding love is hard, especially when you love staying in or are forced to stay in. Online dating apps are full of catfishes, stalkers, and people with bad intentions. Many times what we see online isn't reflective of what the other person is truly like.

-   Solution

    -   Our platform will ensure that people are who they say they are by validating their accounts with an UW email, and also connect people with others via video chatting who would likely be relatively nearby because they would all attend the same school.

-   THE PROFILE

    -   Name, Age, Year, Major (or intended), Pronouns, Short bio (100 characters max), Picture (1 or 2), Favorite Restaurant on the Ave*, Available times

-   THE CALLS

    -   7 minutes video chat (can be ended at any point)

    -   At the end of the 7 minutes, they get to pick yes or no, if both pick yes then they get each other's contact information

    -   If no, then unmatched

    -   The end
    

Technical Description
---------------------

-   Logged out - Sign Up (Only one that doesn't require authentication. Every other endpoint throws 401 Unauthorized if not authenticated)

      -   /v1/users

          -   POST

            -   201 - New user is created on the platform

                -   Content Type: Application/JSON

            -   415 - Content Type if header does not start with Application/JSON

            -   500 - Internal Server Error

-   Logged In - Matches

    -   /v1/matches

        -   GET

            -   200 - Return the three profiles you should see on your homepage each day.

                -   Content Type: Application/JSON

            -   Each profile encoded as user JSON object

            -   500 - Internal Server Error

    -   /v1/matches/{id}

        -   DELETE (auto delete after 24 hours, cron job)

            -   200 - Deleted match ("disliked")

            -   401 - Not Authorized

            -   500 - Internal Server Error

-   User Profile

    -   /v1/profile

        -   GET

            -   200 - Return your own profile information

                -   Content Type: Application/JSON

                -   Profile encoded as User JSON object

            -   500 - Internal Server Error

        -   PATCH

            -   200 - Updated new profile information

                -   Content Type: Application/JSON

                -   Updated Profile encoded as user JSON object

        -   DELETE

            -   200 - Deleted User profile and logged out

            -   401 - Not Authorized

            -   500 - Internal Server Error

    -   /v1/profile/{id}

        -   GET

            -   200 - Return profile information

                -   Content Type: Application/JSON

                -   Profile encoded as User JSON object

            -   500 - Internal Server Error

-   Chat Room

    -   /v1/chatroom

        -   POST

            -   201 - New Chat room is created on the platform

                -   Content Type: Application/JSON

            -   415 - Content Type if header does not start with Application/JSON

            -   500 - Internal Server Error

    -   /v1/chatroom/{id}

        -   GET

            -   200 - Get Chat Room Information

            -   403 - Do not have access to this chat room

            -   500 - Internal Server Error

    -   Chat room doesn't exist

        -   DELETE

            -   200 - Deleted Chat Room

            -   403 - Do not have access to this chat room

            -   500 - Internal Server Error

-   Not in a Chat room

    -   /v1/chatroom/invite

        -   POST

            -   201 - Created Chat Room Invite

            -   500 - Internal Server Error

                -   Not currently in a chat room

        -   GET

            -   200 - Get Current Pending Chat Room invites

            -   500 - Internal Server Error

-   Send Message 

    -   /v1/message/send

        -   POST

            -   201 - Sent Message

                -   Content Type: Application/JSON

                -   Encoded as Message JSON object

            -   500 - Internal Server Error

-   Get Messages 

    -   /v1/messages

        -   GET

            -   200 - Got all messages

                -   Content Type: Application/JSON

                -   Encoded Message JSON objects

        -   500 - Internal Server Error

-   Sessions

    -   /v1/sessions

        -   POST

            -   201 - New session created

            -   401 - Invalid Credentials

            -   500 - Internal Server Error

    -   /v1/sessions/{id}

        -   DELETE

            -   200 - Session ended (logged out)

            -   500 - Internal Server Error

-   Admin

    -   /v1/admin/matches

        -   POST

            -   201 - New matches populated

            -   401 - Unauthorized

            -   500 - Internal Server Error

            -   Cron Job (Repeat this call at a time every day)

                -   Run every day at 9am

                -   0 9 * * * <command-to-execute>

                -   Resource: <https://www.ostechnix.com/a-beginners-guide-to-cron-jobs/>

                -   Generator: <https://crontab.guru/>

                -   Deploying in Docker: <https://stackoverflow.com/questions/37458287/how-to-run-a-cron-job-inside-a-docker-container>

    -   /v1/admin/profile/{id}

        -   DELETE

            -   200 - User deleted

            -   401 - Unauthorized

            -   500 - Internal Server Error

User Cases and Priority:
------------------------

| Priority | User         | Description                                                                                                                                     |   |   |
|----------|--------------|-------------------------------------------------------------------------------------------------------------------------------------------------|---|---|
| P0       | Unregistered | I want to be able to create my own profile and re-login into it.                                                                                |   |   |
| P0       | Registered   | I want to be able to make edits to my own profile, or be able to delete my profile if I no longer want to use the application.                  |   |   |
| P0       | Registered   | I want to be able to view my matches’ profiles while logged into an active session as a user.                                                   |   |   |
| P1       | Registered   | I want to be able to connect with matches I am interested in through video chat, as well as be able to send and retrieve messages in real time. |   |   |
| P1       | Registered   | I want to be able to send my contact info through the messaging feature, and be able to re-access it later by only the appropriate users.       |   |   |
| P2       | Registered   | Notification System would also be part of a messaging microservice                                                                              |   |   |

Architecture Diagram
--------------------

![](https://lh6.googleusercontent.com/P1cxXjsSD6R6MKoBzPi_KSAi_e7KK6hus9scsQAgxZ5L6UWeMWep4LB9BYFRa5OmEDWjyW6ShXMpwV0Mh8NGrOrIsI40rX4Ia1ffKRT61P0kCH9bmxyd5lmOUtgINiJ7GZp7DJ1i)

Database Schema (MYSQL, but may do messages in MongoDB as microservice json schema)
-----------------------------------------------------------------------------------

-   Users

-   ID int primary key auto_increment not null,

-   FName varchar(50) not null,

-   LName varchar(50) not null,

-   Major varchar(100) not null,

-   Bio varchar(500),

-   Pronouns varchar(50),

-   Sexuality varchar(50),

-   Availability varchar(100) not null,

-   Contact Info varchar(200) not null,

-   Chat room

-   ID int primary key auto_increment not null,

-   Time date not null

-   User_ChatRoom

-   ChatRoomID int not null,

-   User1ID int not null,

-   User2ID int not null,

-   Foreign key (ChatRoomID) references Chatroom(ID),

-   Foreign key (User1ID) references Users(ID),

-   Foreign key (User2ID) references Users(ID)

-   Messages

-   ID int primary key auto_increment not null,

-   SentAt date not null,

-   ExpiresAt date not null,

-   ProposedTime date not null

-   SenderID int not null,

-   ReceiverID int not null,

-   Foreign key (SenderID) references Users(ID),

-   Foreign key (ReceiverID) references Users(ID)

Project Components
------------------

-   Timeline: 1 month

-   Client

-   Video chat page

-   Video for 7 minutes

-   Open chat window at 5 minutes (with alert)

-   At the end of the 7 minutes, they get to pick yes or no, if both pick yes then they can continue the video chat (until they hang up? lol)

-   If no, then unmatched

-   The end

-   If yes, the chat window remains open for another 5 minutes if they want to continue chatting

-   Go back to auth main page

-   Auth Main page

-   3 matches

-   Can click into their profiles, like or dislike

-   Current Liked Matches pending for response (7 days expiration time)

-   Current Being Liked Matches, pending for response (for you to set up a video scheduling time, or reject) 

-   Current mutually liked matches (not called yet), shows button to start video call (when the time comes, if not, grayed out)

-   Profile (self, or current matches)

-   All the things we entered

-   Current schedule (or class schedule)

-   If it's a match, show video scheduling option

-   Landing page

-   Explain the product

-   Links to signup / login

-   Login page / signup page

-   Typical

-   Server

-   User Database

-   Video ChatRoom database

-   Sessions Tracking? Maybe

-   Define Endpoints
