[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/ysjzgyDt)
# Classic City Social

##  Overview

This repository represents the culminating project for CSCI 4300 – Web Programming at UGA.  
Our team collaboratively designed, developed, and deployed this full-stack web application using React + Next.js, Node.js and MongoDB. 

Our project is called ClassicCitySocial. It is a hub for events in Athens, where you can browse all kinds of events, create your own, and connect with friends. 

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
- CRUD operations** for users, events, and reviews using a database or API  
- Responsive UI** & dynamic navigation bar
- Friends page including mutual friends
- Profile page
- Surpise Me feature, generating a random event
- Geolocation filtering

---

## Repository Structure

```
│── {classic-city-social}
│   └── src
│       └── app - App Router pages & API routes
            └── api
                └── auth
                    └── [...nextauth]
                        └── route.ts
        
                └── events
                    ├── route.ts
                    └── [id]
                        └── route.ts
        
                └── imageUrl
                    └── route.ts
        
                └── reviews
                    ├── route.ts
                    └── [id]
                        └── route.ts
        
                └── summarize-reviews
                    └── route.ts
        
                └── users
                    ├── route.ts
                    └── [id]
                        └── route.ts
             
            └── components
                └── figma
                    └── ImageWithFallback.tsx
        
                └── ui
                    └── ui - accordion.tsx, alert-dialog.tsx, alert.tsx, aspect-ratio.tsx,
                              avatar.tsx, badge.tsx, breadcrumb.tsx, button.tsx, calendar.tsx,
                              card.tsx, carousel.tsx, chart.tsx, checkbox.tsx, collapsible.tsx,
                              command.tsx, content-menu.tsx, dialog.tsx, drawer.tsx,
                              dropdown-menu.tsx, form.tsx, hover-card.tsx, input-otp.tsx,
                              input.tsx, label.tsx, menubar.tsx, navigation-menu.tsx,
                              pagination.tsx, popover.tsx, progress.tsx, radio-group.tsx,
                              resizable.tsx, scroll-area.tsx, select.tsx, separator.tsx,
                              sheet.tsx, sidebar.tsx, skeleton.tsx, slider.tsx, sonner.tsx,
                              switch.tsx, table.tsx, tabs.tsx, textarea.tsx, toggle-group.tsx,
                              toggle.tsx, tooltip.tsx, use-mobile.ts, utils.ts
        
                └── EventCard.tsx
                └── EventCardNew.tsx
                └── EventDetailsDialog.tsx
                └── EventForm.tsx
                └── ImageCropper.tsx
                └── MapComponent.tsx
                └── MapSlideOver.tsx
                └── MiniMapComponent.tsx
            
            
            └── events
                └── page.tsx
        
            └── friends
                └── page.tsx
        
            └── login
                └── page.tsx

            └── models
                └── eventSchema.ts
                └── mockData.ts
                └── reviewSchema.ts
                └── userSchema.ts
        
            └── profile
                └── page.tsx
        
            └── services
                └── api.ts
        
            └── signup
                └── page.tsx
        
            └── utils
                └── cdn.ts
            
            ├── favicon.ico
            ├── globals.css
            ├── layout.tsx
            ├── not-found.tsx
            └── page.tsx
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

## API Endpoints

| Method      | Endpoint                    | Description                                         |
| ----------- | --------------------------- | --------------------------------------------------- |
| GET/POST    | /api/auth/*                 | NextAuth authentication routes                      |
| GET         | /api/events                 | Fetch all events (from DB and Ticketmaster via API) |
| POST        | /api/events                 | Create a new event                                  |
| GET         | /api/events/[id]            | Get event by ID                                     |
| PUT         | /api/events/[id]            | Update event by ID                                  |
| DELETE      | /api/events/[id]            | Delete event by ID                                  |
| POST        | /api/imageUrl               | Upload image to ImgBB and return hosted URL         |
| GET         | /api/reviews                | Fetch all reviews (can filter with `?eventId=...`)  |
| POST        | /api/reviews                | Create a new review                                 |
| GET         | /api/reviews/[id]           | Get review by ID                                    |
| PUT         | /api/reviews/[id]           | Update review by ID                                 |
| DELETE      | /api/reviews/[id]           | Delete review by ID                                 |
| POST        | /api/summarize-reviews      | Generate an AI summary of an event's reviews        |
| GET         | /api/users                  | Fetch all users                                     |
| POST        | /api/users                  | Create a new user (Signup) or authenticate (Login)  |
| GET         | /api/users/[id]             | Get user by ID                                      |
| PUT         | /api/users/[id]             | Update user profile by ID                           |
| DELETE      | /api/users/[id]             | Delete user account by ID                           |

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
