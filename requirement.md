You are an expert game developer and UI/UX engineer. Your task is to design and implement a complete, polished, and highly addictive browser-based game.

# 🎮 Game Title

Bed Allocation Panic

# 🧠 Core Concept

This is a fast-paced resource management game inspired by real-world care facility logistics (like CareMates), but designed to be fun, intuitive, and slightly chaotic rather than medically heavy.

Players must assign incoming patients to available beds/rooms under time pressure while respecting constraints. The game should create emergent “panic moments” where the player must rearrange previous decisions to accommodate new urgent cases.

# 🎯 Design Goals

* Extremely easy to understand (within 5 seconds)
* Addictive gameplay loop (“just one more round”)
* Clean, modern, aesthetic UI
* Smooth animations and satisfying feedback
* Increasing chaos over time
* Light humor and personality (not overly serious or clinical)

# 🧩 Core Gameplay Loop

1. Patients arrive as cards (one-by-one or in bursts)
2. Player drags and drops them into available rooms/beds
3. Each placement must satisfy constraints
4. If incorrect → penalty or rejection
5. New patients + events increase pressure
6. Game continues until failure condition

# 🧑‍⚕️ Entities

## Patients

Each patient has:

* id
* name (fun/light names, not too realistic)
* attributes:

  * careLevel: low | medium | high
  * gender: male | female
  * isolationRequired: boolean
  * equipment: none | oxygen | intensive
  * optional fun trait (e.g. "night owl", "hates noise")

Represent visually as a card with icons (NOT text-heavy).

## Rooms/Beds

Grid-based layout.

Each room has:

* id
* capacity (1 or 2 beds)
* supportedCareLevel
* gender restriction (or mixed)
* isolation capability
* equipment availability

# ⚖️ Rules (Validation Engine)

A placement is valid if:

* care level is supported
* gender constraints satisfied
* isolation requirement satisfied
* required equipment is available
* room capacity not exceeded

Invalid placements:

* should visually reject (shake animation + red highlight)
* apply small penalty

# 🔥 Game Mechanics

## Time Pressure

* Continuous timer or increasing speed of arrivals
* Later stages become chaotic

## Score System

* +points for correct placements
* combo multiplier for streaks
* speed bonus for fast placement
* penalties for mistakes

## Combo System

* consecutive correct placements increase multiplier
* breaking combo resets multiplier

# 💥 Event System (CRITICAL FEATURE)

Random events that disrupt gameplay:

Examples:

* "Emergency Admission" → must place within 5 seconds
* "Room Cleaning" → disables a room temporarily
* "Condition Worsened" → patient needs upgrade
* "Inspection" → invalid placements penalized more

Events should:

* appear as animated popups
* be short-lived but impactful

# 🤖 AI Suggestion Feature (FUN TWIST)

Include a button:
“Suggest Placement”

Behavior:

* highlights a suggested room
* sometimes correct
* sometimes suboptimal or wrong

This adds humor and unpredictability.

# 🎨 UI/UX Requirements

## Visual Style

* Minimalist, modern, soft colors
* Card-based UI
* Rounded corners (2xl style)
* Subtle shadows
* Clean grid layout

## Interactions

* Drag and drop (smooth)
* Snap animation on valid placement
* Red shake on invalid
* Hover highlighting

## Feedback

* Sound effects (optional but recommended):

  * pop (success)
  * buzz (error)
* Visual cues:

  * green = valid
  * red = invalid

## Animations

* Use motion library (e.g. Framer Motion)
* Smooth transitions
* Slight bounce/snap for placements

# 🧱 Technical Requirements

## Stack

Use:

* React (with Vite or Next.js)
* TypeScript
* Tailwind CSS
* Optional: Framer Motion for animations

## Architecture

* Component-based design
* Clean separation:

  * Game state
  * UI components
  * Validation logic
  * Event system

## Suggested Structure

* GameEngine (state + loop)
* PatientCard component
* RoomGrid component
* EventManager
* ScoreManager

# 🔄 Game Loop

* Tick system (e.g. every X ms)
* Spawn patients
* Trigger events randomly
* Increase difficulty over time

# 🧪 Difficulty Scaling

* Increase spawn rate
* Add more constraints
* Introduce more events
* Reduce decision time

# 🏁 End Condition

Game ends when:

* too many patients unplaced
  OR
* critical patient not placed in time

Show:

* final score
* efficiency %
* streak stats

# ✨ Polish Features (HIGH IMPACT)

* Animated “Day Complete” or “Game Over” screen
* Restart button
* Subtle humor in text/events
* Fake facility names for flavor

# 🚀 Deliverables

* Complete working codebase
* Clean, readable TypeScript
* Modular structure
* Ready to run locally
* Minimal setup required

# ⚡ Bonus (if possible)

* Leaderboard (local storage is fine)
* Daily challenge mode
* Sound toggle

# ❗ Important

Do NOT overcomplicate with backend or real APIs.
Focus on:

* gameplay feel
* responsiveness
* polish

This should feel like a small, premium indie game — not a prototype.

Produce the FULL implementation, not just an outline.
