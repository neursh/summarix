import asyncio

from fastapi import FastAPI, WebSocket
from flow_manager import FlowManager

flow_manager = FlowManager()
app = FastAPI()

@app.websocket("/transcript")
async def transcript_process(websocket: WebSocket):
    await flow_manager.connect(websocket)

    queue = flow_manager.queue_messengers[websocket]
    queue_collect = await queue.get()

    try:
        if queue_collect[0] == 1:
            await websocket.send_json(
                {
                    "status": "processing",
                    "queue": queue_collect[0],
                    "total": queue_collect[1],
                }
            )
        else:
            await websocket.send_json(
                {
                    "status": "waiting",
                    "queue": queue_collect[0],
                    "total": queue_collect[1],
                }
            )

        while queue_collect is not None:
            # Ping, also checks for queue update in line.
            # This will also raise an exception when client disconnects.
            while True:
                await websocket.send_bytes(b"0")
                try:
                    queue_collect = queue.get_nowait()
                except:
                    pass
                else:
                    break

                await asyncio.sleep(1)

            if queue_collect[0] == 1:
                await websocket.send_json(
                    {
                        "status": "processing",
                        "queue": queue_collect[0],
                        "total": queue_collect[1],
                    }
                )
            else:
                await websocket.send_json(
                    {
                        "status": "waiting",
                        "queue": queue_collect[0],
                        "total": queue_collect[1],
                    }
                )
    finally:
        await flow_manager.disconnect(websocket)
