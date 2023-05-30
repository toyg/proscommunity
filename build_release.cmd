echo "This program requires two parameters: source directory (e.g. chrome) and output filename (e.g. proscommunity_1-6)"

set ZDIR="C:\Program Files\7-Zip"
set PATH=%PATH%;%ZDIR%
cd %1
call 7z a -tzip ..\%1_%2.zip *.* images
cd ..