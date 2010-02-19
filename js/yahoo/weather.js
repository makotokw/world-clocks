
	
include("xmldom.js");
function xmlError(str) { log("xmldom: " + str); };

var weatherIcons = 
[
	"Thunderstorms,0",		//  0 : Thunderstorms
	"Thunderstorms,0",		//  1 : Thunderstorms
	"Thunderstorms,0",		//  2 : Thunderstorms
	"Thunderstorms,0",		//  3 : Thunderstorms
	"Thunderstorms,0",		//  4 : Thunderstorms
	"Hail,0",				//  5 : Icy Snowy Rain ***
	"Hail,0",				//  6 : Sleet & Rain ***
	"Hail,0",				//  7 : Icy Snowy Rain (hail/rain/snow) ***
	"Showers,0",			//  8 : Icy Drizzle ***
	"Showers,0",			//  9 : Drizzle
	"Rain,0",				// 10 : Icy Rain ***
	"Showers,0",			// 11 : Light Showers ***
	"Rain,0",				// 12 : Showers ***
	"Flurries,0",			// 13 : Light Snow Flurries
	"Snow,0",				// 14 : Med Snow  ***
	"Ice,0",				// 15 : Friged (Very Cold)  ***
	"Snow,0",				// 16 : Normal Snow
	"Thunderstorms,0",		// 17 : Thunderstorms
	"Hail,0",				// 18 : Sleet ***
	"Haze,1",				// 19 : Dust ***
	"Fog,0",				// 20 : Fog
	"Haze,1",				// 21 : Hazy
	"Haze,1",				// 22 : Smoke ***
	"Wind,0",				// 23 : Windy
	"Wind,0",				// 24 : Windy
	"Ice,0",				// 25 : Friged/Icy
	"Many Clouds,0",		// 26 : Cloudy (no sun/moon)
	"Many Clouds,1",		// 27 : Mostly Cloudy Night
	"Many Clouds,1",		// 28 : Mostly Cloudy Day
	"Clouds,1",				// 29 : Partially Cloudy Night
	"Clouds,1",				// 30 : Partially Cloudy Day
	"None,1",				// 31 : Clear Night
	"None,1",				// 32 : Clear Day
	"Few Clouds,1",			// 33 : Tiny bit of clouds at night
	"Few Clouds,1",			// 34 : Tiny bit of clouds during the day
	"Thunderstorms,0",		// 35 : Thunderstorms
	"None,1",				// 36 : Hot
	"Thunderstorms,1",		// 37 : Sunny Thunderstorms
	"Thunderstorms,1",		// 38 : Sunny Thunderstorms
	"Showers,1",			// 39 : Sunny Showers
	"Rain,0",				// 40 : Rain ***
	"Snow,0",				// 41 : Normal Snow (sunny)
	"Snow,0",				// 42 : Normal Snow
	"Snow,0",				// 43 : Blowing/Windy Snow (normal snow) ***
	"Few Clouds,1",			// 44 : Partially Cloudy Day (N/A) ***
	"Showers,1",			// 45 : Night Rain ***
	"Snow,0",				// 46 : Night Snow ***
	"Thunderstorms,1",		// 47 : Night Thunder Storm
	"Rain,1",				// 48 : Sunny Rain ***
];

var tinyWeatherIcons = 
[
	"Thunderstorms",		//  0 : Thunderstorms
	"Thunderstorms",		//  1 : Thunderstorms
	"Thunderstorms",		//  2 : Thunderstorms
	"Thunderstorms",		//  3 : Thunderstorms
	"Thunderstorms",		//  4 : Thunderstorms
	"Hail",					//  5 : Icy Snowy Rain ***
	"Hail",					//  6 : Sleet & Rain ***
	"Hail",					//  7 : Icy Snowy Rain (hail/rain/snow) ***
	"Showers",				//  8 : Icy Drizzle ***
	"Showers",				//  9 : Drizzle
	"Rain",					// 10 : Icy Rain ***
	"Showers",				// 11 : Light Showers ***
	"Rain",					// 12 : Showers ***
	"Flurries",				// 13 : Light Snow Flurries
	"Snow",					// 14 : Med Snow  ***
	"Ice",					// 15 : Friged (Very Cold)  ***
	"Snow",					// 16 : Normal Snow
	"Thunderstorms",		// 17 : Thunderstorms
	"Hail",					// 18 : Sleet ***
	"Haze",					// 19 : Dust ***
	"Fog",					// 20 : Fog
	"Haze",					// 21 : Hazy (do some mini-icon smarts here) ***
	"Haze",					// 22 : Smoke ***
	"Wind",					// 23 : Windy
	"Wind",					// 24 : Windy
	"Ice",					// 25 : Friged/Icy
	"Clouds",				// 26 : Cloudy (no sun/moon)
	"Moon And Clouds",		// 27 : Mostly Cloudy Night
	"Sun And Clouds",		// 28 : Mostly Cloudy Day
	"Moon And Clouds",		// 29 : Partially Cloudy Night
	"Sun And Clouds",		// 30 : Partially Cloudy Day
	"Moon",					// 31 : Clear Night
	"Sun",					// 32 : Clear Day
	"Moon Few Clouds",		// 33 : Tiny bit of clouds at night
	"Sun Few Clouds",		// 34 : Tiny bit of clouds during the day
	"Thunderstorms",		// 35 : Thunderstorms
	"Sun",					// 36 : Hot
	"Sunny Thunderstorms",	// 37 : Sunny Thunderstorms
	"Sunny Thunderstorms",	// 38 : Sunny Thunderstorms
	"Sun And Rain",			// 39 : Sunny Showers
	"Rain",					// 40 : Rain ***
	"Snow",					// 41 : Normal Snow (sunny)
	"Snow",					// 42 : Normal Snow
	"Snow",					// 43 : Blowing/Windy Snow (normal snow) ***
	"Sun Few Clouds",		// 44 : Partially Cloudy Day (N/A) ***
	"Moon And Rain",		// 45 : Night Rain ***
	"Snow",					// 46 : Night Snow ***
	"Thunderstorms",		// 47 : Night Thunder Storm
	"Sun And Rain",			// 48 : Sunny Rain ***
];

function CityWeather(cityName, locationCode)
{
	this.url = new URL();
	this.cityName = cityName;
	this.locationCode = locationCode;
	
	this.fetchLocationCode = function(cityName)
	{
		var url = this.url;
		var searchResultsData = url.fetch("http://xoap.weather.com/search/search?where=" + escape(cityName));
		if (searchResultsData.length == "276") {
			wal.print("We were unable to find the city you entered.\n\nIf your city can't be found, try a entering a larger neighboring city.");
			return;
		}
		if (searchResultsData.length == 0 || searchResultsData == "Could not load URL") {
			wal.print("We are unable to choose your city because we can't connect to our servers.\n\nPlease check your network connection or try again later.");
			return;
		}
	
		var resultsXML = new XMLDoc(searchResultsData, xmlError);
		var resultsNode = resultsXML.docNode;
		
		if (resultsNode == null) {
			wal.print("There was a problem parsing search results.");
			return;
		} 
		
		var cityArray = new Array();
		var idArray = new Array();
		var locationCount = 0;
		for (var n = 0; n < resultsNode.children.length; n++) {
			if (resultsNode.children[n].tagName == "loc") {
				cityArray[locationCount] = resultsNode.children[n].getText();
				idArray[resultsNode.children[n].getText()] = resultsNode.children[n].getAttribute("id");
				++locationCount;
			}
		}
	
		if (locationCount > 1) {		  
			var formFields = new Array();			
			formFields[0] = new FormField();
			formFields[0].name = 'city_popup';
			formFields[0].title = 'Location:';
			formFields[0].type = 'popup';
			formFields[0].option = cityArray;				
			formFields[0].defaultValue = cityArray[0];
			formFields[0].description = "Please choose the city closest to where you live.";
			
			var formResults = form(formFields, 'Choose a City', 'Choose');				
			if ( formResults != null ) {
				var city = new Object();
				city.displayName = formResults[0].split(" (")[0];
				city.locationCode = idArray[String(formResults[0])];
				return city;
			}
		} else if (locationCount == 1) {
			var city = new Object();
			city.displayName = cityArray[0].split(" (")[0];
			city.locationCode = idArray[cityArray[0]];
			return city;
		} else {
			wal.print("No results (problem with search data?)");
			return;
		}
		return;
	}
	
	this.fetchSucceeded = false;
	this.fetchData = function(unit)
	{	
		if (this.locationCode=="") {
			var city = this.fetchLocationCode(this.cityName);
			if (city == null) return false;
			this.cityName = city.displayName;
			this.locationCode = city.locationCode;
		}
		
		var url = this.url;
		this.fetchSucceeded = false;
		
		var unitValue = (unit) ? "c" : "f";
		var urlData = url.fetch("xml.weather.yahoo.com/forecastrss/" + this.locationCode + "_" + unitValue + ".xml");

		//wal.print(urlData);
		if (urlData.length == 0 || urlData == "Could not load URL") {
			this.errorMessage = "Could not load URL";
			return false;
		}
		
		urlData = urlData.replace(/\r|\n|\t/g, "");
		if (urlData.length == 0 || urlData == "Could not load URL") {
			this.failureCount++;
			if (this.failureCount == 4)
				this.errorMessage = "Lost Connection";
			return false;
		}
		
		this.failureCount = 0;
		this.xml = new XMLDoc(urlData, xmlError);
		var xml = this.xml;
		if (xml.selectNode("/failure")) {
			if (xml.selectNode("/failure").getText() == "Location does not exist.") {
				this.errorMessage = "Missing Location";
				return false;
			}
		}
		if (xml.selectNode("/channel/title")) {
			if (xml.selectNode("/channel/title").getText() == "Yahoo! Weather - Error") {
				this.errorMessage = "Missing Location";
				return false;
			}
		}
		
		this.fetchSucceeded = true;
		return true;
	}
	
	this.parseWeather = function()
	{
		var xml = this.xml;
		
		var fetchedTemp = xml.selectNode("/channel/item/yweather:condition").getAttribute("temp");		
		var fetchedCity = xml.selectNode("/channel/yweather:location").getAttribute("city");
		var fetchedIcon = xml.selectNode("/channel/item/yweather:condition").getAttribute("code");
		var fetchedTextConditions = xml.selectNode("/channel/item/yweather:condition").getAttribute("text");
		
		this.lastFetchTime = "";
		var fetchedTime = xml.selectNode("/channel/item/yweather:condition").getAttribute("date");
		if ( fetchedTime != null && fetchedTime != "" ) {
			var timePart = fetchedTime.match(/.* (.*:.. [AaPp][Mm]).*/)[1];
			if ( timePart != "" ) {
				var timeIs = timePart.split(" ")[0];
				var amPmIs = timePart.split(" ")[1];
				this.lastFetchTime = timeIs + " " + amPmIs;
			}
		}

		// Placeholder fix for 3200 issue:
		// Make the condition clear since that's generic.
		if ( fetchedIcon == "3200" ) fetchedIcon = 32;
		
		this.cachedCityName = fetchedCity;
		this.data = fetchedIcon;
		this.temprature = (fetchedTemp == "N/A") ? null : Number(fetchedTemp);
		this.isNightTime = this.getNightTime();
		this.moonPhase = this.getMoonPhase();
		this.moonPhasePercent = Math.round(this.getMoonPhasePercent(new Date()));
		this.conditions = fetchedTextConditions;
		this.fetchedTime = fetchedTime;
		
		this.dayTexts = new Array();
		this.weatherCodes = new Array();
		this.weatherTexts = new Array();
		this.highTempratures = new Array();
		this.lowTempratures = new Array();

		var resultsNode = xml.docNode;
		var i = 0;
		for (var n = 0; n < resultsNode.children.length; n++)
		{
			if (resultsNode.children[n].tagName == "channel")
			{
				for (var x = 0; x < resultsNode.children[n].children.length; x++)
				{
					if (resultsNode.children[n].children[x].tagName == "item")
					{
						for (var y = 0; y < resultsNode.children[n].children[x].children.length; y++)
						{
							if (resultsNode.children[n].children[x].children[y].tagName == "yweather:forecast")
							{
								var day = resultsNode.children[n].children[x].children[y].getAttribute("day").toUpperCase();
								var hiTemp = resultsNode.children[n].children[x].children[y].getAttribute("high");
								var lowTemp = resultsNode.children[n].children[x].children[y].getAttribute("low");
								var text = resultsNode.children[n].children[x].children[y].getAttribute("text");
								var code = resultsNode.children[n].children[x].children[y].getAttribute("code");
								if ( code == "3200" ) code = 32;
								
								this.dayTexts[i] = day;
								this.weatherCodes[i] = code;
								this.weatherTexts[i] = text;
								this.highTempratures[i] = hiTemp;
								this.lowTempratures[i] = lowTemp;
								i++;
							}
						}
					}
				}
			}
		}
		return true;
	}
	
	this.getMoonPhasePercent = function(theDate)
	{
		var baseDate = new Date();
			baseDate.setUTCFullYear(2005);
			baseDate.setUTCMonth(4);
			baseDate.setUTCDate(8);
			baseDate.setUTCHours(8);
			baseDate.setUTCMinutes(48);
			
		var diff = theDate - baseDate;
		var phase = diff / (this.synodic * this.msPerDay);
		phase *= 100;
		while ( phase > 100 ) phase -= 100;
		return phase;
	}
			
	this.getMoonPhase = function()
	{
		var today = new Date();
		var phasePercent = this.getMoonPhasePercent(today);
		var phase = Math.floor(phasePercent * .279);
		return phase;
		
	}
	
	this.getMoonPhaseName = function(phase)
	{
		if (phase==null) phase = this.getMoonPhase();
		return this.moonPhaseNames[phase];
	}
	
	this.convertTime = function(timeIn)
	{
		var timeIs = timeIn.split(" ")[0];
		var amPmIs = timeIn.split(" ")[1].toUpperCase();

		var timeHour   = timeIs.split(":")[0];
		var timeMinute = timeIs.split(":")[1];

		if (amPmIs == "AM" && timeHour == "12")
			return "00:" + timeMinute;
		else if (amPmIs == "PM" && timeHour == "12")
			return "12:" + timeMinute;
		else if (amPmIs == "PM")
			return (12 + Number(timeHour)) + ":" +  timeMinute;
		else
			return timeIs;	
	}
	
	this.isNight = function()
	{
		return (this.convertTime(this.lastFetchTime).split(":")[0] < 2 || this.convertTime(this.lastFetchTime).split(":")[0] > 15) ? true : false;
	}

	this.getNightTime = function()
	{
		try
		{
			var riseData = this.convertTime(xml.selectNode("/channel/yweather:astronomy").getAttribute("sunrise"));
			var setData  = this.convertTime(xml.selectNode("/channel/yweather:astronomy").getAttribute("sunset"));
			var curData  = this.convertTime(this.lastFetchTime);

			var curTime = new Date();
			curTime.setHours(curData.split(":")[0]);
			curTime.setMinutes(curData.split(":")[1]);

			var riseTime = new Date();
			riseTime.setHours(riseData.split(":")[0]);
			riseTime.setMinutes(riseData.split(":")[1]);
			
			var setTime = new Date();
			setTime.setHours(setData.split(":")[0]);
			setTime.setMinutes(setData.split(":")[1]);

			if (Number(setData.split(":")[0]) < Number(riseData.split(":")[0])) 
			{	
				if (curData.split(":")[0] < setData.split(":")[0])
					riseTime.setTime(riseTime.getTime() - (1000 * 60 * 60 * 24));
				else
					setTime.setTime(setTime.getTime() + (1000 * 60 * 60 * 24));
			}

			var theSet = setTime.getTime();
			var theRise = riseTime.getTime();
			var theCur = curTime.getTime();
			
			if (theCur > theRise && theCur < theSet)
				return false;
			else
				return true;
		}
		catch(e)
		{
			var dateNow = new Date();
			var hourStamp = dateNow.getHours();
			if ( hourStamp > 6 && hourStamp < 20 )
				return false;
			else
				return true;
		}
	}
}

CityWeather.prototype.synodic = 29.53058867;
CityWeather.prototype.msPerDay = 24 * 60 * 60 * 1000;
CityWeather.prototype.moonPhaseNames = [
	"New Moon", "New Moon",
	"Waxing Crescent", "Waxing Crescent", "Waxing Crescent", "Waxing Crescent",
	"First Quarter", "First Quarter", "First Quarter",
	"Waxing Gibbous", "Waxing Gibbous", "Waxing Gibbous", "Waxing Gibbous", "Waxing Gibbous",
	"Full Moon", "Full Moon",
	"Waning Gibbous", "Waning Gibbous", "Waning Gibbous", "Waning Gibbous",
	"Last Quarter", "Last Quarter", "Last Quarter",
	"Waning Crescent", "Waning Crescent", "Waning Crescent", "Waning Crescent",
	"New Moon"];

