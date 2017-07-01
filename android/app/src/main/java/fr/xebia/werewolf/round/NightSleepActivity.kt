package fr.xebia.werewolf.round

import android.content.Intent
import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.ValueEventListener
import fr.xebia.werewolf.R
import fr.xebia.werewolf.firebaseDbRef
import fr.xebia.werewolf.model.Round
import fr.xebia.werewolf.prefsUtil

class NightSleepActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_night_sleep)

        // transition to DAY
        val roundsRef = firebaseDbRef.child("games/${prefsUtil.currentGameId}/rounds")
        roundsRef.addValueEventListener(object : ValueEventListener {
            override fun onCancelled(p0: DatabaseError?) {
            }

            override fun onDataChange(p0: DataSnapshot?) {
                roundsRef.child("current").addListenerForSingleValueEvent(object : ValueEventListener {
                    override fun onCancelled(p0: DatabaseError?) {
                    }

                    override fun onDataChange(p0: DataSnapshot?) {
                        val currentRound = p0!!.getValue(Round::class.java)
                        if (currentRound!!.phase.state == "DAY") {
                            startActivity(Intent(this@NightSleepActivity, DayActivity::class.java))
                            finish()
                        }
                    }
                })
            }
        })

        // TODO end game
    }
}
