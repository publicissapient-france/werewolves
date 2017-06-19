# Werewolves backend

## Main principles
* All communications between devices and backend are handled through firebase interation.
* All interactions between Home and the backend go through API.ai.
* All messages are stored into API.ai and enriched by the backend.
* A game is identified by a unique ID and thigh to a unique Home Device through the Home's user-id, as forwarded in HTTP request.

## Slicing
* public directory is used to store static resources (sounds mainly).
* rules directory stores all game rules.
* index.js is the main entry point to an express server.



