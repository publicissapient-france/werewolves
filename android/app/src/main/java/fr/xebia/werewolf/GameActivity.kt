package fr.xebia.werewolf

import android.content.Intent
import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.widget.Toast
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener
import kotlinx.android.synthetic.main.activity_game.*

class GameActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game)


        buttonSubmitGameId.setOnClickListener {
            val gameId = editTextGameId.text.toString()
            if (!gameId.isEmpty()) {
                val gameRef = firebaseDbRef.child("games").child(gameId)
                gameRef.addListenerForSingleValueEvent(object : ValueEventListener {
                    override fun onDataChange(p0: DataSnapshot?) {
                        if (p0!!.exists()) {
                            prefsUtil.currentGameId = gameId
                            startActivity(Intent(this@GameActivity, PlayerInfoActivity::class.java))
                            finish()
                        } else {
                            Toast.makeText(this@GameActivity, R.string.error_game_not_exist, Toast.LENGTH_LONG).show()
                        }
                    }

                    override fun onCancelled(p0: DatabaseError?) {

                    }
                })
            }
        }
    }
}
