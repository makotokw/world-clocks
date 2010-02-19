
//
// Widget Abstract Layer for Yahoo Widget
// Copyright 2006 kw
// 

function WidgetAbstractLayer()
{
	// system
	this.system = new WidgetAbstractLayerSystem();
	
	// windows COM
	this.COM = new WidgetAbstractLayerCOM();
	
	// 
	// global function
	// 
	this.print = function(str)
	{
		return print(str);
	}
	
	this.appleScript = function(str)
	{
		return appleScript(str);
	}
	
	this.alert = function(msg, button1, button2, button3)
	{
		if (button3)
			return alert(msg, button1, button2, button3);
		if (button2)
			return alert(msg, button1, button2);
		if (button1)
			return alert(msg, button1);
		return alert(msg);
	}
		
	this.isApplicationRunning = function(str)
	{
		return isApplicationRunning(str);
	}
	
	this.runCommand = function(str)
	{
		return runCommand(str);
	}
}

function WidgetAbstractLayerSystem()
{
	this.getPlatform = function()
	{
		return system.platform;
	}
		
	this.getMenuSeparatorTitle = function()
	{
		if (system.platform == "macintosh")
			return "(-";
		else if (system.platform == "windows")
			return "-";
		return "";
	}
}

function WidgetAbstractLayerCOM()
{
	this.connectObject = function(object, prefix)
	{
		return COM.connectObject(object,prefix);
	}
	
	this.createObject = function(guid)
	{
		return COM.createObject(guid);
	}
	
	this.disconnectObject = function(object)
	{
		return COM.disconnectObject(object);
	}
}

wal = new WidgetAbstractLayer();

