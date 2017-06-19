package fr.xebia.werewolf

import android.os.Bundle
import android.support.v7.app.AppCompatActivity
import kotlinx.android.synthetic.main.activity_user_info.*

class UserInfoActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_user_info)

        buttonJoinGame.setOnClickListener {
            val username = editTextUserName.text.toString()
            // TODO add user to userlist
        }
    }
}
