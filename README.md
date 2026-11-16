# 🎄 Forcier Family Christmas Day

Sign-up site for Christmas Day: 12/25 @ 11:30am, 56 Old Fort Ln, Dunbarton, NH.

- Each visit picks a new Christmas-movie theme (🎞️ button to shuffle, or `?theme=griswold|elf|grinch|homealone|polar|wonderful|diehard|sadtree|frosty|hallmark|rudolph|carol|miracle`)
- Claim, change, release, or add dishes; RSVP with adult/kid counts
- "Is Die Hard a Christmas movie?" live family poll (`xmas_votes`, one vote per device)
- Add to Calendar (`christmas.ics` for Apple/Outlook with a day-before reminder, or Google Calendar)
- No theme repeats within 10 views (per device)
- Sticky jump bar (Food · RSVP · Walk, plus Debate in the Die Hard theme)
- Live countdown, directions button, and walk forecast (unlocks ~16 days out, via Open-Meteo)
- Sign-ups are stored in Supabase (`xmas_items`, `xmas_rsvps`) and refresh automatically every few seconds
- 3 hidden secrets 🤫

Plain static HTML/CSS/JS, no build step. Host it on GitHub Pages from the repo root.
