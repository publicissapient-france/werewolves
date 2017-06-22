Werewolves Android
==================

# Configuration

Companion Android app is built with kotlin and targeting O preview.

# TODO

## Screens

Screen transition:

- In order for game to start, user should click on the `I'm Ready` button after they check out their
role & display `the night will fall... `
- Once everybody is ready, assistant will announce the game starts
    - werewolves will now see the screen for killing villagers
    - villagers shouldn't see anything yet

### Night screen

Display all villagers and indicate werewolves to discuss and kill one villager.

### Day screen

Display all live players and user can choose one player and vote.

### Dead screen

- case 1: You are killed by werewolves
- case 2: You have been voted out

## Misc

- Check player name's uniqueness
- Display other players of the same game
- Name length limitation
- More visible game code input

## Advanced

- Add Firebase Authentication (it's current public access)
- Resume game if user quits app and re-open