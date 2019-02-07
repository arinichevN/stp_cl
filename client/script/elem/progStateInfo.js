function ProgStateInfo(channel, delay_send_usec) {
    this.container = cd();
    this.active = false;
    this.tmr1 = {tmr: null};
    this.channel=channel;
    this.delay_send_usec=delay_send_usec;
    this.ACTION =
		{
			GET_STATE: 1
		};
    this.container.innerHTML = '&empty;';
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
    this.update = function (value) {
		var success=true;
		if (typeof d[0].id === 'undefined' || typeof d[0].state === 'undefined') {
			console.log("stateButton:update(): undefinded id or state");
			success=false;
		}
		if(success && parseInt(d[0].id)!==this.channel.id){
			console.log("stateButton:update(): bad id");
			success=false;
		}
		if (success && value === null) {
			console.log("stateButton:update(): value is null");
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
	this.sendGetState = function () {
		var data = [
			{
				action: ['channel', 'get_state'],
				param: {address: this.channel.peer.address, port: this.channel.peer.port, item: [this.channel.id]}
			}
		];
		sendTo(this, data, this.ACTION.GET_STATE, 'json_udp_acp');
    };
	this.delaySend = function () {
		if (this.active) {
			var self = this;
			this.tmr1.tmr = window.setTimeout(function () {
				self.sendGetState();
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
			case this.ACTION.GET_STATE:
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
			case this.ACTION.GET_STATE:
				this.update(null);
				this.delaySend();
				break;
			default:
				console.log("confirm: unknown action: ", action);
			break;
		}
	};
    cla(this.container, ["mn_block", "select_none", "mn_dis"]);
}
