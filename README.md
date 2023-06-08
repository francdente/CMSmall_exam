[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/suhcjUE-)
# Exam #12345: "Exam Title"
## Student: s123456 LASTNAME FIRSTNAME 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

### __Get pages__

URL: `/api/pages`

Method: GET

Description: Get all pages

Request body: _None_

Response: `200 OK` (success) or `500 Internal Server Error` (error)

Response body: An array of objects, each describing a page
```
[
  {
    "page_id": 1,
    "author_id": 1,
    "author_name": "John Doe",
    "title": "Page title",
    "creation_date": "2020-01-01T00:00:00.000Z",
    "publication_date": "2020-01-01T00:00:00.000Z",
  },
  ....
]
```

### __Get published pages__

URL: `/api/pages/published`

Method: GET

Description: Get all published pages

Request body: _None_

Response: `200 OK` (success) or `500 Internal Server Error` (error)

Response body: An array of objects, each describing a page
```
[
  {
    "page_id": 1,
    "author_id": 1,
    "author_name": "John Doe",
    "title": "Page title",
    "creation_date": "2020-01-01T00:00:00.000Z",
    "publication_date": "2020-01-01T00:00:00.000Z",
  },
  ....
]
```

### __Get page (by Id)__

URL: `/api/pages/:id`

Method: GET

Description: Get page with given id

Request body: _None_

Response: `200 OK` (success) or `500 Internal Server Error` (error)

Response body: An object describing the page
```
{
  "page_id": 1,
  "author_id": 1,
  "author_name": "John Doe",
  "title": "Page title",
  "creation_date": "2020-01-01T00:00:00.000Z",
  "publication_date": "2020-01-01T00:00:00.000Z",
}
```

- POST `/api/login`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

## Database Tables

- Table `users` - contains xx yy zz
- Table `something` - contains ww qq ss
- ...

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username: u1@e.com, password: "pwd", role: "user"
- username: u2@e.com, password: "pwd", role: "user" 
- username: u3@e.com, password: "pwd", role: "user" 
- username: a1@e.com, password: "pwd", role: "admin"



