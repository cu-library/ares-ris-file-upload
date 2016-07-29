@ECHO OFF
SETLOCAL

REM Change to the same directory as the current script
@setlocal enableextensions
@cd /d "%~dp0"

SET installdir=C:\inetpub\wwwroot\ares
SET jsinstalldir=%installdir%\js
SET cssinstalldir=%installdir%\css

ECHO To use this script, right click and select "Run as administrator" option.

CHOICE /M "Are you sure you want to copy files?"
ECHO %ERRORLEVEL%
IF %ERRORLEVEL% ==1 GOTO CONTINUE
GOTO CANCEL

:CONTINUE

ECHO Copying jquery-1.12.4.min.js...
COPY /V /Y jquery-1.12.4.min.js %jsinstalldir%

ECHO Copying include_risupload.html...
COPY /V /Y include_risupload.html %installdir%

ECHO Copying ares-ris-file-upload.js...
COPY /V /Y ares-ris-file-upload.js %jsinstalldir%

ECHO Copying ares-ris-file-upload.css...
COPY /V /Y ares-ris-file-upload.css %cssinstalldir%

ECHO Done!
PAUSE
GOTO END

:CANCEL
ECHO Cancelled!
PAUSE

:END




