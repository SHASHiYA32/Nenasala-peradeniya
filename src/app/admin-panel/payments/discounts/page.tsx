"use client";

import React, { useState } from "react";
import { Wrench, Bell, ArrowLeft, Check } from "lucide-react";

export default function UnderDevelopmentFull() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between p-6 md:p-12 font-sans">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-white">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          System Status
        </div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all text-zinc-600 dark:text-zinc-400"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-xl mx-auto w-full text-center py-12 space-y-6">
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xl">
            <Wrench className="w-10 h-10 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            This Page is Under Construction
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm md:text-base leading-relaxed">
            Our team is actively building this section. We expect to roll out this feature in the upcoming update.
          </p>
        </div>

        {/* Progress Bar Indicator */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl max-w-md mx-auto space-y-2 text-left shadow-sm">
          <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            <span>Development Progress</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono">75%</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full w-3/4 transition-all duration-500" />
          </div>
        </div>

        {/* Email Notification Option */}
        <div className="max-w-md mx-auto pt-2">
          {subscribed ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> You'll be notified as soon as this page goes live!
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubscribed(true);
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                required
                placeholder="Enter email to get notified..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Bell className="w-3.5 h-3.5 animate-bounce" /> Notify Me
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-zinc-400 dark:text-zinc-600">
        &copy; {new Date().getFullYear()} All rights reserved.
      </div>
    </div>
  );
}