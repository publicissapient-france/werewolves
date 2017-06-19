package fr.xebia.werewolf

import android.content.Intent
import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import com.google.firebase.database.FirebaseDatabase
import kotlinx.android.synthetic.main.activity_game.*

class GameActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)

        val database = FirebaseDatabase.getInstance()

        buttonSubmitGameId.setOnClickListener {
            val gameId = editTextGameId.text.toString()

            val myGame = database.getReference(gameId)
            // TODO if game is valid => store current gameId & ask user to enter name

            prefsUtil.currentGameId = gameId
            startActivity(Intent(this, UserInfoActivity::class.java))
        }
    }
}
