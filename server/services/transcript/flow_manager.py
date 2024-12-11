from fastapi import WebSocket
import asyncio


class FlowManager:
    process_limit = 1
    queue_messengers: dict[WebSocket, asyncio.Queue] = {}

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def queue_update(self):
        for queue in self.queue_messengers.items():
            await queue[1].put([self.active_connections.index(queue[0]) + 1, self.len()])

    def len(self):
        return self.active_connections.__len__()

    async def connect(self, websocket: WebSocket):
        self.queue_messengers.update({websocket: asyncio.Queue()})

        await websocket.accept()
        self.active_connections.append(websocket)

        await self.queue_messengers[websocket].put(
            [self.active_connections.index(websocket) + 1, self.len()]
        )

    async def disconnect(self, websocket: WebSocket):
        await self.queue_messengers[websocket].put(None)

        del self.queue_messengers[websocket]

        try:
            await websocket.close()
        except:
            pass

        self.active_connections.remove(websocket)

        await self.queue_update()

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, json_message):
        for connection in self.active_connections:
            await connection.send_json(json_message)
