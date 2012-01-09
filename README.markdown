Kanban Board for Codebase ( www.codebasehq.com ) milestones. Example: https://img.skitch.com/20110421-nyyty951c1qr7ttqj2623wujdy.png
======

This is a small project to display your tickets in Codebase ( www.codebasehq.com ) in Kanban style.

Installation
------------

After checking out the code repsitory, you need to copy the settings.example.php to settings.php and edit that file with the appropriate config data. You crrently need to specify 4 configuration options:

* /$codebaseAccount/ This is the Codebase account you use. Not your username, by the way.
* /$codebaseUser/ This is the username, used for authentication with the Codebase API. The user must have adminitration privileges, otherwise the kanban board will not work.
* /$codebaseApikey/ This is the API Key, also used for authentication.
* /$codebaseMainProject/ The simple name of the project for which you want to show the kanban board

This should be all the configuration you need.

Kanban is just plain PHP and Javascript. Just upload the files to your server and you're done!

Usage
-----

You can control the columns through Codebase. For every possible status a column will be created. You can control the ordering of the columns also via Codebase. If a status is treated as if the ticket was closed, then the column will use the full width of the page, otherwise the columns will have a fixed width.

Currently, the kanban board will use the first active milestone it can find.

Contact
-------

If you want to know more, have questions etc. please contact us at developers@springest.nl
Please note that we don't actively maintain this tool anymore, as we've switched to GitHub and are now a new Kanban board which is not open-sourced yet.
