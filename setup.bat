@echo off
REM Start Database/index.js and wait for it to finish
npm init -y

CLS

REM Immediately start serverV2/index.js after db/index.js exits
npm install