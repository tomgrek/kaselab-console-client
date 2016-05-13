# kaselab-console-client
Realtime push notifications to the terminal via REST/DDP, with Meteor and NodeJS

Skeleton working project for a ```terminal app``` (written with Node) that runs in the background of your console/terminal, receiving push notifications in realtime from a remote back-end written with Meteor. Has password & token based logins. Uses both REST and DDP protocols.

For more details, see [my blog post](http://tomgrek.com/post/node-meteor-console-app/).

To begin, run
```
nodejs spawner.js [start][stop] background_alerts
```
Add a new entry to the Mongo document 'Messages', with the user id of the user you created, and see the alert pop up.

The code isn't a full project of course, but demonstrates some tricky concepts I had to pull together to get something like this working. Honestly, the *hardest part* was frickin escape codes for the terminal, to get the alerts to display at the top of the screen without interrupting the user's typing. I did all this when starting work on my new communication-centric project management platform [KaseLab](https://kaselab.com).

