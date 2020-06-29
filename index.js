'use strict';

const express=require('express');
const fs=require('fs');
const https=require('https');

const option={
    key:fs.readFileSync('certs/johan.com.co.key'),
    cert:fs.readFileSync('certs/johan.com.co.crt')
}

const app=express();

app.use(express.static('public'));

const server=https.createServer(option,app).listen(443,()=>{
    console.log('Server is running');
});