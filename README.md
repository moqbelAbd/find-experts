# FindExperts
A professional marketplace where people can find experts, ask questions, request services, discover job opportunities, and book expert consultations.

FindExperts connects people needing assistance with skilled professionals. Users can search for experts, create posts (questions, services, jobs), and book consultations. Any user can upgrade their account to become an expert by creating a professional profile.

# ✨ Main Features
User Profiles: Basic accounts containing name, bio, location, activity, and reviews/guarantees given.

# Expert Profiles:
Upgraded accounts showcasing job title, professional field, experience, skills, certificates, portfolio projects, and consultation settings.

# Find Experts:
Advanced search filtering by field, skills, experience, rating, price, and earned badges.

# Posts:

# Questions: 
Ask the community for help. Open for comments and discussion.

# Services:
Request a specific task (includes budget and deadline). Experts can respond with "I Can Help" to become candidates.

# Jobs: 
Publish employment opportunities (Full/Part-Time, On-Site/Hybrid/Remote, Salary, Deadline). Experts can apply using "I'm Suitable".

# Expert Consultations & Booking:

Experts configure their schedule, price, and duration.

Users book slots, generating statuses: PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED.

Uses external meeting links (e.g., Google Meet) provided upon acceptance.

# Messaging: 
Asynchronous inbox for user-expert communication.

# Reviews & Ratings: 
Clients leave a 1-5 star rating and written feedback after a completed interaction.

# Guarantees & Badges:
A trust-based reputation system separate from reviews. Accumulating client guarantees unlocks badges: Green (3), Silver (5), Bronze (10), and Gold (15).

# Notifications:
Alerts for post comments, candidate applications, consultation updates, and new reviews.

# Dashboards:

# Admin Dashboard: 
view all users/Expert And change thier status, view all bookings and thier status 

# User Dashboard:
Track posts, bookings, and saved experts.

# Expert Dashboard:
Manage incoming consultation requests, upcoming meetings, applied posts, and profile/availability settings.

# 🔐 Permissions
Guest: Browse the landing page, search experts, and view public profiles/posts. Cannot interact.

Registered User: Manage profile, create posts, comment, book/contact experts, leave reviews/guarantees, and upgrade to Expert.

Expert: All user permissions plus managing expert profile/schedule and responding to service/job posts.

Admin: Moderate users, posts, comments, reports, and platform settings.

🔒 Important Business Rules
A user can have a maximum of one expert profile (optional).

Consultation bookings cannot overlap with existing accepted bookings.

Reviews and Guarantees can only be given after a completed interaction.

# 🎯 MVP Scope (Ready Features)
P0 (Core): Auth, User/Expert Profiles, Search, Fields/Skills, Posts (Questions/Services/Jobs), "I Can Help" / "I'm Suitable", Booking Flow, Reviews, Guarantees, Badges, Notifications.

P1 (Supporting): Messaging/Inbox, Saved Experts, Dashboards, Certificates/Portfolio, Advanced Filters.

(Note: Future concepts like built-in video calls, WebSockets, payment escrow, and AI matching are excluded from the current MVP scope).

# 🎨 Design System & UI
Brand Color: Deep green / emerald.

Style: Clean, professional, minimal, and accessible.

Responsive: Desktop (1440px) and Mobile (375px–430px) prioritized.

🧪 Core User Flows
Book an Expert: Search -> View Profile -> Select Date/Time -> Request -> Expert Accepts -> Join External Meeting.

Request Service / Post Job: Create Post -> Publish -> Experts view and apply -> Post owner reviews candidates and selects one.

Become an Expert: User Profile -> "Go Expert" -> Fill Professional Info (Skills/Experience) -> Set Availability -> Profile Created.

Reputation Building: Completed Interaction -> Client leaves Review & Guarantee -> Guarantee Count rises -> Expert earns new Badge.

# To Use Admin Account: 
Email: admin@findexperts.com
password: Admin@123!
