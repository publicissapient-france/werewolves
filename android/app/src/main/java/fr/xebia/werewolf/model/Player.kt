package fr.xebia.werewolf.model

// Player need to provide an empty constructor for Firebase to marshall the data
data class Player(val name: String = "",
                  val deviceId: String = "",
                  val role: Role = Role.EMPTY,
                  val status: String = PlayerState.ALIVE.name)