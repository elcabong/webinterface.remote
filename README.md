xbmc-remote
===========

an expanded remote based on  Ishiro's iRemote-for-XBMC


Required:
   For the "In Progress" links to work, you must copy the smart playlists in the included "required" folder to your userdata/playlists/video/  directory.  (this is the master user directory, even if you use profiles)


1.  Copy to your ./xbmc/addons/webinterface.remote   directory
2.  Activate XBMC webserver
      1. Start XBMC
      2. Go to 'System -> Settings -> Network -> Services'
      3. Check 'Allow control of XBMC via HTTP'
      4. Set your Port, or leave as default 8080
      5. Select "remote" as the 'Web interface'
3.  direct your browser to http://xbmcip:port
