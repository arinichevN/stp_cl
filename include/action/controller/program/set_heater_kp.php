<?php

namespace controller\program;

class set_heater_kp {

    public static function getUser() {
        return ['stranger' => '*'];
    }

    public static function execute($p) {
        \sock\init($p['address'], $p['port']);
        \acp\requestSendI1F1List(ACP_CMD_REGSMP_PROG_SET_HEATER_KP, $p['item']);
        \sock\suspend();
    }

}
