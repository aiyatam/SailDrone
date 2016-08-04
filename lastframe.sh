#!/bin/bash

fn="$1"
of=${fn%.*}.jpg

lf=`ffprobe -show_streams "$fn" 2> /dev/null | awk -F= '/^nb_frames/ { print $2-1 }'`
lf=`ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nokey=1:noprint_wrappers=1 "$fn"`
let "lf = $lf - 3"
echo $lf
rm -f "$of"
echo "$of"
ffmpeg -i "$fn" -vf "select='eq(n,$lf)'" -vframes 1 "$of" 2> /dev/null
