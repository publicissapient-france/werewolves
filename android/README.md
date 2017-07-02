Werewolves Android
==================

# Configuration

Companion Android app is built with kotlin and targeting O preview.

# Transitions

- Talk to Google Home `create a new game`:
  - new game created, game Id initialized
  - device and game are associated
  - Google Home announces the game ID to players
- (`GameInfoActivity`) Players enter the game ID 
- (`PlayerInfoActivity`) Players submit their name: this creates player profile under the
`/games/gameId/players` 
- Once there are at least 4 players, talk to Google Home `start the game`, Home asks to confirm
players info, replay YES to trigger the role attribution
- (`RoleActivity`) Mobile app listens to `/games/gameId/players/$playerName`, screen changes to hidden role
card screen once roles are attributed.
- (`RoleActivity`) By revealing role card, mobile app sets player status as `READY`
- Once all players are `READY`, backend creates a new round => night falls
- (`RoleActivity`) Mobile app listens to `/games/gameId/rounds/`, once the `current` round is created with
phase NIGHT:
  - (`NightKillActivity`) display night kill screen for werewolves
  - (`NightSleepActivity`) display night sleep screen for villagers (they have their eyes closed anyway)
- (`NightKillActivity` -> `NightSleepActivity`) Werewolves choose a villager to kill, they can't submit kill until everybody select the
same villager, by click on the kill button, mobile app writes vote under 
`/games/gameId/rounds/current/phase/subPhase/votes` with structure like this:
```
{  
  "votes":{  
    "qian":{  
      "voted":"pablo"
    },
    "julien":{  
      "voted":"pablo"
    }
  }
}
```
- backend listens to the votes endpoint, once all the werewolves voted, it judges the death
and end the night by update the `/games/gameId/rounds/current/phase/state` to `DAY`
- mobile app listens to both current round & current player's status
  - display **You are dead** screen to the killed villager (TODO: `NightSleepActivity` -> Dead)
  - displays the day vote screen to all the alive players where everybody gets to vote ( `NightSleepActivity` -> `DayActivity`)
- (`DayActivity`) Players discuss & decide their votes, mobile app writes `/games/gameId/rounds/current/phase/subPhase/votes`
for every player's vote
- backend counts all the votes once every alive player has voted and update players' status
- backend archives the current round and create a new current round with the night phase
- (`DayActivity`) mobile app listens to both current round & current player's status
  - displays **You are dead** screen to the player who gets the most votes (TODO: `DayActivity` -> Dead) 
  - display night kill screen for werewolves (`DayActivity` -> `NightKillActivity`) 
  - display night sleep screen for alive villagers (`DayActivity` -> `NightSleepActivity`) 
- TODO: game end

## TODO:

Extract a `TransitionAcitivty` with list of input:
- input: different status, for example, `WEREWOLF_VOTED`
- condition: endpoint & value they should be listening to
- output: screen they should redirect to 

in order to dispatch all the transitions

## Misc

- Display other players of the same game
- Name length limitation
- prevent people from join the game if the game already starts

## Advanced

- Add Firebase Authentication (it's current public access)
- Resume game if user quits app and re-open