function VisMonitor() {
    this.type = VISU_TYPE.MAIN;
    this.container = {};
    this.sensor = [
        {name: '1', peer_id: 'obj_1', remote_id: 1, mu: "&deg;C", group_id: 1},
        {name: '1', peer_id: 'obj_1', remote_id: 2, mu: "&deg;C", group_id: 1},
        {name: '1', peer_id: 'obj_1', remote_id: 3, mu: "&deg;C", group_id: 1},
        {name: '1', peer_id: 'obj_1', remote_id: 4, mu: "&deg;C", group_id: 1}
    ];
    this.data = [
        {name: "канал 1", mu: "&deg;C", peer_id: 'reg_1', prog_id: 1, group_id: 1},
        {name: "канал 2", mu: "&deg;C", peer_id: 'reg_1', prog_id: 2, group_id: 2},
        {name: "канал 3", mu: "&deg;C", peer_id: 'reg_1', prog_id: 3, group_id: 3},
        {name: "канал 4", mu: "&deg;C", peer_id: 'reg_1', prog_id: 4, group_id: 4}
    ];
    this.peer = [
        {id: 'reg_1', address: '127.0.0.1', port: 49176, timeout: 3, name: "регулятор 1"},
        {id: 'obj_1', address: '192.168.0.103', port: 49176, timeout: 3, name: "регулятор 2"}
    ];
    this.group = [
        {id: 1, name: 'регулятор1_канал1'},
        {id: 2, name: 'регулятор1_канал2'},
        {id: 3, name: 'регулятор1_канал3'},
        {id: 4, name: 'регулятор1_канал4'}
    ];

    this.sendData = []; //prepared for send data from this.data and this.peer

    this.tmr_p = {tmr: null};
    this.tmr_ga = {tmr: null};
    this.tmr_sleep = {tmr: null};
    this.tmr_u = {tmr: null};//auto update timer
    this.DELAY_U = 5000;
    this.DELAY_P = 3000;
    this.DELAY_GA = 5000;
    this.delay_sleep = 300000;
    this.delay_p = this.DELAY_P;//send ping interval
    this.delay_ga = this.DELAY_GA;//send ping interval
    this.delay_u = this.DELAY_U;//auto update min interval

    this.DELAY_FACTOR = 2000000;//factor
    this.sleep = false;
    this.ACTION =
            {
                CONTROLLER: {
                    PING: 2,
                    PROGRAM: {
                        START: 62,
                        STOP: 63,
                        RESET: 64,
                        GET_DATA_RUNTIME: 34,
                        GET_DATA_INIT: 35,
                        DISABLE: 42,
                        ENABLE: 43,
                    }
                }
            };
    this.CATCH = {
        REGB: 1,
        EDIT: 2,
        PAGE_BLOCKER: 3
    };
    this.curr_peer = null;
    this.curr_peer_ind = -1;
    this.curr_ppeer = null;
    this.curr_item = null;
    this.curr_item_ind = -1;
    this.curr_item_done = true;
    this.curr_item_timeisout = true;
    this.curr_clicked = false;
    this.curr_item_edit = null;
    this.curr_editing = false;
    this.initialized = false;
    this.update = true; //editor will make it false
    this.visible = false;

    this.startB = null;
    this.stopB = null;
    this.nextB = null;
    this.prevB = null;
    this.modeE = null;
    this.chartB = null;
    this.helpB = null;
    this.bb = null;
    this.dataE = null;
    this.init = function () {
        try {
            var self = this;
            this.makeData();
            this.container = cvis();
            this.startB = cb("&blacktriangleright;");
            this.stopB = cb("&blacksquare;");
            this.nextB = cb("&RightArrow;");
            this.prevB = cb("&LeftArrow;");
            this.modeE = new ToggleButtonArray([[ trans.get(328), true], [ trans.get(328), false]], trans.get(328), 'pre_ems_header', 'pre_ems_dis', 'pre_ems_en', 'pre_ems_icont', 'pre_ems_cont', 'pre_ems_item');
            this.chartB =  new NavigationButton(vchart, "f_js/image/chart.png");
            this.helpB = new NavigationButton(vhelp_step, "f_js/image/help.png");
            this.bb = new BackButton();
            this.peerE = cd();
            this.dataE = cd();
            this.container.onmouseover = function () {
                self.wakeUp();
            };
            this.startB.onclick = function () {
                self.add();
            };
            this.stopB.onclick = function () {
                self.delete();
            };
            this.nextB.onclick = function () {
                self.save();
            };
            this.prevB.onclick = function () {
                self.getData();
            };
            var rcont = cd();
            var sscont=cd();
            var npcont=cd();
            var rscont=cd();
            var pcont =cd();
            a(sscont, [this.startB, this.stopB]);
            a(npcont, [this.prevB, this.nextB]);
            a(rscont, [this.modeE, npcont]);
            a(pcont, [rscont, sscont,this.chartB]);
            a(rcont, [pcont, this.helpB, this.bb]);
            a(this.container, [this.dataE, rcont, this.peerE]);
            for (var i = 0; i < this.peer.length; i++) {
                var elem = new PeerButton(this.peer[i]);
                this.peer[i].elem = elem;
                a(this.peerE, elem);
            }
            var self = this;
            for (var i = 0; i < this.group.length; i++) {
                this.group[i].elem = new GroupElem(this.group[i].name);
                a(this.dataE, this.group[i].elem);
            }
            for (var i = 0; i < this.data.length; i++) {
                this.data[i].elem = new RegButton(this.data[i].id, self, this.CATCH.REGB);
                this.data[i].elem.updateInit(this.data[i]);
                var group = this.getGroupById(this.data[i].group_id);
                a(group.elem.content, this.data[i].elem);
            }
            cla([this.dataE, this.peerE], ["cn_cont1"]);
            cla(this.peerE, 'cn_pcont');
            cla([this.helpB], ["cn_button2", "f2", "w100"]);
            page_blocker.prep(1, 1, this, this.CATCH.PAGE_BLOCKER);
            this.initialized = true;
        } catch (e) {
            alert("control: init: " + e.message);
        }
    };
    this.getName = function () {
        return trans.get(400);
    };
    this.updateStr = function () {
        try {
            document.title = trans.get(314);
            this.helpB.updateStr();
        } catch (e) {
            alert("control: updateStr: " + e.message);
        }
    };
    this.catchEdit = function (d, kind, apply) {
        try {
            switch (kind) {
                case this.CATCH.REGB:
                    var item = this.getDataById(d);
                    var f = false;
                    if (item.elem.isSelected()) {
                        f = true;
                    }
                    this.selectOneB(d);
                    if (f) {
                        cursor_blocker.enable();
                        this.curr_item_edit = item;
                        this.curr_clicked = true;
                        if (this.curr_item_done) {
                            this.sendGetProgEdit();
                        }
                    }
                    break;
                case this.CATCH.EDIT:
                    var item = this.getDataById(d.id);
                    var curr_ind = this.getDataIndById(d.id);
                    if (curr_ind === null) {
                        this.curr_clicked = false;
                        this.curr_editing = false;
                        this.curr_item_timeisout = true;
                        return;
                    }
                    if (curr_ind - 1 >= 0) {
                        this.curr_item_ind = curr_ind - 1;
                    } else {
                        this.curr_item_ind = this.data.length - 1;
                    }

                    if (apply) {
                        if (d.goal !== item.reg.goal) {
                            this.setRegValue(item, d.goal, 'set_goal');
                        }
                        if (d.change_gap !== item.reg.change_gap) {
                            this.setRegValue(item, d.change_gap, 'set_change_gap');
                        }
                        if (d.heater.mode !== item.reg.heater.mode) {
                            var mode = this.getModeStr(d.heater.mode);
                            this.setRegValue(item, mode, 'set_heater_mode');
                        }
                        if (d.heater.use !== item.reg.heater.use || d.cooler.use !== item.reg.cooler.use) {
                            var value = null;
                            if (d.heater.use === true && d.cooler.use === true) {
                                value = "both";
                            } else if (d.heater.use === true && d.cooler.use === false) {
                                value = "heater";
                            } else if (d.heater.use === false && d.cooler.use === true) {
                                value = "cooler";
                            } else if (d.heater.use === false && d.cooler.use === false) {
                                value = "none";
                            }
                            this.setRegValue(item, value, 'set_em_mode');
                        }
                        if (d.cooler.mode !== item.reg.cooler.mode) {
                            var mode = this.getModeStr(d.cooler.mode);
                            this.setRegValue(item, mode, 'set_cooler_mode');
                        }
                        if (d.heater.delta !== item.reg.heater.delta) {
                            this.setRegValue(item, d.heater.delta, 'set_heater_delta');
                        }
                        if (d.cooler.delta !== item.reg.cooler.delta) {
                            this.setRegValue(item, d.cooler.delta, 'set_cooler_delta');
                        }
                        if (d.cooler.kp !== item.reg.cooler.kp) {
                            this.setRegValue(item, d.cooler.kp, 'set_cooler_kp');
                        }
                        if (d.cooler.ki !== item.reg.cooler.ki) {
                            this.setRegValue(item, d.cooler.ki, 'set_cooler_ki');
                        }
                        if (d.cooler.kd !== item.reg.cooler.kd) {
                            this.setRegValue(item, d.cooler.kd, 'set_cooler_kd');
                        }
                        if (d.heater.kp !== item.reg.heater.kp) {
                            this.setRegValue(item, d.heater.kp, 'set_heater_kp');
                        }
                        if (d.heater.ki !== item.reg.heater.ki) {
                            this.setRegValue(item, d.heater.ki, 'set_heater_ki');
                        }
                        if (d.heater.kd !== item.reg.heater.kd) {
                            this.setRegValue(item, d.heater.kd, 'set_heater_kd');
                        }
                        if ((d.reg === true && (item.reg.state === "OFF" || item.reg.state === "DISABLE")) || (d.reg === false && (item.reg.state !== "OFF" && item.reg.state !== "DISABLE"))) {
                            this.setReg(item, d.reg);
                        }
                        if (d.set_power) {
                            if (item.reg.heater.rsl !== null) {
                                this.setRegValue(item, (d.heater.power / 100) * item.reg.heater.rsl, 'set_heater_power');
                            }
                            if (item.reg.cooler.rsl !== null) {
                                this.setRegValue(item, (d.cooler.power / 100) * item.reg.cooler.rsl, 'set_cooler_power');
                            }
                        }
                    }

                    //    console.log(d);
                    this.curr_clicked = false;
                    this.curr_editing = false;
                    this.curr_item_timeisout = true;
                    break;
                case this.CATCH.PAGE_BLOCKER:
                    this.wakeUp();
                    break;
                default:
                    console.log("catchEdit: bad k");
                    break;
            }
        } catch (e) {
            alert("control: catchEdit: " + e.message);
        }
    };
    this.wakeUp = function () {
        this.delaySleep();
        if (this.sleep) {
            this.sleep = false;
            clearTmr(this.tmr_u);
            clearTmr(this.tmr_p);
            this.delay_u = this.DELAY_U;
            this.delay_p = this.DELAY_P;
            this.delay_ga = this.DELAY_GA;
            this.curr_item_timeisout = true;
            this.updateNextItem();
            this.pingNextPeer();
        }
    };
    this.selectOneB = function (id) {
        try {
            var done1 = false, done2 = false;
            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].elem.isSelected() && this.data[i].elem.id !== id) {
                    this.data[i].elem.select();
                    done1 = true;
                }
                if (this.data[i].elem.id === id) {
                    this.data[i].elem.select();
                    done2 = true;
                }
                if (done1 && done2) {
                    break;
                }
            }
        } catch (e) {
            alert("control: selectOneB: " + e.message);
        }
    };
    this.getDataById = function (id) {
        try {
            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].id === id) {
                    return this.data[i];
                }
            }
            return null;
        } catch (e) {
            alert("control: getDataById: " + e.message);
        }
    };
    this.getDataIndById = function (id) {
        try {
            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].id === id) {
                    return i;
                }
            }
            return null;
        } catch (e) {
            alert("control: getDataById: " + e.message);
        }
    };
    this.getGroupById = function (id) {
        try {
            for (var i = 0; i < this.group.length; i++) {
                if (this.group[i].id === id) {
                    return this.group[i];
                }
            }
            return null;
        } catch (e) {
            alert("monitor: getGroupById: " + e.message);
        }
    };
    this.getPeerById = function (id) {
        try {
            for (var i = 0; i < this.peer.length; i++) {
                if (this.peer[i].id === id) {
                    return this.peer[i];
                }
            }
            return null;
        } catch (e) {
            alert("control: getPeerById: " + e.message);
        }
    };
    this.getSelectedDataItem = function () {
        try {
            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].elem.isSelected()) {
                    return this.data[i];
                }
            }
            return null;
        } catch (e) {
            alert("control: getSelectedDataItem: " + e.message);
        }
    };
    this.sendGetProgEdit = function () {
        this.curr_editing = true;
        this.curr_item = this.curr_item_edit;
        if (this.curr_item.reg.peer !== null) {
            this.sendGetRegRuntime(this.curr_item.reg.peer, this.curr_item.prog_id);
        } else {
            this.abort(this.ACTION.CONTROLLER.PROGRAM.GET_DATA_RUNTIME, "no peer");
        }
    };
    this.updateNextItem = function () {
        try {
            if (this.data.length <= 0) {
                //  console.log("un:", "bad data length");
                return;
            }
            if (this.curr_clicked) {
                if (this.curr_editing) {
                    //   console.log("un:", "being edited");
                    return;
                }
                this.sendGetProgEdit();
                return;
            }
            if (!this.curr_item_done) {
                // console.log("un:", "not done yet");
                return;
            }
            if (this.curr_item_ind === this.data.length - 1 && !this.curr_item_timeisout) {
                //  console.log("un:", "time not passed yet");
                return;
            }
            if (this.curr_item_ind < this.data.length - 1) {
                this.curr_item_ind++;
            } else {
                this.curr_item_ind = 0;
            }
            this.curr_item = this.data[this.curr_item_ind];
            //console.log("un:", "ok");

            this.curr_item.reg.done1 = false;
            this.curr_item.reg.done2 = false;

            this.curr_item_done = false;

            if (this.curr_item_ind === 0) {
                this.delayUpdateNextItem();
                //  console.log("un:", "delay update");
            }
            this.sendGetRegRuntime(this.curr_item.reg.peer, this.curr_item.prog_id);
        } catch (e) {
            alert("updateNextItem: " + e.message);
        }
    };
    this.pingNextPeer = function () {
        try {
            clearTmr(this.tmr_p);
            if (this.peer.length <= 0) {
                return;
            }
            var dowait = 0;
            if (this.curr_peer_ind < this.peer.length - 1) {
                this.curr_peer_ind++;
            } else {
                this.curr_peer_ind = 0;
                dowait = 1;
            }
            this.curr_ppeer = this.peer[this.curr_peer_ind];
            if (dowait) {
                this.delaySendP();
            } else {
                this.sendPingPeer(this.curr_ppeer);
            }

        } catch (e) {
            alert("control: pingNextPeer: " + e.message);
        }
    };
    this.sendPingPeer = function (peer) {
        var data = [
            {
                action: ['controller', 'ping'],
                param: {address: peer.address, port: peer.port}
            }
        ];
        sendTo(this, data, this.ACTION.CONTROLLER.PING, 'json_udp_acp');
    };
    this.setRegValue = function (item, value, action) {
        if (item.reg.peer === null) {
            return;
        }
        if (value === null) {
            return;
        }
        var data = [
            {
                action: ['controller', 'program', action],
                param: {item: [{p0: item.prog_id, p1: value}], address: item.reg.peer.address, port: item.reg.peer.port}
            }
        ];
        sendTo(this, data, this.ACTION.CONTROLLER.PROGRAM.SET_VALUE, 'json_udp_acp');
    };
    this.setReg = function (item, value) {
        if (item.reg.peer === null) {
            return;
        }
        if (value === null) {
            return;
        }
        var act = 'enable';
        var kind = this.ACTION.CONTROLLER.PROGRAM.ENABLE;
        if (!value) {
            act = 'disable';
            kind = this.ACTION.CONTROLLER.PROGRAM.DISABLE;
        }
        var data = [
            {
                action: ['controller', 'program', act],
                param: {item: [item.prog_id], address: item.reg.peer.address, port: item.reg.peer.port}
            }
        ];
        sendTo(this, data, kind, 'json_udp_acp');
    };
    this.sendGetRegRuntime = function (peer, prog_id) {
        var data = [
            {
                action: ['controller', 'program', 'get_data_runtime'],
                param: {address: peer.address, port: peer.port, item: [prog_id]}
            }
        ];
        sendTo(this, data, this.ACTION.CONTROLLER.PROGRAM.GET_DATA_RUNTIME, 'json_udp_acp');
    };
    this.sendGetRegInit = function (peer, prog_id) {
        var data = [
            {
                action: ['controller', 'program', 'get_data_init'],
                param: {address: peer.address, port: peer.port, item: [prog_id]}
            }
        ];
        sendTo(this, data, this.ACTION.CONTROLLER.PROGRAM.GET_DATA_INIT, 'json_udp_acp');
    };
    this.delayUpdateNextItem = function () {
        try {
            if (this.visible) {
                clearTmr(this.tmr_u);
                this.curr_item_timeisout = false;
                var self = this;
                this.tmr_u.tmr = window.setTimeout(function () {
                    self.curr_item_timeisout = true;
                    //  console.log("un: time has come");
                    self.updateNextItem();
                }, this.delay_u);
            }
        } catch (e) {
            alert("control: delayUpdateNextItem: " + e.message);
        }
    };
    this.delaySendP = function () {
        try {
            if (this.visible) {
                var self = this;
                this.tmr_p.tmr = window.setTimeout(function () {
                    self.sendPingPeer(self.curr_ppeer);
                }, this.delay_p);
            }
        } catch (e) {
            alert("control: delaySendP: " + e.message);
        }
    };
    this.delaySleep = function () {
        try {
            if (this.visible) {
                clearTmr(this.tmr_sleep);
                var self = this;
                this.tmr_sleep.tmr = window.setTimeout(function () {
                    self.sleep = true;
                    self.delay_u = self.DELAY_U * self.DELAY_FACTOR;
                    self.delay_p = self.DELAY_P * self.DELAY_FACTOR;
                    page_blocker.enable();
                }, this.delay_sleep);
            }
        } catch (e) {
            alert("control: delaySleep: " + e.message);
        }
    };
    this.makeData = function () {
        for (var i = 0; i < this.group.length; i++) {
            this.group[i].elem = null;
        }
        for (var i = 0; i < this.peer.length; i++) {
            this.peer[i].sent = false;
            this.peer[i].active = false;
            this.peer[i].elem = null;
        }
        for (var i = 0; i < this.data.length; i++) {
            this.data[i].id = i;
            this.data[i].reg = {
                peer: this.getPeerById(this.data[i].peer_id),
                state: null,
                state_r: null,
                change_tm_rest: null,
                sensor: {
                    value: null,
                    state: null
                },
                heater: {
                    use: null,
                    rsl: null,
                    mode: null,
                    output: null,
                    delta: null,
                    power: null,
                    kp: null,
                    ki: null,
                    kd: null
                },
                cooler: {
                    use: null,
                    rsl: null,
                    mode: null,
                    output: null,
                    delta: null,
                    power: null,
                    kp: null,
                    ki: null,
                    kd: null
                },
                goal: null,
                change_gap: null,
                done1: false,
                done2: false
            };
        }
        // console.log(this.data);
    };
    this.getModeStr = function (value) {
        if (value === app.MODE.RETURN.PID) {
            return app.MODE.DB.PID;
        } else if (value === app.MODE.RETURN.ONF) {
            return app.MODE.DB.ONF;
        }
    };
    this.doAfterRegRuntime = function () {
        this.curr_item.reg.done1 = true;
        this.curr_item.elem.updateRegRuntime(this.curr_item.reg);
        if (this.curr_item.reg.peer !== null) {
            this.sendGetRegInit(this.curr_item.reg.peer, this.curr_item.prog_id);
        } else {
            this.abort(this.ACTION.CONTROLLER.PROGRAM.GET_DATA_INIT, "no peer");
        }
    };
    this.doAfterRegInit = function () {
        this.curr_item.reg.done2 = true;
        this.curr_item_done = true;
        this.curr_item.elem.updateRegInit(this.curr_item.reg);
        if (this.curr_editing) {
            cursor_blocker.disable();
            //console.log(this.curr_item);
            vprog_edit.prep(this.curr_item, this, this.CATCH.EDIT, this.curr_item.name);
            showV(vprog_edit);
            return;
        }
        this.updateNextItem();
    };
    this.confirm = function (action, d, dt_diff) {
        try {
            switch (action) {
                case this.ACTION.CONTROLLER.PROGRAM.GET_DATA_RUNTIME:
                    if (typeof d[0] !== 'undefined') {
                        var id = parseInt(d[0].id);
                        if (this.curr_item.prog_id !== id) {
                            //   console.log("bad reg prog id recieved: " + id + " expected: " + this.curr_item.id);
                            logger.err(269);
                            this.doAfterRegRuntime();
                            return;
                        }
                        this.curr_item.reg.sensor.value = parseFloat(d[0].sensor_value);
                        this.curr_item.reg.sensor.state = parseInt(d[0].sensor_state);
                        this.curr_item.reg.state = d[0].state; //INIT REG OFF
                        this.curr_item.reg.state_r = d[0].state_r; //HEATER COOLER
                        this.curr_item.reg.heater.output = parseFloat(d[0].output_heater);
                        this.curr_item.reg.cooler.output = parseFloat(d[0].output_cooler);
                        this.curr_item.reg.change_tm_rest = parseInt(d[0].change_tm_rest);
                    } else {
                        this.curr_item.reg.sensor.value = null;
                        this.curr_item.reg.sensor.state = null;
                        this.curr_item.reg.state = null; //INIT REG OFF
                        this.curr_item.reg.state_r = null; //HEATER COOLER
                        this.curr_item.reg.heater.output = null;
                        this.curr_item.reg.cooler.output = null;
                        this.curr_item.reg.change_tm_rest = null;
                    }
                    this.doAfterRegRuntime();
                    break;
                case this.ACTION.CONTROLLER.PROGRAM.GET_DATA_INIT:
                    if (typeof d[0] !== 'undefined') {
                        var id = parseInt(d[0].id);
                        if (this.curr_item.prog_id !== id) {
                            //  console.log("bad reg prog id recieved: " + id + " expected: " + this.curr_item.id);
                            logger.err(269);
                            this.doAfterRegInit();
                            return;
                        }
                        this.curr_item.reg.goal = parseFloat(d[0].goal);
                        this.curr_item.reg.change_gap = parseInt(d[0].change_gap);
                        var use = 0;
                        use = parseInt(d[0].heater_use);
                        if (use === 1) {
                            this.curr_item.reg.heater.use = true;
                        } else {
                            this.curr_item.reg.heater.use = false;
                        }
                        this.curr_item.reg.heater.rsl = Math.round(parseFloat(d[0].heater_rsl));
                        this.curr_item.reg.heater.mode = d[0].heater_mode;
                        this.curr_item.reg.heater.delta = parseFloat(d[0].heater_delta);
                        this.curr_item.reg.heater.kp = parseFloat(d[0].heater_kp);
                        this.curr_item.reg.heater.ki = parseFloat(d[0].heater_ki);
                        this.curr_item.reg.heater.kd = parseFloat(d[0].heater_kd);
                        use = parseInt(d[0].cooler_use);
                        if (use === 1) {
                            this.curr_item.reg.cooler.use = true;
                        } else {
                            this.curr_item.reg.cooler.use = false;
                        }
                        this.curr_item.reg.cooler.rsl = Math.round(parseFloat(d[0].cooler_rsl));
                        this.curr_item.reg.cooler.mode = d[0].cooler_mode;
                        this.curr_item.reg.cooler.delta = parseFloat(d[0].cooler_delta);
                        this.curr_item.reg.cooler.kp = parseFloat(d[0].cooler_kp);
                        this.curr_item.reg.cooler.ki = parseFloat(d[0].cooler_ki);
                        this.curr_item.reg.cooler.kd = parseFloat(d[0].cooler_kd);
                    } else {
                        this.curr_item.reg.goal = null;
                        this.curr_item.reg.change_gap = null;
                        this.curr_item.reg.heater.use = null;
                        this.curr_item.reg.heater.rsl = null;
                        this.curr_item.reg.heater.mode = null;
                        this.curr_item.reg.heater.delta = null;
                        this.curr_item.reg.heater.kp = null;
                        this.curr_item.reg.heater.ki = null;
                        this.curr_item.reg.heater.kd = null;

                        this.curr_item.reg.cooler.use = null;
                        this.curr_item.reg.cooler.rsl = null;
                        this.curr_item.reg.cooler.mode = null;
                        this.curr_item.reg.cooler.delta = null;
                        this.curr_item.reg.cooler.kp = null;
                        this.curr_item.reg.cooler.ki = null;
                        this.curr_item.reg.cooler.kd = null;

                    }
                    // console.log(this.curr_item.reg);
                    this.doAfterRegInit();
                    break;
                case this.ACTION.CONTROLLER.PROGRAM.RESET:
                    cursor_blocker.disable();
                    break;
                case this.ACTION.CONTROLLER.PING:
                    switch (d) {
                        case ACP.RESP.APP_BUSY:
                            this.curr_ppeer.active = true;
                            break;
                        case ACP.RESP.APP_IDLE:
                            this.curr_ppeer.active = false;
                            break;
                        default:
                            this.curr_ppeer.active = false;
                            break;
                    }
                    this.curr_ppeer.elem.update(d);
                    this.pingNextPeer();
                    break;
                case this.ACTION.CONTROLLER.PROGRAM.SET_VALUE:
                    break;
                case this.ACTION.CONTROLLER.PROGRAM.START:
                case this.ACTION.CONTROLLER.PROGRAM.STOP:
                case this.ACTION.CONTROLLER.PROGRAM.RESET:
                case this.ACTION.CONTROLLER.PROGRAM.DISABLE:
                case this.ACTION.CONTROLLER.PROGRAM.ENABLE:
                    cursor_blocker.disable();
                    break;
                default:
                    console.log("confirm: unknown action: ", action);
                    break;
            }

        } catch (e) {
            alert("control: confirm: " + e.message);
        }
    };
    this.abort = function (action, m, n) {
        try {
            switch (action) {
                case this.ACTION.CONTROLLER.PROGRAM.GET_DATA_RUNTIME:
                    this.curr_item.reg.sensor.value = null;
                    this.curr_item.reg.sensor.state = null;
                    this.curr_item.reg.state = null; //INIT BUSY OFF
                    this.curr_item.reg.state_r = null; //HEATER COOLER
                    this.curr_item.reg.heater.output = null;
                    this.curr_item.reg.cooler.output = null;
                    this.curr_item.reg.change_tm_rest = null;
                    this.doAfterRegRuntime();
                    break;
                case this.ACTION.CONTROLLER.PROGRAM.GET_DATA_INIT:
                    this.curr_item.reg.goal = null;
                    this.curr_item.reg.change_gap = null;

                    this.curr_item.reg.heater.use = null;
                    this.curr_item.reg.heater.rsl = null;
                    this.curr_item.reg.heater.mode = null;
                    this.curr_item.reg.heater.delta = null;
                    this.curr_item.reg.heater.kp = null;
                    this.curr_item.reg.heater.ki = null;
                    this.curr_item.reg.heater.kd = null;

                    this.curr_item.reg.cooler.use = null;
                    this.curr_item.reg.cooler.rsl = null;
                    this.curr_item.reg.cooler.mode = null;
                    this.curr_item.reg.cooler.delta = null;
                    this.curr_item.reg.cooler.kp = null;
                    this.curr_item.reg.cooler.ki = null;
                    this.curr_item.reg.cooler.kd = null;
                    this.doAfterRegInit();
                    break;
                case this.ACTION.CONTROLLER.PING:
                    this.curr_ppeer.active = false;
                    this.curr_ppeer.elem.update(null);
                    this.pingNextPeer();
                    break;
                case this.ACTION.CONTROLLER.PROGRAM.DISABLE:
                    logger.err(264);
                    break;
                case this.ACTION.CONTROLLER.PROGRAM.ENABLE:
                    logger.err(263);
                    break;
                case this.ACTION.CONTROLLER.PROGRAM.SET_VALUE:
                    logger.err(270);
                    break;
                default:
                    console.log("abort: unknown action: ", action);
                    break;
            }
        } catch (e) {
            alert("control: abort: " + e.message);
        }
    };
    this.show = function () {
        try {
            document.title = this.getName();
            clr(this.container, "hdn");
            this.visible = true;
            this.curr_item_timeisout = true;
            this.pingNextPeer();
            this.updateNextItem();
            this.delaySleep();
        } catch (e) {
            alert("control: show: " + e.message);
        }
    };
    this.hide = function () {
        try {
            cla(this.container, "hdn");
            clearTmr(this.tmr_u);
            clearTmr(this.tmr_p);
            clearTmr(this.tmr_sleep);
            this.visible = false;
        } catch (e) {
            alert("control: hide: " + e.message);
        }
    }
    ;
}
var vmonitor = new VisMonitor();
visu.push(vmonitor);
