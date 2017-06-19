package fr.xebia.werewolf

import android.app.Application

val prefsUtil: PrefsUtil by lazy {
    WerewolfApp.prefsUtil!!
}

class WerewolfApp : Application() {

    companion object {
        var prefsUtil: PrefsUtil? = null
    }

    override fun onCreate() {
        prefsUtil = PrefsUtil(applicationContext)
        super.onCreate()
    }
}