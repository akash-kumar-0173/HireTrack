# HireTrack

A Kanban-style job application tracker for students hunting internships. Keep every application on one board and see your progress at a glance.

**Live demo:** https://akash-hiretrack.vercel.app

## Features

- Five stages: Wishlist, Applied, Interview, Offer, Rejected
- Drag and drop cards between stages, or move them with the arrow buttons
- Add and edit applications with form validation (company, role, stipend, link, notes)
- Live stats: total tracked, applied, interviews, offers and reply rate
- Search by company or role
- Data saved in the browser with localStorage, so it stays after a refresh

## Tech stack

- React 18
- Tailwind CSS
- Vite

## Run it locally

```bash
git clone https://github.com/akash-kumar-0173/HireTrack.git
cd HireTrack
npm install
npm run dev
```

Then open the link shown in the terminal (usually http://localhost:5173).

## What I learned

- Managing state with `useState` and derived values with `useMemo`
- Saving data with a custom `useLocal` hook built on `useEffect`
- Handling drag and drop events and form validation in React
- Styling a responsive layout with Tailwind utility classes

## Roadmap

- [ ] Add a Node.js and MongoDB backend with login
- [ ] Sort by stipend and date
- [ ] Reminders for follow-ups

## Author

Akash Kumar, B.Tech ECE (2027)
GitHub: [akash-kumar-0173](https://github.com/akash-kumar-0173) | LinkedIn: [akash-kumar-13z](https://linkedin.com/in/akash-kumar-13z)
