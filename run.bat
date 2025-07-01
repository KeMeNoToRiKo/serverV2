@echo off
REM Start Database/index.js and wait for it to finish
node Database/index.js

CLS

REM Immediately start serverV2/index.js after db/index.js exits
node index.js