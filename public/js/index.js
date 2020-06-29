"use strict";

let btnCamera=document.getElementById('btn#camera');
let btnCall=document.getElementById('btn#call');
let btnHangout=document.getElementById('btn#hangout');

let localVideo=document.getElementById('localVideo');
let remoteVideo=document.getElementById('remoteVideo');

let textLocal=document.getElementById('ta#local');
let textRemote=document.getElementById('ta#remote');

let btnSend=document.getElementById('btn#send');

let localStream;
let remoteStream;

let localPeerConnection;
let remotePeerConnection

let sendChannel;
let receiverChannel;

const openUserMedia=()=>{
    navigator.mediaDevices.getUserMedia({
        audio:true,
        video:true
    })
    .then((stream)=>{
        localStream=stream;
        localVideo.srcObject=localStream;
        console.log('local video has been loaded');
        btnCall.disabled=false;
    })        
    .catch(error=>console.log(error));    
}

const handlerIceCandidate=(event)=>{
    let peerConnection=event.target;
    let iceCandidate=event.candidate;

    if (iceCandidate){
        const newCandidate=new RTCIceCandidate(iceCandidate);
        const otherPeer=((peerConnection===localPeerConnection)?remotePeerConnection:localPeerConnection);
        otherPeer.addIceCandidate(newCandidate)
        .then()
        .catch(error=>console.log(error));
    }
}

const handlerIceConnectionStateChange= event => console.log(event.target.iceConnectionState);

const call=()=>{
    localPeerConnection=new RTCPeerConnection(null);
    localPeerConnection.addEventListener('icecandidate',handlerIceCandidate);
    localPeerConnection.addEventListener('iceconnectionstatechange',handlerIceConnectionStateChange);

    sendChannel=localPeerConnection.createDataChannel('sendMessage',null);

    sendChannel.addEventListener('open',event=>console.log(event.target.readyState));

    sendChannel.addEventListener('close',event=>console.log(event.target.readyState));

    remotePeerConnection=new RTCPeerConnection(null);
    remotePeerConnection.addEventListener('icecandidate',handlerIceCandidate);
    remotePeerConnection.addEventListener('iceconnectionstatechange',handlerIceConnectionStateChange);
    remotePeerConnection.addEventListener('addstream',(event)=>{
        remoteStream=event.stream;
        remoteVideo.srcObject=remoteStream;
        btnHangout.disabled=false;
        btnCall.disabled=true;
        btnSend.disabled=false;
    });

    remotePeerConnection.addEventListener('datachannel',(message)=>{
        receiverChannel=event.channel;
        receiverChannel.addEventListener('open',event=>console.log(event.target.readyState));
        receiverChannel.addEventListener('close',event=>console.log(event.target.readyState));
        receiverChannel.addEventListener('message',event=>textRemote.value=event.data);
    });

    localPeerConnection.addStream(localStream);

    localPeerConnection.createOffer({
        offerToReceiveAudio:true,
        offerToReceiveVideo:true
    })
    .then((description)=>{
        console.log('Description');
        console.log(description);
        localPeerConnection.setLocalDescription(description)
        .then()
        .catch(error=>console.log(error));

        remotePeerConnection.setRemoteDescription(description)
        .then()
        .catch(error=>console.log(error));

        remotePeerConnection.createAnswer()
        .then((description)=>{       
            remotePeerConnection.setLocalDescription(description)
            .then()
            .catch(error=>console.log(error));

            localPeerConnection.setRemoteDescription(description)
            .then()
            .catch(error=>console.log(error));
        })
        .catch(error=>console.log(error));

    })
    .catch(error=>console.log(error));
}

const hangout=()=>{
    localPeerConnection.close();
    remotePeerConnection.close();
    sendChannel.close();
    receiverChannel.close()
    //localStream=null;
    remoteStream=null;
    btnHangout.disabled=true;
    btnCall.disabled=false;
    btnSend.disabled=true;
}

const sendMessage=()=>{
    sendChannel.send(textLocal.value);
}

const readMedia=async()=>{
    const devices=await navigator.mediaDevices.enumerateDevices();
    console.log(devices);
}

btnCamera.addEventListener('click',openUserMedia);
btnCall.addEventListener('click',call);
btnHangout.addEventListener('click',hangout)
btnSend.addEventListener('click',sendMessage)