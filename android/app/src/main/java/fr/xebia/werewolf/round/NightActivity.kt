package fr.xebia.werewolf.round

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.support.v7.widget.GridLayoutManager
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener
import fr.xebia.werewolf.R
import fr.xebia.werewolf.firebaseDbRef
import fr.xebia.werewolf.model.Player
import fr.xebia.werewolf.prefsUtil
import kotlinx.android.synthetic.main.activity_night.*

class NightActivity : AppCompatActivity() {

    private lateinit var playerAdapter: PlayerAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_night)

        val gameId = prefsUtil.currentGameId
        val playersRef = firebaseDbRef.child("games/$gameId/players")
        playersRef.addValueEventListener(object : ValueEventListener {
            override fun onCancelled(p0: DatabaseError?) {
                // void
            }

            override fun onDataChange(p0: DataSnapshot?) {
                val players = mutableListOf<Player>()
                p0!!.children.mapTo(players) { it.getValue(Player::class.java) as Player }
                setupRecyclerView(players)
            }
        })
    }

    private fun setupRecyclerView(players: List<Player>) {
        playerAdapter = PlayerAdapter(this)
        val spanCount = 3
        val layoutManager = GridLayoutManager(this, spanCount)
        layoutManager.spanSizeLookup
        villagerRecyclerView.layoutManager = layoutManager
        villagerRecyclerView.adapter = playerAdapter

        playerAdapter.setItems(players)
    }
}
