package fr.xebia.werewolf.round

import android.content.Context
import android.util.AttributeSet
import android.widget.RelativeLayout
import fr.xebia.werewolf.model.Player
import kotlinx.android.synthetic.main.view_player.view.*

class PlayerView @JvmOverloads constructor(context: Context, attrs: AttributeSet? = null, defStyleAttr: Int = 0) :
        RelativeLayout(context, attrs, defStyleAttr) {

    fun bindData(player: Player) {
        playerName.text = player.name
    }
}