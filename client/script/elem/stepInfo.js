function stepInfo(channel, delay_send_usec) {
    this.container = cd();
    this.active = false;
    this.tmr1 = {tmr: null};
    this.channel=channel;
    this.delay_send_usec=delay_send_usec;
    this.ACTION =
		{
			GET_INFO: 1
		};
	this.idE=cd();
    this.goalE=cd();
    this.rtimeE=cd();
    this.htimeE=cd();
    this.rgoalE=cd();
    this.lrtimeE=cd();
    this.lhtimeE=cd();
    this.stateE=cd();
    this.RETRY = 7;
    this.uf_count = 0;//number of bad updates
    this.updateStr = function () {
		;
    };
    this.blink = function (style) {
        cla(this.container, style);
        var self = this;
        var tmr = window.setTimeout(function () {
            self.unmark(style);
        }, 300);
    };
    this.unmark = function (style) {
        clr(this.container, style);
    };
    this.checkData=function(){
		var f=true;
		if (typeof v[0].channel_id === 'undefined'){
			console.log("undefinded channel_id");
			f=false;
		}
				if (typeof v[0].id === 'undefined'){
			console.log("undefinded id");
			f=false;
		}
		if (typeof v[0].goal === 'undefined'){
			console.log("undefinded goal");
			f=false;
		}
		if (typeof v[0].rtime === 'undefined'){
			console.log("undefinded reach time");
			f=false;
		}
		if (typeof v[0].htime === 'undefined'){
			console.log("undefinded hold time");
			f=false;
		}
		if (typeof v[0].state === 'undefined'){
			console.log("undefinded state");
			f=false;
		}
		if (typeof v[0].rgoal === 'undefined'){
			console.log("undefinded runtime goal");
			f=false;
		}
		if (typeof v[0].lrtime === 'undefined'){
			console.log("undefinded reach time rest");
			f=false;
		}
		if (typeof v[0].lhtime === 'undefined'){
			console.log("undefinded hold time rest");
			f=false;
		}
		if(!f){
			return f;
		}
		if (parseInt(v[0].channel_id) !== this.channel_id){
			console.log("bad channel_id");
			f=false;
		}
		
		
	};
    this.update = function (v) {
		var success=true;
		if (typeof v[0].id === 'undefined' || typeof v[0].goal === 'undefined' || typeof v[0].rtime === 'undefined' || typeof v[0].htime === 'undefined' || typeof v[0].state === 'undefined' || typeof v[0].rgoal === 'undefined' || typeof v[0].lrtime === 'undefined' || typeof v[0].lhtime === 'undefined') {
			console.log("update(): undefinded id or state");
			success=false;
		}
		if(success && parseInt(d[0].id)!==this.channel.id){
			console.log("update(): bad id");
			success=false;
		}
		if (success && value === null) {
			console.log("update(): value is null");
			success=false;
		}
		if(!success){
			if (this.uf_count > this.RETRY) {
	            this.container.innerHTML = '&empty;';
				cla(this.container, 'mn_dis');
            } else {
                this.uf_count++;
            }
            this.blink('mn_updatedf');
		}else{
	        this.container.innerHTML = value.state;
            this.uf_count = 0;
            clr(this.container, 'mn_dis');
            this.blink('mn_updated');
		}
     
    };
	this.sendGetData = function () {
		var data = [
			{
				action: ['stp', 'get_cstep_info'],
				param: {address: this.channel.peer.address, port: this.channel.peer.port, item: [this.channel.id]}
			}
		];
		sendTo(this, data, this.ACTION.GET_STATE, 'json_udp_acp');
    };
	this.delaySend = function () {
		if (this.active) {
			var self = this;
			this.tmr1.tmr = window.setTimeout(function () {
				self.sendGetData();
			}, this.delay_send_usec);
		}
    };
    this.enable=function(){
		this.active=true;
		this.delaySend();
	};
	this.disable=function(){
		this.active=false;
		clearTmr(this.tmr1);
	};
    this.confirm = function (action, d, dt_diff) {
		switch (action) {
			case this.ACTION.GET_INFO:
				this.update(d[0]);
				this.delaySend();
				break;
			default:
				console.log("confirm: unknown action: ", action);
				break;
         }
	};
	this.abort = function (action, m, n) {
		switch (action) {
			case this.ACTION.GET_INFO:
				this.update(null);
				this.delaySend();
				break;
			default:
				console.log("abort: unknown action: ", action);
			break;
		}
	};
	var rcont1=cd();
	var rcont2=cd();
	a(rcont1, [this.idE, this.goalE,this.rtimeE,this.htimeE]);
	a(rcont2,[this.stateE,this.rgoalE,this.lrtimeE,this.lhtimeE]);
	a(this.container,[rcont1,rcont2]);
    cla(this.container, ["mn_block", "select_none", "mn_dis"]);
}
