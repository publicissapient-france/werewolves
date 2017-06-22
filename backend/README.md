# Werewolves backend

## Main principles
* All communications between devices and backend are handled through firebase interactions.
* All interactions between Home and the backend go through API.ai.
* All messages are stored into API.ai and enriched by the backend.
* A game is identified by a unique ID and thigh to a unique Home Device through the Home's user-id, as forwarded in HTTP request.

## Slicing
* public directory is used to store static resources (sounds mainly).
* rules directory stores all game rules.
* index.js is the main entry point to an express server.

## Datastructure
See `datastruct.json for a sample

## Game playing
* A round is a pair Night / Day
* A phase is either night or day. A round has 2 phases
* A subPhase is a simple event. At first, the only 2 subphases are WEREWOLVES_VOTE at night, and VILLAGERS_VOTE at day.
* Backend listens to the add of the "death" property in currentSubPhase node.
