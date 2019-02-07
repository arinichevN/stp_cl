function ChartWrapper(yAxisLable, delay_send_usec, retry_count) {
    this.container = cd();
	this.canvas=c('canvas');
	var timeFormat = 'MM/DD/YYYY HH:mm:s';
	this.delay_send_usec=delay_send_usec;
	this.retry_count=retry_count;
	this.active=false;
	this.fast=false;
	this.cretry=0;
    this.ACTION =
		{
			GET_NEXT: 1,
			GET_LAST: 2
		};
	var colors = {
		red: 'rgb(255, 99, 132)',
		orange: 'rgb(255, 159, 64)',
		yellow: 'rgb(255, 205, 86)',
		green: 'rgb(75, 192, 192)',
		blue: 'rgb(54, 162, 235)',
		purple: 'rgb(153, 102, 255)',
		grey: 'rgb(201, 203, 207)'
	};
	var newColor = colors['green'];
	var color = Chart.helpers.color;
    this.config = {
			type: 'line',
			data: {
				labels: [ // Date Objects
					
				],
				datasets: [
					{
						//label: "",
						borderColor: newColor,
						backgroundColor: color(newColor).alpha(0.5).rgbString(),
						fill: false,
						data: [],
					}
				]
			},
			options: {
				title: {
					text: 'Chart.js Time Scale'
				},
				scales: {
					xAxes: [{
						type: 'time',
						time: {
							parser: timeFormat,
							// round: 'day'
							tooltipFormat: 'll HH:mm'
						},
						scaleLabel: {
							display: true,
							labelString: 'Date'
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: yAxisLable
						},
						ticks: {
							min: 0,
							max: 60
						}
					}]
				},
			}
	};

	this.chart=new Chart(this.canvas,this.config);
	//{id:1,description:'dfdf', mark:455455, value:20.5}
	
    this.update=function(){
		this.chart.update();
	};
	this.click=function(){
		;
	};
	this.getMaxMark=function(arr){
		var mark=0;
		for(var i=0;i<arr.length;i++){
			if(arr[i].x > mark){
				mark=arr[i].x;
			}
		}
		return mark;
	};
	this.getNext= function () {
		if(!this.active) {return;}
		var max_mark=this.getMaxMark(this.config.data.datasets.data);
		var data = [
			{
				action: ['lgr', 'get_next_item'],
				param: {address: this.channel.peer.address, port: this.channel.peer.port, item: [{p0: this.channel.id, p1: max_mark/1000}]}
			}
		];
		sendTo(this, data, this.ACTION.GET_NEXT, 'json_udp_acp');
    };
	this.getLast = function () {
		if(!this.active) {return;}
		var data = [
			{
				action: ['lgr', 'get_last_item'],
				param: {address: this.channel.peer.address, port: this.channel.peer.port, item: [this.channel.id]}
			}
		];
		sendTo(this, data, this.ACTION.GET_LAST, 'json_udp_acp');
    };
	this.delayGetLast = function () {
		var self = this;
		this.tmr1.tmr = window.setTimeout(function () {
			self.getLast();
		}, this.delay_send_usec);
    };
    this.enable=function(){
		this.active=true;
		this.cretry=0;
		cleara(this.config.data.datasets.data);
		this.getNext();
	};
	this.disable=function(){
		this.active=false;
		clearTmr(this.tmr1);
	};
    this.confirm = function (action, d, dt_diff) {
		switch (action) {
			case this.ACTION.GET_NEXT:
			    this.cretry=0;
				if(d.length<=0){
					this.chart.update();
					this.delayGetLast();
					break;
				}
				for(var i=0;i<d.length;i++){
					var id:parseInt(d[i].id);
					var mark=parseInt(d[i].mark_sec)*1000;
					var value=parseFloat(d[i].value);
					var state=parseInt(d[i].state);
					if(!(isNaN(id) || isNaN(mark) || isNaN(value) || isNaN(state)) && state === 1 && id === this.channel.id){
						this.config.data.datasets.data.push({x: mark, y: value});
					}else{
						console.log("confirm(): bad data");
					}
				}
				this.getNext();
				break;
			case this.ACTION.GET_LAST:
				var success=false;
				for(var i=0;i<d.length;i++){
					var id:parseInt(d[i].id);
					var mark=parseInt(d[i].mark_sec)*1000;
					var value=parseFloat(d[i].value);
					var state=parseInt(d[i].state);
					if(!(isNaN(id) || isNaN(mark) || isNaN(value) || isNaN(_state)) && state === 1 && id === this.channel.id){
						this.config.data.datasets.data.push({x: mark, y: value});
						success=true;
					}
				}
				if(success){this.chart.update();}
				this.delayGetLast();
				break;
			default:
				console.log("confirm(): unknown action: ", action);
				break;
         }
	};
	this.abort = function (action, m, n) {
		switch (action) {
			case this.ACTION.GET_NEXT:
				if(this.cretry<this.retry_count){
					this.cretry++;
					this.getNext();
				}else{
					this.chart.update();
					this.delayGetLast();
				}
				break;
			case this.ACTION.GET_LAST:
				this.delayGetLast();
				break;
			default:
				console.log("abort(): unknown action: ", action);
			break;
		}
	};
    a(this.container, [this.canvas]);
    cla(this.container, ["canvas_container"]);
    cla(this.canvas, ["canvas"]);
    var self = this;
    this.container.onclick = function () {
        self.click();
    };
}
