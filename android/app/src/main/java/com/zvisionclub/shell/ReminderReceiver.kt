package com.zvisionclub.shell

import android.Manifest
import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import java.util.Calendar

/**
 * Daily local reminder ("daily puzzle"), the Android side of ZV.remind / ZV.remindOff (same as ios/Shared/NativeKit.swift).
 * An inexact daily alarm (no exact-alarm permission needed) fires this receiver, which posts the notification;
 * after a reboot the saved time is scheduled again.
 */
class ReminderReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        val p = c.getSharedPreferences("zv", 0)
        if (i.action == Intent.ACTION_BOOT_COMPLETED) {
            val at = p.getString("remind_at", null) ?: return
            schedule(c, at, p.getString("remind_t", "") ?: "", p.getString("remind_b", "") ?: ""); return
        }
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(c, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
        if (Build.VERSION.SDK_INT >= 26) c.getSystemService(NotificationManager::class.java)
            .createNotificationChannel(NotificationChannel("daily", "Daily reminder", NotificationManager.IMPORTANCE_DEFAULT))
        val open = PendingIntent.getActivity(c, 0, Intent(c, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK), PendingIntent.FLAG_IMMUTABLE)
        val n = NotificationCompat.Builder(c, "daily").setSmallIcon(c.applicationInfo.icon)
            .setContentTitle(p.getString("remind_t", "")).setContentText(p.getString("remind_b", ""))
            .setAutoCancel(true).setContentIntent(open).build()
        NotificationManagerCompat.from(c).notify(1, n)
    }

    companion object {
        private fun pending(c: Context) = PendingIntent.getBroadcast(c, 1, Intent(c, ReminderReceiver::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)

        fun schedule(c: Context, hhmm: String, title: String, body: String) {
            c.getSharedPreferences("zv", 0).edit().putString("remind_at", hhmm).putString("remind_t", title).putString("remind_b", body).apply()
            val parts = hhmm.split(":")
            val h = (parts.getOrNull(0)?.toIntOrNull() ?: 9).coerceIn(0, 23)
            val m = (parts.getOrNull(1)?.toIntOrNull() ?: 0).coerceIn(0, 59)
            val cal = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, h); set(Calendar.MINUTE, m); set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
                if (timeInMillis <= System.currentTimeMillis()) add(Calendar.DAY_OF_YEAR, 1)
            }
            c.getSystemService(AlarmManager::class.java).setInexactRepeating(AlarmManager.RTC_WAKEUP, cal.timeInMillis, AlarmManager.INTERVAL_DAY, pending(c))
        }

        fun cancel(c: Context) {
            c.getSystemService(AlarmManager::class.java).cancel(pending(c))
            c.getSharedPreferences("zv", 0).edit().remove("remind_at").apply()
        }
    }
}
