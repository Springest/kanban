var statuses;
var milestones;
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
        if (data.ticket.length == 30) {
            loadTickets(pageNumber + 1);
        }
        processTickets();
    }, 'json');
}

function processTickets() {
    $.each(tickets, function(i, ticket) {
        if ($('#ticket-' + ticket['ticket-id']).size() == 0) {
            addTicket(ticket);
        }
    });
    countTickets();
}

function addTicket(ticket) {
    var ticketId = 'ticket-' + ticket['ticket-id'];
    var gravatarHash = (users[ticket['assignee-id']] !== undefined) ? users[ticket['assignee-id']].hash : '';
    var userName = (users[ticket['assignee-id']] !== undefined) ? users[ticket['assignee-id']]['first-name'] + ' ' + users[ticket['assignee-id']]['last-name'] : '';
	var ticketSummary = (ticket.summary.length > 50) ? ticket.summary.substr(0, 50) + '...' : ticket.summary;
    $('#status-' + ticket['status-id']).append($('<div />').attr('id', ticketId).attr('class', 'ticket'));	
    $('#' + ticketId).append($('<h3 />').attr('title', ticket.summary).text(ticketSummary));
    $('#' + ticketId).append($('<a href="https://eduhub.codebasehq.com/projects/www/tickets/' + ticket['ticket-id'] + '" target="_blank" />').attr('class', 'ticket-link').text('#' + ticket['ticket-id']));
    $('#' + ticketId).append($('<div class="ticket-priority" />').text(ticket.priority));
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
                loadTickets(1);
            }, 'json');            
        }, 'json');
        
    }, 'json');    
});