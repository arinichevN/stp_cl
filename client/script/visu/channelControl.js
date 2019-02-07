function VChannelControl() {
    this.type = VISU_TYPE.DIAL;
    this.container = null;
    this.nextB = null;
    this.prevB = null;
    this.startB = null;
    this.stopB = null;
    this.resetB = null;
    this.initialized = false;
    this.channel=null;
    this.interval=1000;
    this.style_enabled="dcb_enabled";
    this.style_disabled="dcb_disabled";
	this.ACTION =
	{
		NEXT_STEP: 1,
		PREV_STEP: 2,
		CHANNEL:{
			START:11,
			STOP:12,
			RESET:13
		}
	};
    this.init = function () {
        var self = this;
        this.container = cvis();
        this.nextB = new DoubleClickButton(this.interval, this.nextClick, self, this.style_enabled, this.style_disabled);
        this.prevB = new DoubleClickButton(this.interval, this.prevClick, self, this.style_enabled, this.style_disabled);
        this.startB = new DoubleClickButton(this.interval, this.startClick, self, this.style_enabled, this.style_disabled);
        this.stopB = new DoubleClickButton(this.interval, this.stopClick, self, this.style_enabled, this.style_disabled);
        this.resetB = new DoubleClickButton(this.interval, this.resetClick, self, this.style_enabled, this.style_disabled);
        var rpn = cd();
        a(rpn, [this.prevB, this.nextB]);
        a(this.container, [rpn, this.startB, this.stopB, this.resetB]);
      //  cla([this.startB], "pre_header");
        this.initialized = true;
    };
    this.getName = function () {
        return trans.get(312);
    };
    this.updateStr = function () {
        this.heaterH.innerHTML = trans.get(315);
        this.coolerH.innerHTML = trans.get(316);
        this.cancelB.innerHTML = trans.get(5);
        this.applyB.innerHTML = trans.get(2);
    };
    this.nextClick=function(me){
		var data = [
			{
				action: ['stp', 'next_step'],
				param: {address: me.channel.peer.address, port: me.channel.peer.port, item: [me.channel.id]}
			}
		];
		sendTo(me, data, me.ACTION.NEXT_STEP, 'json_udp_acp');
		goBack();
	};
	this.prevClick=function(me){
		var data = [
			{
				action: ['stp', 'prev_step'],
				param: {address: me.channel.peer.address, port: me.channel.peer.port, item: [me.channel.id]}
			}
		];
		sendTo(me, data, me.ACTION.PREV_STEP, 'json_udp_acp');
		goBack();
	};
	this.startClick=function(me){
		var data = [
			{
				action: ['channel', 'enable'],
				param: {address: me.channel.peer.address, port: me.channel.peer.port, item: [me.channel.id]}
			}
		];
		sendTo(me, data, me.ACTION.CHANNEL.START, 'json_udp_acp');
		goBack();
	};
	this.stopClick=function(me){
		var data = [
			{
				action: ['channel', 'disable'],
				param: {address: me.channel.peer.address, port: me.channel.peer.port, item: [me.channel.id]}
			}
		];
		sendTo(me, data, me.ACTION.CHANNEL.STOP, 'json_udp_acp');
		goBack();
	};
	this.resetClick=function(me){
		var data = [
			{
				action: ['channel', 'reset'],
				param: {address: me.channel.peer.address, port: me.channel.peer.port, item: [me.channel.id]}
			}
		];
		sendTo(me, data, me.ACTION.CHANNEL.RESET, 'json_udp_acp');
		goBack();
	};
	this.confirm = function (action, d, dt_diff) {
		switch (action) {
			case this.ACTION.NEXT_STEP:
			case this.ACTION.PREV_STEP:
			case this.ACTION.CHANNEL.START:
			case this.ACTION.CHANNEL.STOP:
			case this.ACTION.CHANNEL.RESET:
				break;
			default:
				console.log("confirm(): unknown action: ", action);
				break;
		}
	};
	this.abort = function (action, m, n) {
		switch (action) {
			case this.ACTION.NEXT_STEP:
			case this.ACTION.PREV_STEP:
			case this.ACTION.CHANNEL.START:
			case this.ACTION.CHANNEL.STOP:
			case this.ACTION.CHANNEL.RESET:
			    logger.fail();
				break;
			default:
				console.log("abort(): unknown action: ", action);
				break;
		}
	};
	this.prep=function(channel){
		this.channel=channel;
	};
    this.show = function () {
        clr(this.container, "hdn");
    };
    this.hide = function () {
        cla(this.container, "hdn");
    };
}
var vchannel_control = new VChannelControl();
visu.push(vchannel_control);
