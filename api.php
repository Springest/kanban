<?php

include_once 'settings.php';
include_once 'codebasehq.inc.php';

$cb =& new CodeBaseHQAPI($codebaseAccount, $codebaseUser, $codebaseApikey);

$what = $_GET['f'];

if ($what == 'milestones') {
    $milestones = $cb->get_milestones($codebaseMainProject);
    echo json_encode($milestones);
}

if ($what == 'statuses') {
    $statuses = $cb->get_statuses($codebaseMainProject);
    echo json_encode($statuses);
}

if ($what == 'tickets') {
    $tickets = $cb->search_tickets($codebaseMainProject, sprintf('sort:priority milestone:"%s"', $_GET['q']), $_GET['p']);
    echo json_encode($tickets);
}