var statuses;
var milestones;
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
}

function addTicket(ticket) {
    var ticketId = 'ticket-' + ticket['ticket-id'];
    $('#status-' + ticket['status-id']).append($('<div />').attr('id', ticketId).attr('class', 'ticket'));
    $('#' + ticketId).append($('<h3 />').text(ticket.summary)).append($('<div class="ticket-link" />').append($('<a href="https://eduhub.codebasehq.com/www/tickets/' + ticket['ticket-id'] + '">#' + ticket['ticket-id'] + '</a>')));
    $('#' + ticketId).append($('<div class="ticket-priority" />').text(ticket.priority));
}

$(document).ready(function() {
    $.get('/api.php?f=statuses', function (data) {
        statuses = data['ticketing-status'];
        $.each(statuses, function(i, status) {
            var status_class = (status['treat-as-closed'] == 'true') ? 'status-horizontal' : 'status-vertical';
            $('#statuses').append($('<div class="status ' + status_class + '" />').attr('id', 'status-' + status.id).append($('<h2 style="background: '+ status['background-colour'] + ';" />').text(status.name)));
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
});