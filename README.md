# ABISAT ET

ABISAT ET is a modern satellite information and download website for software, loaders, news, and channel updates.

## Stack

- Frontend: Vue 3 + Vite + Tailwind CSS
- Backend: Express + MySQL
- Database: MySQL with automatic schema initialization on startup
- Interface: persistent dark and light themes

## Project structure

- Frontend/: Vue frontend app and assets
- Backend/: Express API, upload handling, MySQL bootstrap, environment configuration
- Frontend/public/: static images and CSS files

## Setup

1. Install dependencies
   - npm install
2. Configure MySQL
   - Make sure MySQL/MariaDB is running locally
   - Update Backend/.env with your DB credentials and admin credentials
   - Configure EMAIL_USER and EMAIL_PASS with a Gmail address and its Google App Password
   - Set CONTACT_TO to the mailbox that should receive contact form messages (defaults to abisatinfo.support@gmail.com)
3. Run the app
   - npm run dev:frontend
   - npm run dev:backend

The backend automatically creates the database and tables defined in Backend/database/schema.sql when it starts if the database server is reachable.

## Default env values

- DB_NAME=abisat_et
- ADMIN_USERNAME=admin
- ADMIN_PASSWORD=change-this-before-deploying
- CONTACT_TO=abisatinfo.support@gmail.com

The contact form reports when Gmail's SMTP server accepts a message; this does not guarantee inbox placement. Check the configured CONTACT_TO mailbox's spam/promotions folders. EMAIL_PASS should be a Google App Password, not the normal Gmail account password.

## Useful commands

- npm run build: build the Vue app for production
- npm run start --workspace Backend: run the backend server

## Notes

- Uploaded files are stored in Backend/uploads/
- Frontend static assets remain under Frontend/public/
