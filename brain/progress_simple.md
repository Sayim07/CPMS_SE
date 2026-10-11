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
                  ┌──────────────────────────────────────────────┐
                  │            SAYIM (Project Lead)              │
                  │ Overall Blueprint, All 18 Screens & Lead     │
                  └──────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
    JOYEETA (Phase 0)              ADITYA (Phase 1)              AAKRITI (Phase 0/1/5)
    The Digital Filing Cabinet     The Front Door Security       The Fast Helper & Messenger
    (Cloud Database & Tables)      (Login, Passwords & Locks)    (System Status & Bell Alerts)
```

---

### 1. Sayim — Project Lead & Master Architect
- **Role:** Project Lead & Frontend Architect
- **Real-World Metaphor:** The Chief Architect who designs the whole building blueprint, builds the full physical model with furniture and lights, and coordinates all the builders.
- **What He Does:**
  - **The Master Blueprint:** Planned how the entire system works from start to finish across 9 detailed planning guides.
  - **Built All 18 Screens:** Already designed and coded every single page of the website (Student area, Company area, Teacher area, and Admin control panel) so everyone can see and click through the whole experience.
  - **Smooth Animations & Feel:** Made the website feel super smooth and polished—cards tilt slightly when you move your mouse, buttons respond to clicks, and pressing `Ctrl + K` brings up a fast search bar.
  - **Project Leadership:** Doesn't just do one small part—he oversees all 4 team members, reviews the code everyone writes, helps when someone gets stuck, and makes sure the project finishes on time for college evaluation.
- **Current Progress:** **100% of Prototype & Visual System Finished** (Authored all 7 project updates pushed to GitHub so far).

---

### 2. Joyeeta — Database Engineer (Filing Cabinet Builder)
- **Role:** Database Engineer (**Phase 0**)
- **Real-World Metaphor:** The Vault Organizer who sets up a giant, secure electronic filing cabinet in the cloud and creates neatly labeled drawers for everything.
- **What She Needs to Do:**
  - **Connect to the Cloud:** Connect our project to Supabase (an online cloud warehouse for storing information).
  - **Create the 11 Drawers (Tables):** Set up neatly organized sections so information doesn't get mixed up:
    1. A drawer for *Students* (name, roll number, grades, branch).
    2. A drawer for *Companies* (company name, website, approval status).
    3. A drawer for *Job Posts* (salary, job title, requirements).
    4. A drawer for *Applications* (who applied to what).
    5. A drawer for *Interview Rounds* (round 1 test, round 2 interview).
    6. Drawers for *Notifications, Logs, and College Settings*.
  - **Starter Data:** Put in initial college branch names (Computer Science, IT, Mechanical, etc.) and the admin account so the website isn't empty on day one.
- **Current Progress:** Assigned and ready to start.

---

### 3. Aditya — Authentication & Security Engineer (Door Keeper)
- **Role:** Authentication & Security Engineer (**Phase 1**)
- **Real-World Metaphor:** The Security Officer at the front gate who checks ID badges, issues keycards, and locks the door if an intruder tries guessing passwords.
- **What He Needs to Do:**
  - **Front Gate Sign-Up:** Create the entry forms so new students and companies can register their accounts.
  - **Secret Password Scrambler:** Make sure passwords are never stored as plain text. He turns them into scrambled secret codes so even if someone sneaks a look, they can't read them.
  - **Digital Wristbands (Login Tokens):** When a student or company types the correct email and password, give them a digital wristband that proves who they are for the rest of the day.
  - **The 5-Attempt Lockout Rule:** If someone types the wrong password 5 times in a row, the door automatically locks them out for 15 minutes to stop hackers from guessing passwords.
  - **Hallway Permissions:** Make sure students can only enter student rooms, companies can only enter company rooms, and teachers can enter the teacher control center.
- **Current Progress:** Assigned and ready to start once Joyeeta's user drawer is ready.

---

### 4. Aakriti — Reference Data & Notification Helper
- **Role:** Reference Data & Notification Helper (**Phase 0, 1 & 5**)
- **Real-World Metaphor:** The friendly front-desk assistant who answers "Yes, we are open!", hands out the college department list, and slips paper notes into people's mailboxes.
- **Why this is the easiest & most beginner-friendly job:**
  - No complicated math, no tricky security locks, and no heavy setups.
  - Just asking the database for simple lists and showing them on screen.
  - She already has ready-to-use starter code templates to copy and plug in.
- **What She Needs to Do:**
  - **Task 1: The Heartbeat Check (`/health`):** A super simple button that answers: *"Yes! The server is awake and healthy."* This takes just 10 lines of code.
  - **Task 2: The Department List (`/departments`):** Whenever a student signs up and clicks the "Choose Department" dropdown, this helper fetches the clean list of branches (CSE, IT, ECE, MECH).
  - **Task 3: The Notification Bell (`/notifications`):**
    - Show students their messages (e.g., *"Google scheduled your interview for tomorrow!"*).
    - Add a button so students can click *"Mark as Read"* when they finish reading a message.
- **Current Progress:** Assigned and ready to start right now.

---

## Team Summary Table

| Person | Team Role | Real-World Job | Difficulty | Current Status |
|---|---|---|---|---|
| **Sayim** | Project Lead | Master Architect & Screen Builder | Comprehensive | **100% Done** (All 18 screens ready, 7 GitHub pushes) |
| **Joyeeta** | Phase 0 | Electronic Filing Cabinet (Database) | Medium | Ready to set up Supabase & drawers |
| **Aditya** | Phase 1 | Front Door Security (Login & Locks) | Medium | Ready to build login & lockout rules |
| **Aakriti** | Phase 0/1/5 | Front Desk Messenger (Health & Alerts) | **Easiest / Friendly** | Ready to copy & plug in starter templates |

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
