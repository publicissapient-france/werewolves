package fr.xebia.werewolf

import android.content.Intent
import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.widget.Toast
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener
import com.google.firebase.iid.FirebaseInstanceId
import fr.xebia.werewolf.R.string.user_name_prompt
import fr.xebia.werewolf.model.Player
import fr.xebia.werewolf.model.Role
import kotlinx.android.synthetic.main.activity_player_info.*

class PlayerInfoActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_player_info)

        playerInfoPrompt.text = String.format(getString(user_name_prompt), prefsUtil.currentGameId)

        buttonJoinGame.setOnClickListener {
            // firebase id is case sensitive
            val playerName = editTextPlayerName.text.toString().toLowerCase()
            if (!playerName.isEmpty()) {
                val userId = FirebaseInstanceId.getInstance().id
                val player = Player(playerName, userId, Role.EMPTY)

                val currentGameRef = firebaseDbRef.child("games").child(prefsUtil.currentGameId)
                val playerRef = currentGameRef.child("players").child(playerName)
                playerRef.addListenerForSingleValueEvent(object : ValueEventListener {
                    override fun onCancelled(p0: DatabaseError?) {
                        // void implementation
                    }

                    override fun onDataChange(p0: DataSnapshot?) {
                        if (p0!!.exists()) {
                            Toast.makeText(this@PlayerInfoActivity, R.string.error_play_name_taken, Toast.LENGTH_LONG).show()
                        } else {
                            playerRef.setValue(player).addOnCompleteListener {
                                prefsUtil.currentPlayerName = playerName
                                startActivity(Intent(this@PlayerInfoActivity, RoleActivity::class.java))
                            }
                        }
                    }
                })
            }
        }
    }
}
