/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

const callButton = document.getElementById('callButton');

callButton.disabled = true;

callButton.addEventListener('click', call);

let startTime;
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');



let localStream;
let pc1;
let pc2;

let num = 1;


function getName(pc) {
  return (pc === pc1) ? 'pc1' : 'pc2';
}

//开启音视频源
async function start() {
  console.log('Requesting local stream');
  
  try {
	  //捕获摄像头和麦克风的流，放到localVideo中
    const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
    console.log('Received local stream');
    localVideo.srcObject = stream;
    localStream = stream;
    callButton.disabled = false;
  } catch (e) {
    alert(`getUserMedia() error: ${e.name}`);
  }
}

start();

//拨打，建立连接
async function call() {
  callButton.disabled = true;
  console.log('Starting call');
  startTime = window.performance.now();
  
  const configuration = {};
  console.log('RTCPeerConnection configuration:', configuration);
  
  //源连接，
  pc1 = new RTCPeerConnection(configuration);

  //把localStream的音视频，放到源中
  localStream.getTracks().forEach(track => pc1.addTrack(track, localStream));
  
  //目标
  pc2 = new RTCPeerConnection(configuration);
  //等待源发来的流
  pc2.addEventListener('track', gotRemoteStream);

  //当ice准备好后，加到目标源中
  pc1.addEventListener('icecandidate', e => onIceCandidate(pc2, e));
  
  

 

  try {
    console.log('pc1 createOffer start');
	
	const offerOptions = {
		offerToReceiveAudio: 1,
		offerToReceiveVideo: 1
	};

	//创建和设置连接描述
  const desc_pc1 = await pc1.createOffer(offerOptions);

	console.log("desc_pc1 :");
	console.log(desc_pc1);
	await pc1.setLocalDescription(desc_pc1);
	
	//目标 拿到源的连接描述后，给自己，并生成自己的连接描述
	await pc2.setRemoteDescription(desc_pc1);
	const desc_pc2 = await pc2.createAnswer();

	console.log("answer desc_pc2 :");
	console.log(desc_pc2);
	await pc2.setLocalDescription(desc_pc2);
	
	//源拿到目标的连接描述后，知道有人要来连接，开启 通道
	await pc1.setRemoteDescription(desc_pc2);
	
	
  } catch (e) {
    onCreateSessionDescriptionError(e);
  }
}




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

function gotRemoteStream(e) {
  if (remoteVideo.srcObject !== e.streams[0]) {
    remoteVideo.srcObject = e.streams[0];
    console.log('pc2 received remote stream');
  }
}



async function onIceCandidate(pc, event) {

  try {
	  console.log(event.candidate.address);
	//源发来的ice，加入到目标中
	if(true){
		console.log(event.candidate);
        pc.addIceCandidate(event.candidate);
        onAddIceCandidateSuccess(pc);
	}

  } catch (e) {
    onAddIceCandidateError(pc, e);
  }
  //console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess(pc) {
  console.log(`${getName(pc)} addIceCandidate success`);
}

function onAddIceCandidateError(pc, error) {
  console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
}

