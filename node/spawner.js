var fs = require('fs');

spawn = require('child_process').spawn;

if (process.argv.length < 3) {
	console.log('KaseLab v0.0.1\nUsage:'); 
	console.log('kaselab start background_alerts : start the background alerts process - notifies you of changes to a project you are subscribed to.');
	console.log('kaselab stop background_alerts : stop the background alerts process.');
}

if (process.argv[2] === 'start')
{
	if (process.argv[3] === 'background_alerts')
	{
		theProcess = spawn('nodejs', ['index.js'], {
		  detached: true,
		  stdio: ['ignore',1,2]
		});
		if (theProcess) {
			console.log("Started KaseLab background alerts.");
			// In this file, there's a lazily hard-coded link to ~/.kaselab.conf. It's done better in the other file :)
			// You'll need to run the program from ~ (your home directory) /kcc (i.e. ~/kcc/nodejs spawner.js)
			var conf_file = fs.readFileSync('../.kaselab.conf');
			var config = JSON.parse(conf_file);
			config.process = theProcess.pid;
			fs.writeFileSync('../.kaselab.conf', JSON.stringify(config));
			process.exit(0);
		}
		else {
			console.log("Could not start background alerts.");
		}
	}
}
if (process.argv[2] === 'stop')
{
	if (process.argv[3] === 'background_alerts') {
		var conf_file = fs.readFileSync('../.kaselab.conf'); // bad hardcoded link.
		var theConf = JSON.parse(conf_file);
		if (theConf.process) {
			try {
				process.kill(theConf.process, 'SIGTERM');
				delete theConf.process;
				fs.writeFileSync('../.kaselab.conf', JSON.stringify(theConf)); // another bad hardcoded link
				console.log('Stopping KaseLab background alerts.');
			} catch(err) {
				console.log('Error stopping the background alerts process.');
			}
		}
		else {
			console.log("KaseLab isn't currently showing background alerts.");
		}
	}
}

