var statuses;
var milestones;
var categories = {};
var priorities = {};
var users = {};
var activeMilestones;
var currentMilestone;
var tickets = [];
var loaded = {};

function loadTickets(pageNumber, ticketStatus) {
    var ticketUrl = '/api.php?f=tickets&s=' + ticketStatus + '&q=' + escape(currentMilestone.name);
    if (pageNumber > 1) {
        ticketUrl = ticketUrl + '&p=' + pageNumber;
    }
    $.get(ticketUrl, function (data) {
        $.each(data.ticket, function(i, ticket) {
            tickets.push(ticket);
        });
        processTickets(pageNumber, ticketStatus, data.ticket.length);
    }, 'json');
}

function processTickets(pageNumber, ticketStatus, totalTickets) {
    var newTickets = 0;
    
    $.each(tickets, function(i, ticket) {
        if ($('#ticket-' + ticket['ticket-id']).size() == 0) {
            newTickets++;
            addTicket(ticket);
        }
    });
    
    countTickets();
    
    if ((totalTickets == 30) && (newTickets > 0)) {
        loadTickets(pageNumber + 1, ticketStatus);
    }
}

/* 
 * Parse the date for browser compatibility, see
 * http://stackoverflow.com/questions/4622732/new-date-using-javascript-in-safari
 */
function parseDate(input) {
	var parts = input.match(/(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)(Z|\+|-)((\d+):(\d+))?/);
	
	var timezoneOffset = 0;
	if (parts[7] == '+') {
	    timezoneOffset = -(parseInt(parts[9], 10) * 60 + parseInt(parts[10], 10));
    } else if (parts[7] == '-') {
    	timezoneOffset = parseInt(parts[9], 10) * 60 + parseInt(parts[10], 10);
    }
	return new Date(parts[1], parts[2]-1, parts[3], parts[4], parseInt(parts[5],10)+timezoneOffset-(new Date()).getTimezoneOffset(), parts[6]);
}

function calcTimeAgo(date) {
	// Date is returned as UTC time, so we have to add our TimezoneOffset as we live in UTC+1 (or +2 with DST)
	var minutesAgo = (new Date().getTime() - date.getTime()) / 60000;
	var timeAgo = new Array();
	if (minutesAgo > 24*60) {
	    timeAgo['long'] = Math.round(minutesAgo/24/60) + " days";
	    timeAgo['short'] = Math.round(minutesAgo/24/60) + "days";
    } else if (minutesAgo > 60) {
        timeAgo['long'] = Math.round(minutesAgo/60) + " hours";
        timeAgo['short'] = Math.round(minutesAgo/60) + "hrs";
    } else {
        timeAgo['long'] = Math.round(minutesAgo) + " minutes";
        timeAgo['short'] = Math.round(minutesAgo) + "min";
    }

	return timeAgo;
}

function addTicket(ticket) {
    var ticketTypeClass = 'ticket-default';
    var ticketCategory = categories[ticket['category-id']];
    var ticketPriority = priorities[ticket['priority-id']];
    var ticketId = 'ticket-' + ticket['ticket-id'];
    var gravatarHash = (users[ticket['assignee-id']] !== undefined) ? users[ticket['assignee-id']].hash : '';
    var userName = (users[ticket['assignee-id']] !== undefined) ? users[ticket['assignee-id']]['first-name'] + ' ' + users[ticket['assignee-id']]['last-name'] : '';
	var ticketSummary = (ticket.summary.length > 50) ? ticket.summary.substr(0, 50) + '...' : ticket.summary;
	var timeAgo = calcTimeAgo(parseDate(ticket['updated-at']));
	
	// change color for other repo's
	matches = ticketCategory.match(/^\s*(\w+)\s*[\-|\/]/);
	if (matches) {
	    ticketTypeClass = 'ticket-' + matches[1].toLowerCase();
	}
	
    $('#status-' + ticket['status-id']).append($('<div />').attr('id', ticketId).attr('class', 'ticket ' + ticketTypeClass).attr('style', 'border-top: 2px solid ' + ticketPriority.colour + ';'));	
    $('#' + ticketId).append($('<h3 />').attr('title', ticket.summary).text(ticketSummary));
    $('#' + ticketId).append($('<abbr class="age" title="updated '+timeAgo['long']+' ago">'+timeAgo['short']+'</abbr>'));
    $('#' + ticketId).append($('<a href="https://eduhub.codebasehq.com/projects/www/tickets/' + ticket['ticket-id'] + '" target="_blank" />').attr('class', 'ticket-link').text('#' + ticket['ticket-id']));
    if (gravatarHash != '') {
        $('#' + ticketId).append($('<img class="gravatar" src="http://www.gravatar.com/avatar/' + gravatarHash + '?s=32" title="' + userName + '" />'));
    }
}

function countTickets() {
    $('#overview').html('');
    var overviewList = $('<ul />');
    $.each(statuses, function (i, status) {
        var ticketCount = $('#status-' + status.id).find('.ticket').size();
        var overviewListItem = $('<li />');
        overviewListItem.append($('<a href="#status-' + status.id + '" />').text(status.name + '(' + ticketCount + ')'));
        overviewList.append(overviewListItem);
    });
    $('#overview').append(overviewList);
}

$(document).ready(function() {
    loaded.statuses = $.get('/api.php?f=statuses', function (data) {
        statuses = data['ticketing-status'];
        $.each(statuses, function(i, status) {
			var statusBox = $('<div class="status" />').attr('id', 'status-' + status.id).append($('<h2 />').attr('style', 'background-color: ' + status['colour'] ).text(status.name));
			var target = (status['treat-as-closed'] == 'true') ? '#closed' : '#open';
			$(target).append(statusBox);
        });
    }, 'json');
    
    loaded.users = $.get('/api.php?f=users', function (data) {
        $.each(data.user, function (i, user) {
            users[user.id] = user;
        });
    }, 'json');
    
    loaded.milestones = $.get('/api.php?f=milestones', function (data) {
        milestones = data['ticketing-milestone'];
        activeMilestones = $.grep(milestones, function(milestone, i) {
            return (milestone.status == 'active');
        });
        currentMilestone = activeMilestones[0];
    }, 'json');
    
    loaded.priorities = $.get('/api.php?f=priorities', function (data) {
        rawPriorities = data['ticketing-priority'];
        $.each(rawPriorities, function (i, priority) {
            priorities[priority.id] = priority;
        });
    }, 'json');
    
    loaded.categories = $.get('/api.php?f=categories', function (data) {
        rawCategories = data['ticketing-category'];
        $.each(rawCategories, function (i, category) {
            categories[category.id] = category.name;
        });
    }, 'json');

    $.when(loaded.statuses, loaded.users, loaded.milestones, loaded.priorities, loaded.categories)
        .done(function(){ loadTickets(1, 'open'); })
        .done(function(){ loadTickets(1, 'closed'); });
});