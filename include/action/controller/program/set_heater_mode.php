<?php

namespace controller\program;

class set_heater_mode {

    public static function getUser() {
        return ['stranger' => '*'];
    }

    public static function execute($p) {
        \sock\init($p['address'], $p['port']);
        \acp\requestSendI1S1List(ACP_CMD_REG_PROG_SET_HEATER_MODE, $p['item']);
        \sock\suspend();
    }

}
