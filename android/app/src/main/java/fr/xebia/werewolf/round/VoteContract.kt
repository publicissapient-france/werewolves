package fr.xebia.werewolf.round

import fr.xebia.werewolf.model.Player

interface VoteContract {

    interface View {

        fun selectPlayer(player: Player)
    }
}