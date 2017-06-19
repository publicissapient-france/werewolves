package fr.xebia.werewolf

import android.graphics.Color
import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import android.util.Log
import android.view.View.GONE
import android.view.View.VISIBLE
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import fr.xebia.werewolf.model.Role
import kotlinx.android.synthetic.main.activity_role.*

class RoleActivity : AppCompatActivity() {

    private var givenRole: Role = Role.EMPTY

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_role)

        val gameId = prefsUtil.currentGameId
        val playerName = prefsUtil.currentPlayerName
        val currentPlayer = FirebaseDatabase.getInstance().reference.child("games/$gameId/players/$playerName/role")

        roleCard.setOnClickListener {
            when (givenRole) {
                Role.WEREWOLF -> {
                    roleCard.setBackgroundResource(R.drawable.card_werewolf)
                    rolePrompt.visibility = GONE
                    roleImage.visibility = VISIBLE
                    roleImage.setImageResource(R.drawable.werewolf)
                    roleImage.setColorFilter(Color.WHITE)
                }
                Role.VILLAGER -> {
                    roleCard.setBackgroundResource(R.drawable.card_villager)
                    rolePrompt.visibility = GONE
                    roleImage.visibility = VISIBLE
                    roleImage.setImageResource(R.drawable.farmer)
                    roleImage.setColorFilter(Color.WHITE)
                }
                Role.EMPTY -> {
                }
            }
        }

        currentPlayer.addValueEventListener(object : ValueEventListener {
            override fun onCancelled(p0: DatabaseError?) {

            }

            override fun onDataChange(p0: DataSnapshot?) {
                Log.d("WEREWOLF", "role changed to ${p0!!.value}")
                try {
                    givenRole = Role.valueOf(p0.value.toString().toUpperCase())
                    if (givenRole != Role.EMPTY) {
                        roleWaiting.visibility = GONE
                        roleCard.visibility = VISIBLE
                    }
                } catch(e: IllegalArgumentException) {
                    Log.e("WEREWOLF", "Role type error")
                }
            }
        })
    }
}
