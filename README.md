# **Sports Venue Booking Platform**

A microservices platform for booking sports venues. Users can register, view venues, check available time slots, and make bookings. Slot availability is verified asynchronously using RabbitMQ to prevent conflicts.

### Stack:

Backend: Node.js, Express, Sequelize (PostgreSQL)
Frontend: React, Tailwind CSS
Messaging: RabbitMQ
Architecture: Microservices (User, Venue, Booking, API Gateway)
Auth: JWT

### How to Start:

#### **_WARNING: You must create PostgreSQL databases manually before starting services. Otherwise, services will throw errors._**

**1.Clone repo:**
`git clone https://github.com/Shiw4se/web.git
cd webprog`;

**2.Install dependencies:**
`npm install
npm run install:all`

**3.Create database manually:** 

Open your PostgreSQL client (psql, pgAdmin, etc.) and run: `CREATE DATABASE SportCourts;`
    
**3.1.Create tables**  

```
-- Users table
CREATE TABLE IF NOT EXISTS public.users (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name varchar,
email varchar UNIQUE,
password varchar,
role varchar DEFAULT 'user' CHECK (role IN ('admin', 'user')),
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id)
);``

-- Venues table
CREATE TABLE IF NOT EXISTS public.venues (
id uuid NOT NULL DEFAULT gen_random_uuid(),
name varchar NOT NULL,
location varchar NOT NULL,
type varchar NOT NULL CHECK (type IN ('football_field', 'tennis_court', 'basketball_court')),
description text,
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id)
);

-- Available slots table
CREATE TABLE IF NOT EXISTS public.available_slots (
id uuid NOT NULL DEFAULT gen_random_uuid(),
venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,
start_time timestamp NOT NULL,
end_time timestamp NOT NULL,
is_available boolean DEFAULT true,
PRIMARY KEY (id)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,
slot_id uuid NOT NULL,
start_time timestamp NOT NULL,
end_time timestamp NOT NULL,
status varchar DEFAULT 'booked' CHECK (status IN ('booked','cancelled')),
created_at timestamp DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (id)
);
```

**4.Setup environment variables**

Copy .env.example to .env in each backend service and update credentials.

**5.Start services with `npm start`**

### Usage:

* Register/login user via `/user/register` & `/user/login`

* List venues: `/venue`

* View venue slots: `/venue/find_by_id/:id`

* Create booking: `/bookings/create`

* View user bookings: `/bookings/:userId`

* Cancel booking: `/bookings/:bookingId`

For any questions or issues, reach out to me on Telegram ([@shiw4se](https://t.me/shiw4se)) 
or via email [ausenko476@gmail.com](mailto:ausenko476@gmail.com)