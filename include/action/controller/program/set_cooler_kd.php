<?php

namespace controller\program;

class set_cooler_kd {

    public static function getUser() {
        return ['stranger' => '*'];
    }

    public static function execute($p) {
        \sock\init($p['address'], $p['port']);
        \acp\requestSendI1F1List(ACP_CMD_REGSMP_PROG_SET_COOLER_KD, $p['item']);
        \sock\suspend();
    }

}