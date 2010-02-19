// worldclocks.js
// Copyright 2006 kw

function WorldClocks()
{
	this.idIndex = 0;
	this.items = new Array();

	this.window = new Window();
	this.window.name = "theWindow";
	
	_worldclocks = this;
	var items = new Array();
	var menuIndex = 0;
	items[menuIndex] = new MenuItem();
	items[menuIndex].title = "New City...";
	items[menuIndex].onSelect = "_worldclocks.addNewClock();";	
	this.window.contextMenuItems = items;
		
	ClockItem.prototype.width			= 300;
	ClockItem.prototype.height			= 55;
	ClockItem.prototype.weatherWidth	= 50;
	
	this.weathersWidth = ClockItem.prototype.weatherWidth * 3;
	
	this.loadPreference = function(first)
	{		
		ClockItem.prototype.dateFormat			= preferences.dateFormat.value;
		ClockItem.prototype.use24HourTime		= (preferences.use24HourTime.value != "0") ? true : false;
		ClockItem.prototype.font				= preferences.font.value;
		ClockItem.prototype.fontSize			= preferences.fontSize.value;
		ClockItem.prototype.locationFontColor	= preferences.locationFontColor.value;
		ClockItem.prototype.timeFontColor		= preferences.timeFontColor.value;
		ClockItem.prototype.bgColor				= preferences.bgColor.value;
		
		this.weathersWidth = 0;
		if (preferences.showTodayWeather.value == "1") this.weathersWidth += ClockItem.prototype.weatherWidth;
		if (preferences.showTommorowWeather.value == "1") this.weathersWidth += ClockItem.prototype.weatherWidth;
		if (preferences.showTodayMoon.value == "1") this.weathersWidth += ClockItem.prototype.weatherWidth;
		
		if (first) {
			this.loadBackground();

			if (preferences.firstDisplay.value == "1") {
				var time = new Date();
				this.addClock("Local Time", "", "", (-1)*time.getTimezoneOffset(), false, this.window);
				this.addClock("Tokyo", "Tokyo, Japan", "JAXX0085", 540, false, this.window);
				this.addClock("San Jose", "San Jose, CA", "USCA0993", -480, true, this.window);
				preferences.firstDisplay.value = "0";
			} else {
				var settings = preferences.clocks.value;
				if (settings == "") {
					var time = new Date();
					this.addClock("LocalTime", "", "", (-1)*time.getTimezoneOffset(), false, this.window);
				} else {
					var items = settings.split("///");
					for (var i = 0; i < items.length; i+=5) {
						this.addClock(items[i], items[i+1], items[i+2], items[i+3], items[i+4]);
 					}
				}
			} 
		}
		
		this.setWeatherVisible(
			(preferences.showTodayWeather.value == "1") ? true : false,
			(preferences.showTommorowWeather.value == "1") ? true : false,
			(preferences.showTodayMoon.value == "1") ? true : false
		);
		this.setTextFormat(preferences.font.value, preferences.fontSize.value);
		
		this.updateClock();
		this.updatePosition();
		this.updateWeather();
	}
	
	this.loadBackground = function()
	{
		var bgIndex = 0;
		this.bgImages = new Array();
		this.bgImages[bgIndex] = new Image();
		this.bgImages[bgIndex].src = "Resources/Images/Panel_UpperLeft.png";
		this.bgUpperHeight = this.bgImages[bgIndex].height;
		this.bgLeftWidth = this.bgImages[bgIndex].width;
		
		bgIndex++;
		this.bgImages[bgIndex] = new Image();
		this.bgImages[bgIndex].src = "Resources/Images/Panel_UpperRight.png";
		this.bgRightWidth = this.bgImages[bgIndex].width;
		
		bgIndex++;
		this.bgImages[bgIndex] = new Image();
		this.bgImages[bgIndex].src = "Resources/Images/Panel_UpperSide.png";
		
		bgIndex++;
		this.bgImages[bgIndex] = new Image();
		this.bgImages[bgIndex].src = "Resources/Images/Panel_LowerLeft.png";
		this.bgLowerHeight = this.bgImages[bgIndex].height;
		
		bgIndex++;
		this.bgImages[bgIndex] = new Image();
		this.bgImages[bgIndex].src = "Resources/Images/Panel_LowerSide.png";
		
		bgIndex++;
		this.bgImages[bgIndex] = new Image();
		this.bgImages[bgIndex].src = "Resources/Images/Panel_LowerRight.png";
		
		this.titlebarImg = new Image();
		this.titlebarImg.src = "Resources/Images/titlebar.png";
		this.titlebarImg.hOffset = 10;
		this.titlebarImg.vOffset = 4;
		
		this.copyright = new Text();
		this.copyright.data = copyright;
		this.copyright.size = 9;
		this.copyright.color = "#FFFFFF";
		this.copyright.alignment = "center";
	}
	
	this.moveBackground = function(x,y,cx,cy)
	{			
		this.x = x;
		this.y = y;
		this.cx = cx;
		this.cy = cy;
		
		var bgIndex = 0;
		this.bgImages[bgIndex].hOffset = x;
		this.bgImages[bgIndex].vOffset = y;
		bgIndex++;
		this.bgImages[bgIndex].hOffset = x+cx-this.bgRightWidth;
		this.bgImages[bgIndex].vOffset = y;
		bgIndex++;
		this.bgImages[bgIndex].hOffset = x+this.bgLeftWidth;
		this.bgImages[bgIndex].vOffset = y;
		this.bgImages[bgIndex].width = cx-(this.bgLeftWidth+this.bgRightWidth);
		bgIndex++;
		this.bgImages[bgIndex].hOffset = x;
		this.bgImages[bgIndex].vOffset = y+cy-this.bgLowerHeight;
		bgIndex++;
		this.bgImages[bgIndex].hOffset = x+this.bgLeftWidth;
		this.bgImages[bgIndex].vOffset = y+cy-this.bgLowerHeight;
		this.bgImages[bgIndex].width = cx-(this.bgLeftWidth+this.bgRightWidth);
		bgIndex++;
		this.bgImages[bgIndex].hOffset = x+cx-this.bgRightWidth;
		this.bgImages[bgIndex].vOffset = y+cy-this.bgLowerHeight;
		
		this.copyright.vOffset = y+cy-6;
		this.copyright.hOffset = x + Math.floor(cx/2);
	}
	
	this.showBackground = function(isVisible)
	{
		var len = this.bgImages.length;
		for (var index = 0; index < len; index++ ) {
			this.bgImages[index].visible = isVisible;
		}
	}
	
	this.savePreference = function()
	{
		var settings = "";
		var len = this.items.length;		
		for (var i=0; i<len; i++) {
			settings += this.items[i].toString("///");
			if (i+1!=len) settings += "///";
		}
		preferences.clocks.value = settings;
	}
	
	this.setWeatherVisible = function(today, tommorow, moon)
	{
		for (var i=0; i<this.items.length; i++) {
			this.items[i].setWeatherVisible(today, tommorow, moon);
		}
	}
	
	this.setTextFormat = function(newFont, newSize)
	{
		for (var i=0; i<this.items.length; i++) {
			this.items[i].setTextFormat(newFont, newSize);
		}
	}
	
	this.setColor = function(newLocationColor, newTimeColor, newBgColor)
	{		
		var len = this.items.length;		
		for (var i=0; i<len; i++) {
			this.items[i].setColor(newLocationColor, newTimeColor, newBgColor);
		}
	}
	
	this.addNewClock = function()
	{
		var time = new Date();
		var dlg = new ClockItemDialog("Add Clock", "Local Time", "", (-1)*time.getTimezoneOffset(), false);
		if (dlg.doModal())
			this.addClock(dlg.displayName, dlg.cityName, "", dlg.timezoneOffset, dlg.useDst);
	}
		
	this.addClock = function(displayName, cityName, locationCode, timezoneOffset, dst)
	{
		var newItem = new ClockItem(this, this.idIndex++, displayName, cityName, locationCode, timezoneOffset, dst);
		newItem.setWeatherVisible(
			(preferences.showTodayWeather.value == "1") ? true : false,
			(preferences.showTommorowWeather.value == "1") ? true : false,
			(preferences.showTodayMoon.value == "1") ? true : false
		);
		newItem.setTextFormat(preferences.font.value, preferences.fontSize.value);
		newItem.updateWeather();
		newItem.updateClock();
		this.items.push(newItem);
		this.updatePosition();
	}
	
	this.editClock = function(id)
	{
		var item = this.getItem(id);
		if (item) {
			if (item.edit()) {
				//item.updateClock();
				item.updateWeather();
				this.updatePosition();
			}
		}
	}
	
	this.removeClock = function(id)
	{
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i].id == id) {
				this.items[i].dispose();
				this.items.splice(i,1);
				this.updatePosition();
				return;
			}
		}
	}
	
	this.moveUpClock = function(id)
	{
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i].id == id) {
				if (i>0) {
					var a = this.items[i-1];
					var b = this.items[i];
					this.items[i] = a;
					this.items[i-1] = b;
					this.updatePosition();
				}
				return;
			}
		}
	}
	
	this.moveDownClock = function(id)
	{
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i].id == id) {
				if (i<this.items.length-1) {
					var a = this.items[i];
					var b = this.items[i+1];
					this.items[i+1] = a;
					this.items[i] = b;
					this.updatePosition();
				}
				return;
			}
		}
	}
	
	this.updateClock = function()
	{
		//ClockItem.prototype.animation = !(ClockItem.prototype.animation);	
		for (var i=0; i<this.items.length; i++) {
			this.items[i].updateClock();
		}
	}
	
	this.updateWeather = function()
	{
		for (var i=0; i<this.items.length; i++) {
			this.items[i].updateWeather();
		}
	}
	
	this.updatePosition = function()
	{
		var len = this.items.length;
		var maxWidth = (len > 0) ? 0 : 100;
		this.window.width = ClockItem.prototype.width + 6;
		this.window.height = ClockItem.prototype.height*len + this.bgUpperHeight + this.bgLowerHeight;		
		for (var i=0; i<len; i++) {
			this.items[i].setWindowPos(3, this.bgUpperHeight + i*ClockItem.prototype.height);
			this.items[i].setBackground(i%2 + 1);
			var width = this.items[i].getTextWidth();
			if (maxWidth < width) maxWidth = width;
		}
		
		maxWidth += 25 + this.weathersWidth;
		this.window.width = ClockItem.prototype.width = maxWidth;
		this.window.width += 6;
		for (var i=0; i<len; i++) {
			this.items[i].setWindowPos(null, null, maxWidth);
		}
		
		this.moveBackground(0, 0, this.window.width, this.window.height);
	}
		
	this.getItem = function(id)
	{
		for (var i=0; i<this.items.length; i++)
			if (this.items[i].id == id) return this.items[i];
		return null;
	}
}

function ClockItem(parent, id, displayName, cityName, locationCode, timezoneOffset, useDst)
{
	this.parent = parent;
	this.id = id;
	this.displayName = displayName;
	this.timezoneOffset = timezoneOffset;
	this.useDst = useDst;
	this.weather = new CityWeather(cityName, locationCode);
	
	// cache
	eval("_citem" + id + "= this;");
	
	this.shadow = new Shadow();
	this.shadow.color='#000000';
	this.shadow.vOffset=1;
	this.shadow.hOffset=1;
	this.shadow.opacity=255;
	
	this.bg = new Image();
	this.bg.name = "bg" + id;
	this.bg.src = "Resources/Images/bg1.png";
	this.bg.hOffset = 0;
	this.bg.vOffset = 0;
	this.bg.width = this.width;
	this.bg.height = this.height;
	this.bg.window = parent.window;
	//this.bg.colorize = this.bgColor;
	
	var items = new Array();
	var menuIndex = 0;
	//items[menuIndex] = new MenuItem();
	//items[menuIndex].title = "New City...";
	//items[menuIndex].onSelect = "_citem" + id + ".parent.addNewClock();";	
	items[menuIndex] = new MenuItem();
	items[menuIndex].onSelect = "_citem" + id + ".parent.editClock('" + id + "');";
	this.editMenuIndex = menuIndex;
	items[++menuIndex] = new MenuItem();
	items[menuIndex].onSelect = "_citem" + id + ".parent.removeClock('" + id + "');";
	this.removeMenuIndex = menuIndex;
	items[++menuIndex] = new MenuItem();
	items[menuIndex].title = "Up";
	items[menuIndex].onSelect = "_citem" + id + ".parent.moveUpClock('" + id + "');";
	items[++menuIndex] = new MenuItem();
	items[menuIndex].title = "Down";
	items[menuIndex].onSelect = "_citem" + id + ".parent.moveDownClock('" + id + "');";
	items[++menuIndex] = new MenuItem();
	items[menuIndex].title = wal.system.getMenuSeparatorTitle();
	this.bg.contextMenuItems = items;
		
	this.txTitle = new Text();
	this.txTitle.name = "date" + id;
	this.txTitle.data = displayName;
	this.txTitle.font = this.font;
	this.txTitle.color = this.locationFontColor;
	this.txTitle.size = this.fontSize;
	this.txTitle.alignment = "left";
	this.txTitle.style='bold';
	this.txTitle.window = parent.window;
	this.txTitle.shadow = this.shadow;
	
	this.txTime = new Text();
	this.txTime.name = "time" + id;
	this.txTime.font = this.font;
	this.txTime.color = this.timeFontColor;
	this.txTime.size = this.fontSize;
	this.txTime.alignment = "left";
	this.txTime.style='bold';
	this.txTime.window = parent.window;
	this.txTime.shadow = this.shadow;
	
	this.todayWeatherDay = new Text();
	this.todayWeatherHighTemp = new Text();
	this.todayWeatherLowTemp = new Text();
	this.todayWeatherImg = new Image();
	this.todayWeatherImg.src = "Resources/Images/weather/Sun.png";
	this.tommorowWeatherDay = new Text();
	this.tommorowWeatherHighTemp = new Text();
	this.tommorowWeatherLowTemp = new Text();
	this.tommorowWeaherImg = new Image();
	this.tommorowWeaherImg.src = "Resources/Images/weather/Rain.png";
	this.todayMoonDay = new Text();
	this.todayMoonPercent = new Text();
	this.todayMoonImg = new Image();
	this.todayMoonImg.src = "Resources/Images/weather/Moons/14.png";
	
	this.moonShadow = new Shadow();
	this.moonShadow.color='#FFFF00';
	this.moonShadow.vOffset=1;
	this.moonShadow.hOffset=1;
	this.moonShadow.opacity=128;
	
	this.highShadow = new Shadow();
	this.highShadow.color='#FF0000';
	this.highShadow.vOffset=1;
	this.highShadow.hOffset=1;
	this.highShadow.opacity=128;
	
	this.lowShadow = new Shadow();
	this.lowShadow.color='#0000FF';
	this.lowShadow.vOffset=1;
	this.lowShadow.hOffset=1;
	this.lowShadow.opacity=128;
	
	// font
	this.todayWeatherDay.font = this.tommorowWeatherDay.font = this.todayMoonDay.font = "Helvetica Bold, Arial Bold";
	this.todayWeatherHighTemp.font = this.tommorowWeatherHighTemp.font = "Helvetica Bold, Arial Bold";
	this.todayWeatherLowTemp.font = this.tommorowWeatherLowTemp.font = "Helvetica Bold, Arial Bold";
	this.todayMoonPercent.font = "Helvetica Bold, Arial Bold";
	// font size
	this.todayWeatherDay.size = this.tommorowWeatherDay.size = this.todayMoonDay.size = 10;
	this.todayWeatherHighTemp.size = this.tommorowWeatherHighTemp.size = 13;
	this.todayWeatherLowTemp.size = this.tommorowWeatherLowTemp.size = 11;
	this.todayMoonPercent.size = 13;
	// font color
	this.todayWeatherDay.color = this.tommorowWeatherDay.color = this.todayMoonDay.color = "#FFFFFF";
	this.todayWeatherHighTemp.color = this.tommorowWeatherHighTemp.color = "#FFFFFF";
	this.todayWeatherLowTemp.color = this.tommorowWeatherLowTemp.color = "#FFFFFF";
	this.todayMoonPercent.color = "#FFFFFF";
	// width
	this.todayWeatherDay.width = this.tommorowWeatherDay.width = this.todayMoonDay.width = this.weatherWidth;
	this.todayWeatherHighTemp.width = this.tommorowWeatherHighTemp.width = Math.floor(this.weatherWidth/2);
	this.todayWeatherLowTemp.width = this.tommorowWeatherLowTemp.width = Math.floor(this.weatherWidth/2);
	this.todayMoonPercent.width = this.weatherWidth;
	// alignment
	this.todayWeatherImg.alignment = this.tommorowWeaherImg.alignment = this.todayMoonImg.alignment = "center";
	this.todayWeatherDay.alignment = this.tommorowWeatherDay.alignment = this.todayMoonDay.alignment = "center";
	this.todayWeatherHighTemp.alignment = this.tommorowWeatherHighTemp.alignment = "center";
	this.todayWeatherLowTemp.alignment = this.tommorowWeatherLowTemp.alignment = "center";
	this.todayMoonPercent.alignment = "center";
	// owner
	this.todayWeatherDay.window = this.tommorowWeatherDay.window = this.todayMoonDay.window = parent.window;
	this.todayWeatherHighTemp.window = this.tommorowWeatherHighTemp.window = parent.window;
	this.todayWeatherLowTemp.window = this.tommorowWeatherLowTemp.window = parent.window;
	this.todayMoonPercent.window = parent.window;
	// shadow
	this.todayWeatherDay.shadow = this.tommorowWeatherDay.shadow = this.todayMoonDay.shadow = this.shadow;
	this.todayWeatherHighTemp.shadow = this.tommorowWeatherHighTemp.shadow = this.highShadow;
	this.todayWeatherLowTemp.shadow = this.tommorowWeatherLowTemp.shadow = this.lowShadow;
	this.todayMoonPercent.shadow = this.moonShadow;
	
	this.setName = function(name)
	{
		this.displayName = name;
		this.txTitle.data = name;
		this.bg.contextMenuItems[this.editMenuIndex].title = "Edit " + name + "...";
		this.bg.contextMenuItems[this.removeMenuIndex].title = "Remove " + name;
	}
	this.setName(displayName);
	
	this.dispose = function()
	{
		this.bg.visible = this.txTitle.visible = this.txTime.visible = false;
		this.todayWeatherImg.visible = this.tommorowWeaherImg.visible = this.todayMoonImg.visible = false;
	}

	this.setTextFormat = function(newFont, newSize, newColor)
	{
		if (newFont!=null) {
			this.txTime.font = newFont;
			this.txTitle.font = newFont;
		}
		
		if (newSize!=null) {			
			this.txTime.size = newSize;			
			this.txTitle.size = newSize;
		}
		
		if (newColor!=null) {
			this.txTime.color = newColor;
			this.txTitle.color = newColor;
		}
	}
	
	this.setBackground = function(index)
	{
		this.bg.src = "Resources/Images/bg" + index + ".png";
	}
	
	this.setColor = function(newLocationColor, newTimeColor, newBgColor)
	{		
		if (newLocationColor!=null) {
			this.txTitle.color = newLocationColor;
		}
		
		if (newTimeColor!=null) {
			this.txTime.color = newTimeColor;
		}
		
		if (newBgColor!=null) {
			this.bg.colorize = newBgColor;
		}
	}
	
	this.getTextWidth = function()
	{
		return (this.txTitle.width > this.txTime.width) ? this.txTitle.width : this.txTime.width;
	}
	
	this.setWeatherVisible = function(today, tommorow, moon)
	{
		this.todayWeatherDay.visible = today;
		this.todayWeatherImg.visible = today;
		this.todayWeatherHighTemp.visible = today;
		this.todayWeatherLowTemp.visible = today;
		
		this.tommorowWeatherDay.visible = tommorow;
		this.tommorowWeaherImg.visible = tommorow;
		this.tommorowWeatherHighTemp.visible = tommorow;
		this.tommorowWeatherLowTemp.visible = tommorow
		
		this.todayMoonDay.visible = moon;
		this.todayMoonImg.visible = moon;
		this.todayMoonPercent.visible = moon;
	}
	
	this.setWindowPos = function(x,y,cx,cy)
	{			
		if (x!=null) {
			this.bg.hOffset = x;
			this.txTitle.hOffset = x + 10;
			this.txTime.hOffset = x + 10;
		}
		if (y!=null) {
			this.bg.vOffset = y;
			this.txTitle.vOffset = y + 22;
			this.txTime.vOffset = y + 42;
				
			this.todayWeatherDay.vOffset = y + 12;
			this.todayWeatherImg.vOffset = y + 10;
			this.todayWeatherHighTemp.vOffset = y + 49;
			this.todayWeatherLowTemp.vOffset = y + 49;
			
			this.tommorowWeatherDay.vOffset = y + 12;
			this.tommorowWeaherImg.vOffset = y + 10;
			this.tommorowWeatherHighTemp.vOffset = y + 49;
			this.tommorowWeatherLowTemp.vOffset = y + 49;
			
			this.todayMoonDay.vOffset = y + 12;
			this.todayMoonImg.vOffset = y + 10;
			this.todayMoonPercent.vOffset = y + 49;
		}
		
		if (cx!=null) {
			this.bg.width = cx;

			var offset = this.weatherWidth + 5;
			var halfWidth = Math.round(this.weatherWidth/2);
			var qtWidth = Math.round(this.weatherWidth/4);
			if (this.todayMoonImg.visible) {
				this.todayMoonDay.hOffset = cx - offset + halfWidth;
				this.todayMoonImg.hOffset = cx - offset + halfWidth;
				this.todayMoonPercent.hOffset = cx - offset + halfWidth;
				offset += this.weatherWidth;
			}
			if (this.tommorowWeaherImg.visible) {
				this.tommorowWeatherDay.hOffset = cx - offset + halfWidth;
				this.tommorowWeaherImg.hOffset = cx - offset + halfWidth;
				this.tommorowWeatherHighTemp.hOffset = cx - offset + qtWidth;
				this.tommorowWeatherLowTemp.hOffset = cx - offset + halfWidth + qtWidth;
				offset += this.weatherWidth;
			}
			if (this.todayWeatherImg.visible) {
				this.todayWeatherDay.hOffset = cx - offset + halfWidth;
				this.todayWeatherImg.hOffset = cx - offset + halfWidth;
				this.todayWeatherHighTemp.hOffset = cx - offset + qtWidth;
				this.todayWeatherLowTemp.hOffset = cx - offset + halfWidth + qtWidth;
				offset += this.weatherWidth;
			}
		}
		if (cy!=null) {
			this.bg.height = cy;
		}
	}
	
	this.edit = function()
	{
		var dlg = new ClockItemDialog("Edit Clock", this.displayName, this.weather.cityName, this.timezoneOffset, this.useDst);
		if (dlg.doModal()) {
			this.setName(dlg.displayName);

			if ( this.weather.cityName != dlg.cityName) {
				this.weather.locationCode = "";
				this.weather.cityName = dlg.cityName;
			}
			this.timezoneOffset = dlg.timezoneOffset;
			this.useDst = dlg.useDst;
			return true; 
		}
		return false;
	}

	this.updateClock = function()
	{
		if (this.txTime != null) {
		
			var timeString;
			var time = new Date();
			
			if (this.timezoneOffset != null) {
				//print("this.timezoneOffset = " + this.timezoneOffset);
				//print("time.getTimezoneOffset() = " + time.getTimezoneOffset());
				var ms = time.getTime();
				ms += time.getTimezoneOffset() * 60 * 1000; // localTime to GMT
				ms += this.timezoneOffset * 60 * 1000;
				time.setTime(ms);
			}
			var month = time.getMonth() + 1;
			if (month < 10) month = "0" + month;
			var day	= time.getDate();
			if (day < 10) day = "0" + day;
			
			var year = time.getFullYear();
			var hour = time.getHours();
			
			var dayString = this.shortDayNames[time.getDay()];
						
			var minutes = time.getMinutes();
			if (minutes < 10) minutes = "0" + minutes;
			var seconds = time.getSeconds();
			if (seconds < 10) seconds = "0" + seconds;
			
			//var anime = (this.animation) ? " " : ":";
			var anime = ":";
			if (!this.use24HourTime) {
				var ampm = (hour < 11) ? "AM" : "PM";
				if (hour > 12) hour = hour - 12;
				if (hour < 10) hour = "0" + hour;
				timeString = hour + anime + minutes + " " + ampm;
			} else {
				if (hour < 10) hour = "0" + hour;
				timeString = hour + anime + minutes;
			}
			
			var format = this.dateFormat;
			format = format.replace(/YYYY/, year);
			format = format.replace(/MM/, month);
			format = format.replace(/DD/, day);
			format = format.replace(/ddd/, dayString);
			
			this.txTime.data = format + " " + timeString
			
		} else {
			print("no txtTime");
		}		
	}
	
	this.updateWeather = function()
	{
		var weather = this.weather;
		var unit = (preferences.unitsPref.value == 1) ? true : false;
		if (weather.fetchData(unit))
		{
			if (weather.parseWeather())
			{
				this.todayWeatherDay.data = weather.isNight() ? "TONIGHT" : "TODAY";
				this.todayWeatherHighTemp.data = weather.highTempratures[0] + "°";
				this.todayWeatherLowTemp.data = weather.lowTempratures[0] + "°";
				//this.todayWeatherImg.src = "http://st.msn.com/as/wea3/i/en-US/saw/" + weather.weatherCodes[0] + ".gif";
				this.todayWeatherImg.src = "Resources/Images/weather/" + tinyWeatherIcons[Number(weather.weatherCodes[0])] + ".png";
				this.todayWeatherImg.tooltip = weather.weatherTexts[0];
				
				this.tommorowWeatherDay.data = weather.dayTexts[1];
				this.tommorowWeatherHighTemp.data = weather.highTempratures[1] + "°";
				this.tommorowWeatherLowTemp.data = weather.lowTempratures[1] + "°";
				//this.tommorowWeaherImg.src = "http://st.msn.com/as/wea3/i/en-US/saw/" + weather.weatherCodes[0] + ".gif";
				this.tommorowWeaherImg.src = "Resources/Images/weather/" + tinyWeatherIcons[Number(weather.weatherCodes[1])] + ".png";
				this.tommorowWeaherImg.tooltip = weather.weatherTexts[1];
				
				this.todayMoonDay.data = "MOON";
				this.todayMoonPercent.data = weather.moonPhasePercent + "%";
				this.todayMoonImg.src = "Resources/Images/weather/Moons/" + weather.moonPhase + ".png";
			}
				
			//weather.moonPhasePercent;
			//weather.conditions;
			//weather.fetchedTime;
			//weather.highTempratures;
			//weather.lowTempratures;			
		}
	}
}

ClockItem.prototype.monthNames		= new Array( "January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" )
ClockItem.prototype.dayNames		= new Array( "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" );
ClockItem.prototype.shortDayNames	= new Array( "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" );
ClockItem.prototype.toString = function(split)
{
	var str = "";	
	str += this.displayName + split;
	str += this.weather.cityName + split;
	str += this.weather.locationCode + split;
	str += this.timezoneOffset + split;
	str += this.useDst;
	return str;
}

function ClockItemDialog(windowTitle, displayName, cityName, timezoneOffset, useDst)
{
	this.windowTitle = windowTitle;
	this.displayName = displayName;
	this.cityName = cityName;
	this.timezoneOffset = timezoneOffset;
		
	var tzOffsetValue = timezoneOffset;
	var tzOffsetMinus = false;
	if (timezoneOffset < 0) {
		tzOffsetMinus = true;
		tzOffsetValue = (-1)*tzOffsetValue;
	}
	var hOffset = Math.floor(tzOffsetValue/60);
	var mOffset = Number(tzOffsetValue%60);
	if (tzOffsetMinus) {
		hOffset *= -1;
		mOffset *= -1;
	}
				
	this.useDst = useDst;
	
	this.aControl = Array();
	var c = this.aControl;
	var index = 0;
	c[index] = new FormField;
	c[index].name = 'displayName';
	c[index].type = 'text';
	c[index].title =  "Display Name:";
	c[index].defaultValue = displayName;
	
	index++;
	c[index] = new FormField;
	c[index].name = 'cityName';
	c[index].type = 'text';
	c[index].title =  "City Name:";
	c[index].defaultValue = cityName;

	index++;
	c[index] = new FormField;
	c[index].name = "hOffset";
	c[index].title = "Offset from GMT (Hour):";
	c[index].type = "popup";
	c[index].option = [-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12];
	c[index].defaultValue = hOffset;

	index++;
	c[index] = new FormField;
	c[index].name = "mOffset";
	c[index].title = "Offset from GMT (Min):";
	c[index].type = "popup";
	c[index].option = [-30,0,30];
	c[index].defaultValue = mOffset;

	index++;
	c[index] = new FormField;
	c[index].name = "dst";
	c[index].title = "DST";
	c[index].type = "checkbox";
	c[index].description = "Check if DST is currently active in the time zone";
	c[index].defaultValue = (useDst) ? "1" : "0";

	this.doModal = function()
	{
		var results = form(this.aControl, this.windowTitle, 'Add');
		if (results != null) {
			this.displayName = results[0];
			this.cityName = results[1];
			var hOffset = Number(results[2]);
			var mOffset = Number(results[3]);
			this.timezoneOffset = hOffset * 60 + mOffset;
			this.useDst = (results[4] != 0) ? true : false;
			return true;
		}
		else {
			return false;
		}
	}
}

/*

var timeZones = new Array();
timeZones.push({name:"(GMT) Greenwich Mean Time; Dublin, Edinburgh, London", diff:0});
timeZones.push({name:"(GMT+01:00) Lisbon, Warsaw", diff:1});
timeZones.push({name:"(GMT+01:00) Paris, Madrid", diff:1});
timeZones.push({name:"(GMT+01:00) Berlin, Stockholm, Rome, Bern, Brussels, Vienna", diff:1});
timeZones.push({name:"(GMT+02:00) Eastern Europe", diff:2});
timeZones.push({name:"(GMT+01:00) Prague", diff:1});
timeZones.push({name:"(GMT+02:00) Athens, Helsinki, Istanbul", diff:2});
timeZones.push({name:"(GMT-03:00) Brasilia", diff:-3});
timeZones.push({name:"(GMT-04:00) Atlantic Time (Canada)", diff:-4});
timeZones.push({name:"(GMT-05:00) Eastern Time (US & Canada)", diff:-5});
timeZones.push({name:"(GMT-06:00) Central Time (US & Canada)", diff:-6});
timeZones.push({name:"(GMT-07:00) Mountain Time (US & Canada)", diff:-7});
timeZones.push({name:"(GMT-08:00) Pacific Time (US & Canada); Tijuana", diff:-8});
timeZones.push({name:"(GMT-09:00) Alaska", diff:-9});
timeZones.push({name:"(GMT-10:00) Hawaii", diff:-10});
timeZones.push({name:"(GMT-11:00) Midway Island, Samoa", diff:-11});
timeZones.push({name:"(GMT+12:00) Wellington, Auckland", diff:12});
timeZones.push({name:"(GMT+10:00) Brisbane, Melbourne, Sydney", diff:10});
timeZones.push({name:"(GMT+09:30) Adelaide", diff:9.5});
timeZones.push({name:"(GMT+09:00) Tokyo, Osaka, Sapporo, Seoul, Yakutsk", diff:9});
timeZones.push({name:"(GMT+08:00) Hong Kong, Perth, Singapore, Taipei", diff:8});
timeZones.push({name:"(GMT+07:00) Bangkok, Jakarta, Hanoi", diff:7});
timeZones.push({name:"(GMT+05:30) Bombay, Calcutta, Madras, New Delhi, Colombo", diff:5.5});
timeZones.push({name:"(GMT+04:00) Abu Dhabi, Muscat, Tbilisi, Kazan, Volgograd", diff:4});
timeZones.push({name:"(GMT+03:30) Tehran", diff:3.5});
timeZones.push({name:"(GMT+03:00) Baghdad, Kuwait, Nairobi, Riyadh", diff:3});
timeZones.push({name:"(GMT+02:00) Israel", diff:2});
timeZones.push({name:"(GMT-03:30) Newfoundland", diff:-3.5});
timeZones.push({name:"(GMT-01:00) Azores, Cape Verde Is.", diff:-1});
timeZones.push({name:"(GMT-02:00) Mid-Atlantic", diff:-2});
timeZones.push({name:"(GMT) Monrovia, Casablanca", diff:0});
timeZones.push({name:"(GMT-03:00) Buenos Aires, Georgetown", diff:-3});
timeZones.push({name:"(GMT-04:00) Caracas, La Paz", diff:-4});
timeZones.push({name:"(GMT-05:00) Indiana (East)", diff:-5});
timeZones.push({name:"(GMT-05:00) Bogota, Lima", diff:-5});
timeZones.push({name:"(GMT-06:00) Saskatchewan", diff:-6});
timeZones.push({name:"(GMT-06:00) Mexico City, Tegucigalpa", diff:-6});
timeZones.push({name:"(GMT-07:00) Arizona", diff:-7});
timeZones.push({name:"(GMT-12:00) Eniwetok, Kwajalein", diff:-12});
timeZones.push({name:"(GMT+12:00) Fiji, Kamchatka, Marshall Is.", diff:12});
timeZones.push({name:"(GMT+11:00) Magadan, Solomon Is., New Caledonia", diff:11});
timeZones.push({name:"(GMT+10:00) Hobart", diff:10});
timeZones.push({name:"(GMT+10:00) Guam, Port Moresby, Vladivostok", diff:10});
timeZones.push({name:"(GMT+09:30) Darwin", diff:9.5});
timeZones.push({name:"(GMT+08:00) Beijing, Chongqing, Urumqi", diff:8});
timeZones.push({name:"(GMT+06:00) Almaty, Dhaka", diff:6});
timeZones.push({name:"(GMT+05:00) Islamabad, Karachi, Sverdlovsk, Tashkent", diff:5});
timeZones.push({name:"(GMT+04:30) Kabul", diff:4.5});
timeZones.push({name:"(GMT+02:00) Cairo", diff:2});
timeZones.push({name:"(GMT+02:00) Harare, Pretoria", diff:2});
timeZones.push({name:"(GMT+03:00) Moscow, St. Petersburg", diff:3});

*/

