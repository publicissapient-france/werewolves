package fr.xebia.werewolf

import android.content.Intent
import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.iid.FirebaseInstanceId
import fr.xebia.werewolf.model.Player
import fr.xebia.werewolf.model.Role
import kotlinx.android.synthetic.main.activity_player_info.*

class PlayerInfoActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_player_info)

        val database = FirebaseDatabase.getInstance().reference
        gameInfoPrompt.text = String.format(getString(R.string.user_name_prompt), prefsUtil.currentGameId)

        buttonJoinGame.setOnClickListener {
            val playerName = editTextPlayerName.text.toString()
            prefsUtil.currentPlayerName = playerName

            val userId = FirebaseInstanceId.getInstance().id
            val user = Player(playerName, userId, Role.EMPTY)

            val currentGameRef = database.child("games").child(prefsUtil.currentGameId)
            currentGameRef.child("players").child(playerName).setValue(user).addOnCompleteListener {
                startActivity(Intent(this@PlayerInfoActivity, RoleActivity::class.java))
            }
        }
    }
}
