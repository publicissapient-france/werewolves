package fr.xebia.werewolf.round

import android.content.Context
import android.util.AttributeSet
import android.widget.RelativeLayout
import fr.xebia.werewolf.R
import fr.xebia.werewolf.model.Player
import kotlinx.android.synthetic.main.view_player.view.*

class PlayerView @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null, defStyleAttr: Int = 0) :
        RelativeLayout(context, attrs, defStyleAttr) {

    interface Delegate {
        fun selectPlayer(player: Player)
    }

    fun bindView(listener: Delegate, player: Player, isSelected: Boolean) {
        setOnClickListener {
            listener.selectPlayer(player)
        }
        playerName.text = player.name
        if (isSelected) {
            playerAvatar.setBackgroundResource(R.drawable.player_bg_selected)
        } else {
            playerAvatar.setBackgroundResource(R.drawable.player_bg)
        }
    }
}