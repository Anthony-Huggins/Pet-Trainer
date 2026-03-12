# PawForward Academy - Frontend Design Prompt

Provide this prompt to the frontend design agent to create comprehensive UI/UX mockups.

---

You are designing the complete UI/UX for **PawForward Academy**, a professional dog training business web application. The design should be **modern, warm, professional, and trustworthy** -- combining the polish of a premium SaaS product with the approachability of a pet business. The tech stack is Angular 19 with Tailwind CSS.

### Brand Identity

- **Name**: PawForward Academy
- **Tagline**: "Every paw, one step forward."
- **Color Palette**:
  - Primary: Deep teal (`#0D7377`) -- trust, professionalism
  - Secondary: Warm amber/golden (`#F59E0B`) -- energy, warmth, dogs
  - Accent: Coral (`#F87171`) -- calls-to-action, urgency
  - Neutrals: Slate grays (`#1E293B` through `#F8FAFC`) for text and backgrounds
  - Success: Emerald green (`#10B981`)
  - Background: Off-white (`#FAFBFC`) with white cards
- **Typography**:
  - Headings: "Plus Jakarta Sans" (bold, modern, geometric)
  - Body: "Inter" (clean, highly readable)
- **Visual Style**: Clean, spacious layouts with subtle shadows. Rounded corners on cards (12px) and buttons (8px). Paw-print motif used sparingly as decorative elements. Real dog photography for hero images and backgrounds (placeholder for now).

### Global Elements

**Navigation Bar (Public)**:
- Sticky top bar, white background with subtle bottom shadow
- Left: PawForward Academy logo (paw icon + text)
- Center/Right nav links: Home, Services, Trainers, Classes, About, Contact
- Right: "Log In" text button, "Get Started" primary filled button
- Mobile: Hamburger menu that opens a full-screen slide-in overlay from the right

**Navigation Bar (Authenticated -- Client)**:
- Same logo on left
- Center links: Dashboard, My Dogs, Bookings, Classes
- Right: Notification bell icon with red unread count badge, User avatar dropdown (Profile, Settings, Payment History, Referrals, Log Out)

**Navigation Bar (Authenticated -- Trainer)**:
- Left: Logo
- Center: My Schedule, My Clients, Training Logs
- Right: Notification bell, avatar dropdown

**Navigation Bar (Admin)**:
- Persistent left sidebar (collapsible on mobile):
  - Dashboard (with chart icon)
  - Users (with people icon)
  - Services (with list icon)
  - Classes (with calendar icon)
  - Bookings (with clipboard icon)
  - Reviews (with star icon)
  - Inquiries (with mail icon)
  - Revenue (with dollar icon)
  - Trainers (with badge icon)
- Top bar: PawForward Admin label, notification bell, admin avatar

**Footer**:
- 4-column layout on desktop (About, Services, Support, Connect)
- About column: Brief description, address, phone
- Services column: Links to each service type
- Support column: FAQ, Contact, Privacy Policy, Terms
- Connect column: Social media icons, newsletter email signup
- Bottom bar: copyright notice
- Mobile: stacked single column

**Chatbot Widget**:
- Floating circular button in bottom-right corner, teal background with paw-print icon
- Clicking opens a 400px wide x 550px tall chat panel
- Panel has: header bar (PawForward Assistant, minimize button, close button), scrollable message area, input bar with send button
- Messages styled as bubbles (user on right, teal; assistant on left, gray)
- Typing indicator (three animated dots) while waiting
- Quick-suggestion chips below the input for common questions ("View services", "Book a session", "Training tips")
- On mobile: chat panel takes full screen width

### Page-by-Page Design Specifications

#### 1. HOME PAGE (`/`)

**Hero Section**:
- Full-width section with gradient overlay on a high-quality dog training photo
- Large heading: "Professional Dog Training That Gets Results"
- Subheading: "From puppy basics to advanced agility -- PawForward Academy builds confident, well-behaved dogs through positive reinforcement training."
- Two CTAs: "Book a Session" (primary amber button) and "View Our Services" (outlined white button)
- Below hero: Three floating stat cards in a row with subtle animation on scroll-in:
  - "500+ Dogs Trained" with paw icon
  - "15+ Years Experience" with trophy icon
  - "4.9 Star Rating" with star icon

**Services Overview Section**:
- Section heading: "Our Training Programs"
- 3-column grid of service category cards:
  - **Private Training**: Icon (person + dog), brief description, starting price, "Learn More" link
  - **Group Classes**: Icon (group), brief description, starting price, "View Schedule" link
  - **Board & Train**: Icon (house), brief description, starting price, "Learn More" link
- Each card: white background, teal top border accent, hover shadow elevation

**Meet Our Trainers Section**:
- Section heading: "Meet Your Trainers"
- Horizontal scrollable cards (3 visible on desktop, 1 on mobile)
- Each trainer card: circular photo, name, title, specializations as small badges, star rating, "View Profile" link

**Testimonials Section**:
- Section heading: "What Our Clients Say"
- Carousel/slider of testimonial cards
- Each card: 5-star rating display, quote text (italicized), client name, dog name + breed, client photo (small circular)
- Auto-rotate with manual arrows and dot indicators

**CTA Section**:
- Teal background section
- "Ready to Start Your Dog's Training Journey?"
- "Book your free consultation today and see the PawForward difference."
- Single large "Schedule a Consultation" amber button

#### 2. SERVICES LIST PAGE (`/services`)

- Page heading: "Our Training Services"
- Brief intro paragraph about the training philosophy
- Tabbed or segmented control: All | Private Sessions | Group Classes | Board & Train
- Grid of service cards (2 columns on desktop, 1 on mobile):
  - Service image (placeholder or icon)
  - Service name
  - Category badge (teal for private, amber for group, coral for B&T)
  - Short description (2-3 lines, truncated)
  - Duration (e.g., "60 minutes")
  - Price (e.g., "$85/session" or "Starting at $450")
  - "View Details" button
- Sidebar on desktop (or bottom section on mobile): "Session Packages" section showing package deals

#### 3. SERVICE DETAIL PAGE (`/services/:id`)

- Breadcrumb: Home > Services > [Service Name]
- Hero area: Service name (large heading), category badge, hero image
- Two-column layout:
  - Left (wider): Full description, what to expect, prerequisites, what to bring
  - Right (sidebar): Pricing card with price, duration, deposit info, "Book Now" primary button; if group class: next available date; related packages section
- Below: "What You'll Learn" section with icon-list of skills
- Below: Related trainer profiles who teach this service
- Below: Reviews specific to this service

#### 4. TRAINERS LIST PAGE (`/trainers`)

- Page heading: "Our Training Team"
- Grid of trainer cards (3 per row desktop, 1 mobile):
  - Large photo (rectangular, rounded corners)
  - Name and credentials
  - Specialization badges (e.g., "Puppy Training", "Aggression", "Agility")
  - Star rating with review count
  - Years of experience
  - "View Profile" button

#### 5. TRAINER PROFILE PAGE (`/trainers/:id`)

- Large banner photo area with trainer photo
- Name, title, certifications listed
- Bio section (2-3 paragraphs)
- Specializations as large badges
- "Book with [Name]" CTA button
- Availability calendar widget (weekly view, shows open slots in green, booked in gray)
- Reviews section: Average rating, rating distribution bar chart, list of reviews with pagination
- Photo gallery section (optional): photos from training sessions

#### 6. CLASS SCHEDULE PAGE (`/classes`)

- Page heading: "Group Class Schedule"
- Filter bar: Category dropdown, Date range picker, Trainer dropdown
- View toggle: Calendar View | List View
- **Calendar View**: Monthly calendar with class dots on dates; clicking a date shows that day's classes in a side panel
- **List View**: Cards sorted by start date:
  - Class name
  - Trainer name + small photo
  - Schedule (e.g., "Saturdays, 10:00 AM - 11:00 AM, Apr 5 - May 24")
  - Location
  - Spots remaining (progress bar: "8/12 spots filled") or "WAITLIST" badge if full
  - Price
  - "Enroll Now" or "Join Waitlist" button

#### 7. CLASS DETAIL PAGE (`/classes/:id`)

- Class name, category, trainer
- Full description, what the class covers week by week
- Schedule details with all session dates listed
- Enrollment status bar (spots filled / max)
- Prerequisites section
- Price and "Enroll Now" button (opens payment flow) or "Join Waitlist" if full
- Trainer mini-profile card
- Reviews from past participants of this class type

#### 8. BOOKING WIZARD PAGE (`/book`)

Multi-step wizard with progress indicator at top (Step 1 of 5 style dots with labels).

**Step 1: Select Service**
- List of service types as selectable cards
- Selected card gets a teal border highlight
- "Next" button at bottom

**Step 2: Select Your Dog**
- List of user's dogs as selectable cards (photo, name, breed)
- "Add a New Dog" card with plus icon (opens a modal form)
- Vaccination compliance warning if any required vaccinations are expired
- "Next" / "Back" buttons

**Step 3: Select Trainer** (for private sessions)
- Grid of available trainers for the selected service
- Each shows photo, name, specializations, next available date
- "Any Available Trainer" option at top
- "Next" / "Back" buttons

**Step 4: Select Date & Time**
- Calendar date picker (available dates highlighted in teal)
- Selecting a date shows available time slots as clickable chips below
- Available slots in teal/white, unavailable grayed out
- "Next" / "Back" buttons

**Step 5: Review & Confirm**
- Summary card showing: Service, Dog, Trainer, Date/Time, Location, Price
- Referral code input field with "Apply" button
- Package usage option: "Use session from [Package Name] (3 remaining)" radio
- Price breakdown: Subtotal, Discount, Total
- Cancellation policy note
- "Proceed to Payment" primary button (redirects to Stripe Checkout)
- "Back" button

#### 9. BOOKING SUCCESS PAGE (`/booking/success`)

- Large checkmark icon (animated green circle)
- "Booking Confirmed!" heading
- Summary of booking details
- "Add to Calendar" button (generates .ics file)
- "View My Bookings" button
- "Book Another Session" link

#### 10. LOGIN PAGE (`/auth/login`)

- Centered card on a subtle pattern background
- PawForward Academy logo at top
- "Welcome Back" heading
- Email input field
- Password input field with show/hide toggle
- "Remember me" checkbox
- "Forgot your password?" link
- "Log In" primary button (full width)
- Divider: "or continue with"
- "Sign in with Google" button (Google branded, outlined)
- Bottom: "Don't have an account? Sign Up" link

#### 11. REGISTER PAGE (`/auth/register`)

- Same centered card layout
- "Create Your Account" heading
- First name + Last name (side by side)
- Email input
- Phone input (optional)
- Password input with real-time strength meter below (bar that fills green/yellow/red with text like "Strong")
- Confirm password input
- "I agree to the Terms and Privacy Policy" checkbox with links
- "Create Account" primary button
- Divider: "or continue with"
- "Sign up with Google" button
- Bottom: "Already have an account? Log In" link

#### 12. CLIENT DASHBOARD (`/dashboard`)

- Greeting: "Welcome back, [First Name]!" with date
- 4-column stat cards across the top:
  - Upcoming Appointments (count)
  - Dogs Registered (count)
  - Sessions Completed (count)
  - Packages Remaining (count)

**Upcoming Appointments Section** (left 2/3):
- List of next 3 upcoming appointments as cards:
  - Date/time, service name, trainer name + photo, dog name
  - Location
  - "View Details" and "Cancel" buttons
- "View All Bookings" link

**Quick Actions** (right 1/3):
- Vertical stack of action cards:
  - "Book a Session" with calendar icon
  - "Add a Dog" with plus icon
  - "View Training Progress" with chart icon
  - "Leave a Review" with star icon

**Recent Training Activity** (full width):
- Timeline-style feed of recent training logs
- Each entry: date, trainer, dog, summary snippet, skill tags
- "View Full Log" links

**Homework Section**:
- Card listing current homework assignments from trainers
- Each: assignment text, assigned date, trainer name

#### 13. MY DOGS PAGE (`/dashboard/dogs`)

- "My Dogs" heading with "Add Dog" button top right
- Grid of dog cards:
  - Dog photo (or placeholder paw icon)
  - Name, breed, age (computed from DOB)
  - Training status badge (e.g., "Currently in training", "3 active goals")
  - Vaccination status indicator (green checkmark = compliant, amber warning = expiring soon, red = expired)
  - "View Profile" button

#### 14. DOG PROFILE PAGE (`/dashboard/dogs/:id`)

- Dog photo (large), name, breed, age, weight
- Tab navigation: Overview | Training Progress | Vaccinations | Media

**Overview Tab**:
- Dog details card (gender, spayed/neutered, microchip ID, vet info, special needs)
- "Edit" button
- Active training goals section with progress bars
- Recent session summaries

**Training Progress Tab**:
- Training goals list with progress bars and status
- Skill radar chart (visual representation of proficiency in various skills)
- Session history timeline with trainer notes
- Homework assignments

**Vaccinations Tab**:
- Table of vaccinations: Name, Date, Expiration, Status (badge), Document (view/upload)
- "Add Vaccination" button opens a form modal
- Expired/expiring items highlighted

**Media Tab**:
- Photo/video grid gallery from training sessions
- Lightbox on click
- Filter by date range

#### 15. ADD/EDIT DOG PAGE (`/dashboard/dogs/new`, `/dashboard/dogs/:id/edit`)

- Form with sections:
  - Basic Info: Name, Breed (autocomplete dropdown), Date of Birth (date picker), Weight, Gender (radio), Spayed/Neutered (toggle)
  - Photo Upload: Drag-and-drop area or click to upload, image preview with crop
  - Health Info: Special Needs (textarea), Vet Name, Vet Phone, Microchip ID
  - Vaccinations: Inline table with "Add Row" to add vaccination records
- "Save" and "Cancel" buttons

#### 16. MY BOOKINGS PAGE (`/dashboard/bookings`)

- Tabs: Upcoming | Past | Cancelled
- Each tab shows a list of booking cards:
  - Service name, date/time, trainer, dog, status badge
  - For upcoming: "Cancel" button (with confirmation dialog)
  - For past: "Leave Review" button, "Rebook" button
  - For cancelled: Refund status

#### 17. TRAINING PROGRESS PAGE (`/dashboard/training`)

- Dog selector dropdown at top (if multiple dogs)
- Active Goals section: Cards with goal title, description, progress bar, target date, status
- Skills Overview: Radar chart of skill proficiency
- Session History: Paginated list of training log cards
- Each log card: Date, trainer, summary, skills worked (as tags), behavior notes, homework

#### 18. PAYMENT HISTORY PAGE (`/dashboard/payments`)

- Table/list of payments: Date, Description, Amount, Status badge (Succeeded/Failed/Refunded), Receipt link
- Filter by date range
- Summary card: Total spent this month, total spent all time

#### 19. MY PACKAGES PAGE (`/dashboard/packages`)

- Cards for each purchased package:
  - Package name
  - Sessions remaining / total (visual progress ring)
  - Expiration date
  - "Book Using Package" button
  - Status badge (Active/Expired/Depleted)
- "Buy More Packages" button linking to packages page

#### 20. PROFILE SETTINGS PAGE (`/dashboard/profile`)

- Tabs: Profile | Security | Notifications | Referrals

**Profile Tab**:
- Avatar upload (circular preview, change button)
- Edit form: First name, Last name, Email (read-only), Phone
- "Save Changes" button

**Security Tab**:
- Change Password: Current password, New password (with strength meter), Confirm new password
- Connected Accounts: Google (Connected/Not Connected, Connect/Disconnect button)
- Active Sessions list (optional, impressive)

**Notifications Tab**:
- Toggles for notification types:
  - Session reminders (email, SMS)
  - Training updates (email, in-app)
  - Payment receipts (email)
  - Promotional offers (email)
  - Waitlist notifications (email, SMS, in-app)

**Referrals Tab**:
- Personal referral code displayed prominently with "Copy" button
- Shareable link
- Stats: Times used, Credits earned
- Redemption history table

#### 21. NOTIFICATIONS PAGE/PANEL (`/dashboard/notifications`)

- Can also be a slide-in panel from the notification bell
- List of notifications with icons based on type
- Unread items have a subtle background highlight
- "Mark All Read" button at top
- Clicking a notification navigates to the relevant page (booking, training log, etc.)
- Types with distinct icons: booking confirmed (calendar), session reminder (clock), payment (dollar), training update (chart), waitlist update (list)

#### 22. BOARD & TRAIN REQUEST PAGE (`/board-train/request`)

- Form:
  - Dog selector
  - Preferred start date picker
  - Program length selector (1 week, 2 weeks, 3 weeks, 4 weeks)
  - Goals textarea ("What would you like us to focus on?")
  - Pickup/dropoff instructions
  - Emergency contact fields
  - Special instructions
- Price estimate section that updates based on selections
- "Submit Request" button (sends inquiry, admin reviews)

#### 23. BOARD & TRAIN DETAIL PAGE (`/board-train/:id`)

- Program header: Dog name, dates, trainer, status badge
- Progress timeline: Visual timeline from drop-off to pick-up
- Daily Updates section (reverse chronological):
  - Each day card: Date, summary, photos/videos (inline gallery), skills worked, mood/behavior notes
  - Clients see this as a "live journal" of their dog's stay
- Goals progress section: How the goals set at intake are progressing

#### 24. REVIEWS PAGE (`/reviews`)

- "Client Reviews" heading
- Overall stats: Average rating (large number with stars), total reviews, rating distribution chart
- Filter: All ratings, 5-star only, 4-star, etc.
- Sort: Newest, Highest, Lowest
- Review cards: Star rating, review title, review body, reviewer name, dog breed, date
- Featured reviews highlighted with a "Featured" badge

#### 25. CONTACT PAGE (`/contact`)

- Two-column layout:
  - Left: Contact form (Name, Email, Phone, Service of Interest dropdown, Dog's Name, Message textarea, "Send Message" button)
  - Right: Contact info (Address with embedded map, Phone, Email, Hours of Operation), Social media links
- Below: FAQ accordion section with common questions

#### 26. ABOUT PAGE (`/about`)

- Hero section with business story
- "Our Philosophy" section (positive reinforcement training approach)
- Team section with all trainer profiles
- Certifications and affiliations
- Photo gallery of the facility and training in action

#### 27. TRAINER PORTAL -- DASHBOARD (`/trainer/dashboard`)

- Greeting with today's date
- Today's Schedule: Timeline view of today's sessions
  - Each session card: Time, client name, dog name + breed, service type, location, notes preview
  - "Start Session" button on current/next session
- Quick Stats: Sessions this week, clients served, training logs due
- Recent Training Logs: List of recently submitted logs
- Upcoming board & train programs

#### 28. TRAINER PORTAL -- SCHEDULE (`/trainer/schedule`)

- Full calendar view (weekly default, monthly toggle)
- Color-coded sessions (private = teal, group = amber, board & train = coral)
- Click on empty slot to create a session
- Click on session to view details or mark complete
- Day view shows detailed timeline

#### 29. TRAINER PORTAL -- MY CLIENTS (`/trainer/clients`)

- List/grid of client-dog pairs assigned to this trainer
- Each card: Client name, dog photo + name + breed, active goals, last session date, vaccination status
- Click to view full training history and create logs

#### 30. TRAINER PORTAL -- CREATE TRAINING LOG (`/trainer/training-log/new`)

- Form:
  - Client/Dog selector (searchable dropdown)
  - Session selector (links to a scheduled session)
  - Date (defaults to today)
  - Summary textarea
  - Skills worked (multi-select tags from a predefined + custom list)
  - Behavior Notes textarea
  - Homework assigned textarea
  - Session rating (1-5, trainer's assessment of progress)
  - Media upload: Drag and drop area for photos/videos, with preview thumbnails
- "Save Log" button

#### 31. TRAINER PORTAL -- MANAGE AVAILABILITY (`/trainer/availability`)

- Weekly grid: 7 columns (days) x time rows
- Click and drag to set available time blocks
- Toggle recurring vs. specific date
- Block off time for vacations or personal time
- Visual: Available blocks in green, blocked in red/gray

#### 32. ADMIN DASHBOARD (`/admin/dashboard`)

- Full-width stats bar: Total Revenue (this month), Active Clients, Sessions This Month, Pending Inquiries
- Charts section (2x2 grid):
  - Revenue Over Time (line chart, date range selector)
  - Bookings by Service Type (pie/donut chart)
  - Client Growth (line chart, cumulative)
  - Popular Time Slots (heatmap, days of week x hours)
- Recent Activity feed: Latest bookings, payments, reviews, signups
- Action items: Pending review approvals, unanswered inquiries, upcoming sessions

#### 33. ADMIN -- MANAGE USERS (`/admin/users`)

- Data table: Name, Email, Role (editable dropdown), Status (Active/Disabled toggle), Dogs count, Bookings count, Joined date
- Search bar and role filter
- Click row to view user detail drawer/modal
- Bulk actions: Export CSV

#### 34. ADMIN -- MANAGE SERVICES (`/admin/services`)

- List of service types with inline editing capability
- "Add Service" button opens form modal: Name, Category, Description, Duration, Price, Deposit, Max Participants, Image, Sort Order, Active toggle
- Drag-to-reorder
- Toggle active/inactive

#### 35. ADMIN -- MANAGE CLASSES (`/admin/classes`)

- Calendar view of all class series
- "Create Class Series" button
- Form: Service type, Trainer, Title, Description, Start/End dates, Day of week, Time, Location, Max participants
- Existing classes show enrollment counts, waitlist counts
- Quick actions: Cancel class, send announcement to enrollees

#### 36. ADMIN -- MANAGE BOOKINGS (`/admin/bookings`)

- Data table with filters: Date range, Trainer, Status, Service type
- Columns: Date, Time, Client, Dog, Trainer, Service, Status, Payment status
- Click to view/edit booking
- Quick actions: Cancel, Reschedule, Mark complete, Mark no-show

#### 37. ADMIN -- MANAGE REVIEWS (`/admin/reviews`)

- Two tabs: Pending Approval | All Reviews
- Pending reviews shown as cards with Approve/Reject buttons
- All Reviews table with Featured toggle, Approve/Unapprove toggle

#### 38. ADMIN -- REVENUE REPORTS (`/admin/revenue`)

- Date range picker
- Summary cards: Total revenue, Average per session, Total sessions, Refunds
- Revenue by service type (bar chart)
- Revenue by trainer (bar chart)
- Monthly revenue trend (line chart)
- Detailed transaction table with export to CSV
- Package sales summary

### Responsive Design Requirements

- All pages must be fully responsive using Tailwind breakpoints (sm, md, lg, xl)
- Mobile (< 768px): Single column layouts, hamburger menu, bottom navigation bar for authenticated pages
- Tablet (768-1024px): Two-column layouts where appropriate, collapsible sidebar
- Desktop (> 1024px): Full layouts as described above

### Animation and Micro-interactions

- Page transitions: Subtle fade-in on route change
- Cards: Hover elevation (shadow increase)
- Buttons: Subtle scale on hover (1.02), press effect on active
- Loading states: Skeleton loaders matching the shape of content
- Toast notifications: Slide in from top-right, auto-dismiss after 5 seconds
- Modals: Fade-in with backdrop, slide-up on mobile
- Progress bars: Smooth animated fill
- Number counters: Animated count-up on dashboard stats
- Scroll animations: Subtle fade-up on sections as they enter viewport (on landing page only)

### Accessibility Requirements

- WCAG 2.1 AA compliance
- All interactive elements keyboard-navigable
- ARIA labels on icons and non-text elements
- Color contrast ratios meet AA standards
- Focus indicators visible
- Form validation messages associated with inputs via aria-describedby
- Skip navigation link