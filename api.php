<?php

include_once 'settings.php';
include_once 'codebasehq.inc.php';

$cb = new CodeBaseHQAPI($codebaseAccount, $codebaseUser, $codebaseApikey);

$what = $_GET['f'];

if ($what == 'categories') {
    $categories = $cb->get_categories($codebaseMainProject);
    echo json_encode($categories);
}

if ($what == 'milestones') {
    $milestones = $cb->get_milestones($codebaseMainProject);
    echo json_encode($milestones);
}

if ($what == 'statuses') {
    $statuses = $cb->get_statuses($codebaseMainProject);
    echo json_encode($statuses);
}

if ($what == 'priorities') {
    $priorities = $cb->get_priorities($codebaseMainProject);
    echo json_encode($priorities);    
}

if ($what == 'users') {
    $users = $cb->get_users($codebaseMainProject);
    foreach($users->user as $user) {
        $f = "email-address";
        $user->hash = md5(strtolower(trim($user->$f)));
    }
    echo json_encode($users);
}

if ($what == 'tickets') {
    $status = isset($_GET['s']) ? $_GET['s'] : 'open';
    $tickets = $cb->search_tickets($codebaseMainProject, sprintf('sort:priority status:%s milestone:"%s"', $status, $_GET['q']), $_GET['p']);
    echo json_encode($tickets);
}