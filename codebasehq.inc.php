<?php

class CodebaseHQAPI {
    function __construct($account, $user_name, $api_key) {
        $this->account = $account;
        $this->user_name = $user_name;
        $this->api_key = $api_key;
    }
    
    function base_url() {
        return 'http://api3.codebasehq.com';
    }
    
    function _get_request($full_path) {
        $process = curl_init($this->base_url() . $full_path);
        curl_setopt($process, CURLOPT_HTTPHEADER, array('Content-Type: application/xml', 'Accept: application/xml'));              
        curl_setopt($process, CURLOPT_HEADER, 0);           
        curl_setopt($process, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);                                                                
        curl_setopt($process, CURLOPT_USERPWD, $this->account .'/'. $this->user_name . ":" . $this->api_key);                                                
        curl_setopt($process, CURLOPT_TIMEOUT, 30);                                                                         
        //curl_setopt($process, CURLOPT_POST, 1);                                                                             
        //curl_setopt($process, CURLOPT_POSTFIELDS, $payloadName);                                                            
        curl_setopt($process, CURLOPT_RETURNTRANSFER, TRUE);                                                                
        $return = curl_exec($process);
        return $return;
    }
    
    function _parse_request($content) {
        return simplexml_load_string($content);
    }
    
    function _perform_request($full_path) {
        $content = $this->_get_request($full_path);
        return $this->_parse_request($this->_get_request($full_path));
    }
    
    function get_statuses($project) {
        return $this->_perform_request(sprintf('/%s/tickets/statuses', $project));
    }

    function get_priorities($project) {
        return $this->_perform_request(sprintf('/%s/tickets/priorities', $project));
    }

    function get_categories($project) {
        return $this->_perform_request(sprintf('/%s/tickets/categories', $project));
    }

    function get_milestones($project) {
        return $this->_perform_request(sprintf('/%s/milestones', $project));
    }

    function search_tickets($project, $query, $page = 1) {
        $params = 'query='. urlencode($query);
        if ($page > 1) {
            $params .= '&page='. $page;
        }
        return $this->_perform_request(sprintf('/%s/tickets?%s', $project, $params));        
    }
}