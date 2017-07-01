package fr.xebia.werewolf.round

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.support.v7.widget.GridLayoutManager
import android.view.View.GONE
import android.view.View.VISIBLE
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener
import fr.xebia.werewolf.R
import fr.xebia.werewolf.firebaseDbRef
import fr.xebia.werewolf.model.Player
import fr.xebia.werewolf.model.PlayerState
import fr.xebia.werewolf.model.Vote
import fr.xebia.werewolf.prefsUtil
import kotlinx.android.synthetic.main.activity_day.*

class DayActivity : AppCompatActivity(), VoteContract.View {

    private lateinit var playerAdapter: PlayerAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_day)

        // display players
        val playersRef = firebaseDbRef.child("games/${prefsUtil.currentGameId}/players")
        playersRef.addListenerForSingleValueEvent(object : ValueEventListener {
            override fun onCancelled(p0: DatabaseError?) {
                // void
            }

            override fun onDataChange(p0: DataSnapshot?) {
                val players = mutableListOf<Player>()
                p0!!.children.mapTo(players) { it.getValue(Player::class.java) as Player }
                players
                        .filter {
                            it.status == PlayerState.DEAD ||
                                    it.name == prefsUtil.currentPlayerName
                        }
                        .forEach { players.remove(it) }
                setupRecyclerView(players)
            }
        })

        // vote a villager
        buttonVotePlayer.setOnClickListener {
            val votes = firebaseDbRef.child("/games/${prefsUtil.currentGameId}/rounds/current/phase/subPhase/votes")
            votes.child(prefsUtil.currentPlayerName).setValue(Vote(playerToVote.name))

            votedPrompt.visibility = VISIBLE
            playerRecyclerView.visibility = GONE
            dayVotePrompt.visibility = GONE
            buttonVotePlayer.visibility = GONE
        }

        // TODO transition back to night

        // TODO end the game
    }

    private fun setupRecyclerView(players: List<Player>) {
        playerAdapter = PlayerAdapter(this, this)
        val spanCount = 3
        val layoutManager = GridLayoutManager(this, spanCount)
        layoutManager.spanSizeLookup
        playerRecyclerView.layoutManager = layoutManager
        playerRecyclerView.adapter = playerAdapter

        playerAdapter.setItems(players)
    }

    private lateinit var playerToVote: Player

    override fun selectPlayer(player: Player) {
        buttonVotePlayer.isEnabled = true
        playerToVote = player
    }
}
