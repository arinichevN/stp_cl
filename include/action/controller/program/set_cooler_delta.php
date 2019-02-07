<?php

namespace controller\program;

class set_cooler_delta {

    public static function getUser() {
        return ['stranger' => '*'];
    }

    public static function execute($p) {
        \sock\init($p['address'], $p['port']);
        \acp\requestSendI1F1List(ACP_CMD_REGONF_PROG_SET_COOLER_DELTA, $p['item']);
        \sock\suspend();
    }

}
