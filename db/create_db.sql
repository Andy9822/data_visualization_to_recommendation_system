CREATE TABLE IF NOT EXISTS Genres
(
    id          serial primary key,
    name        VARCHAR(100) not null unique
    
);


CREATE TABLE IF NOT EXISTS Titles
(
    id   			    serial primary key,
    title_glbp_id 	    VARCHAR(16) not null unique
);


CREATE TABLE IF NOT EXISTS GenreTitles
(
    id   			serial primary key,
    title_id        serial references Titles (id) not null,
    genre_id        serial references Genres (id) not null,
    unique(title_id, genre_id)
);

CREATE TABLE IF NOT EXISTS Players
(
    id   		serial primary key,
    name        VARCHAR(50) not null unique
);

CREATE TABLE IF NOT EXISTS Devices
(
    id   		serial primary key,
    name        VARCHAR(50) not null unique
);

CREATE TABLE IF NOT EXISTS Users
(
    id   		        serial primary key,
    user_glbp_id        VARCHAR(16) not null unique
);

CREATE TABLE IF NOT EXISTS Views
(
    id   			serial primary key,
    title_id        serial references Titles (id) not null, 
    user_id         serial references Users (id) not null,
    device_id       serial references Devices (id) not null, 
    player_id       serial references Players (id) not null
);