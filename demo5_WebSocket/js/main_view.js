/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

const remoteVideo = document.getElementById('remoteVideo');

let pc2;
let websocket;

function gotRemoteStream(e) {
  if (remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0];
    console.log('pc2 received remote stream');
  }
}



function initChat() {
    websocket.addEventListener("open", () => {
    });
}

function receiveWebsocketMessage() {
    websocket.addEventListener("message", messageHander);
}

async function messageHander(data){
    const event = JSON.parse(data.data);

    console.log("message:" + event['type']);

    switch (event['type']) {
        //接收sdp
        case "sdp":
            const desc_pc1 = event['content'];
            await pc2.setRemoteDescription(desc_pc1);
            const desc_pc2 = await pc2.createAnswer();
            await pc2.setLocalDescription(desc_pc2);
            console.log("answer desc_pc2 :");
            console.log(desc_pc2);

            //发送answer
            const req = {
                type: "answer_sdp",
                content: desc_pc2,
            };
            websocket.send(JSON.stringify(req));

        //接收ice
        case "candidate":
            pc2.addIceCandidate(event['content']);

    }
}


window.addEventListener("load", () => {
    // Open the WebSocket connection and register event handlers.

    //目标
    const configuration = {};
    pc2 = new RTCPeerConnection(configuration);
    //等待源发来的流
    pc2.addEventListener('track', gotRemoteStream);

    websocket = new WebSocket("wss://192.168.100.164:8001/");
    initChat();
    receiveWebsocketMessage();

});


function onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
}


function onSetLocalSuccess(pc) {
    console.log(`${getName(pc)} setLocalDescription complete`);
}

function onSetRemoteSuccess(pc) {
    console.log(`${getName(pc)} setRemoteDescription complete`);
}

function onSetSessionDescriptionError(error) {
    console.log(`Failed to set session description: ${error.toString()}`);
}

function onAddIceCandidateSuccess(pc) {
    console.log(`${getName(pc)} addIceCandidate success`);
}

function onAddIceCandidateError(pc, error) {
    console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

