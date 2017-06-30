package fr.xebia.werewolf.round

import fr.xebia.werewolf.model.Player

interface KillContract {

    interface View {

        fun selectPlayer(player: Player)
    }
}