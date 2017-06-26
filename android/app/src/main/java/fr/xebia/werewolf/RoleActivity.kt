package fr.xebia.werewolf

import android.graphics.Color
import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.util.Log
import android.view.MotionEvent.ACTION_DOWN
import android.view.MotionEvent.ACTION_UP
import android.view.View.GONE
import android.view.View.VISIBLE
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.ValueEventListener
import fr.xebia.werewolf.R.string.waiting_for_role_prompt
import fr.xebia.werewolf.model.PlayerState
import fr.xebia.werewolf.model.Role
import kotlinx.android.synthetic.main.activity_role.*

class RoleActivity : AppCompatActivity() {

    private var givenRole: Role = Role.EMPTY
    private lateinit var currentPlayerRef: DatabaseReference

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_role)

        val gameId = prefsUtil.currentGameId
        val playerName = prefsUtil.currentPlayerName
        currentPlayerRef = firebaseDbRef.child("games/$gameId/players/$playerName")
        roleWaitingPrompt.text = String.format(getString(waiting_for_role_prompt), playerName)

        roleCard.setOnTouchListener { view, motionEvent ->
            when (motionEvent.action) {
                ACTION_DOWN -> {
                    when (givenRole) {
                        Role.WEREWOLF -> {
                            setPlayerReady()
                            roleCardContent.setBackgroundResource(R.drawable.card_werewolf)
                            rolePrompt.visibility = GONE
                            roleImage.visibility = VISIBLE
                            roleImage.setImageResource(R.drawable.werewolf)
                            roleImage.setColorFilter(Color.WHITE)
                            true
                        }
                        Role.VILLAGER -> {
                            setPlayerReady()
                            roleCardContent.setBackgroundResource(R.drawable.card_villager)
                            rolePrompt.visibility = GONE
                            roleImage.visibility = VISIBLE
                            roleImage.setImageResource(R.drawable.farmer)
                            roleImage.setColorFilter(Color.WHITE)
                            true
                        }
                        Role.EMPTY -> {
                            true
                        }
                    }
                }
                ACTION_UP -> {
                    roleCardContent.setBackgroundResource(R.drawable.card_back)
                    rolePrompt.visibility = VISIBLE
                    roleImage.visibility = GONE
                    true
                }
                else -> {
                    true
                }
            }
        }

        currentPlayerRef.child("/role").addValueEventListener(object : ValueEventListener {
            override fun onCancelled(p0: DatabaseError?) {
                // void
            }

            override fun onDataChange(p0: DataSnapshot?) {
                try {
                    givenRole = Role.valueOf(p0!!.value.toString().toUpperCase())
                    if (givenRole != Role.EMPTY) {
                        prefsUtil.currentPlayerRole = givenRole.name
                        roleWaiting.visibility = GONE
                        roleCard.visibility = VISIBLE
                    }
                } catch(e: IllegalArgumentException) {
                    Log.e("WEREWOLF", "Role type error")
                }
            }
        })
    }

    private fun setPlayerReady() {
        currentPlayerRef.child("status").setValue(PlayerState.READY.name)
    }
}
