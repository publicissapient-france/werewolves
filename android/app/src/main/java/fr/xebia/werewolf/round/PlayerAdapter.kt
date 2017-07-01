package fr.xebia.werewolf.round

import android.content.Context
import android.support.v7.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import fr.xebia.werewolf.R
import fr.xebia.werewolf.model.Player

class PlayerAdapter internal constructor(context: Context, val parentView: VoteContract.View)
    : RecyclerView.Adapter<PlayerAdapter.ViewHolder>(), PlayerView.Delegate {

    private val layoutInflater: LayoutInflater = LayoutInflater.from(context)
    private var players: List<Player>? = ArrayList()
    private var selectedPosition: Int = -1

    override fun onBindViewHolder(holder: ViewHolder?, position: Int) {
        val player = players!![position]
        (holder!!.itemView as PlayerView).bindView(this, player, position == selectedPosition)
    }

    override fun onCreateViewHolder(parent: ViewGroup?, viewType: Int): ViewHolder {
        val v = layoutInflater.inflate(R.layout.view_player, parent, false) as PlayerView
        return ViewHolder(v)
    }

    override fun getItemCount(): Int {
        if (players != null) return players!!.size
        return 0
    }

    fun setItems(players: List<Player>) {
        this.players = players
        selectedPosition = randomIntInRange(0, players.size)
        notifyDataSetChanged()
    }

    fun updateKillIntention(wantToKill: String) {
        // TODO display other werewolf's kill intention
    }

    override fun selectPlayer(player: Player) {
        notifyItemChanged(selectedPosition)
        selectedPosition = players!!.indexOf(player)
        notifyItemChanged(selectedPosition)

        parentView.selectPlayer(player)
    }

    class ViewHolder(v: View) : RecyclerView.ViewHolder(v)

    fun randomIntInRange(min: Int, max: Int): Int {
        return (Math.floor(Math.random() * (max - min + 1)) + min).toInt()
    }
}