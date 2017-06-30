Werewolves Android
==================

# Configuration

Companion Android app is built with kotlin and targeting O preview.

# TODO

## Screen transition

Once the player reveal their role, it sets the player status as `READY`. When all players are
ready, the game starts.

### Night screen

When night falls:

- For werewolf: app displays all villagers and indicate werewolves to discuss and kill one villager.
- For villagers: app displays a screen with prompt saying "night falls, village sleeps"

### Day screen

Display all alive players and user can choose one player to vote.

### Dead screen

- case 1: You are killed by werewolves
- case 2: You have been voted out

## Misc

- Display other players of the same game
- Name length limitation
- prevent people from join the game if the game already starts

## Advanced

- Add Firebase Authentication (it's current public access)
- Resume game if user quits app and re-open