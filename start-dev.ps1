# Start MongoDB in background
Start-Process -NoNewWindow -FilePath "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" -ArgumentList "--config E:\MongoDB\config\mongod.cfg"

# Wait a few seconds for MongoDB to start
Start-Sleep -Seconds 5

# Start Node backend
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "cd 'E:\MOVIE_B\RNP_DIGITAL_PROCUREMENT_PLATFORM\backend'; npm run dev"

# Open Mongosh (optional)
Start-Process -NoNewWindow -FilePath "E:\program files\mongosh-2.5.8-win32-x64\bin\mongosh.exe"
