const Command = require('command')

module.exports = function raidattempts(dispatch) {
	const command = Command(dispatch);
	var runs = [],
		names = [],
		time = 0,
		boss_hp = 0,
		n = 0,
		t = 0,
		timer_is_on = 0,
		target = null,
		run_started = false
		

//Array Function


	function parseRun() {
		// Do Stuff
		var run = {name: "", time: 0, hp: 0};
			run.name = names;
			run.time = time;
			run.hp = boss_hp;
		runs.push(run);
	}
	

//Timer


	function timedCount() {
		time = time + 1
		t = setTimeout(function(){timedCount()}, 1000);
	}
	function startCount() {
		if (!timer_is_on) {
			timer_is_on = 1;
			timedCount();
		}
	}
	function stopCount() {
		clearTimeout(t);
		timer_is_on = 0;
	}
  

//Start and Stop


	function startRun() {
		startCount();
		command.message('Run number ' + (n+1) + ' started.');
		run_started = !run_started;
	}
	function stopRun() {
		stopCount();
		parseRun();
		command.message('Elapsed Time: ' + time + ' sec. Boss HP: ' + boss_hp + '%. Run number ' + (n+1) + ' finished.');
		time = 0;
		n++;
		run_started = !run_started;
		target = null;
	}
  

//Main Hooks

	//start run
	dispatch.hook('S_USER_STATUS', 1, (event) => {
		if ((event.status == 1) && (!run_started) && (target != null)){
			startRun();
		}
	})

	//stop run
	// boss detection
	dispatch.hook('S_NPC_TARGET_USER', 1, (event) => {
		//getting boss ID
		if(!run_started){
			target = event.target
		}
		//boss detarget ID = original boss ID
		else if ((JSON.stringify(event.target) == JSON.stringify(target)) && (event.status == 0) && (run_started)) {
			stopRun();
		}
	})
	//getting boss hp
	dispatch.hook('S_BOSS_GAGE_INFO', 1, (event) => {
		//if(JSON.stringify(event.target) == JSON.stringify(target)){
			boss_hp = Math.round((event.curHp/event.maxHp)*100);
		//}
	})
	//getting party members
	dispatch.hook('S_PARTY_MEMBER_LIST', 1, (event) => {
		names = event.members.map(function(a) { return a["name"]; });
	})
  

//Commands

	command.add('startrun', () => {
		startRun();
	})
	command.add('stoprun', () => {
		stopRun();
	})
	command.add('printruns', () => {
		command.message(runs);
	})
	command.add('raidmembers', () => {
		command.message('Current raid members \n' + names)
	})
	command.add('raidattendace', () => {
		command.message('Everyone is present')
		command.message('You are missing')
	})
	command.add('uploadraid', () => {
		command.message('Uploaded raid data')
	})
	//run.partyArray = event.members.map(function(a) { return a["name"]; });
}
