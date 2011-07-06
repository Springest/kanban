var statuses;
var milestones;
var priorities = {};
var users = {};
var activeMilestones;
var currentMilestone;
var tickets = [];

function loadTickets(pageNumber) {
    var ticketUrl = '/api.php?f=tickets&q=' + escape(currentMilestone.name);
    if (pageNumber > 1) {
        ticketUrl = ticketUrl + '&p=' + pageNumber;
    }
    $.get(ticketUrl, function (data) {
        $.each(data.ticket, function(i, ticket) {
            tickets.push(ticket);
        });
        processTickets(pageNumber, data.ticket.length);
    }, 'json');
}

function processTickets(pageNumber, totalTickets) {
    var newTickets = 0;
    
    $.each(tickets, function(i, ticket) {
        if ($('#ticket-' + ticket['ticket-id']).size() == 0) {
            newTickets++;
            addTicket(ticket);
        }
    });
    
    countTickets();
    
    if ((totalTickets == 30) && (newTickets > 0)) {
        loadTickets(pageNumber + 1);
    }
}

function addTicket(ticket) {
    var ticketPriority = priorities[ticket['priority-id']];
    var ticketId = 'ticket-' + ticket['ticket-id'];
    var gravatarHash = (users[ticket['assignee-id']] !== undefined) ? users[ticket['assignee-id']].hash : '';
    var userName = (users[ticket['assignee-id']] !== undefined) ? users[ticket['assignee-id']]['first-name'] + ' ' + users[ticket['assignee-id']]['last-name'] : '';
	var ticketSummary = (ticket.summary.length > 50) ? ticket.summary.substr(0, 50) + '...' : ticket.summary;
	var minutesAgo = (new Date().getTime() - new Date(ticket['updated-at']).getTime()) / 60000;
	var ageLong, ageShort;
	if (minutesAgo > 24*60) {
	    ageLong = Math.round(minutesAgo/24/60) + " days";
	    ageShort = Math.round(minutesAgo/24/60) + " days";
    } else if (minutesAgo > 60) {
        ageLong = Math.round(minutesAgo/60) + " hours";
        ageShort = Math.round(minutesAgo/60) + " hrs";
    } else {
        ageLong = Math.round(minutesAgo) + " minutes";
        ageShort = Math.round(minutesAgo) + " min";
    }
    
    $('#status-' + ticket['status-id']).append($('<div />').attr('id', ticketId).attr('class', 'ticket').attr('style', 'border-top: 2px solid ' + ticketPriority.colour + ';'));	
    $('#' + ticketId).append($('<h3 />').attr('title', ticket.summary).text(ticketSummary));
    $('#' + ticketId).append($('<abbr class="age" title="updated '+ageLong+' ago">'+ageShort+'</abbr>'));
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
    $.get('/api.php?f=statuses', function (data) {
        statuses = data['ticketing-status'];

        $.each(statuses, function(i, status) {
			var statusBox = $('<div class="status" />').attr('id', 'status-' + status.id).append($('<h2 />').attr('style', 'background-color: ' + status['colour'] ).text(status.name));
			var target = (status['treat-as-closed'] == 'true') ? '#closed' : '#open';
			$(target).append(statusBox);
        });
        
        $.get('/api.php?f=users', function (data) {
            $.each(data.user, function (i, user) {
                users[user.id] = user;
            });
            
            $.get('/api.php?f=milestones', function (data) {
                milestones = data['ticketing-milestone'];
                activeMilestones = $.grep(milestones, function(milestone, i) {
                    return (milestone.status == 'active');
                });
                currentMilestone = activeMilestones[0];
                
                $.get('/api.php?f=priorities', function (data) {
                    rawPriorities = data['ticketing-priority'];
                    
                    $.each(rawPriorities, function (i, priority) {
                        priorities[priority.id] = priority;
                    });
                    
                    loadTickets(1);
                }, 'json');                
            }, 'json');            
        }, 'json');
        
    }, 'json');    
});