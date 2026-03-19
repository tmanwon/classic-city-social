[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/ysjzgyDt)
# Project_Name_Here

##  Overview

This repository represents the culminating project for CSCI 4300 – Web Programming at UGA.  
Our team collaboratively designed, developed, and deployed this full-stack web application using React + Next.js, Node.js and MongoDB. 

---

## Our Team - Group_Name_Here 

| Member Name      | GitHub Username      | Role          |
|------------------|----------------------|---------------|
|                  |                      | Project Leader  |
|                  |                      | Project Manager   |
|                  |                      | Communication Leader    |
|                  |                      | GitHub Captain |

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
| Styling           | Tailwind CSS ?? / Custom CSS Modules ??      |
| Authentication    | NextAuth.js                                  |

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

## Database Models (example)
User
| Field    | Type   | Description     |
| -------- | ------ | --------------- |
| name     | String | Full name       |
| email    | String | Unique email    |
| role     | String | admin/user/etc. |
| password | String | Hashed password |

## Client Routes (example)
| Route         | Description       |
| ------------- | ----------------- |
| `/`           | Homepage          |
| `/login`      | User login        |
| `/dashboard`  | User dashboard    |
| `/items`      | List of items     |
| `/items/[id]` | View details page |

## Future Improvements
- what would you like to do next?

## Acknowledgements
- kudos to ....
