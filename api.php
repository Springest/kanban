<?php

include_once 'codebasehq.inc.php';

$cb =& new CodeBaseHQAPI('eduhub', 'breyten', 'lykje2p55l2dgew4fnfkndtv4inqkscu8dpv77x3');

//$return = $cb->search_tickets('www', 'sort:status milestone:"April 29"');
//echo json_encode($return);

$what = $_GET['f'];

if ($what == 'milestones') {
    $milestones = $cb->get_milestones('www');
    echo json_encode($milestones);
}

if ($what == 'statuses') {
    $statuses = $cb->get_statuses('www');
    echo json_encode($statuses);
}

if ($what == 'tickets') {
    $tickets = $cb->search_tickets('www', sprintf('milestone:"%s"', $_GET['q']), $_GET['p']);
    echo json_encode($tickets);
}