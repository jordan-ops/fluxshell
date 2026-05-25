pkill -f "ags"

sleep 0.3

ags run ~/playground/mybar/app.ts &
disown
