import asyncio
import re
from queue import Queue
from threading import Thread

import aiohttp
from fastapi import FastAPI
from yt_dlp import YoutubeDL

PREFERED_LANG = "en"

app = FastAPI()

@app.get("/context")
async def context(url: str):
    subtitle_cleanup = re.compile(r"(?<!\\)\w+|[^\x00-\x7F]|'\w+")
    yt_result = Queue()
    yt = Thread(target=yt_fetch_context, args=(url, yt_result,))
    yt.start()

    metadata: dict = await asyncio.to_thread(yt_result.get)
    subtitles: dict = metadata["subtitles"]
    automatic_captions: dict = metadata["automatic_captions"]

    selected_track = None

    if "live_chat" in subtitles:
        del subtitles["live_chat"]
    
    if subtitles.__len__() != 0:
        if PREFERED_LANG in subtitles:
            selected_track = subtitles[PREFERED_LANG]
        else:
            selected_track = subtitles[next(iter(subtitles))]
    else:
        if automatic_captions.__len__() != 0:
            if PREFERED_LANG in automatic_captions:
                selected_track = automatic_captions[PREFERED_LANG]
            else:
                selected_track = automatic_captions[next(iter(automatic_captions))]
    
    subtitle = None

    if selected_track is not None:
        async with aiohttp.ClientSession() as session:
            async with session.get(selected_track[0]["url"]) as response:
                subtitle = await response.json()

    combined = ""
    if subtitle is not None:
        for sub in subtitle["events"]:
            if "segs" in sub:
                for segment in sub["segs"]:
                    combined += " ".join(subtitle_cleanup.findall(segment["utf8"])) + " "
            # Yeild the event loop to handle other tasks
            await asyncio.sleep(0)
    
    return {
        "title": metadata["title"],
        "description": metadata["description"],
        "channel": metadata["channel"],
        "subtitle": combined,
    }

def yt_fetch_context(url: str, result: Queue):
    with YoutubeDL({'quiet': True, 'noprogress': True}) as ydl:
        result.put(ydl.extract_info(url, download=False))
