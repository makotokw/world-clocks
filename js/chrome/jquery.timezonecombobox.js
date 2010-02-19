/*!
	jQuery.timezonecombobox - Timezone ComboBox for jQuery
	
	jQuery plugin for allowing the user to visually determine the offset of its local time (in seconds) relative to UTC.

	uses:
		- jquery
		-	jquery.timers

	example:
		<html>
			<head>
				<script type='text/javascript'>
					$(function() {
						$('#example').timezoneComboBox();
					});
				</script>
			</head>
			<body>
				<div id='example' ></div>
			</body>
		</html>

	return with submit form:
		'timezone_offset' if jQuery object contains one element; otherwise 'id_timezone_offset'

	options:
		refreshTime - refresh time, milliseconds (default: 1s)
		isHidden		-	hide widget

	\brief		Computes timezone offset (seconds)
	\licence	http://www.gnu.org/licenses/lgpl-3.0.txt	
	\author		manifest
*/

(function($) {

	var defaults = {
		refreshTime: 60000,
		isHidden: false
	};
  
	$.fn.timezoneComboBox = function(opt) {
		
		var options = $.extend({}, defaults, opt);
		var length = $(this).length;
	
		if(length > 1)
			var idAsPrefix_ = true;
		else
			var idAsPrefix_ = false;

		this.each(function(element) {
		
			if(this.id)
				var id_ = this.id;
			else
				var id_ = 'timezoneComboBox';
			
			var privateElement = document.getElementById(id_internal());
			if(!privateElement)
				$(id_external_full()).html(timezoneComboBoxHtml());

			$().everyTime(options.refreshTime, function() {
				updateTimezoneComboBox();
			});

			return this;

			function id_external_full() { return '#' + id_; }
			function id_internal_full() { return '#' + id_internal(); }
			function id_internal() { return id_ + 'Private'; }
			
			function updateTimezoneComboBox()
			{
				var index = document.getElementById(id_internal()).selectedIndex;
				$(id_internal_full()).replaceWith(timezoneComboBoxHtml(index));
			}

			function timezoneComboBoxHtml(selectedIndex)
			{
				function addMilliseconds(time, ms)
				{
					return time.setMilliseconds(time.getMilliseconds() + ms);
				}

				function optionTimeFormat(time)
				{
					var minutes = time.getUTCMinutes();
					if(minutes < 10)
						minutes = '0' + minutes;
					
					return time.getUTCHours() + ':' + minutes;
				}

				function optionText(time, zone, sign)
				{
					return optionTimeFormat(time) + ' (UTC '+ sign + optionTimeFormat(zone) + ')';
				}

				function option(value, text, isSelected)
				{
					isSelected = isSelected?'selected':'';
					return '<option ' + isSelected + ' value=' + value  + '>' + text + '</option>';
				}

				function name()
				{
					var value = 'timezone_offset';

					if(idAsPrefix_ == false)
						return value;
					else
						return id_ + '_' + value;
				}

				function expectedOffset()
				{
					var d = new Date();
					return -d.getTimezoneOffset()*60;
				}

				function formHidden()
				{
					return '<input type="hidden" id=' + id_internal() + ' name= ' + name() + ' value=' + expectedOffset() + ' >';
				}

				function formComboBox()
				{
					var index = 0;
					var h12 = 12*60*60*1000;
					var m30sec = 30*60;
					var m30 = m30sec*1000;
					var zone = new Date(h12 + m30);
					var tmp = new Date();
					var utc = tmp.valueOf();
					var end = utc.valueOf() + h12;
					var offset = -m30sec * 24;

					addMilliseconds(tmp, -(h12 + m30));
					if(!selectedIndex)
						selectedIndex = 24 + parseInt(expectedOffset()/m30*1000);

					form = '<select id=' + id_internal() + ' name=' + name() + ' >';
					while((time = addMilliseconds(tmp, m30)) <= end)
					{
						if(index == selectedIndex) isSelected = true;
						else isSelected = false;
								
						switch(time)
						{
							case utc:
								addMilliseconds(zone, -m30);
								form += option(offset, optionTimeFormat(tmp) + ' (UTC)', isSelected);
								break;
							default:
								if(time < utc)
								{
									addMilliseconds(zone, -m30);
									form += option(offset, optionText(tmp, zone, '-'), isSelected);
								}
								else
								{
									addMilliseconds(zone, +m30);
									form += option(offset, optionText(tmp, zone, '+'), isSelected);
								}
						};
						offset += m30sec;
						++index;
					}
					form += '</select>';
					return form;
				}

				if(options.isHidden)
					return formHidden();
				else
					return formComboBox();
			}
		});
	};
})(jQuery);
