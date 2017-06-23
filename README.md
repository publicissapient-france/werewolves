WEREWOLVES XEBIA
================

# Data structure

```
{
  "devices":{
  	"deviceId": {

  	}
  },
  "games": {
    "1001": {
      "state": "ROUND_2"
      "rounds": {
      	"current": {},
      	"1": {},
      	"2": {}
      },
      "players": {
      	"qian":{},
      	"pablo":{}
      },
      "timestamp": 1459361875337,
    },
    "1002": {},
    "1003": {}
  }
}
```

## Device

Key:

- device ID

Values:

- gameId: the ID of the game playing on the current device
- startDate: "2017-06-20T16:11:11+00:00"
- status: round number "ROUND_1"

## Player

Key:

- the name of the player, e.g. qian

Values:

- `name`: qian
- `role`: possible values, `EMPTY`, `VILLAGER`, `WEREWOLF`
- `status`: possible values `JOIN`, `READY`, `ALIVE`, `DEAD`
- `killedAt`: the values is `ROUND_$no`, for example `ROUND_1`
- `killedBy`: VILLAGERS_VOTE, WEREWOLVES_VOTE

## Round (TO BE DISCUSSED!)

Example:

```
{  
  "current":{  
    "phase":{  
      "subPhase":"VILLAGERS_VOTE",
	  "state":"DAY"
    },
    "number":3
  }
}
```

Key:

- `current` for the current round
- the round number for the past round

Values:

- `number`: the round number
- `phase`: a game phase

## Phase

Values:

- `state`: possible values, `NIGHT`, `DAY`
- `subPhase`: possible values are `VILLAGERS_VOTE`, `WEREWOLVES_VOTE`



