#!/usr/bin/env python

import asyncio
import json
import secrets

import websockets
from time import time

import ssl

connected = ''

async def send_chat(websocket):
    """
    Receive and process chat messages from a user.

    """
    global connected
    async for message in websocket:
        # Parse a "talk" event from the UI.
        for ws in connected:
            if ws != websocket:
                await ws.send(message)


async def start(websocket):
    """
    Handle a connection: start a new chat.

    """
    # Initialize a Chat, the set of WebSocket connections
    # receiving moves from this chat, and secret access tokens.

    print("one connected")
    global connected
    if connected == '':
        connected = {websocket}
    else:
        connected.add(websocket)

    try:
        await send_chat(websocket)
    except RuntimeError as exc:
        print(exc)
    finally:
        connected.remove(websocket)



async def handler(websocket):
    """
    Handle a connection and dispatch it according to who is connecting
    (either join a chatroom or start one).
    """
    # Receive and parse the "init" event from the UI.
    await start(websocket)


async def main():
    """
    Start a WebSockets server.
    """
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain("/usr/local/nginx/ssl/private/server.crt","/usr/local/nginx/ssl/private/server.key.unsecure")

    async with websockets.serve(handler, "", 8001, ssl=ssl_context): 
        await asyncio.Future()  # run forever

# entry point
if __name__ == "__main__":
    asyncio.run(main())
