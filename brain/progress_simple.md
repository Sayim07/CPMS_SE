# Team Progress & Role Guide — CPMS (Plain English Edition)

> **Project:** College Placement Management System (CPMS)  
> **Team:** Sayim (Project Lead), Joyeeta, Aditya, Aakriti  
> **Purpose:** A friendly, easy-to-read guide explaining what CPMS is, who is building what, and what has been completed so far.  
> **Technical Edition:** [`progress_technical.md`](progress_technical.md) (Complete schemas, REST endpoints, JWT & code templates)  

---

## Project Overview

Imagine your college is hosting a huge job fair where big companies come to hire students. 

Usually, this means hundreds of paper forms, confusing bulletin boards, long waiting lines, and teachers drowning in spreadsheets.

**CPMS (College Placement Management System)** is a modern website that turns that entire messy process into a clean, smooth digital portal:
- **Students** can create a profile, see job openings, apply with one click, and check if they got hired.
- **Companies** can post job requirements, see eligible student lists, schedule interviews, and select winners.
- **Placement Officers & Admins** can monitor everything from a live dashboard, ensure rules are followed, and make sure every student gets a fair shot.

---

## Team Roles & Structure

Think of building this website like building a modern high-tech building. Everyone has a specific, important job:

```
                      ┌─────────────────────────────────────────────────────┐
                      │                SAYIM (Project Lead)                 │
                      │   Phases: UI, 4, 7 + Overall Project Supervision    │
                      │    18 Screens, Eligibility Rules & SE Evaluation    │
                      └──────────────────────────┬──────────────────────────┘
                                                 │
               ┌─────────────────────────────────┼─────────────────────────────────┐
               │                                 │                                 │
               ▼                                 ▼                                 ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────────┐
│  JOYEETA (Phases 0, 3, 6)   │   │    ADITYA (Phases 1, 2)     │   │  AAKRITI (Phases 5, 0, 1)   │
│  The Filing Cabinet & Jobs  │   │ The Front Door & Passports  │   │The Helper & Alert Messenger │
│  (Database, Jobs, Reports)  │   │(Login, Profiles & Security) │   │(Pulse Check, Lists, Alerts) │
└─────────────────────────────┘   └─────────────────────────────┘   └─────────────────────────────┘
```

---

### 1. Sayim — Project Lead & Full Stack Architect
- **Role:** Project Lead & Full Stack Architect
- **Real-World Metaphor:** The Chief Architect who designs the whole building blueprint, builds the full physical model with furniture and lights, and coordinates all the builders.
- **What He Does:**
  - **The Master Blueprint:** Planned how the entire system works from start to finish across 9 detailed planning guides.
  - **Built All 18 Screens:** Already designed and coded every single page of the website (Student area, Company area, Teacher area, and Admin control panel) so everyone can see and click through the whole experience.
  - **Smooth Animations & Feel:** Made the website feel super smooth and polished—cards tilt slightly when you move your mouse, buttons respond to clicks, and pressing `Ctrl + K` brings up a fast search bar.
  - **Project Leadership:** Doesn't just do one small part—he oversees all 4 team members, reviews the code everyone writes, helps when someone gets stuck, and makes sure the project finishes on time for college evaluation.
- **Current Progress:** **100% of Prototype & Visual System Finished** (Authored all 7 project updates pushed to GitHub so far).

---

### 2. Joyeeta — Database Engineer (Filing Cabinet Builder)
- **Role:** Database Engineer (**Phases 0, 3, 6**)
- **Real-World Metaphor:** The Vault Organizer who sets up a giant, secure electronic filing cabinet in the cloud and creates neatly labeled drawers for everything.
- **What She Needs to Do:**
  - **Phase 0 (Cloud Database Setup):** Connect our project to Supabase and create the 11 neatly organized tables (Students, Companies, Jobs, Applications, Interview Rounds, Notifications, Settings). Populate starter departments (CSE, IT, ECE, MECH) and admin accounts.
  - **Phase 3 (Company Drives & Job Posts):** Manage company verification status and create job posting forms with automatic application deadline cutoffs.
  - **Phase 6 (Placement Reports):** Generate placement statistics, charts, and downloadable reports for teachers and institutional audits.
- **Current Progress:** Assigned and ready to start Phase 0.

---

### 3. Aditya — Authentication & Security Engineer (Door Keeper)
- **Role:** Authentication & Security Engineer (**Phases 1, 2**)
- **Real-World Metaphor:** The Security Officer at the front gate who checks ID badges, issues keycards, and locks the door if an intruder tries guessing passwords.
- **What He Needs to Do:**
  - **Phase 1 (Front Door Security & Login):** Create registration for students and companies, hash passwords into unreadable codes, issue 8-hour digital login wristbands (JWT), enforce the 5-wrong-passwords lockout rule (15-minute freeze), and restrict hallway permissions (RBAC).
  - **Phase 2 (Student Profiles & Resume Vault):** Build student profile update pages, set up secure resume upload links, and automatically flag profiles for teacher re-verification if grades or marks are edited.
- **Current Progress:** Assigned and ready to start Phase 1.

---

### 4. Aakriti — Reference Data & Notification Helper
- **Role:** Reference Data & Notification Helper (**Phases 5 & 0, 1**)
- **Real-World Metaphor:** The friendly front-desk assistant who answers "Yes, we are open!", hands out the college department list, and slips paper notes into people's mailboxes.
- **Why this is the easiest & most beginner-friendly job:**
  - No complicated math, no tricky security locks, and no heavy setups.
  - Just asking the database for simple lists and showing them on screen.
  - She already has ready-to-use starter code templates to copy and plug in.
- **What She Needs to Do:**
  - **Phase 0 & 1 (Reference Helpers):** Build the pulse check (`/health` — answering "Yes, server is alive!") and the department catalog (`/departments` — listing CSE, IT, ECE, MECH for registration dropdowns).
  - **Phase 5 (Notifications & Candidate Alerts):** Show students their messages (e.g., *"Interview scheduled for tomorrow"*), add the "Mark as Read" button, and handle interview round updates.
- **Current Progress:** Assigned and ready to start Phase 0/1 reference endpoints.

---

## Team Summary Table

| Person | Team Role | Real-World Job | Difficulty | Current Status |
|---|---|---|---|---|
| **Sayim** | Phases UI, 4, 7 (Project Lead) | Full Stack Architect & Screen Builder | Comprehensive | **100% Done** (All 18 screens ready, 20 commits & PR merges) |
| **Joyeeta** | Phases 0, 3, 6 | Electronic Filing Cabinet (Database, Jobs & Reports) | Medium | **100% Done (Phases 0, 3, 6 merged via PR #1)** |
| **Aditya** | Phases 1, 2 | Front Door Security (Login, Locks & Profiles) | Medium | **Pending (0 Commits - Auth & Profiles to start)** |
| **Aakriti** | Phases 5 & 0, 1 | Front Desk Messenger (Health, Catalog & Alerts) | **Easiest / Friendly** | **Pending (0 Commits - Reference APIs & Alerts to start)** |

---

## Step-by-Step Project Map (All Project Phases)

Here is how the whole website is being built step-by-step from start to finish, with **Sayim (Project Lead)** supervising and actively contributing to every stage:

| Stage | What We Are Building | Primary Builder | Contributing & Supervision | What Happens |
|---|---|---|---|---|
| **Phase UI** | **The Visual Experience (18 Screens)** | **Sayim** *(Project Lead)* | **Sayim** | **Finished!** Every button, card, and page is ready to look and feel amazing. |
| **Phase 0** | **The Cloud Filing Cabinet** | **Joyeeta** | Aakriti, **Sayim** | Connecting Supabase and setting up the 11 data drawers. |
| **Phase 1** | **The Front Door & Keys** | **Aditya** | Aakriti, **Sayim** | Setting up Sign Up, Login, and the 5-wrong-passwords lockout door. |
| **Phase 2** | **Student Profiles & Resumes** | **Aditya** | **Sayim** | Letting students update their grades, upload resumes, and teacher approvals. |
| **Phase 3** | **Company Accounts & Job Posts** | **Joyeeta** | **Sayim** | Companies posting jobs with salaries and requirements. |
| **Phase 4** | **The Matchmaker & Single Offer Rule** | **Sayim** *(Project Lead)* | Joyeeta, **Sayim** | The brain of the site: automatically checking who is eligible and ensuring fair play. |
| **Phase 5** | **Interviews & Message Bells** | **Aakriti** | Aditya, **Sayim** | Sending alerts to students and moving candidates through interview stages. |
| **Phase 6** | **Reports & College Analytics** | **Joyeeta** | Aakriti, **Sayim** | Generating placement statistics, charts, and downloadable reports for teachers. |
| **Phase 7** | **Final Polish, Launch & Evaluation** | **Sayim** *(Project Lead)* | Aditya, Joyeeta, **Sayim** | Putting the website online, final safety checks, and presenting to professors. |

---

## How Everything Comes Together

1. **Sayim** already built the entire visual website so the team can see exactly what the final product will look like.
2. **Joyeeta** builds the filing cabinet where all data will live safely in the cloud.
3. **Aditya** sets up the front door locks so people can sign up and log in securely.
4. **Aakriti** connects the department list and notification bells so students stay updated.
5. **Sayim** connects all their pieces into the visual screens, reviews everyone's work, and makes sure the project passes college grading with flying colors!
