# Mora Cricket Stats

A simple web app I built to keep track of the **Mora Cricket team's match and player statistics** in one place.

Instead of keeping cricket records scattered across physical scorecards, and online scorecards or manually calculating career statistics, this app makes it easy to record match performances and view player and team stats over time.

## What I Built

The main goal of this project is to create a central place where the Mora Cricket team can manage and view its cricket statistics.

Anyone can browse the team's matches, players, and statistics, while administrators can log in to add matches, manage players, and enter match performances.

## Features

### Match Records

I can keep track of all the team's matches, including:

* Opponent
* Match date
* Venue
* Number of overs
* Match type

Matches can also be edited or removed by an administrator when needed.

###  Player Profiles

Each player has their own profile containing:

* Full name
* Short name
* Batting style
* Bowling style
* Playing role
* Active/inactive status
* Career batting statistics
* Career bowling statistics
* Recent performances

This makes it easy to see how a player has performed throughout their time with the team.

###  Batting Statistics

The batting section gives an overview of each player's performance, including:

* Innings
* Runs
* Batting average
* Strike rate
* Highest score
* Not outs
* 50s and 100s
* Fours and sixes
* Ducks

The table can be sorted and filtered by match type.

###  Bowling Statistics

The bowling section provides statistics such as:

* Wickets
* Economy rate
* Bowling average
* Strike rate
* 5-wicket hauls
* Wides
* No-balls
* Overs
* Best bowling figures

These statistics can also be filtered by match type.

###  Career Overview

The career page provides an overall picture of the team's performance.

It includes both batting and bowling statistics, along with a breakdown of the team's statistics across different match types.

###  Easy Stats Entry

Administrators can enter match performances through a simple three-step process:

1. Select or create a match
2. Select the players who participated
3. Enter their batting and bowling performances

This keeps the process of recording a match straightforward and organized.

###  Admin Access

Only administrators can make changes to the data.

This includes:

* Adding and editing matches
* Managing players
* Entering match statistics
* Updating existing performances

Everyone else can freely browse the team's statistics.

## Match Types

The app currently supports five match types:

* Home and Home
* Practice
* Div 3
* Inter Uni
* SLUG

This allows the team's statistics to be viewed either as a whole or based on the type of match.

## Design

I wanted the application to feel modern while still being easy to use.

The interface features:

* Dark theme
* Blue and yellow accents
* Glass-style cards
* Responsive layout for phones and desktops
* Simple navigation
* Sortable statistics tables
* Clear match and player badges

The goal was to make cricket statistics feel more like a proper sports dashboard rather than a spreadsheet.

## Why I Built It

I built Mora Cricket Stats to solve a practical problem for the team: **keeping player and match statistics organized and easily accessible**.

It also gave me an opportunity to build a complete application around something I'm genuinely interested in cricket  while working on areas such as data management, user access, and building a responsive web experience.

## Running the Project

To access the deployed project click on this link:

https://mora-cricket-stat-records.vercel.app/

To run the project locally, install the dependencies and start the application:

```bash
npm install
npm run dev
```

The application can then be opened in a web browser.

For a production build:

```bash
npm run build
npm run start
```

The project also includes a script for creating the initial administrator account:

```bash
npm run seed:admin
```

## Environment Setup

The project requires a few environment settings for the database, administrator account, and application URL.

These are kept outside the project code so that sensitive information such as database credentials and passwords aren't stored in the repository.

## Future Improvements

There are several things I'd like to explore as the project grows, such as:

* More detailed match scorecards
* Player performance charts
* Better historical analysis
* Additional cricket statistics
* Improved match-by-match insights
* More ways to compare players
* Automated stats entry
* AI assisted insights on players

## Built For

**Mora Cricket Team**
University of Moratuwa

Built with a focus on making cricket statistics **simple, accessible, and useful for the team.**
