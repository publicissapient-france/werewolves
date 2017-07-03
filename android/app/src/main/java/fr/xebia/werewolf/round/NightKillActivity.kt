package fr.xebia.werewolf.round

import android.content.Intent
import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.support.v7.widget.GridLayoutManager
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.ValueEventListener
import fr.xebia.werewolf.R
import fr.xebia.werewolf.firebaseDbRef
import fr.xebia.werewolf.model.*
import fr.xebia.werewolf.prefsUtil
import kotlinx.android.synthetic.main.activity_night_kill.*

class NightKillActivity : AppCompatActivity(), VoteContract.View {

    private lateinit var playerAdapter: PlayerAdapter
    private lateinit var killIntentionsRef: DatabaseReference
    private lateinit var playerToKill: Player

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_night_kill)

        // init kill intention as a werewolf
        initKillIntention()

        val playersRef = firebaseDbRef.child("games/${prefsUtil.currentGameId}/players")
        playersRef.addValueEventListener(object : ValueEventListener {
            override fun onCancelled(p0: DatabaseError?) {
                // void
            }

            override fun onDataChange(p0: DataSnapshot?) {
                val players = mutableListOf<Player>()
                p0!!.children.mapTo(players) { it.getValue(Player::class.java) as Player }
                players
                        .filter {
                            it.role == Role.WEREWOLF
                                    || it.status == PlayerState.DEAD
                        }
                        .forEach { players.remove(it) }
                setupRecyclerView(players)
            }
        })

        killIntentionsRef.addValueEventListener(object : ValueEventListener {
            override fun onCancelled(p0: DatabaseError?) {

            }

            override fun onDataChange(p0: DataSnapshot?) {
                val killIntentions = mutableListOf<KillIntention>()
                var canKill = false
                p0!!.children.mapTo(killIntentions) {
                    it.getValue(KillIntention::class.java) as KillIntention
                }
                // check if kill intentions are unanimous
                if (killIntentions.filter { it.wantToKill.isNotEmpty() }.isNotEmpty()) {
                    if (killIntentions.distinct().size == 1) {
                        canKill = true
                    }
                }
                buttonKillVillager.isEnabled = canKill
            }
        })
        // transition to night sleep till the death is annonced
        buttonKillVillager.setOnClickListener {
            val subPhaseRef = firebaseDbRef.child("games/${prefsUtil.currentGameId}/rounds/current/phase/subPhase/votes")
            subPhaseRef.child(prefsUtil.currentPlayerName).setValue(Vote(playerToKill.name))
            startActivity(Intent(this@NightKillActivity, NightSleepActivity::class.java))
            finish()
        }
    }

    private fun setupRecyclerView(players: List<Player>) {
        playerAdapter = PlayerAdapter(this, this)
        val spanCount = 3
        val layoutManager = GridLayoutManager(this, spanCount)
        layoutManager.spanSizeLookup
        villagerRecyclerView.layoutManager = layoutManager
        villagerRecyclerView.adapter = playerAdapter

        playerAdapter.setItems(players)
    }

    fun initKillIntention() {
        killIntentionsRef = firebaseDbRef.child("games/${prefsUtil.currentGameId}/killIntentions")
        killIntentionsRef.child(prefsUtil.currentPlayerName).setValue(KillIntention())
    }

    override fun selectPlayer(player: Player) {
        playerToKill = player
        killIntentionsRef.child(prefsUtil.currentPlayerName).setValue(KillIntention(player.name))
    }
}
