window.getVersion = function() { 
  if (!chrome.extension.version_) { 
    var xhr = new XMLHttpRequest(); 
    xhr.open("GET", chrome.extension.getURL('manifest.json'), false); 
    xhr.onreadystatechange = function() { 
      if (this.readyState == 4) { 
        var manifest = JSON.parse(this.responseText); 
        chrome.extension.version_ = manifest.version; 
      } 
   }; 
   xhr.send(); 
 } 
 return chrome.extension.version_; 
}