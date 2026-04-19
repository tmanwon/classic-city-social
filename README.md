[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/ysjzgyDt)
# Classic City Social

##  Overview

This repository represents the culminating project for CSCI 4300 – Web Programming at UGA.  
Our team collaboratively designed, developed, and deployed this full-stack web application using React + Next.js, Node.js and MongoDB. 

---

## Our Team - Athens Event Finders 

| Member Name      | GitHub Username      | Role                |
|------------------|----------------------|---------------------|
| Justin Alexander | justin-t-alexander   | Project Leader      |
| Gerardo Mendoza  | GJMendoza1           | Project Manager     |
| Yousef Hasan     | yousef-0614          | Communication Leader|
| Tillman Won      | tmanwon              | GitHub Captain      |

---

## Project Features (Example)

- Authentication & Authorization** (login/sign-up, protected routes)  
- Middleware or Route Protection** for authenticated users  
- CRUD operations** using a database or API  
- Responsive UI** & dynamic navigation bar  

---

## Repository Structure

```
│── {project-name}
│   └── src
│       └── app - App Router pages & API routes
│            └──   components → list components
│            └──   models → Mongoose schemas / MongoDB models
│── design - mockups.md 
│── images - mockup images, etc.
└── status - WEEKLY_STATUS.md

```

---

## Tech Stack

| Layer             | Technology                                   |
|-------------------|----------------------------------------------|
| Frontend          | React + Next.js (App Router)                 |
| Backend           | Next.js API Routes / Node.js                 |
| Database          | MongoDB + Mongoose                           |
| Styling           | Tailwind CSS                                 |
| Authentication    | NextAuth.js, bcrypt (hasing), JWT            |

---

## Run the development server

```
npm run dev
```

The project should now be running at:
    http://localhost:3000

## API Endpoints (Examples – update as you build)

| Method      | Endpoint             | Description            |
| ----------- | -------------------- | ---------------------- |
| GET         | /api/items           | Fetch all items        |
| POST        | /api/items           | Create a new item      |
| GET         | /api/items/[id]      | Get item by ID         |
| PUT         | /api/items/[id]      | Update item by ID      |
| DELETE      | /api/items/[id]      | Delete item by ID 
| ...         | ...                  | ... 
| ...         | ...                  | ...                    |

## Database Models

### User
| Field           | Type        | Description               |
|-----------------|------------|---------------------------|
| firstName       | String     | User’s first name         |
| lastName        | String     | User’s last name          |
| email           | String     | Unique email              |
| password        | String     | Hashed password           |
| friends         | String[]   | Friend user IDs           |
| imageUrl        | String/null| Profile image URL         |
| interests       | String[]   | User interests            |
| myEvents        | String[]   | Events created by user    |
| eventsAttending | String[]   | Events user is attending  |

### Event
| Field               | Type        | Description                         |
|---------------------|------------|-------------------------------------|
| title               | String     | Event title                         |
| tmid                | String/null| Ticketmaster ID                     |
| description         | String     | Event description                   |
| date                | String     | Event date                          |
| time                | String     | Event time                          |
| location            | String     | Event location                      |
| coordinates         | Object     | Latitude & longitude                |
| category            | String     | Event category                      |
| imageUrl            | String     | Event image URL                     |
| venue               | String     | Venue name                          |
| price               | String     | Ticket price                        |
| attendees           | String[]   | Attending user IDs                  |
| reviews             | String[]   | Review IDs                          |
| createdBy           | String     | Creator user ID                     |
| url                 | String/null| External link                       |
| source              | String     | Event source                        |
| aiSummary           | String/null| AI-generated summary                |
| aiSummaryUpdatedAt  | String/null| Last AI update                      |

### Review
| Field     | Type   | Description                          |
|-----------|--------|--------------------------------------|
| eventId   | String | Event ID                             |
| userId    | String | User ID                              |
| userName  | String | Reviewer name                        |
| rating    | Number | Rating (1–5)                         |
| comment   | String | Review text                          |
| sentiment | String | positive / neutral / negative        |
| createdAt | String | Timestamp                            |

---

## Client Routes

| Route          | Description           |
|----------------|-----------------------|
| `/`            | Homepage              |
| `/events`      | Browse events         |
| `/events/[id]` | Event details         |
| `/friends`     | Friends page          |
| `/login`       | User login            |
| `/signup`      | User registration     |
| `/profile`     | User profile          |

## Future Improvements
- what would you like to do next?

## Acknowledgements
- kudos to ....
