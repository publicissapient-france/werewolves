package fr.xebia.werewolf

import android.app.Application
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.FirebaseDatabase

val prefsUtil: PrefsUtil by lazy {
    WerewolfApp.prefsUtil!!
}

val firebaseDbRef: DatabaseReference by lazy {
    WerewolfApp.firebaseDb!!
}

class WerewolfApp : Application() {

    companion object {
        var prefsUtil: PrefsUtil? = null
        var firebaseDb: DatabaseReference? = null
    }

    override fun onCreate() {
        prefsUtil = PrefsUtil(applicationContext)
        firebaseDb = FirebaseDatabase.getInstance().reference
        super.onCreate()
    }
}