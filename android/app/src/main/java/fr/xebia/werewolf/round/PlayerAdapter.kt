package fr.xebia.werewolf.round

import android.content.Context
import android.support.v7.widget.RecyclerView
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import fr.xebia.werewolf.R
import fr.xebia.werewolf.model.Player

class PlayerAdapter internal constructor(context: Context) : RecyclerView.Adapter<PlayerAdapter.ViewHolder>() {

    private val layoutInflater: LayoutInflater = LayoutInflater.from(context)
    private var players: List<Player>? = ArrayList()

    override fun onBindViewHolder(holder: ViewHolder?, position: Int) {
        val player = players!![position]
        (holder!!.itemView as PlayerView).bindData(player)
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
        notifyDataSetChanged()
    }

    class ViewHolder(v: View) : RecyclerView.ViewHolder(v)
}