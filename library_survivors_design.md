# Library Survivors

## Game Design Brief

This document contains the complete gameplay brief including:

-   Core gameplay loop
-   Chaos system
-   Kid AI
-   Interaction system
-   Difficulty curve
-   XP progression
-   Upgrade system
-   Child archetypes
-   Events
-   Environmental hazards
-   Meta progression
-   Design philosophy

# Library Survivors

### Game Design Brief (Version 1.0)

---

# High Concept

**Library Survivors** is a reverse horde-survival game inspired by *Vampire Survivors*. Instead of fighting monsters, the player battles **entropy**.

You play as a librarian trying to keep a public library organized while increasingly rowdy children turn it into complete chaos.

Children constantly remove books from shelves, carry them around the library, and leave them scattered across the building. The player must collect misplaced books, return them to their correct shelves, and prevent the **Chaos Meter** from reaching 100%.

The game is about movement, routing, prioritization, crowd management, and maintaining order under increasing pressure.

---

# Core Fantasy

The player is not defeating enemies.

The player is becoming the world's greatest librarian.

The fantasy is transforming from an overwhelmed employee into an unstoppable organization machine capable of managing impossible levels of chaos.

---

# Win Condition

Survive for **30 minutes** without the Chaos Meter reaching 100%.

### Optional Perfect Victory

Finish the run with the Chaos Meter below **10%**.

---

# Lose Condition

The game immediately ends when the Chaos Meter reaches **100%**.

The library has become completely unmanageable.

---

# Core Gameplay Loop

1. Children roam the library.
2. Children interact with bookshelves.
3. Books become misplaced.
4. Chaos begins increasing.
5. The player intercepts children or collects misplaced books.
6. Books are returned to their proper shelves.
7. XP is earned.
8. The player levels up.
9. One upgrade is chosen.
10. Children become more disruptive.
11. More books become available to steal.
12. Repeat until victory or defeat.

---

# Core Player Systems

## Automatic Pickup

Walking near a loose book automatically places it into the librarian's backpack.

No interaction button is required.

---

## Automatic Shelving

Walking near the correct bookshelf automatically returns matching books from the backpack.

Returned books immediately grant XP.

---

## Backpack Capacity

The player begins with:

* Capacity: **5 books**

Capacity can be permanently increased during the run through upgrades.

A full backpack prevents additional book collection until books are shelved.

This naturally creates routing decisions.

---

## Movement

Movement is the player's primary skill.

Efficient routes are more valuable than perfect reactions.

Mastering the library layout is a core part of progression.

---

# Library Chaos System

The Chaos Meter replaces traditional health.

Starts at:

**0%**

Game Over:

**100%**

Chaos increases continuously based on library disorder.

Factors include:

* Number of books on the floor
* Number of books being carried by children
* Time books remain misplaced
* Large clusters of books
* Special events

Returning books removes sources of Chaos.

The player cannot directly reduce the Chaos Meter—they reduce the rate at which Chaos grows by restoring order.

---

# Child AI

Children are not enemies.

They are autonomous chaos generators.

Each child continuously cycles through simple behavior states.

## AI State Machine

### 1. Wander

Children roam randomly throughout the library.

When they discover an active bookshelf they enter the interaction state.

---

### 2. Choose a Book

Children select a book from the nearby shelf.

Each interaction randomly chooses one of two behaviors.

### Behavior A — Local Drop

The child immediately pulls the book from the shelf.

The book lands nearby.

This creates localized cleanup.

---

### Behavior B — Book Theft

The child picks up the book.

The child walks to another location in the library.

After reaching that destination, the book is dropped.

This creates long-distance cleanup and forces the player to make routing decisions.

---

### Visible Book Carrying

Children visibly carry books above or beside their character.

This allows the player to immediately identify high-priority targets.

---

### Player Interception

The player can intercept any child currently carrying a book.

If the librarian reaches the child before the book is dropped:

* The book is automatically confiscated.
* The book goes directly into the backpack.
* The child loses its objective.
* Bonus XP is awarded.
* Chaos is prevented before it is created.

This creates moving objectives that reward proactive play instead of reactive cleanup.

---

### Librarian Repulsion

Children dislike being near the librarian.

Whenever the player enters a child's fear radius:

* The child immediately runs away from the player.
* The child attempts to avoid the librarian while continuing its current objective.

This creates several layers of emergent gameplay:

### Shelf Protection

Standing near bookshelves naturally discourages children from interacting with them.

---

### Herding

Players can intentionally push children away from valuable sections of the library.

---

### Chasing

Children carrying books will attempt to flee.

The player must cut them off before they reach their destination.

---

### Crowd Control

Smart positioning becomes more valuable than simply running after every child.

---

# Difficulty Curve

Difficulty scales through **multiple interacting systems**, not simply by spawning more children.

## 1. More Children

Additional children spawn throughout the run.

The player must manage increasingly crowded spaces.

---

## 2. Faster Children

Children gradually move faster.

Interception becomes more difficult.

Poor routing becomes more punishing.

---

## 3. Smarter Children

As time progresses:

* Children carry books farther away.
* Children spend less time idle.
* More children choose long-distance theft over local drops.

The library gradually becomes harder to organize.

---

## 4. Expanding Book Pool

The library begins with only a portion of its collection available.

As the run progresses:

* Additional shelves unlock.
* More books become interactable.
* More books can potentially be misplaced.

This naturally raises the maximum possible Chaos without feeling artificial.

The library literally becomes harder to maintain over time.

---

## 5. XP Progression

Each level requires more XP than the previous one.

Example progression:

| Level |          XP Required |
| ----- | -------------------: |
| 1     |                  100 |
| 2     |                  180 |
| 3     |                  300 |
| 4     |                  460 |
| 5     |                  680 |
| 6     |                  950 |
| ...   | Continues increasing |

Early upgrades come quickly.

Late-game upgrades become increasingly valuable and difficult to obtain.

---

# Upgrade System

Every level grants one upgrade choice.

Possible upgrades include:

## Mobility

* Faster Movement
* Coffee Boost
* Roller Skates

---

## Inventory

* Larger Backpack
* Faster Shelving
* Increased Pickup Radius

---

## Automation

* Assistant Librarian
* Self-Shelving Books
* Library Fairy
* Roomba Cart

---

## Efficiency

* Dewey Decimal Master
* Better Organization
* Bonus XP
* Combo Improvements

---

## Crowd Control

* Reading Dog
* Security Guard
* Story Time
* PA Announcement

---

# Combo System

Returning books quickly creates combo multipliers.

Example:

5 Books → Combo x2

10 Books → Combo x3

25 Books → Combo x5

Higher combos reward:

* Bonus XP
* Faster leveling
* More satisfying gameplay

---

# Child Types

As the run progresses, specialized children begin appearing.

### Toddler

Drops nearby books.

---

### Curious Kid

Pulls books from multiple shelves.

---

### Hyperactive Kid

Runs faster.

Moves books farther away.

---

### Book Fort Builder

Creates massive book piles.

Produces high Chaos.

---

### Twin Trouble

Two children that create chaos faster while near each other.

---

### Teen

Creates environmental hazards.

Leaves sticky floors.

---

### Chaos Goblin

Rare elite child.

Can remove many books in a short time.

Large XP reward if managed effectively.

---

# Random Events

Examples include:

* Story Time
* School Excursion
* Fire Drill
* Rainy Day Rush
* Book Donation
* Community Reading Day

Each temporarily changes player priorities.

---

# Environmental Hazards

Hazards modify movement rather than dealing damage.

Examples include:

* Sticky spills
* Blocked aisles
* Broken shelves
* Construction zones

---

# Meta Progression

Between runs players unlock:

* New librarians
* New library layouts
* New assistants
* Permanent upgrades
* Cosmetics
* Additional upgrade cards

Example librarians include:

* Veteran Librarian
* Archivist
* Children's Librarian
* Night Shift Librarian

Each offers a unique passive bonus.

---

# Design Philosophy

Every mechanic should reinforce one central idea:

**The player is fighting disorder, not children.**

Children are mischievous rather than malicious.

The player succeeds through:

* Smart positioning
* Efficient movement
* Prioritization
* Interception
* Routing optimization
* Crowd management

The game should constantly ask the player meaningful questions:

* Should I intercept the child carrying a rare book or clean up the growing pile nearby?
* Should I protect this bookshelf or rescue books on the opposite side of the library?
* Should I chase children or focus on efficient shelving?
* Is it better to prevent chaos or recover from it?

As the run progresses, the library slowly transforms from a peaceful public space into complete organizational mayhem.

At the same time, the player transforms from an overwhelmed librarian into an unstoppable master of order, capable of controlling hundreds of moving objectives simultaneously.

The result should deliver the same escalating power fantasy and "one more run" addictiveness as a horde-survival game while replacing combat with logistics, routing, and crowd management.

