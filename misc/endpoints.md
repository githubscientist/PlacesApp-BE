# API Endpoints - Places App

### Places Endpoints

| Endpoint               | HTTP Method | Description                               |
| ---------------------- | ----------- | ----------------------------------------- |
| `api/places/user/:uid` | `GET`       | List all places for a given user id (uid) |
| `api/places/:pid`      | `GET`       | Get a place by place id (pid)             |
| `api/places`           | `POST`      | Create a new place                        |
| `api/places/:pid`      | `PATCH`     | Update a place by place id (pid)          |
| `api/places/:pid`      | `DELETE`    | Delete a place by place id (pid)          |

### Users Endpoints

| Endpoint           | HTTP Method | Description                     |
| ------------------ | ----------- | ------------------------------- |
| `api/users/`       | `GET`       | List all users                  |
| `api/users/signup` | `POST`      | Create a new user + log user in |
| `api/users/login`  | `POST`      | Log user in                     |
